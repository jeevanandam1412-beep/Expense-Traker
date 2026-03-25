import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Switch, StyleSheet, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import Header from '../components/Header';

const CURRENCIES = [
  { label: 'INR (₹)', value: '₹' },
  { label: 'USD ($)', value: '$' },
  { label: 'EUR (€)', value: '€' },
  { label: 'GBP (£)', value: '£' },
  { label: 'JPY (¥)', value: '¥' },
];

export default function SettingsScreen() {
  const { state, actions } = useApp();
  const { settings } = state;

  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [emailjsId, setEmailjsId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || '');
      setOwnerName(settings.ownerName || '');
      setCurrency(settings.currency || '₹');
      setEmailjsId(settings.emailjsId || '');
      setTemplateId(settings.templateId || '');
      setPublicKey(settings.publicKey || '');
      setPrivateKey(settings.privateKey || '');
      setDarkMode(settings.darkMode || false);
    }
  }, [settings]);

  const handleSave = async () => {
    await actions.saveSettings({ storeName, ownerName, currency, emailjsId, templateId, publicKey, privateKey, darkMode });
    Alert.alert('Saved', 'Settings saved successfully!');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete ALL income, expense and borrowed/lent records. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => { actions.clearAllData(); Alert.alert('Done', 'All data has been cleared.'); } },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <Header title="Settings" rightIcon="settings-outline" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Store Info */}
        <SectionHeader title="Store Info" icon="storefront-outline" />
        <View style={styles.card}>
          <SettingField label="Store Name" value={storeName} onChangeText={setStoreName} placeholder="e.g. My Store" icon="business-outline" />
          <Divider />
          <SettingField label="Owner Name" value={ownerName} onChangeText={setOwnerName} placeholder="e.g. Your Name" icon="person-outline" />
          <Divider />
          <TouchableOpacity style={styles.selectRow} onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}>
            <Ionicons name="cash-outline" size={20} color={colors.primary} />
            <View style={styles.selectInfo}>
              <Text style={styles.settingLabel}>Currency</Text>
              <Text style={styles.settingValue}>{CURRENCIES.find(c => c.value === currency)?.label || currency}</Text>
            </View>
            <Ionicons name={showCurrencyPicker ? 'chevron-up' : 'chevron-down'} size={18} color={colors.outline} />
          </TouchableOpacity>
          {showCurrencyPicker && (
            <View style={styles.currencyPicker}>
              {CURRENCIES.map(c => (
                <TouchableOpacity
                  key={c.value}
                  style={[styles.currencyOption, currency === c.value && styles.currencyOptionActive]}
                  onPress={() => { setCurrency(c.value); setShowCurrencyPicker(false); }}
                >
                  <Text style={[styles.currencyOptionText, currency === c.value && styles.currencyOptionTextActive]}>{c.label}</Text>
                  {currency === c.value && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Appearance */}
        <SectionHeader title="Appearance" icon="color-palette-outline" />
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Ionicons name="moon-outline" size={20} color={colors.primary} />
              <View>
                <Text style={styles.switchLabel}>Dark Mode</Text>
                <Text style={styles.switchSub}>Adjust for low light</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.surfaceContainerHigh, true: colors.primary }}
              thumbColor={darkMode ? colors.primaryFixed : colors.surfaceContainerLowest}
            />
          </View>
        </View>

        {/* Email Config */}
        <SectionHeader title="Email Config" icon="mail-outline" />
        <View style={styles.card}>
          <SettingField label="EmailJS Service ID" value={emailjsId} onChangeText={setEmailjsId} placeholder="service_xxx" icon="cloud-outline" secureTextEntry />
          <Divider />
          <SettingField label="Template ID" value={templateId} onChangeText={setTemplateId} placeholder="template_xxx" icon="document-outline" />
          <Divider />
          <SettingField label="Public Key" value={publicKey} onChangeText={setPublicKey} placeholder="xxxxxxxxxxxxxxx" icon="key-outline" secureTextEntry />
          <Divider />
          <SettingField label="Private Key" value={privateKey} onChangeText={setPrivateKey} placeholder="xxxxxxxxxxxxxxx" icon="lock-closed-outline" secureTextEntry />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>Save Settings</Text>
        </TouchableOpacity>

        {/* Data Management */}
        <SectionHeader title="Data Management" icon="server-outline" />
        <View style={styles.card}>
          <DataAction icon="download-outline" label="Export All Data" color={colors.primary} onPress={() => Alert.alert('Coming Soon', 'Export feature coming soon!')} />
          <Divider />
          <DataAction icon="trash-outline" label="Clear All Data" color={colors.error} onPress={handleClearData} destructive />
        </View>

        <Text style={styles.version}>Store Ledger v1.0.0 — Made with ❤️</Text>
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title, icon }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Ionicons name={icon} size={18} color={colors.primary + '60'} />
    </View>
  );
}

function SettingField({ label, value, onChangeText, placeholder, icon, secureTextEntry }) {
  return (
    <View style={styles.fieldRow}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View style={styles.fieldInfo}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

function DataAction({ icon, label, color, onPress, destructive }) {
  return (
    <TouchableOpacity style={styles.dataActionRow} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.dataActionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.dataActionLabel, destructive && { color }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={destructive ? color + '60' : colors.onSurfaceVariant} />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.onSurface },
  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  fieldInfo: { flex: 1, gap: 2 },
  fieldLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: colors.onSurfaceVariant },
  fieldInput: { fontSize: 15, color: colors.onSurface, paddingVertical: 0 },
  divider: { height: 1, backgroundColor: colors.outlineVariant + '30', marginHorizontal: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  switchInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchLabel: { fontSize: 15, fontWeight: '600', color: colors.onSurface },
  switchSub: { fontSize: 12, color: colors.onSurfaceVariant },
  selectRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  selectInfo: { flex: 1 },
  settingLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: colors.onSurfaceVariant },
  settingValue: { fontSize: 15, color: colors.onSurface, fontWeight: '600', marginTop: 2 },
  currencyPicker: { borderTopWidth: 1, borderTopColor: colors.outlineVariant + '30' },
  currencyOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 },
  currencyOptionActive: { backgroundColor: colors.primary + '10' },
  currencyOptionText: { fontSize: 14, color: colors.onSurface, fontWeight: '500' },
  currencyOptionTextActive: { color: colors.primary, fontWeight: '700' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  saveBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  dataActionRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  dataActionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  dataActionLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.onSurface },
  version: { textAlign: 'center', fontSize: 12, color: colors.outline, marginTop: 24 },
});
