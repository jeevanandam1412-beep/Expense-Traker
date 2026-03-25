import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, Dimensions,
} from 'react-native';
import { Text, useTheme, FAB, Surface, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../store/AppContext';
import SummaryCard from '../components/SummaryCard';
import AddEntryModal from '../components/AddEntryModal';
import {
  totalIncome, totalExpense, profit, borrowedTotal, weekOverWeekChange, formatCurrency,
} from '../utils/calculations';
import { getLast7DayLabels, getLast7DayValues } from '../utils/dateHelpers';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { income, expenses, borrowed, settings, addIncome, addExpense, addBorrowed } = useApp();
  const [fabOpen, setFabOpen] = useState(false);
  const [modal, setModal] = useState(null); // 'income' | 'expense' | 'borrowed'

  const tIncome = totalIncome(income);
  const tExpense = totalExpense(expenses);
  const tProfit = profit(income, expenses);
  const tBorrowed = borrowedTotal(borrowed);
  const wow = weekOverWeekChange(expenses);
  const sym = settings.currency;

  const labels = getLast7DayLabels();
  const incomeData = getLast7DayValues(income);
  const expenseData = getLast7DayValues(expenses);

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => `rgba(103, 80, 164, ${opacity})`,
    labelColor: () => theme.colors.onSurfaceVariant,
    strokeWidth: 2,
    propsForBackgroundLines: { stroke: theme.colors.surfaceVariant },
    decimalPlaces: 0,
  };

  const insightText = wow != null
    ? wow > 0
      ? `⚠️ Expenses up ${wow}% vs last week`
      : `✅ Good job! Expenses down ${Math.abs(wow)}% vs last week`
    : null;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Welcome back 👋</Text>
            <Text variant="headlineSmall" style={{ fontWeight: '800', color: theme.colors.onSurface }}>
              {settings.storeName}
            </Text>
          </View>
          <IconButton
            icon="cog"
            size={26}
            onPress={() => navigation.navigate('Settings')}
            iconColor={theme.colors.onSurfaceVariant}
          />
        </View>

        {/* Insight Banner */}
        {insightText && (
          <Surface style={[styles.insightBanner, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
            <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer, fontWeight: '600' }}>
              {insightText}
            </Text>
          </Surface>
        )}

        {/* Summary Cards */}
        <View style={styles.cardGrid}>
          <View style={styles.cardRow}>
            <SummaryCard title="Income" value={`${sym}${tIncome.toLocaleString('en-IN')}`} icon="trending-up" color="#26A69A" />
            <SummaryCard title="Expense" value={`${sym}${tExpense.toLocaleString('en-IN')}`} icon="trending-down" color="#EF5350" trend={wow} />
          </View>
          <View style={styles.cardRow}>
            <SummaryCard
              title="Profit / Loss"
              value={`${tProfit < 0 ? '-' : ''}${sym}${Math.abs(tProfit).toLocaleString('en-IN')}`}
              icon={tProfit >= 0 ? 'cash-plus' : 'cash-minus'}
              color={tProfit >= 0 ? '#5C6BC0' : '#EF5350'}
            />
            <SummaryCard title="Borrowed" value={`${sym}${tBorrowed.toLocaleString('en-IN')}`} icon="handshake" color="#FFA726" />
          </View>
        </View>

        {/* Bar Chart */}
        <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <Text variant="titleMedium" style={styles.chartTitle}>Last 7 Days</Text>
          <BarChart
            data={{
              labels,
              datasets: [
                { data: incomeData, color: () => '#26A69A' },
                { data: expenseData, color: () => '#EF5350' },
              ],
            }}
            width={width - 64}
            height={180}
            chartConfig={chartConfig}
            style={{ borderRadius: 12 }}
            showBarTops={false}
            fromZero
          />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#26A69A' }]} />
              <Text variant="labelSmall">Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#EF5350' }]} />
              <Text variant="labelSmall">Expenses</Text>
            </View>
          </View>
        </Surface>

        {/* Recent Transactions */}
        <Text variant="titleMedium" style={styles.sectionTitle}>Recent Transactions</Text>
        {[...income.slice(0, 3).map(i => ({ ...i, _type: 'income' })),
          ...expenses.slice(0, 3).map(e => ({ ...e, _type: 'expense' }))]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
          .map((item) => (
            <Surface key={item.id} style={[styles.recentItem, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <MaterialCommunityIcons
                name={item._type === 'income' ? 'trending-up' : 'trending-down'}
                size={18}
                color={item._type === 'income' ? '#26A69A' : '#EF5350'}
              />
              <Text variant="bodyMedium" style={{ flex: 1, marginLeft: 10 }}>
                {item._type === 'income' ? item.source : item.category}
              </Text>
              <Text variant="bodyMedium" style={{ fontWeight: '700', color: item._type === 'income' ? '#26A69A' : '#EF5350' }}>
                {item._type === 'income' ? '+' : '-'}{sym}{parseFloat(item.amount).toLocaleString('en-IN')}
              </Text>
            </Surface>
          ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? 'close' : 'plus'}
        actions={[
          { icon: 'cash-plus', label: 'Add Income', onPress: () => setModal('income'), color: '#26A69A' },
          { icon: 'cash-minus', label: 'Add Expense', onPress: () => setModal('expense'), color: '#EF5350' },
          { icon: 'handshake', label: 'Add Borrowed', onPress: () => setModal('borrowed'), color: '#5C6BC0' },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
        style={styles.fab}
      />

      {modal && (
        <AddEntryModal
          visible={!!modal}
          mode={modal}
          onDismiss={() => setModal(null)}
          onSubmit={(data) => {
            if (modal === 'income') addIncome(data);
            else if (modal === 'expense') addExpense(data);
            else addBorrowed(data);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingTop: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  insightBanner: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 12 },
  cardGrid: { paddingHorizontal: 12, gap: 0 },
  cardRow: { flexDirection: 'row', gap: 0 },
  chartCard: { marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 16 },
  chartTitle: { fontWeight: '700', marginBottom: 12 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { fontWeight: '700', marginHorizontal: 20, marginTop: 20, marginBottom: 8 },
  recentItem: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    marginHorizontal: 16, marginBottom: 6, borderRadius: 12,
  },
  fab: { bottom: 8 },
});
