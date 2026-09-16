import { toastSuccess } from './toast';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export interface AuthUserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'RECEPTIONIST' | 'DOCTOR';
}

export interface AuthBridge {
  onAuthenticated: (user: AuthUserInfo) => void;
  onSessionEnded: () => void;
}

const REFRESH_MARGIN_MS = 60_000;

let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;
let autoRefreshTimer: ReturnType<typeof setTimeout> | null = null;
let bridge: AuthBridge | null = null;

function postSuccessMessage(url: string, data?: any): string {
  if (url.includes('/auth/login')) return '';
  if (url.includes('/clinical/encounter')) {
    if (url.endsWith('/addendum')) return 'Addendum saved successfully';
    return data?.encounterId ? 'Examination saved successfully' : 'Examination started successfully';
  }
  if (url.includes('/optical-orders')) return 'Order placed successfully';
  if (url.includes('/patients')) return 'Patient registered successfully';
  if (url.includes('/appointments')) return 'Appointment booked successfully';
  if (url.includes('/prescriptions')) return 'Prescription sent successfully';
  if (url.includes('/users')) return 'User created successfully';
  if (url.includes('/surgery')) return 'Surgery saved successfully';
  return 'Saved successfully';
}

export function registerAuthBridge(b: AuthBridge) {
  bridge = b;
}

export function clearAccessToken() {
  accessToken = null;
  if (autoRefreshTimer) {
    clearTimeout(autoRefreshTimer);
    autoRefreshTimer = null;
  }
}

export function applyAccessToken(token: string) {
  accessToken = token;
  scheduleAccessTokenRefresh(token);
}

function decodeBase64Url(input: string): string {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) base64 += '=';
  return atob(base64);
}

function decodeExp(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

function scheduleAccessTokenRefresh(token: string) {
  if (autoRefreshTimer) {
    clearTimeout(autoRefreshTimer);
    autoRefreshTimer = null;
  }
  const exp = decodeExp(token);
  if (!exp) return;
  const msUntilExp = exp * 1000 - Date.now();
  const delay = Math.max(1000, msUntilExp - REFRESH_MARGIN_MS);
  autoRefreshTimer = setTimeout(() => {
    if (!accessToken) return;
    refreshAccessToken().then((ok) => {
      if (!ok) failAuthSession();
    });
  }, delay);
}

function failAuthSession() {
  clearAccessToken();
  bridge?.onSessionEnded();
}

function deviceUserAgent(): string | undefined {
  return navigator.userAgent.slice(0, 200);
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (!data.accessToken) return false;
      applyAccessToken(data.accessToken);
      bridge?.onAuthenticated(data.user as AuthUserInfo);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(method: string, url: string, data?: any, isRetry = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  const ua = deviceUserAgent();
  if (ua) headers['X-Device-Name'] = ua;

  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers,
    credentials: 'include',
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

  if (res.status === 401 && !url.includes('/auth/')) {
    if (!isRetry) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request<T>(method, url, data, true);
      }
    }
    failAuthSession();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || `API error ${res.status}`) as any;
    if (body && typeof body === 'object') {
      err.code = body.code ?? null;
      err.status = res.status;
      err.payload = body;
    }
    throw err;
  }

  return res.json();
}

export const api = {
  get: <T>(url: string) => request<T>('GET', url),
  post: async <T>(url: string, data?: any, opts?: { toast?: boolean }): Promise<T> => {
    const result = await request<T>('POST', url, data);
    const message = postSuccessMessage(url, data);
    if (message && opts?.toast !== false) toastSuccess(message);
    return result;
  },
  patch: <T>(url: string, data?: any) => request<T>('PATCH', url, data),
  delete: <T>(url: string) => request<T>('DELETE', url),
  refreshAccessToken,
  getAccessToken: () => accessToken,
};