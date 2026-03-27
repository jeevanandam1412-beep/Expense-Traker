import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TextInput, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const INCOME_SOURCES = ['Sales', 'Bank Transfer', 'Online Store', 'Cash', 'Other'];
const EXPENSE_CATS = ['Rent', 'Stock', 'Salary', 'Utilities', 'Transport', 'Food', 'Other'];

export default function AddModal({ visible, onClose, onSave, type, currency = '₹', initialData = null }) {
  const { t, colors } = useApp();
  const styles = getStyles(colors);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const [borrowType, setBorrowType] = useState('borrowed');
  const [personName, setPersonName] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setAmount(initialData.amount ? initialData.amount.toString() : '');
        setDescription(initialData.description || '');
        setCategory(initialData.category || '');
        setSource(initialData.source || '');
        setNotes(initialData.notes || '');
        setPersonName(initialData.personName || '');
        setDueDate(initialData.dueDate || '');
        setBorrowType(initialData.borrowType || 'borrowed');
      } else {
        reset();
      }
    }
  }, [visible, initialData]);

  const reset = () => {
    setAmount(''); setDescription(''); setCategory(''); setSource('');
    setNotes(''); setPersonName(''); setDueDate(''); setBorrowType('borrowed');
  };

  const handleSave = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    let item = { amount: parseFloat(amount), date: initialData?.date || new Date().toISOString() };
    if (initialData?.id) item.id = initialData.id;
    if (initialData?.createdAt) item.createdAt = initialData.createdAt;
    if (initialData?.status) item.status = initialData.status;

    if (type === 'income') {
      item = { ...item, description, source: source || 'Sales', notes };
    } else if (type === 'expense') {
      item = { ...item, description, category: category || 'Other', notes };
    } else if (type === 'borrowed') {
      if (!personName.trim()) { Alert.alert('Missing Info', 'Please enter a person name.'); return; }
      item = { ...item, personName, borrowType: 'borrowed', dueDate, notes };
    }

    onSave(item);
    reset();
    onClose();
  };

  const isEdit = !!initialData;
  const titles = { income: isEdit ? t('edit_income') : t('add_income'), expense: isEdit ? t('edit_expense') : t('add_expense'), borrowed: isEdit ? t('edit_borrowed') : t('add_borrowed') };
  const accentColor = type === 'income' ? colors.tertiary : type === 'expense' ? colors.secondary : colors.orange;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform?.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{titles[type]}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => { reset(); onClose(); }}>
              <Ionicons name="close" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* AMOUNT */}
            <Text style={styles.label}>{t('amount').toUpperCase()}</Text>
            <View style={styles.amountRow}>
              <Text style={[styles.currencySign, { color: accentColor }]}>{currency}</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor={colors.outlineVariant}
              />
            </View>

            {/* BORROWED ONLY */}
            {type === 'borrowed' && (
              <>
                <Text style={styles.label}>PERSON NAME</Text>
                <TextInput
                  style={styles.input}
                  value={personName}
                  onChangeText={setPersonName}
                  placeholder="e.g. John Smith"
                  placeholderTextColor={colors.outline}
                />
                <Text style={styles.label}>{t('date').toUpperCase()} ({t('optional')})</Text>
                <TextInput
                  style={styles.input}
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="e.g. 2024-12-31"
                  placeholderTextColor={colors.outline}
                />
              </>
            )}

            {/* DESCRIPTION */}
            {(type === 'income' || type === 'expense') && (
              <>
                <Text style={styles.label}>{t('description_optional').toUpperCase()}</Text>
                <TextInput
                  style={styles.input}
                  value={description}
                  onChangeText={setDescription}
                  placeholder={type === 'income' ? 'e.g. Store Sales' : 'e.g. Office Rent'}
                  placeholderTextColor={colors.outline}
                />
              </>
            )}

            {/* CATEGORY / SOURCE */}
            {type === 'income' && (
              <>
                <Text style={styles.label}>{t('title_source')}</Text>
                <View style={styles.chipRow}>
                  {INCOME_SOURCES.map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.chip, source === s && { backgroundColor: colors.tertiary }]}
                      onPress={() => setSource(s)}
                    >
                      <Text style={[styles.chipText, source === s && { color: '#fff' }]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            {type === 'expense' && (
              <>
                <Text style={styles.label}>{t('category')}</Text>
                <View style={styles.chipRow}>
                  {EXPENSE_CATS.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.chip, category === c && { backgroundColor: colors.secondary }]}
                      onPress={() => setCategory(c)}
                    >
                      <Text style={[styles.chipText, category === c && { color: '#fff' }]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* DESCRIPTION */}
            <View style={{ marginTop: 14 }}>
              <Text style={styles.label}>{t('description_optional')}</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={description}
                onChangeText={setDescription}
                placeholder="..."
                placeholderTextColor={colors.outline}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* NOTES */}
            <View style={{ marginTop: 14 }}>
              <Text style={styles.label}>{t('description')}</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="..."
                placeholderTextColor={colors.outline}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: accentColor }]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>{t('save')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getStyles = (theme) => StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(24,28,32,0.4)',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform?.OS === 'ios' ? 40 : 24,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 24,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.outlineVariant,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.onSurface,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 14,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceContainerLow,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  currencySign: {
    fontSize: 22,
    fontWeight: '800',
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
    color: theme.onSurface,
    paddingVertical: 12,
  },
  input: {
    backgroundColor: theme.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: theme.onSurface,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: theme.surfaceContainerHigh,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.onSurfaceVariant,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: theme.surfaceContainerHigh,
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 999,
  },
  toggleBtnActive: {
    backgroundColor: theme.primaryContainer,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.onSurfaceVariant,
  },
  toggleTextActive: {
    color: '#fff',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 24,
    marginBottom: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
  },
});
