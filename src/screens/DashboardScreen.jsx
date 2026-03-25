import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import Header from '../components/Header';
import TransactionCard from '../components/TransactionCard';
import AddModal from '../components/AddModal';

export default function DashboardScreen({ navigation }) {
  const { state, actions } = useApp();
  const { income, expenses, borrowed, settings } = state;
  const currency = settings?.currency || '₹';

  const [modalType, setModalType] = useState(null);

  const totals = useMemo(() => {
    const totalIncome = income.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const totalExpense = expenses.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const totalBorrowed = borrowed.filter(b => b.borrowType === 'borrowed').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const totalLent = borrowed.filter(b => b.borrowType === 'lent').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    return { totalIncome, totalExpense, profit: totalIncome - totalExpense, totalBorrowed, totalLent };
  }, [income, expenses, borrowed]);

  const recentTransactions = useMemo(() => {
    const all = [
      ...income.map(i => ({ ...i, type: 'income' })),
      ...expenses.map(e => ({ ...e, type: 'expense' })),
      ...borrowed.map(b => ({ ...b, type: 'borrowed' })),
    ];
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  }, [income, expenses, borrowed]);

  const fmt = (n) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSave = async (item) => {
    if (modalType === 'income') await actions.addIncome(item);
    else if (modalType === 'expense') await actions.addExpense(item);
    else if (modalType === 'borrowed') await actions.addBorrowed(item);
  };

  return (
    <View style={styles.root}>
      <Header title={settings?.storeName || 'Store Ledger'} subtitle="Good Morning" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsRow} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
          <SummaryCard label="Total Income" value={`${currency}${fmt(totals.totalIncome)}`} color={colors.tertiary} icon="trending-up" />
          <SummaryCard label="Total Expense" value={`${currency}${fmt(totals.totalExpense)}`} color={colors.secondary} icon="trending-down" />
          <SummaryCard label="Net Profit" value={`${currency}${fmt(totals.profit)}`} color={colors.primary} icon="analytics" accent />
          <SummaryCard label="Borrowed" value={`${currency}${fmt(totals.totalBorrowed)}`} color={colors.orange} icon="people" />
          <SummaryCard label="Lent" value={`${currency}${fmt(totals.totalLent)}`} color="#8B5CF6" icon="arrow-up-circle" />
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickActions}>
            <QuickAction label="Income" icon="add-circle" color={colors.tertiary} onPress={() => setModalType('income')} />
            <QuickAction label="Expense" icon="remove-circle" color={colors.secondary} onPress={() => setModalType('expense')} />
            <QuickAction label="Borrowed" icon="people" color={colors.orange} onPress={() => setModalType('borrowed')} />
          </View>
        </View>

        {/* Weekly Bar Chart */}
        <View style={styles.section}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Weekly Flow</Text>
            <Text style={styles.chartSub}>LAST 7 DAYS</Text>
          </View>
          <WeeklyChart income={income} expenses={expenses} />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Income')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={40} color={colors.outline} />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubText}>Tap Quick Add to get started</Text>
            </View>
          ) : (
            recentTransactions.map(t => (
              <TransactionCard key={t.id} item={t} type={t.type} currency={currency} />
            ))
          )}
        </View>
      </ScrollView>

      <AddModal
        visible={!!modalType}
        type={modalType}
        currency={currency}
        onClose={() => setModalType(null)}
        onSave={handleSave}
      />
    </View>
  );
}

function SummaryCard({ label, value, color, icon, accent }) {
  return (
    <View style={[styles.summaryCard, accent && { backgroundColor: color }, !accent && { borderLeftWidth: 4, borderLeftColor: color }]}>
      <Text style={[styles.summaryLabel, accent && { color: 'rgba(255,255,255,0.8)' }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: accent ? '#fff' : color }]}>{value}</Text>
    </View>
  );
}

function QuickAction({ label, icon, color, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: color + '1A' }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Ionicons name={icon} size={28} color={color} />
      <Text style={[styles.quickLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function WeeklyChart({ income, expenses }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  const maxH = 80;

  const data = days.map((day, i) => {
    const targetDay = new Date(now);
    targetDay.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1) + i);
    const dayStr = targetDay.toDateString();

    const inc = income.filter(x => new Date(x.createdAt).toDateString() === dayStr)
      .reduce((s, x) => s + parseFloat(x.amount || 0), 0);
    const exp = expenses.filter(x => new Date(x.createdAt).toDateString() === dayStr)
      .reduce((s, x) => s + parseFloat(x.amount || 0), 0);
    return { day, inc, exp };
  });

  const maxVal = Math.max(...data.map(d => Math.max(d.inc, d.exp)), 1);

  return (
    <View style={styles.chartBox}>
      <View style={styles.chartBars}>
        {data.map(({ day, inc, exp }) => (
          <View key={day} style={styles.barGroup}>
            <View style={styles.barStack}>
              <View style={[styles.bar, styles.barIncome, { height: Math.max(4, (inc / maxVal) * maxH) }]} />
              <View style={[styles.bar, styles.barExpense, { height: Math.max(4, (exp / maxVal) * maxH) }]} />
            </View>
            <Text style={styles.barLabel}>{day}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.tertiary }]} /><Text style={styles.legendText}>Income</Text></View>
        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.secondary }]} /><Text style={styles.legendText}>Expense</Text></View>
      </View>
    </View>
  );
}

const HEADER_HEIGHT = Platform.OS === 'ios' ? 130 : 110;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingTop: 16, paddingBottom: 120 },
  cardsRow: { paddingLeft: 20, marginBottom: 8 },
  summaryCard: {
    width: 155,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  summaryLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: colors.onSurfaceVariant, marginBottom: 6 },
  summaryValue: { fontSize: 20, fontWeight: '800' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.onSurface, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  viewAll: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  quickActions: { flexDirection: 'row', gap: 12 },
  quickAction: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20, borderRadius: 16, gap: 6 },
  quickLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chartSub: { fontSize: 9, fontWeight: '700', color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1 },
  chartBox: { backgroundColor: colors.surfaceContainerLow, borderRadius: 16, padding: 16 },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100, marginBottom: 8 },
  barGroup: { flex: 1, alignItems: 'center', gap: 4 },
  barStack: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { width: 10, borderRadius: 4 },
  barIncome: { backgroundColor: colors.tertiary },
  barExpense: { backgroundColor: colors.secondary },
  barLabel: { fontSize: 9, color: colors.onSurfaceVariant, textTransform: 'uppercase', fontWeight: '600' },
  legend: { flexDirection: 'row', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: colors.onSurfaceVariant, fontWeight: '500' },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: '700', color: colors.onSurfaceVariant },
  emptySubText: { fontSize: 12, color: colors.outline },
});
