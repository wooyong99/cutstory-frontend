import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (accessToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: (accessToken) =>
        set({ accessToken, isAuthenticated: true }),
      setUser: (user) =>
        set({ user }),
      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
        localStorage.removeItem('auth-storage');
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
