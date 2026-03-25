export const EXPENSE_CATEGORIES = [
  { label: 'Rent', value: 'Rent', color: '#EF5350' },
  { label: 'Stock/Inventory', value: 'Stock', color: '#AB47BC' },
  { label: 'Salary', value: 'Salary', color: '#5C6BC0' },
  { label: 'Utilities', value: 'Utilities', color: '#29B6F6' },
  { label: 'Transport', value: 'Transport', color: '#26C6DA' },
  { label: 'Marketing', value: 'Marketing', color: '#26A69A' },
  { label: 'Maintenance', value: 'Maintenance', color: '#66BB6A' },
  { label: 'Food', value: 'Food', color: '#D4E157' },
  { label: 'Equipment', value: 'Equipment', color: '#FFA726' },
  { label: 'Other', value: 'Other', color: '#8D6E63' },
];

export const INCOME_SOURCES = [
  'Sales',
  'Online',
  'Cash',
  'Bank Transfer',
  'UPI',
  'Credit',
  'Wholesale',
  'Other',
];

export const CURRENCIES = [
  { label: '₹ Indian Rupee', value: '₹' },
  { label: '$ US Dollar', value: '$' },
  { label: '€ Euro', value: '€' },
  { label: '£ British Pound', value: '£' },
  { label: '¥ Japanese Yen', value: '¥' },
  { label: 'AED Dirham', value: 'AED' },
];

export const getCategoryColor = (category) => {
  const cat = EXPENSE_CATEGORIES.find((c) => c.value === category);
  return cat ? cat.color : '#8D6E63';
};

export const DATE_FILTERS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last Month', value: 'month' },
  { label: 'Last 6 Months', value: '6months' },
  { label: 'Custom', value: 'custom' },
];
