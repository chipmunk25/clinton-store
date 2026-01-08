import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "admin" | "salesperson";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  isAdmin: () => boolean;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,

      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),

      isAdmin: () => {
        const { user } = get();
        return user?.role === "admin";
      },

      logout: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } finally {
          set({ user: null });
          window.location.href = "/login";
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
