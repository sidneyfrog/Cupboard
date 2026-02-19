import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  session: { accessToken: string; refreshToken: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: { accessToken: string; refreshToken: string } | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

/** Global authentication state store. */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: user !== null }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, session: null, isLoading: false, isAuthenticated: false }),
}));
