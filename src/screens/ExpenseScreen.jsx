import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
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
  const { state, actions, t, colors } = useApp();
  const { expenses, settings } = state;
  const currency = settings?.currency || '₹';
  const styles = getStyles(colors);

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

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
    Alert.alert(t('delete'), t('delete_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => actions.deleteExpense(id) },
    ]);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleSave = async (item) => {
    if (item.id) {
      await actions.updateExpense(item.id, item);
    } else {
      await actions.addExpense(item);
    }
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
      <Header title={t('expenses')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Total Banner */}
        <View style={styles.totalBanner}>
          <Text style={styles.totalLabel}>{t('total_expense')} ({t(filter.toLowerCase().replace(' ', '_'))})</Text>
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
            placeholder={t('search_expense')}
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
            <Text style={styles.emptyText}>{t('no_expenses')}</Text>
            <Text style={styles.emptySubText}>{t('quick_add')}</Text>
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
                  <Text style={styles.groupTotal}>{t('total')}: {currency}{catTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </View>
                {items.map(item => (
                  <TransactionCard
                    key={item.id}
                    item={item}
                    type="expense"
                    currency={currency}
                    onDelete={() => handleDelete(item.id)}
                    onEdit={handleEdit}
                  />
                ))}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => { setEditItem(null); setShowModal(true); }} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <AddModal
        visible={showModal}
        type="expense"
        initialData={editItem}
        currency={currency}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 },
  totalBanner: {
    backgroundColor: theme.secondary + '15',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.secondary,
  },
  totalLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: theme.secondary, marginBottom: 4 },
  totalValue: { fontSize: 26, fontWeight: '800', color: theme.secondary },
  categoryRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  catCard: {
    flex: 1,
    backgroundColor: theme.surfaceContainerLowest,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  catLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: theme.outline, marginBottom: 4 },
  catValue: { fontSize: 16, fontWeight: '800', color: theme.onSurface },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: theme.onSurface },
  filterRow: { marginBottom: 16, marginHorizontal: -20, paddingLeft: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: theme.surfaceContainerHigh },
  chipActive: { backgroundColor: theme.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: theme.onSurfaceVariant },
  chipTextActive: { color: theme.onPrimary },
  group: { marginBottom: 20 },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.outlineVariant + '40', paddingBottom: 8, marginBottom: 10 },
  groupLeftRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  groupLabel: { fontSize: 15, fontWeight: '800', color: theme.onSurface },
  groupTotal: { fontSize: 13, fontWeight: '700', color: theme.secondary },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: theme.onSurfaceVariant },
  emptySubText: { fontSize: 13, color: theme.outline },
  fab: {
    position: 'absolute',
    bottom: Platform?.OS === 'ios' ? 108 : 88,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: theme.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
});
