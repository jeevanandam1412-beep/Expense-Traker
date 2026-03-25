import { EXPENSE_CATEGORIES, getCategoryColor } from './constants';
import dayjs from 'dayjs';

export const totalAmount = (entries) =>
  entries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

export const totalIncome = (income) => totalAmount(income);
export const totalExpense = (expenses) => totalAmount(expenses);
export const profit = (income, expenses) => totalIncome(income) - totalExpense(expenses);

export const borrowedTotal = (borrowed) =>
  borrowed
    .filter((b) => b.type === 'borrowed' && b.status !== 'paid')
    .reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);

export const lentTotal = (borrowed) =>
  borrowed
    .filter((b) => b.type === 'lent' && b.status !== 'paid')
    .reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);

export const categoryBreakdown = (expenses) => {
  const map = {};
  expenses.forEach((e) => {
    const cat = e.category || 'Other';
    map[cat] = (map[cat] || 0) + (parseFloat(e.amount) || 0);
  });
  return Object.entries(map).map(([name, amount]) => ({
    name,
    amount,
    color: getCategoryColor(name),
    legendFontColor: '#666',
    legendFontSize: 12,
  }));
};

export const weekOverWeekChange = (expenses) => {
  const thisWeek = expenses
    .filter((e) => dayjs(e.date).isAfter(dayjs().subtract(7, 'day')))
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const lastWeek = expenses
    .filter(
      (e) =>
        dayjs(e.date).isAfter(dayjs().subtract(14, 'day')) &&
        dayjs(e.date).isBefore(dayjs().subtract(7, 'day'))
    )
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  if (lastWeek === 0) return null;
  return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
};

export const formatCurrency = (amount, symbol = '₹') =>
  `${symbol}${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const generateId = () =>
  `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
