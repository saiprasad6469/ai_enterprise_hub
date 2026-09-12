import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'default' | 'success' | 'warning' | 'error';
}

interface ToastStore {
  toasts: ToastMessage[];
  toast: (t: Omit<ToastMessage, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  toast: (t) => {
    const id = 'toast_' + Math.random().toString(36).substr(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { ...t, id }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((item) => item.id !== id),
      }));
    }, 4000);
  },
  dismiss: (id) => set((state) => ({
    toasts: state.toasts.filter((item) => item.id !== id),
  })),
}));
