import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { X } from 'lucide-react';

const CATS = ["Sales", "GPay", "Cash", "UPI", "Other"];
const EXP_CATS = ["Stock/Purchase", "Salary", "Rent", "Utilities", "Transport", "Misc"];

export default function EntryModal({ type: initialType, onClose }) {
  const { addEntry, showToast } = useAppContext();
  
  const [type, setType] = useState(initialType || "expense");

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    category: type === "expense" ? EXP_CATS[0] : CATS[0],
    source: "Cash",
    borrowerName: "",
    note: ""
  });

  async function handleSave() {
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      showToast("Enter a valid amount", "error"); 
      return;
    }
    if (type === "borrow" && !form.borrowerName.trim()) {
      showToast("Enter customer name", "error"); 
      return;
    }

    const entry = { id: Date.now(), ...form, amount: Number(form.amount) };
    const targetType = type === "borrow" ? "borrowed" : type === "expense" ? "expenses" : type;
    await addEntry(targetType, entry);
    onClose();
  }

  const titleColor = type === "income" ? "text-emerald-600" : type === "borrow" ? "text-blue-600" : "text-red-500";
  const titleText = type === "income" ? "Add Income" : type === "borrow" ? "Add Borrowed" : "Add Expense";
  const btnColor = type === "income" ? "bg-emerald-500 hover:bg-emerald-600" : type === "borrow" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-500 hover:bg-red-600";
  const ringColor = type === "income" ? "focus:ring-emerald-500" : type === "borrow" ? "focus:ring-blue-600" : "focus:ring-red-500";

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-end md:items-center justify-center z-[60] backdrop-blur-sm p-4 anim" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl relative">
        
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 rounded-full p-2">
          <X size={20} />
        </button>
        
        <h2 className={`font-black text-2xl mb-4 tracking-tight ${titleColor}`}>{titleText}</h2>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 shadow-inner">
          {['income', 'borrow', 'expense'].map(t => (
            <button 
              key={t}
              onClick={() => {
                setType(t);
                setForm(f => ({ ...f, category: t === "expense" ? EXP_CATS[0] : CATS[0] }));
              }}
              className={`flex-1 py-2.5 text-xs md:text-sm font-black rounded-xl transition-all capitalize ${type === t ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t === 'borrow' ? 'Borrowed' : t}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Amount (₹) *</label>
            <input 
              type="number" 
              value={form.amount} 
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 text-2xl font-black focus:outline-none focus:ring-2 ${ringColor} transition-all`}
            />
          </div>

          {type === "borrow" ? (
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Customer Name *</label>
              <input 
                value={form.borrowerName} 
                onChange={e => setForm(f => ({ ...f, borrowerName: e.target.value }))}
                placeholder="Enter name..."
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 ${ringColor} transition-all`}
              />
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Category</label>
              <select 
                value={form.category} 
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 ${ringColor} transition-all appearance-none`}
              >
                {(type === "income" ? CATS : EXP_CATS).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {type === "income" && (
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Type</label>
              <div className="flex gap-2">
                {["Cash", "GPay"].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setForm(f => ({ ...f, source: s }))}
                    className={`flex-1 flex justify-center items-center py-3.5 rounded-xl border-2 font-bold transition-all ${form.source === s ? 'bg-emerald-50 text-emerald-600 border-emerald-500 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                  >
                    {s === "Cash" ? "💵 Cash" : "📱 GPay"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Note (Optional)</label>
            <input 
              value={form.note} 
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Add details..."
              className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 ${ringColor} transition-all`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Date</label>
            <input 
              type="date" 
              value={form.date} 
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 ${ringColor} transition-all`}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button 
            onClick={onClose}
            className="flex-[1] bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className={`flex-[2] ${btnColor} text-white py-4 rounded-xl font-black text-lg active:scale-[0.98] transition-all shadow-md`}
          >
            Save Entry
          </button>
        </div>

      </div>
    </div>
  );
}
