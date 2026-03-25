import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import {
  Text, useTheme, FAB, Surface, Button, Portal, Dialog, SegmentedButtons, Chip
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import AddEntryModal from '../components/AddEntryModal';
import { formatDate } from '../utils/dateHelpers';
import dayjs from 'dayjs';

export default function BorrowedScreen() {
  const theme = useTheme();
  const { borrowed, settings, addBorrowed, editBorrowed, deleteBorrowed, toggleBorrowedStatus } = useApp();
  const [tab, setTab] = useState('borrowed');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = useMemo(() => borrowed.filter((b) => b.type === tab), [borrowed, tab]);

  const total = useMemo(
    () => filtered.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0),
    [filtered]
  );
  const pending = useMemo(
    () => filtered.filter((b) => b.status !== 'paid').reduce((s, b) => s + (parseFloat(b.amount) || 0), 0),
    [filtered]
  );

  const handleEdit = (item) => { setEditing(item); setModal(true); };
  const confirmDelete = () => { deleteBorrowed(deleteId); setDeleteId(null); };
  const handleSubmit = (data) => {
    if (editing) { editBorrowed({ ...data, id: editing.id }); setEditing(null); }
    else addBorrowed(data);
  };

  const isOverdue = (item) =>
    item.dueDate && item.status !== 'paid' && dayjs().isAfter(dayjs(item.dueDate));

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>🤝 Borrowed</Text>
      </View>

      {/* Summary strip */}
      <View style={styles.summaryRow}>
        <Surface style={[styles.summaryCard, { backgroundColor: tab === 'borrowed' ? '#5C6BC020' : '#26A69A20' }]} elevation={0}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Total</Text>
          <Text variant="titleMedium" style={{ fontWeight: '700', color: tab === 'borrowed' ? '#5C6BC0' : '#26A69A' }}>
            {settings.currency}{total.toLocaleString('en-IN')}
          </Text>
        </Surface>
        <Surface style={[styles.summaryCard, { backgroundColor: '#FFA72620' }]} elevation={0}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Pending</Text>
          <Text variant="titleMedium" style={{ fontWeight: '700', color: '#FFA726' }}>
            {settings.currency}{pending.toLocaleString('en-IN')}
          </Text>
        </Surface>
      </View>

      <SegmentedButtons
        value={tab}
        onValueChange={setTab}
        buttons={[
          { value: 'borrowed', label: '⬇ I Owe' },
          { value: 'lent', label: '⬆ Owe Me' },
        ]}
        style={styles.segmented}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="handshake-outline" size={64} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.3 }} />
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>
              No {tab} entries yet
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <View style={styles.cardTop}>
              <View style={styles.cardLeft}>
                <Text variant="titleSmall" style={{ fontWeight: '700' }}>{item.name}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Due: {item.dueDate ? formatDate(item.dueDate) : 'Not set'}
                  {isOverdue(item) && <Text style={{ color: '#EF5350' }}> · OVERDUE</Text>}
                </Text>
                {item.notes ? (
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.notes}</Text>
                ) : null}
              </View>
              <View style={styles.cardRight}>
                <Text variant="titleMedium" style={{ fontWeight: '800', color: tab === 'borrowed' ? '#5C6BC0' : '#26A69A' }}>
                  {settings.currency}{parseFloat(item.amount).toLocaleString('en-IN')}
                </Text>
                <Chip
                  compact
                  style={{ backgroundColor: item.status === 'paid' ? '#26A69A20' : '#FFA72620', marginTop: 4 }}
                  textStyle={{ color: item.status === 'paid' ? '#26A69A' : '#FFA726', fontSize: 10, fontWeight: '700' }}
                  onPress={() => toggleBorrowedStatus(item.id)}
                >
                  {item.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                </Chip>
              </View>
            </View>
            <View style={styles.cardActions}>
              <Button icon="pencil" mode="text" compact onPress={() => handleEdit(item)} textColor={theme.colors.onSurfaceVariant}>Edit</Button>
              <Button icon="delete" mode="text" compact onPress={() => setDeleteId(item.id)} textColor="#EF5350">Delete</Button>
            </View>
          </Surface>
        )}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: '#5C6BC0' }]}
        color="white"
        onPress={() => { setEditing(null); setModal(true); }}
      />
      <AddEntryModal
        visible={modal}
        mode="borrowed"
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
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontWeight: '800' },
  summaryRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 12 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 14 },
  segmented: { marginHorizontal: 16, marginBottom: 12 },
  card: {
    marginHorizontal: 16, marginVertical: 5, borderRadius: 18, padding: 16, overflow: 'hidden',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLeft: { flex: 1, gap: 2 },
  cardRight: { alignItems: 'flex-end' },
  cardActions: { flexDirection: 'row', marginTop: 8, gap: 4 },
  empty: { alignItems: 'center', marginTop: 60 },
  fab: { position: 'absolute', right: 20, bottom: 24 },
});
