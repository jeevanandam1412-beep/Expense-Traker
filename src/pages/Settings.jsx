import { useAppContext } from '../context/AppContext';
import { fmt } from '../utils/helpers';
import { Mail, Smartphone, Trash2, CheckCircle } from 'lucide-react';

export default function Settings() {
  const { data, updateSettings, clearAllData } = useAppContext();

  function handleGmailChange(e) {
    updateSettings({ gmail: e.target.value });
  }

  function handleGPayToggle() {
    updateSettings({ gpayLinked: !data.emailConfig.gpayLinked });
  }

  const allIncome = data.income.reduce((s, i) => s + Number(i.amount), 0);
  const allBorrowed = data.borrowed.reduce((s, b) => s + Number(b.amount), 0);
  const allExpenses = data.expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-800 px-1 tracking-tight">Settings</h2>

      {/* Gmail Config */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
            <Mail size={18} strokeWidth={2.5} />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Gmail Configuration</h3>
        </div>
        <input 
          value={data.emailConfig.gmail || ""}
          onChange={handleGmailChange}
          placeholder="your@gmail.com"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
        />
        <p className="text-xs text-slate-400 font-medium mt-3">Daily reports will be sent to this email address.</p>
      </div>

      {/* GPay Config */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
              <Smartphone size={18} strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">GPay Integration</h3>
          </div>
          <p className="text-xs text-slate-400 font-medium">Link GPay for auto-income capture</p>
        </div>
        <button 
          onClick={handleGPayToggle}
          className={`flex items-center gap-1.5 border-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-sm ${data.emailConfig.gpayLinked ? 'bg-emerald-50 text-emerald-600 border-emerald-500' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
        >
          {data.emailConfig.gpayLinked ? <><CheckCircle size={15} strokeWidth={2.5} /> Linked</> : "Link GPay"}
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-black text-slate-800 text-sm mb-5 uppercase tracking-widest">All-Time Summary</h3>
        <div className="space-y-1">
          {[
            { label: "Total Income", value: fmt(allIncome), color: "text-emerald-600" },
            { label: "Total Borrowed", value: fmt(allBorrowed), color: "text-blue-600" },
            { label: "Total Expenses", value: fmt(allExpenses), color: "text-red-500" },
            { label: "Income Entries", value: data.income.length, color: "text-slate-600" },
            { label: "Borrow Entries", value: data.borrowed.length, color: "text-slate-600" },
            { label: "Expense Entries", value: data.expenses.length, color: "text-slate-600" },
          ].map((r, i) => (
            <div key={r.label} className={`flex justify-between items-center py-3 ${i < 5 ? 'border-b border-slate-100' : ''}`}>
              <span className="text-xs font-bold text-slate-500">{r.label}</span>
              <span className={`text-sm font-black ${r.color}`}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <button 
        onClick={clearAllData}
        className="w-full bg-white border-2 border-red-500 text-red-500 rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-red-50 active:scale-[0.98] transition-all font-black shadow-sm"
      >
        <Trash2 size={20} strokeWidth={2.5} />
        Clear All Data
      </button>

    </div>
  );
}
