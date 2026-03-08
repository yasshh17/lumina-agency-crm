import React from 'react';
import { Sidebar } from './Sidebar';
import { useAppStore } from '../store/appStore';
import { Menu } from 'lucide-react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { activePage, toggleSidebar } = useAppStore();
  
  const pageTitles = {
    dashboard: 'Analytics Dashboard',
    contacts: 'Contact Management',
    deals: 'Sales Pipeline',
    activities: 'Activity Feed'
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 capitalize">
              {pageTitles[activePage]}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
              AD
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
