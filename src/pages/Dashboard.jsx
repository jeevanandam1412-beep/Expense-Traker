import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { fmt } from '../utils/helpers';
import { generatePDFReport } from '../utils/pdfExport';
import { Mail, Download } from 'lucide-react';

export default function Dashboard() {
  const { data, showToast } = useAppContext();
  
  const todayStr = new Date().toISOString().split("T")[0];

  const todayIncome = useMemo(() => data.income.filter(i => i.date === todayStr), [data.income, todayStr]);
  const todayBorrowed = useMemo(() => data.borrowed.filter(b => b.date === todayStr), [data.borrowed, todayStr]);
  const todayExpenses = useMemo(() => data.expenses.filter(e => e.date === todayStr), [data.expenses, todayStr]);

  const totalIncome = todayIncome.reduce((s, i) => s + Number(i.amount), 0);
  const totalBorrowed = todayBorrowed.reduce((s, b) => s + Number(b.amount), 0);
  const totalExpenses = todayExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const netBalance = totalIncome + totalBorrowed - totalExpenses;

  async function sendDailyReport() {
    if (!data.emailConfig.gmail) { 
      showToast("Set Gmail ID in Settings first", "error"); 
      return; 
    }
    
    showToast("Connecting to SMTP Server...", "success");
    
    // Simulate SMTP network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const subject = encodeURIComponent(`Mohan Kumar Store — Daily Report ${todayStr}`);
    const body = encodeURIComponent(
      `MOHAN KUMAR STORE — DAILY REPORT\nDate: ${todayStr}\n\n` +
      `Total Income: Rs. ${totalIncome}\nTotal Borrowed: Rs. ${totalBorrowed}\nTotal Expenses: Rs. ${totalExpenses}\nNet Balance: Rs. ${netBalance}\n\n` +
      `--- INCOME ---\n${todayIncome.map(i => `${i.category}: Rs. ${i.amount} [${i.note || "-"}]`).join("\n")}\n\n` +
      `--- BORROWED ---\n${todayBorrowed.map(b => `From ${b.borrowerName}: Rs. ${b.amount} [${b.note}]`).join("\n")}\n\n` +
      `--- EXPENSES ---\n${todayExpenses.map(e => `${e.category}: Rs. ${e.amount} [${e.note || "-"}]`).join("\n")}`
    );

    // Fallback to mailto since true pure-frontend SMTP is insecure
    window.open(`mailto:${data.emailConfig.gmail}?subject=${subject}&body=${body}`, "_blank");
    showToast("Email client opened successfully!");
  }

  function handleDownloadPDF() {
    generatePDFReport({
      income: todayIncome,
      borrowed: todayBorrowed,
      expenses: todayExpenses,
      totalIncome,
      totalBorrowed,
      totalExpenses,
      netBalance,
      reportTitle: 'Daily Financial Report',
      dateSubtitle: `Date: ${todayStr}`
    });
    showToast("PDF Downloaded!");
  }

  const allEntries = useMemo(() => {
    return [
      ...todayIncome.map(i => ({ ...i, _type: "income" })),
      ...todayBorrowed.map(b => ({ ...b, _type: "borrow" })),
      ...todayExpenses.map(e => ({ ...e, _type: "expense" }))
    ].sort((a, b) => b.id - a.id);
  }, [todayIncome, todayBorrowed, todayExpenses]);

  return (
    <div className="space-y-6">
      
      {/* Balance Formula Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-5 md:p-6 relative overflow-hidden shadow-xl text-white">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />
        
        <h3 className="text-[10px] md:text-xs text-blue-100 uppercase tracking-[3px] mb-4 font-bold">Today's Balance Formula</h3>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-3 flex items-center justify-between border border-white/20">
          <div className="text-center">
            <div className="text-[10px] text-emerald-300 tracking-widest font-bold mb-1">INCOME</div>
            <div className="font-black text-lg md:text-2xl text-white">{fmt(totalIncome)}</div>
            <div className="text-[9px] text-blue-100 mt-1">{todayIncome.length} entries</div>
          </div>
          <div className="font-black text-2xl text-blue-200/50">+</div>
          <div className="text-center">
            <div className="text-[10px] text-cyan-300 tracking-widest font-bold mb-1">BORROWED</div>
            <div className="font-black text-lg md:text-2xl text-white">{fmt(totalBorrowed)}</div>
            <div className="text-[9px] text-blue-100 mt-1">{todayBorrowed.length} entries</div>
          </div>
          <div className="font-black text-2xl text-blue-200/50">=</div>
          <div className="text-center">
            <div className="text-[10px] text-blue-200 tracking-widest font-bold mb-1">TOTAL</div>
            <div className="font-black text-lg md:text-2xl text-white">{fmt(totalIncome + totalBorrowed)}</div>
            <div className="text-[9px] text-blue-200 mt-1">available</div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 flex items-center justify-between border border-white/20">
          <div className="text-center opacity-70">
            <div className="text-[10px] text-blue-200 tracking-widest font-bold mb-1">TOTAL</div>
            <div className="font-black text-lg md:text-2xl text-white">{fmt(totalIncome + totalBorrowed)}</div>
          </div>
          <div className="font-black text-2xl text-red-300/80">&minus;</div>
          <div className="text-center">
            <div className="text-[10px] text-red-300 tracking-widest font-bold mb-1">EXPENSES</div>
            <div className="font-black text-lg md:text-2xl text-white">{fmt(totalExpenses)}</div>
            <div className="text-[9px] text-blue-100 mt-1">{todayExpenses.length} entries</div>
          </div>
          <div className="font-black text-2xl text-blue-200/50">=</div>
          <div className="text-center">
            <div className={`text-[10px] tracking-widest font-bold mb-1 ${netBalance >= 0 ? 'text-white' : 'text-red-200'}`}>BALANCE</div>
            <div className={`font-black text-lg md:text-2xl ${netBalance >= 0 ? 'text-white' : 'text-red-200'}`}>
              {netBalance < 0 ? <>&minus;</> : ""}{fmt(Math.abs(netBalance))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-lg text-slate-800">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Net Balance Today</div>
            <div className={`font-black text-3xl md:text-4xl tracking-tight ${netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {netBalance < 0 ? <>&minus;</> : ""}{fmt(Math.abs(netBalance))}
            </div>
          </div>
          <div className="text-4xl bg-slate-50 p-3 rounded-full shadow-inner border border-slate-100">{netBalance >= 0 ? "💰" : "📉"}</div>
        </div>
      </div>

      {/* Reports & Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={sendDailyReport} className="bg-white border border-slate-200 text-blue-600 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 active:scale-95 transition-all shadow-sm">
          <div className="bg-blue-100 p-2.5 rounded-xl"><Mail size={22} className="text-blue-600" /></div>
          <span className="text-xs font-bold tracking-wide">Email Report</span>
        </button>
        <button onClick={handleDownloadPDF} className="bg-white border border-slate-200 text-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all shadow-sm">
          <div className="bg-slate-100 p-2.5 rounded-xl"><Download size={22} className="text-slate-600" /></div>
          <span className="text-xs font-bold tracking-wide">Download PDF</span>
        </button>
      </div>

      {/* Today's Activity */}
      <div>
        <div className="flex justify-between items-end mb-3 px-1">
          <h3 className="font-bold text-slate-800 tracking-widest text-xs uppercase">Today's Activity</h3>
          <span className="text-[11px] font-semibold text-slate-400">{allEntries.length} entries</span>
        </div>

        {allEntries.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {allEntries.map((entry, idx) => {
              const color = entry._type === "income" ? "text-emerald-600" : entry._type === "borrow" ? "text-blue-600" : "text-red-500";
              const bgBadge = entry._type === "income" ? "bg-emerald-50 border-emerald-100" : entry._type === "borrow" ? "bg-blue-50 border-blue-100" : "bg-red-50 border-red-100";
              const typeLabel = entry._type === "income" ? "IN" : entry._type === "borrow" ? "BRW" : "OUT";
              const name = entry._type === "borrow" ? entry.borrowerName : (entry.source && entry.source !== "" ? `${entry.category} (${entry.source})` : entry.category);
              const time = new Date(entry.id).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

              return (
                <div key={entry.id} className={`flex items-center p-4 ${idx < allEntries.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50 transition-colors`}>
                  <div className={`w-12 h-9 rounded-xl border flex items-center justify-center text-[10px] font-bold ${bgBadge} ${color} mr-4 shadow-sm`}>
                    {typeLabel}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm text-slate-800 truncate font-bold">{name}</div>
                    <div className="text-[10px] font-medium text-slate-400">{time}</div>
                  </div>
                  <div className={`font-black tracking-wide ${color}`}>
                    {entry._type === "expense" ? <>&minus;</> : "+"}{fmt(entry.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400 font-medium shadow-sm">
            No entries today. Click the + button to add one!
          </div>
        )}
      </div>

    </div>
  );
}
