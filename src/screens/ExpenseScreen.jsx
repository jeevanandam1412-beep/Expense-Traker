import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import Header from '../components/Header';
import TransactionCard from '../components/TransactionCard';
import AddModal from '../components/AddModal';

const FILTERS = ['Today', 'This Week', 'This Month', 'All'];

function inFilter(dateStr, filter) {
  const d = new Date(dateStr);
  const now = new Date();
  if (filter === 'Today') return d.toDateString() === now.toDateString();
  if (filter === 'This Week') {
    const start = new Date(now); start.setDate(now.getDate() - now.getDay());
    return d >= start;
  }
  if (filter === 'This Month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  return true;
}

export default function ExpenseScreen() {
  const { state, actions } = useApp();
  const { expenses, settings } = state;
  const currency = settings?.currency || '₹';

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    return expenses.filter(i => {
      const matchesFilter = inFilter(i.createdAt, filter);
      const matchesSearch = !search || (i.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (i.category || '').toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [expenses, filter, search]);

  const total = filtered.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  // Category totals
  const categoryTotals = useMemo(() => {
    const cats = {};
    filtered.forEach(e => {
      const c = e.category || 'Other';
      cats[c] = (cats[c] || 0) + parseFloat(e.amount || 0);
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [filtered]);

  const handleDelete = (id) => {
    Alert.alert('Delete Expense', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => actions.deleteExpense(id) },
    ]);
  };

  // Group by category
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(item => {
      const key = item.category || 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [filtered]);

  return (
    <View style={styles.root}>
      <Header title="Expenses" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Total Banner */}
        <View style={styles.totalBanner}>
          <Text style={styles.totalLabel}>TOTAL EXPENSES ({filter})</Text>
          <Text style={styles.totalValue}>{currency}{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
        </View>

        {/* Category Summary */}
        {categoryTotals.length > 0 && (
          <View style={styles.categoryRow}>
            {categoryTotals.map(([cat, val]) => (
              <View key={cat} style={styles.catCard}>
                <Text style={styles.catLabel}>{cat}</Text>
                <Text style={styles.catValue}>{currency}{val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search expenses..."
            placeholderTextColor={colors.outline}
            value={search}
            onChangeText={setSearch}
          />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={colors.outline} /></TouchableOpacity> : null}
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === f && styles.chipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Grouped by category */}
        {Object.keys(grouped).length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="trending-down-outline" size={48} color={colors.outline} />
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubText}>Tap + to add an expense</Text>
          </View>
        ) : (
          Object.entries(grouped).map(([catLabel, items]) => {
            const catTotal = items.reduce((s, i) => s + parseFloat(i.amount || 0), 0);
            return (
              <View key={catLabel} style={styles.group}>
                <View style={styles.groupHeader}>
                  <View style={styles.groupLeftRow}>
                    <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                    <Text style={styles.groupLabel}>{catLabel}</Text>
                  </View>
                  <Text style={styles.groupTotal}>Total: {currency}{catTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </View>
                {items.map(item => (
                  <TransactionCard
                    key={item.id}
                    item={item}
                    type="expense"
                    currency={currency}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <AddModal
        visible={showModal}
        type="expense"
        currency={currency}
        onClose={() => setShowModal(false)}
        onSave={actions.addExpense}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 },
  totalBanner: {
    backgroundColor: colors.secondary + '15',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  totalLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: colors.secondary, marginBottom: 4 },
  totalValue: { fontSize: 26, fontWeight: '800', color: colors.secondary },
  categoryRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  catCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  catLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: colors.outline, marginBottom: 4 },
  catValue: { fontSize: 16, fontWeight: '800', color: colors.onSurface },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.onSurface },
  filterRow: { marginBottom: 16, marginHorizontal: -20, paddingLeft: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.surfaceContainerHigh },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant },
  chipTextActive: { color: '#fff' },
  group: { marginBottom: 20 },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.outlineVariant + '40', paddingBottom: 8, marginBottom: 10 },
  groupLeftRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  groupLabel: { fontSize: 15, fontWeight: '800', color: colors.onSurface },
  groupTotal: { fontSize: 13, fontWeight: '700', color: colors.secondary },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: colors.onSurfaceVariant },
  emptySubText: { fontSize: 13, color: colors.outline },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 108 : 88,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
});
