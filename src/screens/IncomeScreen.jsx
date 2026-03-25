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

export default function IncomeScreen() {
  const { state, actions } = useApp();
  const { income, settings } = state;
  const currency = settings?.currency || '₹';

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All'); // All, This Month, This Year
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const filtered = useMemo(() => {
    return income.filter(i => {
      const matchesFilter = inFilter(i.createdAt, filter);
      const matchesSearch = !search || (i.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (i.source || '').toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [income, filter, search]);

  const total = filtered.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  const handleDelete = (id) => {
    Alert.alert('Delete Entry', 'Remove this income record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => actions.deleteIncome(id) },
    ]);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleSave = async (item) => {
    if (item.id) {
      await actions.updateIncome(item.id, item);
    } else {
      await actions.addIncome(item);
    }
  };

  // Group by date
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(item => {
      const d = new Date(item.createdAt);
      const now = new Date();
      const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
      const key = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [filtered]);

  return (
    <View style={styles.root}>
      <Header title="Income" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Total Banner */}
        <View style={styles.totalBanner}>
          <Text style={styles.totalLabel}>TOTAL INCOME ({filter})</Text>
          <Text style={styles.totalValue}>{currency}{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search income..."
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

        {/* Grouped List */}
        {Object.keys(grouped).length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="cash-outline" size={48} color={colors.outline} />
            <Text style={styles.emptyText}>No income entries</Text>
            <Text style={styles.emptySubText}>Tap + to add income</Text>
          </View>
        ) : (
          Object.entries(grouped).map(([dateLabel, items]) => (
            <View key={dateLabel} style={styles.group}>
              <Text style={styles.groupLabel}>{dateLabel}</Text>
              {items.map(item => (
                <TransactionCard
                  key={item.id}
                  item={item}
                  type="income"
                  currency={currency}
                  onDelete={() => handleDelete(item.id)}
                  onEdit={handleEdit}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => { setEditItem(null); setShowModal(true); }} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <AddModal
        visible={showModal}
        type="income"
        initialData={editItem}
        currency={currency}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 },
  totalBanner: {
    backgroundColor: colors.tertiary + '15',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.tertiary,
  },
  totalLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: colors.tertiary, marginBottom: 4 },
  totalValue: { fontSize: 26, fontWeight: '800', color: colors.tertiary },
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
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceContainerHigh,
  },
  chipActive: { backgroundColor: colors.primaryContainer },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant },
  chipTextActive: { color: '#fff' },
  group: { marginBottom: 20 },
  groupLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: colors.onSurfaceVariant, marginBottom: 8 },
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
    backgroundColor: colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.tertiary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
});
