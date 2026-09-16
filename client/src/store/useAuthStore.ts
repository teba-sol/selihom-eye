import { create } from 'zustand';
import { api, registerAuthBridge, clearAccessToken, applyAccessToken, type AuthUserInfo } from '../lib/api';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'DOCTOR' | 'RECEPTIONIST';
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  restoring: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  restoreSession: () => Promise<void>;
  logout: () => void;
}

function normalizeUser(u: AuthUserInfo): AuthUser {
  return {
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    role: u.role,
  };
}

let restoreStarted = false;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  restoring: true,

  login: async (email, password) => {
    try {
      const res = await api.post<{ accessToken: string; user: AuthUserInfo }>('/auth/login', {
        email: email.trim(),
        password: password.trim(),
      });
      applyAccessToken(res.accessToken);
      set({ isAuthenticated: true, user: normalizeUser(res.user) });
      return { success: true, role: res.user.role };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed.' };
    }
  },

  restoreSession: async () => {
    if (restoreStarted) return;
    restoreStarted = true;
    try {
      const ok = await api.refreshAccessToken();
      if (!ok) {
        set({ isAuthenticated: false, user: null });
      }
    } finally {
      set({ restoring: false });
    }
  },

  logout: () => {
    try {
      api.post('/auth/logout', {}, { toast: false }).catch(() => {});
    } catch {
      /* best-effort */
    }
    clearAccessToken();
    set({ user: null, isAuthenticated: false });
  },
}));

registerAuthBridge({
  onAuthenticated: (user) => useAuthStore.setState({ isAuthenticated: true, user: normalizeUser(user) }),
  onSessionEnded: () => useAuthStore.setState({ isAuthenticated: false, user: null }),
});