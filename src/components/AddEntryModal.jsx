import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import {
  Modal, Portal, Text, Button, TextInput, useTheme, SegmentedButtons, Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { EXPENSE_CATEGORIES, INCOME_SOURCES } from '../utils/constants';

const MODAL_TYPES = ['income', 'expense', 'borrowed'];

export default function AddEntryModal({ visible, onDismiss, mode = 'expense', initial = null, onSubmit }) {
  const theme = useTheme();
  const isEdit = !!initial;

  const [amount, setAmount] = useState(initial?.amount?.toString() || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [date, setDate] = useState(initial?.date || dayjs().format('YYYY-MM-DD'));

  // Income fields
  const [source, setSource] = useState(initial?.source || 'Sales');
  // Expense fields
  const [category, setCategory] = useState(initial?.category || 'Other');
  // Borrowed fields
  const [name, setName] = useState(initial?.name || '');
  const [borrowType, setBorrowType] = useState(initial?.type || 'borrowed');
  const [dueDate, setDueDate] = useState(initial?.dueDate || '');

  const handleSubmit = () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    const base = { amount: parseFloat(amount), notes, date, status: initial?.status || 'pending' };
    if (mode === 'income') onSubmit({ ...base, source });
    else if (mode === 'expense') onSubmit({ ...base, category });
    else onSubmit({ ...base, name, type: borrowType, dueDate });
    onDismiss();
  };

  const titles = { income: '💰 Income', expense: '💸 Expense', borrowed: '🤝 Borrowed / Lent' };
  const colors = { income: '#26A69A', expense: '#EF5350', borrowed: '#5C6BC0' };
  const accent = colors[mode];

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.header, { borderBottomColor: theme.colors.surfaceVariant }]}>
            <Text variant="titleLarge" style={{ fontWeight: '700', color: accent }}>
              {isEdit ? 'Edit ' : 'Add '}{titles[mode]}
            </Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.body}>
              <TextInput
                label="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                mode="outlined"
                left={<TextInput.Affix text="₹" />}
                style={styles.input}
              />
              <TextInput
                label="Date (YYYY-MM-DD)"
                value={date}
                onChangeText={setDate}
                mode="outlined"
                style={styles.input}
              />

              {mode === 'income' && (
                <View style={styles.chipGroup}>
                  <Text variant="labelLarge" style={styles.label}>Source</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                      {INCOME_SOURCES.map((s) => (
                        <Button
                          key={s}
                          mode={source === s ? 'contained' : 'outlined'}
                          onPress={() => setSource(s)}
                          compact
                          style={styles.chip}
                          labelStyle={{ fontSize: 11 }}
                        >
                          {s}
                        </Button>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {mode === 'expense' && (
                <View style={styles.chipGroup}>
                  <Text variant="labelLarge" style={styles.label}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                      {EXPENSE_CATEGORIES.map((c) => (
                        <Button
                          key={c.value}
                          mode={category === c.value ? 'contained' : 'outlined'}
                          onPress={() => setCategory(c.value)}
                          compact
                          style={styles.chip}
                          buttonColor={category === c.value ? c.color : undefined}
                          labelStyle={{ fontSize: 11 }}
                        >
                          {c.label}
                        </Button>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {mode === 'borrowed' && (
                <>
                  <TextInput
                    label="Person's Name"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                  />
                  <SegmentedButtons
                    value={borrowType}
                    onValueChange={setBorrowType}
                    buttons={[
                      { value: 'borrowed', label: 'I Owe (Borrowed)' },
                      { value: 'lent', label: 'Owe Me (Lent)' },
                    ]}
                    style={styles.input}
                  />
                  <TextInput
                    label="Due Date (YYYY-MM-DD)"
                    value={dueDate}
                    onChangeText={setDueDate}
                    mode="outlined"
                    style={styles.input}
                  />
                </>
              )}

              <TextInput
                label="Notes (optional)"
                value={notes}
                onChangeText={setNotes}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={styles.input}
              />

              <View style={styles.actions}>
                <Button onPress={onDismiss} style={{ flex: 1 }}>Cancel</Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={{ flex: 1, backgroundColor: accent }}
                  disabled={!amount}
                >
                  {isEdit ? 'Save' : 'Add'}
                </Button>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 16,
    borderRadius: 24,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  body: { padding: 20, gap: 12 },
  input: { marginBottom: 4 },
  label: { marginBottom: 8, fontWeight: '600' },
  chipGroup: { gap: 4 },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'nowrap' },
  chip: { borderRadius: 20 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
