import { useAppContext } from '../context/AppContext';
import { fmt } from '../utils/helpers';
import { Trash2 } from 'lucide-react';

export default function Expenses() {
  const { data, deleteEntry } = useAppContext();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Expense Records</h2>
        <div className="text-xs font-bold text-slate-500 bg-white shadow-sm px-3 py-1.5 rounded-full border border-slate-200">
          {data.expenses.length} total
        </div>
      </div>

      {data.expenses.length > 0 ? (
        <div className="space-y-4">
          {data.expenses.map(e => (
            <div key={e.id} className="bg-white rounded-2xl p-5 border-l-4 border-l-red-500 border-y border-r border-slate-200 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-xl font-black text-red-600">&minus;{fmt(e.amount)}</span>
                  <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 rounded-lg tracking-wide px-2 py-0.5 uppercase font-bold">
                    {e.category}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-400">
                  {e.note || "No note"} • {e.date}
                </div>
              </div>
              <button 
                onClick={() => deleteEntry("expenses", e.id)}
                className="bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-colors active:scale-95"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400 font-medium">
          No expense records yet.
        </div>
      )}
    </div>
  );
}
