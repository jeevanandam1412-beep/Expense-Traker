import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Switch, StyleSheet, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';

const CURRENCIES = [
  { label: 'INR (₹)', value: '₹' },
  { label: 'USD ($)', value: '$' },
  { label: 'EUR (€)', value: '€' },
  { label: 'GBP (£)', value: '£' },
  { label: 'JPY (¥)', value: '¥' },
];

export default function SettingsScreen({ navigation }) {
  const { state, actions, t, colors } = useApp();
  const { settings } = state;
  const styles = getStyles(colors);

  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [emailjsId, setEmailjsId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [language, setLanguage] = useState('en');
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
      setLanguage(settings.language || 'en');
      setDarkMode(settings.darkMode || false);
    }
  }, [settings]);

  const handleSave = async () => {
    await actions.saveSettings({ storeName, ownerName, currency, emailjsId, templateId, publicKey, privateKey, language, darkMode });
    Alert.alert(t('success'), t('saved'));
  };

  const handleClear = () => {
    Alert.alert(t('clear_all_data'), t('clear_warning'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'), style: 'destructive', onPress: async () => { actions.clearAllData(); Alert.alert('Done', 'All data has been cleared.'); } },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <Header title={t('settings')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile */}
        <SectionHeader title={t('store_profile')} icon="storefront-outline" theme={colors} />
        <View style={styles.card}>
          <SettingField label={t('store_name')} value={storeName} onChangeText={setStoreName} placeholder="..." icon="business-outline" theme={colors} />
          <Divider theme={colors} />
          <SettingField label={t('owner_name')} value={ownerName} onChangeText={setOwnerName} placeholder="..." icon="person-outline" theme={colors} />
        </View>

        {/* Preferences */}
        <SectionHeader title={t('preferences')} icon="options-outline" theme={colors} />
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} onPress={() => setShowCurrencyPicker(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.iconBox}><Ionicons name="cash-outline" size={20} color={colors.primary} /></View>
              <Text style={styles.settingLabel}>{t('currency')}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.settingValue}>{currency}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
            </View>
          </TouchableOpacity>
          <Divider theme={colors} />
          <View style={styles.settingRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.iconBox}><Ionicons name="language-outline" size={20} color={colors.primary} /></View>
              <Text style={styles.settingLabel}>{t('language')}</Text>
            </View>
            <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceContainerLow, borderRadius: 8, overflow: 'hidden' }}>
              <TouchableOpacity style={[styles.langBtn, language === 'en' && styles.langBtnActive]} onPress={() => setLanguage('en')}>
                <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.langBtn, language === 'ta' && styles.langBtnActive]} onPress={() => setLanguage('ta')}>
                <Text style={[styles.langText, language === 'ta' && styles.langTextActive]}>தமிழ்</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Divider theme={colors} />
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Ionicons name="moon-outline" size={20} color={colors.primary} />
              <View>
                <Text style={styles.switchLabel}>{t('dark_mode')}</Text>
                <Text style={styles.switchSub}>{t('adjust_low_light')}</Text>
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
        <SectionHeader title={t('email_config')} icon="mail-outline" theme={colors} />
        <View style={styles.card}>
          <SettingField label={t('emailjs_service_id')} value={emailjsId} onChangeText={setEmailjsId} placeholder="service_xxx" icon="cloud-outline" secureTextEntry theme={colors} />
          <Divider theme={colors} />
          <SettingField label={t('template_id')} value={templateId} onChangeText={setTemplateId} placeholder="template_xxx" icon="document-outline" theme={colors} />
          <Divider theme={colors} />
          <SettingField label={t('public_key')} value={publicKey} onChangeText={setPublicKey} placeholder="xxxxxxxxxxxxxxx" icon="key-outline" secureTextEntry theme={colors} />
          <Divider theme={colors} />
          <SettingField label={t('private_key')} value={privateKey} onChangeText={setPrivateKey} placeholder="xxxxxxxxxxxxxxx" icon="lock-closed-outline" secureTextEntry theme={colors} />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{t('save_settings')}</Text>
        </TouchableOpacity>

        {/* Data Management */}
        <SectionHeader title={t('data_management')} icon="warning-outline" color={colors.error} theme={colors} />
        <View style={[styles.card, { borderColor: colors.error + '40', borderWidth: 1 }]}>
          <TouchableOpacity style={styles.settingRow} onPress={handleClear}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.iconBox, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.error }]}>{t('clear_all_data')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Store Ledger v1.0.0 — Made with ❤️</Text>
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title, icon, color, theme }) {
  if (!theme) return null;
  const styles = getStyles(theme);
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, color && { color }]}>{title}</Text>
      <Ionicons name={icon} size={18} color={color || theme.primary + '60'} />
    </View>
  );
}

function SettingField({ label, value, onChangeText, placeholder, icon, secureTextEntry, theme }) {
  const styles = getStyles(theme);
  return (
    <View style={styles.fieldRow}>
      <Ionicons name={icon} size={20} color={theme.primary} />
      <View style={styles.fieldInfo}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.outline}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

function Divider({ theme }) {
  if (!theme) return null;
  return <View style={getStyles(theme).divider} />;
}

const getStyles = (theme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.onSurface },
  card: {
    backgroundColor: theme.surfaceContainerLow,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  fieldInfo: { flex: 1, gap: 2 },
  fieldLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: theme.onSurfaceVariant },
  fieldInput: { fontSize: 15, color: theme.onSurface, paddingVertical: 0 },
  divider: { height: 1, backgroundColor: theme.outlineVariant + '30', marginHorizontal: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  switchInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchLabel: { fontSize: 15, fontWeight: '600', color: theme.onSurface },
  switchSub: { fontSize: 12, color: theme.onSurfaceVariant },
  selectRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  selectInfo: { flex: 1 },
  settingLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: theme.onSurfaceVariant },
  settingValue: { fontSize: 15, color: theme.onSurface, fontWeight: '600', marginTop: 2 },
  currencyPicker: { borderTopWidth: 1, borderTopColor: theme.outlineVariant + '30' },
  currencyOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 },
  currencyOptionActive: { backgroundColor: theme.primary + '10' },
  currencyOptionText: { fontSize: 14, color: theme.onSurface, fontWeight: '500' },
  currencyOptionTextActive: { color: theme.primary, fontWeight: '700' },
  saveBtn: { backgroundColor: theme.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginHorizontal: 20, marginBottom: 24, shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: theme.onPrimary, fontSize: 15, fontWeight: '700' },
  dataActionRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  dataActionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  dataActionLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.onSurface },
  version: { textAlign: 'center', fontSize: 12, color: theme.outline, marginTop: 24 },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primary + '15' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  langBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  langBtnActive: { backgroundColor: theme.primary },
  langText: { fontSize: 12, fontWeight: '600', color: theme.onSurfaceVariant },
  langTextActive: { color: theme.onPrimary },
});
