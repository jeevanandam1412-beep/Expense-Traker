import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, SectionList } from 'react-native';
import { Text, useTheme, FAB, Searchbar, Portal, Dialog, Button, Chip } from 'react-native-paper';
import { useApp } from '../store/AppContext';
import TransactionItem from '../components/TransactionItem';
import AddEntryModal from '../components/AddEntryModal';
import FilterBar from '../components/FilterBar';
import { DATE_FILTERS, EXPENSE_CATEGORIES, getCategoryColor } from '../utils/constants';
import { getDateRange, isInRange } from '../utils/dateHelpers';
import { totalExpense } from '../utils/calculations';

export default function ExpenseScreen() {
  const theme = useTheme();
  const { expenses, settings, addExpense, editExpense, deleteExpense } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('7days');
  const [catFilter, setCatFilter] = useState('All');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { start, end } = useMemo(() => getDateRange(filter), [filter]);

  const filtered = useMemo(() => {
    return expenses.filter((item) => {
      const inRange = isInRange(item.date, start, end);
      const inSearch = search
        ? item.category?.toLowerCase().includes(search.toLowerCase()) ||
          item.notes?.toLowerCase().includes(search.toLowerCase())
        : true;
      const inCat = catFilter === 'All' ? true : item.category === catFilter;
      return inRange && inSearch && inCat;
    });
  }, [expenses, start, end, search, catFilter]);

  const total = useMemo(() => totalExpense(filtered), [filtered]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((e) => {
      const cat = e.category || 'Other';
      if (!map[cat]) map[cat] = [];
      map[cat].push(e);
    });
    return Object.entries(map).map(([title, data]) => ({ title, data }));
  }, [filtered]);

  const handleEdit = (item) => { setEditing(item); setModal(true); };
  const handleDelete = (id) => setDeleteId(id);
  const confirmDelete = () => { deleteExpense(deleteId); setDeleteId(null); };
  const handleSubmit = (data) => {
    if (editing) { editExpense({ ...data, id: editing.id }); setEditing(null); }
    else addExpense(data);
  };

  const catOptions = [{ label: 'All', value: 'All' }, ...EXPENSE_CATEGORIES.map(c => ({ label: c.label, value: c.value }))];

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>💸 Expenses</Text>
        <Text variant="bodyLarge" style={{ color: '#EF5350', fontWeight: '700' }}>
          {settings.currency}{total.toLocaleString('en-IN')}
        </Text>
      </View>
      <Searchbar
        placeholder="Search expenses..."
        value={search}
        onChangeText={setSearch}
        style={[styles.search, { backgroundColor: theme.colors.surface }]}
        elevation={0}
      />
      <FilterBar options={DATE_FILTERS} selected={filter} onSelect={setFilter} />
      <FilterBar
        options={catOptions}
        selected={catFilter}
        onSelect={setCatFilter}
        style={{ paddingTop: 0 }}
      />

      <SectionList
        sections={grouped}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            item={item}
            type="expense"
            onEdit={handleEdit}
            onDelete={handleDelete}
            currency={settings.currency}
          />
        )}
        renderSectionHeader={({ section: { title, data } }) => (
          <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.catDot, { backgroundColor: getCategoryColor(title) }]} />
            <Text variant="labelLarge" style={{ fontWeight: '700', color: theme.colors.onSurface }}>
              {title}
            </Text>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 'auto' }}>
              {settings.currency}{data.reduce((s, e) => s + parseFloat(e.amount || 0), 0).toLocaleString('en-IN')}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>No expenses found</Text>
          </View>
        }
      />

      <FAB icon="plus" style={[styles.fab, { backgroundColor: '#EF5350' }]} color="white" onPress={() => { setEditing(null); setModal(true); }} />
      <AddEntryModal
        visible={modal}
        mode="expense"
        initial={editing}
        onDismiss={() => { setModal(false); setEditing(null); }}
        onSubmit={handleSubmit}
      />
      <Portal>
        <Dialog visible={!!deleteId} onDismiss={() => setDeleteId(null)}>
          <Dialog.Title>Delete Entry?</Dialog.Title>
          <Dialog.Content><Text>This action cannot be undone.</Text></Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteId(null)}>Cancel</Button>
            <Button textColor="#EF5350" onPress={confirmDelete}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontWeight: '800' },
  search: { marginHorizontal: 16, marginBottom: 4, borderRadius: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, gap: 8 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  empty: { alignItems: 'center', marginTop: 60 },
  fab: { position: 'absolute', right: 20, bottom: 24 },
});
