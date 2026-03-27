import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import TransactionCard from '../components/TransactionCard';
import AddModal from '../components/AddModal';

export default function BorrowedScreen() {
  const { state, actions, t, colors } = useApp();
  const { borrowed, settings } = state;
  const currency = settings?.currency || '₹';
  const styles = getStyles(colors);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const filtered = useMemo(() => borrowed.filter(b => b.borrowType === 'borrowed'), [borrowed]);

  const totals = useMemo(() => {
    const totalBorrowed = borrowed.filter(b => b.borrowType === 'borrowed').reduce((s, i) => s + parseFloat(i.amount || 0), 0);
    return { totalBorrowed };
  }, [borrowed]);

  const fmt = (n) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleDelete = (id) => {
    Alert.alert(t('delete'), t('delete_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => actions.deleteBorrowed(id) },
    ]);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleSave = async (item) => {
    if (item.id) {
      await actions.updateBorrowed(item.id, item);
    } else {
      await actions.addBorrowed(item);
    }
  };

  const handleMarkPaid = (id) => {
    Alert.alert(t('mark_settled'), t('mark_settled_confirm') || 'Mark this entry as settled?', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('settled'), onPress: () => actions.markBorrowedPaid(id) },
    ]);
  };

  return (
    <View style={styles.root}>
      <Header title={t('borrowed')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Net Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceMain}>
            <Text style={styles.balanceLabel}>{t('total_borrowed')}</Text>
            <Text style={[styles.balanceValue, { color: colors.secondary }]}>
              {currency}{fmt(totals.totalBorrowed)}
            </Text>
          </View>
        </View>

        {/* List */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.outline} />
            <Text style={styles.emptyText}>{t('no_borrowed')}</Text>
            <Text style={styles.emptySubText}>{t('quick_add')}</Text>
          </View>
        ) : (
          filtered.map(item => (
            <View key={item.id}>
              <TransactionCard
                item={item}
                type="borrowed"
                currency={currency}
                onDelete={() => handleDelete(item.id)}
                onEdit={handleEdit}
              />
              {item.status !== 'paid' && (
                <TouchableOpacity
                  style={styles.markPaidBtn}
                  onPress={() => handleMarkPaid(item.id)}
                >
                  <Ionicons name="checkmark-circle-outline" size={14} color={colors.tertiary} />
                  <Text style={styles.markPaidText}>{t('mark_settled')}</Text>
                </TouchableOpacity>
              )}
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
        type="borrowed"
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
  balanceCard: {
    backgroundColor: theme.surfaceContainerLow,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    gap: 16,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  balanceMain: { gap: 4 },
  balanceLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: theme.onSurfaceVariant },
  balanceValue: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  balanceRow: { flexDirection: 'row', gap: 12 },
  balanceSub: { flex: 1, backgroundColor: theme.surfaceContainerLowest, borderRadius: 12, padding: 14 },
  balanceSubLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: theme.onSurfaceVariant, marginBottom: 4 },
  balanceSubValue: { fontSize: 18, fontWeight: '800' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: theme.onSurfaceVariant },
  emptySubText: { fontSize: 13, color: theme.outline },
  markPaidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: -6,
    marginBottom: 6,
  },
  markPaidText: { fontSize: 12, fontWeight: '700', color: theme.tertiary },
  fab: {
    position: 'absolute',
    bottom: Platform?.OS === 'ios' ? 108 : 88,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: theme.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
});
