import { create } from 'zustand';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email, password) => {
    set({ user: { id: '1', name: 'Receptionist', email, role: 'receptionist' }, isAuthenticated: true });
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));
