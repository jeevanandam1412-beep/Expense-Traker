import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function TransactionCard({ item, type, currency = '₹', onDelete, onEdit }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const isIncome = type === 'income';
  const isExpense = type === 'expense';
  const isBorrowed = type === 'borrowed';

  const accentColor = isIncome ? colors.tertiary : isExpense ? colors.secondary : colors.orange;
  const sign = isIncome ? '+' : '-';
  const iconName = isIncome
    ? 'cash-outline'
    : isExpense
    ? 'trending-down-outline'
    : isBorrowed && item.borrowType === 'lent'
    ? 'arrow-up-circle-outline'
    : 'arrow-down-circle-outline';

  return (
    <TouchableOpacity style={[styles.card, { borderRightColor: accentColor }]} activeOpacity={0.85}>
      <View style={[styles.iconBox, { backgroundColor: accentColor + '1A' }]}>
        <Ionicons name={iconName} size={22} color={accentColor} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.description || item.personName || 'Transaction'}</Text>
        <Text style={styles.sub} numberOfLines={1}>{item.category || item.source || item.borrowType || ''} • {formatDate(item.createdAt || item.date)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: accentColor }]}>
          {isBorrowed ? (item.borrowType === 'lent' ? '+' : '-') : sign}{currency}{parseFloat(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        {item.status ? (
          <View style={[styles.badge, item.status === 'paid' ? styles.badgePaid : styles.badgePending]}>
            <Text style={[styles.badgeText, item.status === 'paid' ? styles.badgePaidText : styles.badgePendingText]}>
              {item.status === 'paid' ? 'Paid' : 'Pending'}
            </Text>
          </View>
        ) : null}
      </View>
      <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuVisible(true)}>
        <Ionicons name="ellipsis-vertical" size={20} color={colors.outline} />
      </TouchableOpacity>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <View style={styles.menuBox}>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); if (onEdit) onEdit(item); }}>
                <Ionicons name="pencil-outline" size={18} color={colors.onSurface} />
                <Text style={styles.menuItemText}>Edit</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); if (onDelete) onDelete(); }}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
                <Text style={[styles.menuItemText, { color: colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </TouchableOpacity>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const now = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return `Today ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderRightWidth: 4,
    gap: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  sub: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  menuBtn: {
    padding: 8,
    marginRight: -8,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBox: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.outlineVariant + '30',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  badgePendingText: {
    color: '#92400E',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgePaid: {
    backgroundColor: colors.tertiaryFixed,
  },
  badgePaidText: {
    color: colors.tertiary,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
