import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  INCOME: '@expense_tracker_income',
  EXPENSES: '@expense_tracker_expenses',
  BORROWED: '@expense_tracker_borrowed',
  SETTINGS: '@expense_tracker_settings',
};

export const loadData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error('Storage load error:', e);
    return null;
  }
};

export const saveData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage save error:', e);
  }
};

export const loadAll = async () => {
  const [income, expenses, borrowed, settings] = await Promise.all([
    loadData(KEYS.INCOME),
    loadData(KEYS.EXPENSES),
    loadData(KEYS.BORROWED),
    loadData(KEYS.SETTINGS),
  ]);
  return { income, expenses, borrowed, settings };
};

export const clearAll = async () => {
  await AsyncStorage.multiRemove(Object.values(KEYS));
};

export const exportBackup = async () => {
  const data = await loadAll();
  return JSON.stringify(data);
};

export const importBackup = async (jsonString) => {
  const data = JSON.parse(jsonString);
  await Promise.all([
    data.income && saveData(KEYS.INCOME, data.income),
    data.expenses && saveData(KEYS.EXPENSES, data.expenses),
    data.borrowed && saveData(KEYS.BORROWED, data.borrowed),
    data.settings && saveData(KEYS.SETTINGS, data.settings),
  ]);
};

export { KEYS };
