import { toastSuccess } from './toast';
import { notifySessionExpired } from './authExpired';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

function postSuccessMessage(url: string): string {
  if (url.includes('/auth/login')) return '';
  if (url.includes('/clinical/encounter')) return 'Examination saved successfully';
  if (url.includes('/optical-orders')) return 'Order placed successfully';
  if (url.includes('/patients')) return 'Patient registered successfully';
  if (url.includes('/appointments')) return 'Appointment booked successfully';
  if (url.includes('/prescriptions')) return 'Prescription sent successfully';
  if (url.includes('/users')) return 'User created successfully';
  if (url.includes('/surgery')) return 'Surgery saved successfully';
  return 'Saved successfully';
}

function getStoredState(): any | null {
  try {
    const raw = localStorage.getItem('asira-auth');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getToken(): string | null {
  return getStoredState()?.state?.token ?? null;
}

function getRefreshToken(): string | null {
  return getStoredState()?.state?.refreshToken ?? null;
}

function updateStoredTokens(token: string, refreshToken: string) {
  const stored = getStoredState();
  if (stored && stored.state) {
    stored.state.token = token;
    stored.state.refreshToken = refreshToken;
    localStorage.setItem('asira-auth', JSON.stringify(stored));
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (!data.accessToken || !data.refreshToken) return false;
        updateStoredTokens(data.accessToken, data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

async function request<T>(method: string, url: string, data?: any, isRetry = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

  if (res.status === 401 && !url.includes('/auth/')) {
    // Try silent refresh once, then retry the original request.
    if (!isRetry) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request<T>(method, url, data, true);
      }
    }
    // No longer force-logout. Notify the app so it can prompt for a password
    // while preserving the current work.
    notifySessionExpired();
    throw new Error('Session expired. Please re-enter your password to continue.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API error ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(url: string) => request<T>('GET', url),
  post: async <T>(url: string, data?: any, opts?: { toast?: boolean }): Promise<T> => {
    const result = await request<T>('POST', url, data);
    const message = postSuccessMessage(url);
    if (message && opts?.toast !== false) toastSuccess(message);
    return result;
  },
  patch: <T>(url: string, data?: any) => request<T>('PATCH', url, data),
  delete: <T>(url: string) => request<T>('DELETE', url),
};
