import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [data, setData] = useState({ income: [], borrowed: [], expenses: [], emailConfig: {} });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    const d = await api.fetchAll();
    setData(d);
    setLoading(false);
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function addEntry(type, entry) {
    const e = await api.addEntry(type, entry);
    setData(d => ({ ...d, [type]: [e, ...d[type]] }));
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} added!`);
  }

  async function deleteEntry(type, id) {
    await api.deleteEntry(type, id);
    setData(d => ({ ...d, [type]: d[type].filter(e => e.id !== id) }));
    showToast("Entry deleted", "error");
  }

  async function updateSettings(newConfig) {
    const config = await api.updateSettings(newConfig);
    setData(d => ({ ...d, emailConfig: config }));
    showToast("Settings saved!");
  }

  async function clearAllData() {
    if (window.confirm("Clear ALL data?")) {
      await api.clearAll();
      await loadInitialData();
      showToast("All data cleared", "error");
    }
  }

  return (
    <AppContext.Provider value={{ data, loading, addEntry, deleteEntry, updateSettings, clearAllData, toast, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
