import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const CATS = ["Sales", "GPay", "Cash", "UPI", "Other"];
const EXP_CATS = ["Stock/Purchase", "Salary", "Rent", "Utilities", "Transport", "Misc"];

export default function EntryModal({ type, onClose }) {
  const { addEntry, showToast } = useAppContext();
  
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
    await addEntry(type === "borrow" ? "borrowed" : type, entry);
    onClose();
  }

  const titleColor = type === "income" ? "text-[#27ae60]" : type === "borrow" ? "text-[#2980b9]" : "text-[#c0392b]";
  const titleText = type === "income" ? "↑ Add Income" : type === "borrow" ? "⇄ Add Borrowed" : "↓ Add Expense";
  const btnColor = type === "income" ? "bg-[#27ae60]" : type === "borrow" ? "bg-[#2980b9]" : "bg-[#c0392b]";

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-[60] backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#1a1a1a] rounded-t-3xl md:rounded-3xl p-6 w-full max-w-md border border-[#2a2a2a] anim shadow-2xl relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white pb-2 px-2 text-xl">&times;</button>
        
        <h2 className={`font-black text-xl mb-6 tracking-wide ${titleColor}`}>{titleText}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest">Amount (₹) *</label>
            <input 
              type="number" 
              value={form.amount} 
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              className="w-full bg-[#242424] border border-[#333] rounded-xl px-4 py-3 text-white text-xl font-bold font-serif focus:border-[#c9a84c] focus:outline-none transition-colors"
            />
          </div>

          {type === "borrow" ? (
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest">Customer Name *</label>
              <input 
                value={form.borrowerName} 
                onChange={e => setForm(f => ({ ...f, borrowerName: e.target.value }))}
                placeholder="Enter name..."
                className="w-full bg-[#242424] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#c9a84c] focus:outline-none transition-colors"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest">Category</label>
              <select 
                value={form.category} 
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-[#242424] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#c9a84c] focus:outline-none transition-colors appearance-none"
              >
                {(type === "income" ? CATS : EXP_CATS).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {type === "income" && (
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest">Payment Source</label>
              <div className="flex gap-2">
                {["Cash", "GPay"].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setForm(f => ({ ...f, source: s }))}
                    className={`flex-1 flex justify-center items-center py-3 rounded-xl border font-bold transition-all ${form.source === s ? 'bg-[#c9a84c] text-black border-[#c9a84c]' : 'bg-[#242424] text-gray-400 border-[#333]'}`}
                  >
                    {s === "Cash" ? "💵 Cash" : "📱 GPay"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest">Note (Optional)</label>
            <input 
              value={form.note} 
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Add details..."
              className="w-full bg-[#242424] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#c9a84c] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest">Date</label>
            <input 
              type="date" 
              value={form.date} 
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full bg-[#242424] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#c9a84c] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button 
            onClick={onClose}
            className="flex-1 bg-[#242424] border border-[#333] text-gray-300 py-4 rounded-xl font-bold hover:bg-[#333] transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className={`flex-[2] ${btnColor} text-white py-4 rounded-xl font-black text-lg hover:brightness-110 active:scale-95 transition-all shadow-lg`}
          >
            Save Entry
          </button>
        </div>

      </div>
    </div>
  );
}
