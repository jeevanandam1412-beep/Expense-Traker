import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  getIncome, addIncome, deleteIncome, updateIncome,
  getExpenses, addExpense, deleteExpense, updateExpense,
  getBorrowed, addBorrowed, deleteBorrowed, updateBorrowed,
  getSettings, saveSettings, clearAllData,
} from '../storage';

const AppContext = createContext(null);

const initialState = {
  income: [],
  expenses: [],
  borrowed: [],
  settings: {
    storeName: 'Mohan Kumar Store',
    ownerName: 'Mohan Kumar',
    currency: '₹',
    emailjsId: '',
    templateId: '',
    publicKey: '',
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

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

export default AppContext;
