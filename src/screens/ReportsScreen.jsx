import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import Header from '../components/Header';

const FILTERS = ['Today', 'Yesterday', 'Last 7 Days', 'Last Month', 'All'];

function inFilter(dateStr, filter) {
  const d = new Date(dateStr);
  const now = new Date();
  if (filter === 'Today') return d.toDateString() === now.toDateString();
  if (filter === 'Yesterday') {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    return d.toDateString() === y.toDateString();
  }
  if (filter === 'Last 7 Days') {
    const s = new Date(now); s.setDate(now.getDate() - 7);
    return d >= s;
  }
  if (filter === 'Last Month') {
    const s = new Date(now); s.setMonth(now.getMonth() - 1);
    return d >= s;
  }
  return true;
}

export default function ReportsScreen() {
  const { state } = useApp();
  const { income, expenses, borrowed, settings } = state;
  const currency = settings?.currency || '₹';

  const [filter, setFilter] = useState('All');

  const data = useMemo(() => {
    const filtIncome = income.filter(i => inFilter(i.createdAt, filter));
    const filtExpenses = expenses.filter(e => inFilter(e.createdAt, filter));
    const totalIncome = filtIncome.reduce((s, i) => s + parseFloat(i.amount || 0), 0);
    const totalExpense = filtExpenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    const netProfit = totalIncome - totalExpense;
    const transactions = filtIncome.length + filtExpenses.length;

    // Combine and sort
    const allTx = [
      ...filtIncome.map(i => ({ ...i, type: 'income' })),
      ...filtExpenses.map(e => ({ ...e, type: 'expense' })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Category breakdown for expenses
    const catMap = {};
    filtExpenses.forEach(e => {
      const c = e.category || 'Other';
      catMap[c] = (catMap[c] || 0) + parseFloat(e.amount || 0);
    });
    const categories = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

    // Weekly data (last 7 days)
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      const inc = income.filter(x => new Date(x.createdAt).toDateString() === dayStr).reduce((s, x) => s + parseFloat(x.amount || 0), 0);
      const exp = expenses.filter(x => new Date(x.createdAt).toDateString() === dayStr).reduce((s, x) => s + parseFloat(x.amount || 0), 0);
      weekData.push({ label: d.toLocaleDateString('en-IN', { weekday: 'short' }), inc, exp });
    }

    return { totalIncome, totalExpense, netProfit, transactions, allTx, categories, weekData };
  }, [income, expenses, filter]);

  const fmt = (n) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const maxBar = Math.max(...data.weekData.map(d => Math.max(d.inc, d.exp)), 1);

  const generateHtml = () => {
    const tableRows = data.allTx.map(tx => `
      <tr>
        <td>${new Date(tx.createdAt).toLocaleDateString('en-IN')}</td>
        <td><span class="badge ${tx.type}">${tx.type.toUpperCase()}</span></td>
        <td>${tx.description || tx.source || tx.category || 'Transaction'}</td>
        <td style="text-align: right; font-weight: bold; color: ${tx.type === 'income' ? '#22c55e' : '#ef4444'};">
          ${tx.type === 'income' ? '+' : '-'}${currency}${parseFloat(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </td>
      </tr>
    `).join('');

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #1e293b; }
            h1 { color: #0f172a; margin-bottom: 5px; }
            .subtitle { color: #64748b; font-size: 14px; margin-bottom: 30px; }
            .grid { display: flex; gap: 10px; margin-bottom: 30px; }
            .card { flex: 1; padding: 15px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; }
            .card-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
            .card-value { font-size: 20px; font-weight: bold; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { text-align: left; padding: 12px; background: #f1f5f9; color: #475569; font-size: 12px; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
            .income { background: #dcfce7; color: #16a34a; }
            .expense { background: #fee2e2; color: #dc2626; }
            .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${settings?.storeName || 'Store Ledger'}</h1>
          <div class="subtitle">Financial Report • ${filter} • Generated on ${new Date().toLocaleString('en-IN')}</div>
          
          <div class="grid">
            <div class="card">
              <div class="card-label">Total Income</div>
              <div class="card-value" style="color: #16a34a;">${currency}${fmt(data.totalIncome)}</div>
            </div>
            <div class="card">
              <div class="card-label">Total Expense</div>
              <div class="card-value" style="color: #dc2626;">${currency}${fmt(data.totalExpense)}</div>
            </div>
            <div class="card">
              <div class="card-label">Net Profit</div>
              <div class="card-value">${currency}${fmt(data.netProfit)}</div>
            </div>
          </div>

          <h3>Transactions</h3>
          <table>
            <tr><th>Date</th><th>Type</th><th>Description</th><th style="text-align: right;">Amount</th></tr>
            ${tableRows}
          </table>

          <div class="footer">
            Generated securely by ${settings?.storeName || 'the Store Ledger app'}.
          </div>
        </body>
      </html>
    `;
  };

  const handleDownloadPDF = async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html: generateHtml() });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e) {
      Alert.alert('Error', 'Failed to generate PDF.');
    }
  };

  const handleEmailReport = async () => {
    if (settings?.publicKey && settings?.templateId) {
      try {
        const { base64 } = await Print.printToFileAsync({ html: generateHtml(), base64: true });
        const pdfDataUrl = `data:application/pdf;base64,${base64}`;

        const payload = {
          service_id: settings.emailjsId || 'service_default',
          template_id: settings.templateId,
          user_id: settings.publicKey,
          accessToken: settings.privateKey,
          template_params: {
            store_name: settings?.storeName || 'Store Ledger',
            report_period: filter,
            total_income: `${currency}${fmt(data.totalIncome)}`,
            total_expense: `${currency}${fmt(data.totalExpense)}`,
            net_profit: `${currency}${fmt(data.netProfit)}`,
            pdf_attachment: pdfDataUrl,
          }
        };

        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        if (res.ok) {
           Alert.alert('Success', 'Report successfully sent via EmailJS!');
           return;
        } else {
           const errText = await res.text();
           console.log('EmailJS Error:', errText);
           Alert.alert('EmailJS Error', 'Failed to send via EmailJS. Falling back to default mail app.');
        }
      } catch (e) {
        console.log('EmailJS Network Error', e);
      }
    }

    try {
      const { uri } = await Print.printToFileAsync({ html: generateHtml() });
      await Sharing.shareAsync(uri, { dialogTitle: 'Email Report' });
    } catch (e) {
      Alert.alert('Error', 'Failed to email report.');
    }
  };

  return (
    <View style={styles.root}>
      <Header title="Reports" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} style={[styles.chip, filter === f && styles.chipActive]} onPress={() => setFilter(f)}>
              <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.tertiary + '1A' }]} onPress={handleDownloadPDF}>
            <Ionicons name="download-outline" size={20} color={colors.tertiary} />
            <Text style={[styles.actionBtnText, { color: colors.tertiary }]}>Save PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary + '1A' }]} onPress={handleEmailReport}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>Email Report</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Grid */}
        <View style={styles.summaryGrid}>
          <StatCard label="Total Income" value={`${currency}${fmt(data.totalIncome)}`} color={colors.tertiary} />
          <StatCard label="Total Expense" value={`${currency}${fmt(data.totalExpense)}`} color={colors.secondary} />
          <StatCard label="Net Profit" value={`${currency}${fmt(data.netProfit)}`} color={data.netProfit >= 0 ? colors.primary : colors.error} />
          <StatCard label="Transactions" value={`${data.transactions}`} color={colors.onSurface} />
        </View>

        {/* Cash Flow Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>Cash Flow Analysis</Text>
            <View style={styles.legend}>
              <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.tertiary }]} /><Text style={styles.legendText}>Income</Text></View>
              <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.secondary }]} /><Text style={styles.legendText}>Expense</Text></View>
            </View>
          </View>
          <View style={styles.chartBars}>
            {data.weekData.map(({ label, inc, exp }) => (
              <View key={label} style={styles.barGroup}>
                <View style={styles.barStack}>
                  <View style={[styles.bar, styles.barInc, { height: Math.max(4, (inc / maxBar) * 90) }]} />
                  <View style={[styles.bar, styles.barExp, { height: Math.max(4, (exp / maxBar) * 90) }]} />
                </View>
                <Text style={styles.barLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Expense Categories */}
        {data.categories.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Expenses by Category</Text>
            <View style={{ gap: 12, marginTop: 12 }}>
              {data.categories.map(([cat, val]) => {
                const pct = data.totalExpense > 0 ? (val / data.totalExpense) * 100 : 0;
                return (
                  <View key={cat}>
                    <View style={styles.catRow}>
                      <Text style={styles.catName}>{cat}</Text>
                      <Text style={styles.catPct}>{pct.toFixed(0)}% — {currency}{val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
                    </View>
                    <View style={styles.progressBg}>
                      <View style={[styles.progressFg, { width: `${pct}%`, backgroundColor: colors.secondary }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Transactions Table */}
        <View style={[styles.chartCard, { padding: 0, overflow: 'hidden' }]}>
          <Text style={[styles.cardTitle, { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }]}>All Transactions</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>Description</Text>
            <Text style={styles.th}>Type</Text>
            <Text style={[styles.th, { textAlign: 'right' }]}>Amount</Text>
          </View>
          {data.allTx.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={32} color={colors.outline} />
              <Text style={styles.emptyText}>No transactions in this period</Text>
            </View>
          ) : (
            data.allTx.map((tx, idx) => (
              <View key={tx.id} style={[styles.tableRow, idx % 2 === 0 && { backgroundColor: colors.surfaceContainerLow + '60' }]}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.tdMain} numberOfLines={1}>{tx.description || tx.source || 'Transaction'}</Text>
                  <Text style={styles.tdSub}>{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: tx.type === 'income' ? colors.tertiary + '20' : colors.secondary + '20' }]}>
                  <Text style={[styles.typeBadgeText, { color: tx.type === 'income' ? colors.tertiary : colors.secondary }]}>
                    {tx.type === 'income' ? 'IN' : 'EX'}
                  </Text>
                </View>
                <Text style={[styles.tdAmount, { color: tx.type === 'income' ? colors.tertiary : colors.secondary }]}>
                  {tx.type === 'income' ? '+' : '-'}{currency}{parseFloat(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, color }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingTop: 16, paddingBottom: 120 },
  filterRow: { marginBottom: 16, paddingHorizontal: 20 },
  actionRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.surfaceContainerLow },
  chipActive: { backgroundColor: colors.primaryContainer },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant },
  chipTextActive: { color: '#fff' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  statCard: {
    width: '47%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: colors.onSurfaceVariant, marginBottom: 6 },
  statValue: { fontSize: 20, fontWeight: '800' },
  chartCard: {
    marginHorizontal: 20,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.onSurface },
  legend: { flexDirection: 'row', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: colors.onSurfaceVariant },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 110, paddingHorizontal: 4 },
  barGroup: { flex: 1, alignItems: 'center', gap: 4 },
  barStack: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { width: 10, borderRadius: 4 },
  barInc: { backgroundColor: colors.tertiary },
  barExp: { backgroundColor: colors.secondary },
  barLabel: { fontSize: 9, color: colors.onSurfaceVariant, textTransform: 'uppercase', fontWeight: '600' },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  catName: { fontSize: 13, fontWeight: '600', color: colors.onSurface },
  catPct: { fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant },
  progressBg: { height: 6, backgroundColor: colors.surfaceContainerHigh, borderRadius: 3, overflow: 'hidden' },
  progressFg: { height: 6, borderRadius: 3 },
  tableHeader: { flexDirection: 'row', backgroundColor: colors.surfaceContainerLow, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', gap: 8 },
  th: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: colors.onSurfaceVariant },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderTopWidth: 1, borderTopColor: colors.surfaceContainer },
  tdMain: { fontSize: 13, fontWeight: '600', color: colors.onSurface },
  tdSub: { fontSize: 10, color: colors.onSurfaceVariant },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, minWidth: 30, alignItems: 'center' },
  typeBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  tdAmount: { fontSize: 13, fontWeight: '800', textAlign: 'right', flex: 1.5 },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 13, color: colors.onSurfaceVariant },
});
