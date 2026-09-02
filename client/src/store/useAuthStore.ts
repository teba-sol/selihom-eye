import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'DOCTOR' | 'RECEPTIONIST';
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  logout: () => void;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const res = await api.post<{ accessToken: string; user: { id: string; email: string; firstName: string; lastName: string; role: string } }>('/auth/login', {
            email: email.trim(),
            password: password.trim(),
          });

          set({
            isAuthenticated: true,
            token: res.accessToken,
            user: {
              id: res.user.id,
              name: `${res.user.firstName} ${res.user.lastName}`,
              email: res.user.email,
              role: res.user.role as 'DOCTOR' | 'RECEPTIONIST',
            },
          });
          return { success: true, role: res.user.role };
        } catch (err: any) {
          return { success: false, error: err.message || 'Login failed.' };
        }
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
    }),
    { 
      name: 'asira-auth',
      // Safely handle corrupted persisted state
      merge: (persisted, current) => {
        try {
          if (persisted && typeof persisted === 'object') {
            return { ...current, ...(persisted as Partial<AuthState>) };
          }
        } catch {
          // corrupted — reset
        }
        return current;
      },
    },
  ),
);
