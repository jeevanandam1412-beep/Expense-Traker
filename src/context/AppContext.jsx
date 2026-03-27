import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getIncome, getExpenses, getBorrowed, getSettings, addIncome, updateIncome, deleteIncome, addExpense, updateExpense, deleteExpense, addBorrowed, updateBorrowed, deleteBorrowed, saveSettings, clearAllData } from '../storage';
import { translate } from '../i18n/translations';
import { themes } from '../theme/colors';

const AppContext = createContext(null);

const initialState = {
  income: [],
  expenses: [],
  borrowed: [],
  settings: {
    storeName: 'Mohan Kumar Store',
    ownerName: 'Mohan Kumar',
    currency: '₹',
    emailjsId: 'service_lj9wpjj',
    templateId: 'template_s6phynr',
    publicKey: '53t1-d_UTg-gfD4EQ',
    privateKey: 'GQmKge4zh6PFx0RLqmwCj',
    language: 'en',
    darkMode: false,
  },
  loading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload, loading: false };
    case 'SET_INCOME':
      return { ...state, income: action.payload };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'SET_BORROWED':
      return { ...state, borrowed: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [income, expenses, borrowed, settings] = await Promise.all([
      getIncome(), getExpenses(), getBorrowed(), getSettings(),
    ]);
    dispatch({ type: 'LOAD_DATA', payload: { income, expenses, borrowed, settings } });
  };

  const actions = {
    // Income
    addIncome: async (item) => {
      const updated = await addIncome(item);
      dispatch({ type: 'SET_INCOME', payload: updated });
    },
    deleteIncome: async (id) => {
      const updated = await deleteIncome(id);
      dispatch({ type: 'SET_INCOME', payload: updated });
    },
    updateIncome: async (id, changes) => {
      const updated = await updateIncome(id, changes);
      dispatch({ type: 'SET_INCOME', payload: updated });
    },
    // Expenses
    addExpense: async (item) => {
      const updated = await addExpense(item);
      dispatch({ type: 'SET_EXPENSES', payload: updated });
    },
    deleteExpense: async (id) => {
      const updated = await deleteExpense(id);
      dispatch({ type: 'SET_EXPENSES', payload: updated });
    },
    updateExpense: async (id, changes) => {
      const updated = await updateExpense(id, changes);
      dispatch({ type: 'SET_EXPENSES', payload: updated });
    },
    // Borrowed
    addBorrowed: async (item) => {
      const updated = await addBorrowed(item);
      dispatch({ type: 'SET_BORROWED', payload: updated });
    },
    deleteBorrowed: async (id) => {
      const updated = await deleteBorrowed(id);
      dispatch({ type: 'SET_BORROWED', payload: updated });
    },
    updateBorrowed: async (id, changes) => {
      const updated = await updateBorrowed(id, changes);
      dispatch({ type: 'SET_BORROWED', payload: updated });
    },
    markBorrowedPaid: async (id) => {
      const updated = await updateBorrowed(id, { status: 'paid' });
      dispatch({ type: 'SET_BORROWED', payload: updated });
    },
    // Settings
    saveSettings: async (settings) => {
      const updated = await saveSettings(settings);
      dispatch({ type: 'SET_SETTINGS', payload: updated });
    },
    clearAllData: async () => {
      await clearAllData();
      dispatch({ type: 'LOAD_DATA', payload: { income: [], expenses: [], borrowed: [] } });
    },
  };

  const currentColors = themes[state.settings?.darkMode ? 'dark' : 'light'];

  return (
    <AppContext.Provider value={{ state, actions, colors: currentColors }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  const t = (key) => translate(key, context.state.settings?.language || 'en');
  return { ...context, t };
}

export default AppContext;
