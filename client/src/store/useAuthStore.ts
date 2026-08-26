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
        
        const emailLower = email.trim().toLowerCase();
        const passwordTrimmed = password.trim();
        
        // Validate credentials
        if (emailLower === 'receptionist@selihome.com' && passwordTrimmed === '123') {
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
        
        if (emailLower === 'doctor@selihome.com' && passwordTrimmed === '123') {
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
        }
        
        // Invalid credentials
        return { success: false, error: 'Invalid email or password.' };
      },

      logout: () => set({ user: null, isAuthenticated: false }),
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
