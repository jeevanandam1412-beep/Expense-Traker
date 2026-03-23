import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { fmt } from '../utils/helpers';
import { generatePDFReport } from '../utils/pdfExport';
import { Calendar, Download, Filter } from 'lucide-react';

export default function Reports() {
  const { data, showToast } = useAppContext();
  const [filter, setFilter] = useState('Today'); // Today, Week, Month, All

  const filteredData = useMemo(() => {
    const getLocalFormattedDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const today = new Date();
    const todayStr = getLocalFormattedDate(today);

    // Monday as start of week
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(diff);
    const startOfWeekStr = getLocalFormattedDate(startOfWeek);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfMonthStr = getLocalFormattedDate(startOfMonth);

    const isWithinFilter = (dateStr) => {
      if (filter === 'All') return true;
      if (filter === 'Today') return dateStr === todayStr;
      if (filter === 'Week') return dateStr >= startOfWeekStr;
      if (filter === 'Month') return dateStr >= startOfMonthStr;
      return true;
    };

    const income = data.income.filter(i => isWithinFilter(i.date));
    const borrowed = data.borrowed.filter(b => isWithinFilter(b.date));
    const expenses = data.expenses.filter(e => isWithinFilter(e.date));

    return { income, borrowed, expenses };
  }, [data, filter]);

  const totalIncome = filteredData.income.reduce((s, i) => s + Number(i.amount), 0);
  const totalBorrowed = filteredData.borrowed.reduce((s, b) => s + Number(b.amount), 0);
  const totalExpenses = filteredData.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const netBalance = totalIncome + totalBorrowed - totalExpenses;

  function handleDownloadPDF() {
    const dateSubtitle = filter === 'All' ? 'All-Time' : filter === 'Today' ? new Date().toLocaleDateString() : `Current ${filter}`;
    
    generatePDFReport({
      income: filteredData.income,
      borrowed: filteredData.borrowed,
      expenses: filteredData.expenses,
      totalIncome,
      totalBorrowed,
      totalExpenses,
      netBalance,
      reportTitle: `${filter} Financial Report`,
      dateSubtitle
    });
    showToast(`${filter} PDF Downloaded!`);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Reports & Analytics</h2>
      </div>

      {/* Filters */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        {['Today', 'Week', 'Month', 'All'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 min-w-[70px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}
          >
            {f === 'All' ? 'All Time' : f}
          </button>
        ))}
      </div>

      {/* Summary Matrix */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Total Income</div>
          <div className="text-xl font-black text-emerald-600">{fmt(totalIncome)}</div>
          <div className="text-xs font-semibold text-emerald-600/60 mt-2">{filteredData.income.length} records</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Total Borrowed</div>
          <div className="text-xl font-black text-blue-600">{fmt(totalBorrowed)}</div>
          <div className="text-xs font-semibold text-blue-600/60 mt-2">{filteredData.borrowed.length} records</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Total Expenses</div>
          <div className="text-xl font-black text-red-500">{fmt(totalExpenses)}</div>
          <div className="text-xs font-semibold text-red-500/60 mt-2">{filteredData.expenses.length} records</div>
        </div>
        <div className={`rounded-2xl p-4 border shadow-sm ${netBalance >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <div className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${netBalance >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>Net Balance</div>
          <div className={`text-xl font-black ${netBalance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {netBalance < 0 ? <>&minus;</> : ""}{fmt(Math.abs(netBalance))}
          </div>
          <div className={`text-xs font-semibold mt-2 ${netBalance >= 0 ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
            {netBalance >= 0 ? "Profit" : "Deficit"}
          </div>
        </div>
      </div>

      <button 
        onClick={handleDownloadPDF}
        className="w-full bg-blue-600 border border-blue-500 text-white rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all font-black shadow-lg shadow-blue-600/20"
      >
        <Download size={20} className="stroke-[2.5px]" />
        Download {filter} Report (PDF)
      </button>

    </div>
  );
}
