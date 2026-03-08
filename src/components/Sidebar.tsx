import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Handshake, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'deals', label: 'Deals', icon: Handshake },
  { id: 'activities', label: 'Activities', icon: Activity },
];

export const Sidebar = () => {
  const { activePage, setActivePage, sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1e293b] text-white transition-all duration-300 flex flex-col h-screen sticky top-0`}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-indigo-600 p-2 rounded-lg shrink-0">
            <Zap size={20} fill="white" />
          </div>
          {sidebarOpen && <span className="font-bold text-xl tracking-tight">Lumina</span>}
        </div>
        <button onClick={toggleSidebar} className="p-1 hover:bg-slate-700 rounded-md lg:hidden">
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <Icon size={22} className={isActive ? 'text-white' : 'group-hover:text-white'} />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <button onClick={toggleSidebar} className="hidden lg:flex w-full items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors">
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          {sidebarOpen && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};
