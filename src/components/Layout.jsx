import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowUpCircle, ArrowLeftRight, ArrowDownCircle, PieChart, Settings, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import EntryModal from './EntryModal';

export default function Layout() {
  const { toast } = useAppContext();
  const location = useLocation();
  const [modalType, setModalType] = useState(null);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/income', label: 'Income', icon: ArrowUpCircle },
    { path: '/borrowed', label: 'Borrowed', icon: ArrowLeftRight },
    { path: '/expenses', label: 'Expenses', icon: ArrowDownCircle },
    { path: '/reports', label: 'Reports', icon: PieChart },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleQuickAdd = () => {
    // With tabs now implemented inside the modal, we can open a default context 
    // but users can still change it manually.
    if (location.pathname === '/income') setModalType('income');
    else if (location.pathname === '/borrowed') setModalType('borrow');
    else setModalType('expense');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20 md:pb-10">
      
      {/* --- DESKTOP HEADER & NAV --- */}
      <div className="hidden md:block bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-blue-600 tracking-tight">Mohan Kumar Store</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Grocery Shop · Daily Expense Manager</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Today</div>
              <div className="text-sm text-slate-700 font-black">
                {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              </div>
            </div>
            {/* Desktop Quick Add Button */}
            <button 
              onClick={handleQuickAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all"
            >
              <Plus size={20} className="stroke-[3px]" />
              Add Record
            </button>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="max-w-5xl mx-auto px-8">
          <nav className="flex gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 pb-4 border-b-4 transition-colors font-bold ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* --- MOBILE HEADER --- */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-black text-blue-600 tracking-tight">Mohan Store</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Expense Manager</p>
        </div>
        <button 
          onClick={handleQuickAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-lg shadow-blue-600/30 active:scale-[0.92] transition-all"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-md md:max-w-5xl mx-auto p-4 md:p-8 anim">
        <Outlet />
      </main>

      {/* --- MOBILE BOTTOM NAV --- */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-40 flex shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 relative transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50'}`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600' : ''}`}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* --- ADD MODAL --- */}
      {modalType && <EntryModal type={modalType} onClose={() => setModalType(null)} />}

      {/* --- TOAST --- */}
      {toast && (
        <div className={`fixed top-4 md:top-24 right-4 md:right-8 transform transition-transform toast-anim shadow-xl rounded-2xl px-6 py-3.5 text-sm font-bold z-[100] border ${toast.type === "error" ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
