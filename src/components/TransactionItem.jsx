import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDate as fmtDate } from '../utils/dateHelpers';
import { getCategoryColor } from '../utils/constants';

export default function TransactionItem({ item, type, onEdit, onDelete, currency = '₹' }) {
  const theme = useTheme();
  const isExpense = type === 'expense';
  const isBorrowed = type === 'borrowed';

  const color = isExpense
    ? getCategoryColor(item.category)
    : isBorrowed
    ? item.type === 'lent' ? '#26A69A' : '#5C6BC0'
    : '#26A69A';

  const icon = isExpense
    ? 'tag'
    : isBorrowed
    ? item.type === 'lent' ? 'arrow-top-right' : 'arrow-bottom-left'
    : 'cash';

  const subtitle = isExpense
    ? item.category
    : isBorrowed
    ? `${item.name} · ${item.type === 'lent' ? 'Lent' : 'Borrowed'}`
    : item.source;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.iconBox, { backgroundColor: color + '18' }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <View style={styles.middle}>
        <Text variant="bodyMedium" style={{ fontWeight: '600', color: theme.colors.onSurface }}>
          {subtitle}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {fmtDate(item.date)}{item.notes ? ` · ${item.notes}` : ''}
        </Text>
        {isBorrowed && (
          <Text variant="labelSmall" style={{
            color: item.status === 'paid' ? '#26A69A' : '#FFA726',
            fontWeight: '600', marginTop: 2,
          }}>
            {item.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
          </Text>
        )}
      </View>
      <View style={styles.right}>
        <Text variant="titleSmall" style={{ color, fontWeight: '700' }}>
          {currency}{parseFloat(item.amount).toLocaleString('en-IN')}
        </Text>
        <View style={styles.actions}>
          <IconButton icon="pencil" size={16} onPress={() => onEdit(item)} iconColor={theme.colors.onSurfaceVariant} style={styles.actionBtn} />
          <IconButton icon="delete" size={16} onPress={() => onDelete(item.id)} iconColor="#EF5350" style={styles.actionBtn} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  middle: { flex: 1 },
  right: { alignItems: 'flex-end' },
  actions: { flexDirection: 'row', marginTop: -4 },
  actionBtn: { margin: 0, padding: 0, width: 28, height: 28 },
});
