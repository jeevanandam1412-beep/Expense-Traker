import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { loadAll, saveData, KEYS } from '../services/storageService';
import { generateId } from '../utils/calculations';

const AppContext = createContext(null);

const DEFAULT_SETTINGS = {
  storeName: 'My Store',
  currency: '₹',
  theme: 'light',
  emailjs: {
    serviceId: '',
    templateId: '',
    publicKey: '',
    recipientEmail: '',
  },
};

const initialState = {
  income: [],
  expenses: [],
  borrowed: [],
  settings: DEFAULT_SETTINGS,
  loading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_ALL':
      return { ...state, ...action.payload, loading: false };

    // --- INCOME ---
    case 'ADD_INCOME': {
      const entry = { ...action.payload, id: generateId(), createdAt: new Date().toISOString() };
      return { ...state, income: [entry, ...state.income] };
    }
    case 'EDIT_INCOME': {
      const income = state.income.map((e) => (e.id === action.payload.id ? { ...e, ...action.payload } : e));
      return { ...state, income };
    }
    case 'DELETE_INCOME':
      return { ...state, income: state.income.filter((e) => e.id !== action.payload) };

    // --- EXPENSES ---
    case 'ADD_EXPENSE': {
      const entry = { ...action.payload, id: generateId(), createdAt: new Date().toISOString() };
      return { ...state, expenses: [entry, ...state.expenses] };
    }
    case 'EDIT_EXPENSE': {
      const expenses = state.expenses.map((e) => (e.id === action.payload.id ? { ...e, ...action.payload } : e));
      return { ...state, expenses };
    }
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.payload) };

    // --- BORROWED ---
    case 'ADD_BORROWED': {
      const entry = { ...action.payload, id: generateId(), createdAt: new Date().toISOString() };
      return { ...state, borrowed: [entry, ...state.borrowed] };
    }
    case 'EDIT_BORROWED': {
      const borrowed = state.borrowed.map((e) => (e.id === action.payload.id ? { ...e, ...action.payload } : e));
      return { ...state, borrowed };
    }
    case 'DELETE_BORROWED':
      return { ...state, borrowed: state.borrowed.filter((e) => e.id !== action.payload) };
    case 'TOGGLE_BORROWED_STATUS': {
      const borrowed = state.borrowed.map((e) =>
        e.id === action.payload ? { ...e, status: e.status === 'paid' ? 'pending' : 'paid' } : e
      );
      return { ...state, borrowed };
    }

    // --- SETTINGS ---
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    // --- CLEAR ALL ---
    case 'CLEAR_ALL':
      return { ...initialState, loading: false, settings: state.settings };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from AsyncStorage on mount
  useEffect(() => {
    loadAll().then(({ income, expenses, borrowed, settings }) => {
      dispatch({
        type: 'LOAD_ALL',
        payload: {
          income: income || [],
          expenses: expenses || [],
          borrowed: borrowed || [],
          settings: settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS,
        },
      });
    });
  }, []);

  // Persist income changes
  useEffect(() => {
    if (!state.loading) saveData(KEYS.INCOME, state.income);
  }, [state.income, state.loading]);

  // Persist expense changes
  useEffect(() => {
    if (!state.loading) saveData(KEYS.EXPENSES, state.expenses);
  }, [state.expenses, state.loading]);

  // Persist borrowed changes
  useEffect(() => {
    if (!state.loading) saveData(KEYS.BORROWED, state.borrowed);
  }, [state.borrowed, state.loading]);

  // Persist settings changes
  useEffect(() => {
    if (!state.loading) saveData(KEYS.SETTINGS, state.settings);
  }, [state.settings, state.loading]);

  const addIncome = useCallback((data) => dispatch({ type: 'ADD_INCOME', payload: data }), []);
  const editIncome = useCallback((data) => dispatch({ type: 'EDIT_INCOME', payload: data }), []);
  const deleteIncome = useCallback((id) => dispatch({ type: 'DELETE_INCOME', payload: id }), []);

  const addExpense = useCallback((data) => dispatch({ type: 'ADD_EXPENSE', payload: data }), []);
  const editExpense = useCallback((data) => dispatch({ type: 'EDIT_EXPENSE', payload: data }), []);
  const deleteExpense = useCallback((id) => dispatch({ type: 'DELETE_EXPENSE', payload: id }), []);

  const addBorrowed = useCallback((data) => dispatch({ type: 'ADD_BORROWED', payload: data }), []);
  const editBorrowed = useCallback((data) => dispatch({ type: 'EDIT_BORROWED', payload: data }), []);
  const deleteBorrowed = useCallback((id) => dispatch({ type: 'DELETE_BORROWED', payload: id }), []);
  const toggleBorrowedStatus = useCallback((id) => dispatch({ type: 'TOGGLE_BORROWED_STATUS', payload: id }), []);

  const updateSettings = useCallback((data) => dispatch({ type: 'UPDATE_SETTINGS', payload: data }), []);
  const clearAll = useCallback(() => dispatch({ type: 'CLEAR_ALL' }), []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        addIncome, editIncome, deleteIncome,
        addExpense, editExpense, deleteExpense,
        addBorrowed, editBorrowed, deleteBorrowed, toggleBorrowedStatus,
        updateSettings, clearAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
