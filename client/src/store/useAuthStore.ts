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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
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
        
        // Check for receptionist/nurse credentials
        if (email.toLowerCase().includes('receptionist') || 
            email.toLowerCase().includes('nurse') ||
            email.toLowerCase() === 'reception@clinic.com') {
          set({
            isAuthenticated: true,
            user: {
              id: 'nurse-1',
              name: 'Sister Selamawit',
              email: email.trim(),
              role: 'RECEPTIONIST',
            },
          });
          return { success: true, role: 'RECEPTIONIST' };
        }
        
        // Default to doctor credentials
        set({
          isAuthenticated: true,
          user: {
            id: 'doc-1',
            name: 'Dr. Eyasu',
            email: email.trim(),
            role: 'DOCTOR',
          },
        });
        return { success: true, role: 'DOCTOR' };
      },

      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'asira-auth' },
  ),
);
