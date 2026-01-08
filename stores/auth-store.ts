import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/db/schema';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  hasPermission: (requiredRole: UserRole) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading:  true,

      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),

      hasPermission:  (requiredRole) => {
        const { user } = get();
        if (!user) return false;
        if (requiredRole === 'salesperson') return true; // Both roles have this
        return user.role === 'admin';
      },

      logout: () => {
        set({ user:  null });
        // Cookie will be cleared by API
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);