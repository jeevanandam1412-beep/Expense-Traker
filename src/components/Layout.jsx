import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowUpCircle, ArrowLeftRight, ArrowDownCircle, Settings, PlusCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import EntryModal from './EntryModal';

export default function Layout() {
  const { toast } = useAppContext();
  const location = useLocation();
  const [modalType, setModalType] = useState(null); // 'income' | 'borrow' | 'expense'

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/income', label: 'Income', icon: ArrowUpCircle },
    { path: '/borrowed', label: 'Borrowed', icon: ArrowLeftRight },
    { path: '/expenses', label: 'Expenses', icon: ArrowDownCircle },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e8e0d0] font-serif pb-20 md:pb-0 md:pt-16">
      
      {/* Header (Desktop) */}
      <header className="hidden md:flex fixed top-0 w-full z-50 bg-gradient-to-r from-[#1a1400] to-[#0f0f0f] border-b border-[#2a2a2a] px-6 py-4 items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#c9a84c] tracking-wide">🛒 Mohan Kumar Store</h1>
          <p className="text-sm text-gray-500 italic">Grocery Shop · Daily Expense Manager</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Today</div>
          <div className="text-sm text-[#e8c97a] font-bold">
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          </div>
        </div>
      </header>

      {/* Header (Mobile) */}
      <header className="md:hidden bg-gradient-to-r from-[#1a1400] to-[#0f0f0f] border-b border-[#2a2a2a] p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#c9a84c] tracking-wide">🛒 Mohan Store</h1>
          <p className="text-xs text-gray-500 italic">Expense Manager</p>
        </div>
        <button 
          onClick={() => setModalType('expense')}
          className="bg-[#c0392b] text-white p-2 rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <PlusCircle size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md md:max-w-2xl mx-auto p-4 md:p-6 mb-24 anim">
        <Outlet />
      </main>

      {/* Navigation Bar (Mobile Bottom / Desktop Sidebar / Desktop Top Tabs) */}
      <nav className="fixed bottom-0 w-full md:w-auto md:top-20 md:left-1/2 md:-translate-x-1/2 md:bottom-auto bg-[#1a1a1a] border-t md:border border-[#2a2a2a] md:rounded-2xl z-40 flex overflow-x-auto shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col md:flex-row items-center justify-center p-3 md:px-6 md:py-3 gap-1 md:gap-2 min-w-[70px] transition-colors duration-200 border-b-2 md:border-b-0 ${isActive ? 'text-[#c9a84c] border-[#c9a84c] bg-[#242424] md:rounded-xl' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
            >
              <Icon size={20} />
              <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {modalType && <EntryModal type={modalType} onClose={() => setModalType(null)} />}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 md:top-24 right-4 md:right-8 transform transition-transform toast-anim shadow-2xl rounded-xl px-5 py-3 text-sm font-bold z-[100] ${toast.type === "error" ? "bg-[#c0392b] text-white" : "bg-[#27ae60] text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
