import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, useTheme, FAB, Searchbar, Portal, Dialog, Button } from 'react-native-paper';
import { useApp } from '../store/AppContext';
import TransactionItem from '../components/TransactionItem';
import AddEntryModal from '../components/AddEntryModal';
import FilterBar from '../components/FilterBar';
import { DATE_FILTERS } from '../utils/constants';
import { getDateRange, isInRange } from '../utils/dateHelpers';
import { totalIncome } from '../utils/calculations';

export default function IncomeScreen() {
  const theme = useTheme();
  const { income, settings, addIncome, editIncome, deleteIncome } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('7days');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { start, end } = useMemo(() => getDateRange(filter), [filter]);

  const filtered = useMemo(() => {
    return income.filter((item) => {
      const inRange = isInRange(item.date, start, end);
      const inSearch = search
        ? item.source?.toLowerCase().includes(search.toLowerCase()) ||
          item.notes?.toLowerCase().includes(search.toLowerCase())
        : true;
      return inRange && inSearch;
    });
  }, [income, start, end, search]);

  const total = useMemo(() => totalIncome(filtered), [filtered]);

  const handleEdit = (item) => { setEditing(item); setModal(true); };
  const handleDelete = (id) => setDeleteId(id);
  const confirmDelete = () => { deleteIncome(deleteId); setDeleteId(null); };

  const handleSubmit = (data) => {
    if (editing) { editIncome({ ...data, id: editing.id }); setEditing(null); }
    else addIncome(data);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>💰 Income</Text>
        <Text variant="bodyLarge" style={{ color: '#26A69A', fontWeight: '700' }}>
          {settings.currency}{total.toLocaleString('en-IN')}
        </Text>
      </View>
      <Searchbar
        placeholder="Search income..."
        value={search}
        onChangeText={setSearch}
        style={[styles.search, { backgroundColor: theme.colors.surface }]}
        elevation={0}
      />
      <FilterBar options={DATE_FILTERS} selected={filter} onSelect={setFilter} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            item={item}
            type="income"
            onEdit={handleEdit}
            onDelete={handleDelete}
            currency={settings.currency}
          />
        )}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>No income entries yet</Text>
          </View>
        }
      />
      <FAB icon="plus" style={[styles.fab, { backgroundColor: '#26A69A' }]} color="white" onPress={() => { setEditing(null); setModal(true); }} />
      <AddEntryModal
        visible={modal}
        mode="income"
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
  empty: { alignItems: 'center', marginTop: 60 },
  fab: { position: 'absolute', right: 20, bottom: 24 },
});
