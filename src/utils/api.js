const STORAGE_KEY = "grocery_expense_data";

const defaultState = {
  income: [],
  borrowed: [],
  expenses: [],
  emailConfig: { gmail: "jeevanandam1412@gmail.com", gpayLinked: false },
};

// Simulate async API calls
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultState;
  } catch {
    return defaultState;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Data fetching and mutation service
// Designed to be easily replaced with `axios` or `fetch` later

export const api = {
  async fetchAll() {
    await delay();
    return loadData();
  },

  async addEntry(type, entry) {
    await delay();
    const data = loadData();
    data[type] = [entry, ...data[type]];
    saveData(data);
    return entry;
  },

  async deleteEntry(type, id) {
    await delay();
    const data = loadData();
    data[type] = data[type].filter((e) => e.id !== id);
    saveData(data);
    return id;
  },

  async updateSettings(newConfig) {
    await delay();
    const data = loadData();
    data.emailConfig = { ...data.emailConfig, ...newConfig };
    saveData(data);
    return data.emailConfig;
  },

  async clearAll() {
    await delay();
    saveData(defaultState);
    return true;
  }
};
