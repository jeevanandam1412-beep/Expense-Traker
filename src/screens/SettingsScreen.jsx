import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  Text, useTheme, TextInput, Button, List, Switch, Divider, Surface,
  SegmentedButtons, Portal, Dialog,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useApp } from '../store/AppContext';
import { CURRENCIES } from '../utils/constants';
import { exportBackup } from '../services/storageService';

export default function SettingsScreen({ navigation }) {
  const theme = useTheme();
  const { settings, updateSettings, clearAll } = useApp();
  const [clearDialog, setClearDialog] = useState(false);
  const [storeName, setStoreName] = useState(settings.storeName);
  const [emailjsServiceId, setEmailjsServiceId] = useState(settings.emailjs?.serviceId || '');
  const [emailjsTemplateId, setEmailjsTemplateId] = useState(settings.emailjs?.templateId || '');
  const [emailjsPublicKey, setEmailjsPublicKey] = useState(settings.emailjs?.publicKey || '');
  const [recipientEmail, setRecipientEmail] = useState(settings.emailjs?.recipientEmail || '');

  const handleSave = () => {
    updateSettings({
      storeName,
      emailjs: { serviceId: emailjsServiceId, templateId: emailjsTemplateId, publicKey: emailjsPublicKey, recipientEmail },
    });
    Alert.alert('Saved', 'Settings updated successfully');
  };

  const handleTheme = (v) => updateSettings({ theme: v });
  const handleCurrency = (v) => updateSettings({ currency: v });

  const handleBackup = async () => {
    try {
      const json = await exportBackup();
      const path = FileSystem.documentDirectory + 'expense_backup.json';
      await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path, { mimeType: 'application/json' });
    } catch (e) {
      Alert.alert('Error', 'Could not export backup');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Store Info */}
        <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Text variant="titleSmall" style={styles.sectionTitle}>Store Info</Text>
          <TextInput
            label="Store Name"
            value={storeName}
            onChangeText={setStoreName}
            mode="outlined"
            left={<TextInput.Icon icon="store" />}
            style={styles.input}
          />
        </Surface>

        {/* Appearance */}
        <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Text variant="titleSmall" style={styles.sectionTitle}>Appearance</Text>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>Theme</Text>
          <SegmentedButtons
            value={settings.theme}
            onValueChange={handleTheme}
            buttons={[
              { value: 'light', label: '☀️ Light', icon: 'white-balance-sunny' },
              { value: 'dark', label: '🌙 Dark', icon: 'moon-waning-crescent' },
            ]}
            style={styles.input}
          />

          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8, marginTop: 12 }}>Currency</Text>
          <SegmentedButtons
            value={settings.currency}
            onValueChange={handleCurrency}
            buttons={CURRENCIES.slice(0, 3).map((c) => ({ value: c.value, label: c.label.split(' ')[0] }))}
            style={styles.input}
          />
        </Surface>

        {/* Email (optional) */}
        <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Text variant="titleSmall" style={styles.sectionTitle}>EmailJS Config (Optional)</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
            Configure to send reports via email from Reports screen.
          </Text>
          {[
            { label: 'Service ID', value: emailjsServiceId, set: setEmailjsServiceId },
            { label: 'Template ID', value: emailjsTemplateId, set: setEmailjsTemplateId },
            { label: 'Public Key', value: emailjsPublicKey, set: setEmailjsPublicKey },
            { label: 'Recipient Email', value: recipientEmail, set: setRecipientEmail },
          ].map((f) => (
            <TextInput
              key={f.label}
              label={f.label}
              value={f.value}
              onChangeText={f.set}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
            />
          ))}
        </Surface>

        {/* Data */}
        <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Text variant="titleSmall" style={styles.sectionTitle}>Data Management</Text>
          <Button
            icon="cloud-download"
            mode="outlined"
            onPress={handleBackup}
            style={styles.input}
          >
            Export Backup (JSON)
          </Button>
          <Button
            icon="delete-sweep"
            mode="outlined"
            onPress={() => setClearDialog(true)}
            style={[styles.input, { borderColor: '#EF5350' }]}
            textColor="#EF5350"
          >
            Clear All Data
          </Button>
        </Surface>

        <Button mode="contained" onPress={handleSave} style={styles.save} icon="content-save">
          Save Settings
        </Button>

        <Text variant="bodySmall" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
          Expense Tracker v1.0.0 · Offline First
        </Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Portal>
        <Dialog visible={clearDialog} onDismiss={() => setClearDialog(false)}>
          <Dialog.Title>⚠️ Clear All Data?</Dialog.Title>
          <Dialog.Content>
            <Text>This will permanently delete all income, expense, and borrowed entries. This cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setClearDialog(false)}>Cancel</Button>
            <Button textColor="#EF5350" onPress={() => { clearAll(); setClearDialog(false); }}>Delete All</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 16, gap: 16 },
  section: { borderRadius: 20, padding: 20 },
  sectionTitle: { fontWeight: '700', marginBottom: 16 },
  input: { marginBottom: 12 },
  save: { marginTop: 4 },
});
