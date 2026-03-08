import { create } from 'zustand';

type Page = 'dashboard' | 'contacts' | 'deals' | 'activities';

interface AppState {
  activePage: Page;
  sidebarOpen: boolean;
  setActivePage: (page: Page) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activePage: 'dashboard',
  sidebarOpen: true,
  setActivePage: (page) => set({ activePage: page }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
