import { create } from 'zustand';

interface UiState {
  sidebarExpanded: boolean;
  mobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebar: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarExpanded: true,
  mobileSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  setMobileSidebar: (open) => set({ mobileSidebarOpen: open }),
}));
