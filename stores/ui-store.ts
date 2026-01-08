import { create } from 'zustand';

interface UIState {
  isMenuOpen:  boolean;
  activeModal: string | null;
  confirmDialog: {
    isOpen: boolean;
    title:  string;
    message: string;
    onConfirm: (() => void) | null;
  };
  
  toggleMenu: () => void;
  openModal:  (modalId: string) => void;
  closeModal: () => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirm: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMenuOpen: false,
  activeModal:  null,
  confirmDialog: {
    isOpen: false,
    title: '',
    message:  '',
    onConfirm:  null,
  },

  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),

  showConfirm: (title, message, onConfirm) =>
    set({
      confirmDialog: { isOpen: true, title, message, onConfirm },
    }),

  closeConfirm: () =>
    set({
      confirmDialog: { isOpen: false, title: '', message: '', onConfirm: null },
    }),
}));