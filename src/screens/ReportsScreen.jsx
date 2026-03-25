import React, { useState, useMemo } from 'react';
import {
  View, ScrollView, StyleSheet, FlatList, Dimensions, Alert,
} from 'react-native';
import {
  Text, useTheme, Button, Surface, Divider, ActivityIndicator, Portal, Dialog, TextInput,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-chart-kit';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useApp } from '../store/AppContext';
import FilterBar from '../components/FilterBar';
import { DATE_FILTERS } from '../utils/constants';
import { getDateRange, isInRange, formatDate, getLast7DayLabels, getLast7DayValues } from '../utils/dateHelpers';
import { totalIncome, totalExpense, profit, categoryBreakdown } from '../utils/calculations';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const theme = useTheme();
  const { income, expenses, settings } = useApp();
  const [filter, setFilter] = useState('7days');
  const [customStart, setCustomStart] = useState(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
  const [customEnd, setCustomEnd] = useState(dayjs().format('YYYY-MM-DD'));
  const [showCustom, setShowCustom] = useState(false);
  const [generating, setGenerating] = useState(false);

  const { start, end } = useMemo(
    () => getDateRange(filter, customStart, customEnd),
    [filter, customStart, customEnd]
  );

  const filteredIncome = useMemo(() => income.filter((i) => isInRange(i.date, start, end)), [income, start, end]);
  const filteredExpenses = useMemo(() => expenses.filter((e) => isInRange(e.date, start, end)), [expenses, start, end]);

  const tIncome = useMemo(() => totalIncome(filteredIncome), [filteredIncome]);
  const tExpense = useMemo(() => totalExpense(filteredExpenses), [filteredExpenses]);
  const tProfit = useMemo(() => profit(filteredIncome, filteredExpenses), [tIncome, tExpense]);
  const categories = useMemo(() => categoryBreakdown(filteredExpenses), [filteredExpenses]);

  const labels = getLast7DayLabels();
  const incData = getLast7DayValues(filteredIncome);
  const expData = getLast7DayValues(filteredExpenses);

  const sym = settings.currency;

  const handleFilter = (v) => {
    setFilter(v);
    if (v === 'custom') setShowCustom(true);
  };

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => `rgba(103, 80, 164, ${opacity})`,
    labelColor: () => theme.colors.onSurfaceVariant,
    strokeWidth: 2,
    propsForBackgroundLines: { stroke: theme.colors.surfaceVariant },
    decimalPlaces: 0,
  };

  // Generate PDF
  const generatePDF = async () => {
    setGenerating(true);
    try {
      const allTx = [
        ...filteredIncome.map((i) => ({ ...i, _type: 'Income', _sub: i.source })),
        ...filteredExpenses.map((e) => ({ ...e, _type: 'Expense', _sub: e.category })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      const rows = allTx.map((tx) => `
        <tr style="border-bottom:1px solid #eee">
          <td style="padding:8px">${tx.date}</td>
          <td style="padding:8px">${tx._type}</td>
          <td style="padding:8px">${tx._sub}</td>
          <td style="padding:8px;text-align:right;color:${tx._type === 'Income' ? '#26A69A' : '#EF5350'}">
            ${tx._type === 'Income' ? '+' : '-'}${sym}${parseFloat(tx.amount).toLocaleString('en-IN')}
          </td>
          <td style="padding:8px;color:#888">${tx.notes || '-'}</td>
        </tr>
      `).join('');

      const catRows = categories.map((c) => `
        <tr>
          <td style="padding:6px">${c.name}</td>
          <td style="padding:6px;text-align:right;color:#EF5350">${sym}${c.amount.toLocaleString('en-IN')}</td>
        </tr>
      `).join('');

      const html = `
        <!DOCTYPE html><html><head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 24px; color: #1a1a1a; }
          h1 { color: #5C6BC0; margin-bottom: 4px; }
          .subtitle { color: #666; margin-bottom: 24px; font-size: 13px; }
          .summary { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
          .card { background: #f5f5f5; border-radius: 12px; padding: 16px; min-width: 140px; flex: 1; }
          .card-label { font-size: 11px; color: #888; margin-bottom: 4px; }
          .card-value { font-size: 22px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background: #f0f0f0; padding: 10px 8px; text-align: left; font-size: 12px; }
          tr:nth-child(even) { background: #fafafa; }
          h2 { color: #333; margin-top: 24px; font-size: 16px; }
        </style>
        </head><body>
        <h1>📊 ${settings.storeName}</h1>
        <div class="subtitle">Expense Report · ${start.format('DD MMM YYYY')} – ${end.format('DD MMM YYYY')}</div>
        
        <div class="summary">
          <div class="card">
            <div class="card-label">TOTAL INCOME</div>
            <div class="card-value" style="color:#26A69A">${sym}${tIncome.toLocaleString('en-IN')}</div>
          </div>
          <div class="card">
            <div class="card-label">TOTAL EXPENSE</div>
            <div class="card-value" style="color:#EF5350">${sym}${tExpense.toLocaleString('en-IN')}</div>
          </div>
          <div class="card">
            <div class="card-label">PROFIT / LOSS</div>
            <div class="card-value" style="color:${tProfit >= 0 ? '#5C6BC0' : '#EF5350'}">${tProfit < 0 ? '-' : ''}${sym}${Math.abs(tProfit).toLocaleString('en-IN')}</div>
          </div>
        </div>

        ${categories.length ? `
        <h2>Expense by Category</h2>
        <table>
          <tr><th>Category</th><th style="text-align:right">Amount</th></tr>
          ${catRows}
        </table>` : ''}

        <h2>All Transactions</h2>
        <table>
          <tr>
            <th>Date</th><th>Type</th><th>Category/Source</th>
            <th style="text-align:right">Amount</th><th>Notes</th>
          </tr>
          ${rows || '<tr><td colspan="5" style="padding:16px;text-align:center;color:#999">No transactions in this period</td></tr>'}
        </table>

        <div style="margin-top:32px;font-size:11px;color:#999;text-align:center">
          Generated on ${dayjs().format('DD MMM YYYY, hh:mm A')} · ${settings.storeName}
        </div>
        </body></html>
      `;

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      setGenerating(false);
      return uri;
    } catch (e) {
      setGenerating(false);
      Alert.alert('Error', 'Failed to generate PDF');
      return null;
    }
  };

  const handleDownload = async () => {
    const uri = await generatePDF();
    if (uri && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
    }
  };

  const allTx = [
    ...filteredIncome.map((i) => ({ ...i, _type: 'Income', _sub: i.source })),
    ...filteredExpenses.map((e) => ({ ...e, _type: 'Expense', _sub: e.category })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>📊 Reports</Text>
        </View>

        <FilterBar options={DATE_FILTERS} selected={filter} onSelect={handleFilter} />

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          {[
            { label: 'Income', value: tIncome, color: '#26A69A' },
            { label: 'Expense', value: tExpense, color: '#EF5350' },
            { label: tProfit >= 0 ? 'Profit' : 'Loss', value: Math.abs(tProfit), color: tProfit >= 0 ? '#5C6BC0' : '#EF5350' },
          ].map((s) => (
            <Surface key={s.label} style={[styles.summaryCard, { backgroundColor: s.color + '15' }]} elevation={0}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{s.label}</Text>
              <Text variant="titleSmall" style={{ fontWeight: '800', color: s.color }}>
                {sym}{s.value.toLocaleString('en-IN')}
              </Text>
            </Surface>
          ))}
        </View>

        {/* Bar Chart */}
        {(tIncome > 0 || tExpense > 0) && (
          <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <Text variant="titleSmall" style={styles.chartTitle}>Income vs Expense (Last 7 Days)</Text>
            <BarChart
              data={{ labels, datasets: [{ data: incData }] }}
              width={width - 64}
              height={160}
              chartConfig={{ ...chartConfig, color: () => '#26A69A' }}
              style={{ borderRadius: 12 }}
              fromZero
              showBarTops={false}
            />
          </Surface>
        )}

        {/* Pie Chart */}
        {categories.length > 0 && (
          <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <Text variant="titleSmall" style={styles.chartTitle}>Expense by Category</Text>
            <PieChart
              data={categories.map((c) => ({ ...c, population: c.amount }))}
              width={width - 64}
              height={180}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </Surface>
        )}

        {/* Transaction Table */}
        <Surface style={[styles.tableCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <Text variant="titleSmall" style={styles.chartTitle}>
            Transactions ({allTx.length})
          </Text>
          <View style={styles.tableHeader}>
            {['Date', 'Type', 'Category', 'Amount'].map((h) => (
              <Text key={h} variant="labelSmall" style={[styles.tableHeaderCell, { color: theme.colors.onSurfaceVariant }]}>{h}</Text>
            ))}
          </View>
          <Divider />
          {allTx.length === 0 ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', padding: 24 }}>
              No transactions in this period
            </Text>
          ) : (
            allTx.map((tx, idx) => (
              <View key={tx.id} style={[styles.tableRow, idx % 2 === 0 && { backgroundColor: theme.colors.surfaceVariant + '30' }]}>
                <Text style={styles.tableCell}>{formatDate(tx.date)}</Text>
                <Text style={[styles.tableCell, { color: tx._type === 'Income' ? '#26A69A' : '#EF5350', fontWeight: '600' }]}>
                  {tx._type}
                </Text>
                <Text style={styles.tableCell}>{tx._sub}</Text>
                <Text style={[styles.tableCell, { color: tx._type === 'Income' ? '#26A69A' : '#EF5350', fontWeight: '700' }]}>
                  {tx._type === 'Income' ? '+' : '-'}{sym}{parseFloat(tx.amount).toLocaleString('en-IN')}
                </Text>
              </View>
            ))
          )}
        </Surface>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="file-pdf-box"
            onPress={handleDownload}
            loading={generating}
            style={[styles.actionBtn, { backgroundColor: '#EF5350' }]}
          >
            Export PDF
          </Button>
          <Button
            mode="outlined"
            icon="share-variant"
            onPress={handleDownload}
            style={styles.actionBtn}
          >
            Share
          </Button>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Custom date dialog */}
      <Portal>
        <Dialog visible={showCustom} onDismiss={() => setShowCustom(false)}>
          <Dialog.Title>Custom Date Range</Dialog.Title>
          <Dialog.Content style={{ gap: 12 }}>
            <TextInput label="Start Date (YYYY-MM-DD)" value={customStart} onChangeText={setCustomStart} mode="outlined" />
            <TextInput label="End Date (YYYY-MM-DD)" value={customEnd} onChangeText={setCustomEnd} mode="outlined" />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCustom(false)}>Cancel</Button>
            <Button onPress={() => setShowCustom(false)} mode="contained">Apply</Button>
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
  summaryRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  summaryCard: { flex: 1, borderRadius: 14, padding: 12 },
  chartCard: { marginHorizontal: 16, marginTop: 12, borderRadius: 20, padding: 16 },
  chartTitle: { fontWeight: '700', marginBottom: 12 },
  tableCard: { marginHorizontal: 16, marginTop: 12, borderRadius: 20, padding: 16, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', paddingBottom: 8 },
  tableHeaderCell: { flex: 1, fontWeight: '700' },
  tableRow: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 4, borderRadius: 6 },
  tableCell: { flex: 1, fontSize: 11.5 },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 16 },
  actionBtn: { flex: 1 },
});
