import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'DOCTOR' | 'RECEPTIONIST';
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 400));
        if (!email.trim() || !password.trim()) {
          return { success: false, error: 'Email and password are required.' };
        }
        set({
          isAuthenticated: true,
          user: {
            id: 'doc-1',
            name: 'Isha Dave',
            email: email.trim(),
            role: 'DOCTOR',
          },
        });
        return { success: true };
      },

      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'asira-auth' },
  ),
);
