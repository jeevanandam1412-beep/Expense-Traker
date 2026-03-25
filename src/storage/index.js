import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  INCOME: '@store_ledger_income',
  EXPENSES: '@store_ledger_expenses',
  BORROWED: '@store_ledger_borrowed',
  SETTINGS: '@store_ledger_settings',
};

// Generic helpers
const getAll = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('getAll error', e);
    return [];
  }
};

const saveAll = async (key, items) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.error('saveAll error', e);
  }
};

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// INCOME
export const getIncome = () => getAll(KEYS.INCOME);
export const addIncome = async (item) => {
  const items = await getIncome();
  const newItem = { ...item, id: generateId(), createdAt: new Date().toISOString() };
  const updated = [newItem, ...items];
  await saveAll(KEYS.INCOME, updated);
  return updated;
};
export const deleteIncome = async (id) => {
  const items = await getIncome();
  const updated = items.filter(i => i.id !== id);
  await saveAll(KEYS.INCOME, updated);
  return updated;
};
export const updateIncome = async (id, changes) => {
  const items = await getIncome();
  const updated = items.map(i => i.id === id ? { ...i, ...changes } : i);
  await saveAll(KEYS.INCOME, updated);
  return updated;
};

// EXPENSES
export const getExpenses = () => getAll(KEYS.EXPENSES);
export const addExpense = async (item) => {
  const items = await getExpenses();
  const newItem = { ...item, id: generateId(), createdAt: new Date().toISOString() };
  const updated = [newItem, ...items];
  await saveAll(KEYS.EXPENSES, updated);
  return updated;
};
export const deleteExpense = async (id) => {
  const items = await getExpenses();
  const updated = items.filter(i => i.id !== id);
  await saveAll(KEYS.EXPENSES, updated);
  return updated;
};
export const updateExpense = async (id, changes) => {
  const items = await getExpenses();
  const updated = items.map(i => i.id === id ? { ...i, ...changes } : i);
  await saveAll(KEYS.EXPENSES, updated);
  return updated;
};

// BORROWED/LENT
export const getBorrowed = () => getAll(KEYS.BORROWED);
export const addBorrowed = async (item) => {
  const items = await getBorrowed();
  const newItem = { ...item, id: generateId(), createdAt: new Date().toISOString(), status: 'pending' };
  const updated = [newItem, ...items];
  await saveAll(KEYS.BORROWED, updated);
  return updated;
};
export const deleteBorrowed = async (id) => {
  const items = await getBorrowed();
  const updated = items.filter(i => i.id !== id);
  await saveAll(KEYS.BORROWED, updated);
  return updated;
};
export const updateBorrowed = async (id, changes) => {
  const items = await getBorrowed();
  const updated = items.map(i => i.id === id ? { ...i, ...changes } : i);
  await saveAll(KEYS.BORROWED, updated);
  return updated;
};

// SETTINGS
export const getSettings = async () => {
  const defaults = {
    storeName: 'Mohan Kumar Store',
    ownerName: 'Mohan Kumar',
    currency: '₹',
    emailjsId: 'service_lj9wpjj',
    templateId: 'template_s6phynr',
    publicKey: '53t1-d_UTg-gfD4EQ',
    privateKey: 'GQmKge4zh6PFx0RLqmwCj',
    darkMode: false,
  };
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!data) return defaults;
    const parsed = JSON.parse(data);
    if (!parsed.publicKey) parsed.publicKey = defaults.publicKey;
    if (!parsed.privateKey) parsed.privateKey = defaults.privateKey;
    if (!parsed.emailjsId || parsed.emailjsId === 'service_default') parsed.emailjsId = defaults.emailjsId;
    if (!parsed.templateId) parsed.templateId = defaults.templateId;
    return parsed;
  } catch (e) {
    return defaults;
  }
};
export const saveSettings = async (settings) => {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  return settings;
};

export const clearAllData = async () => {
  await AsyncStorage.multiRemove([KEYS.INCOME, KEYS.EXPENSES, KEYS.BORROWED]);
};
