import { toastSuccess } from './toast';

const API_BASE = '/api';

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

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('asira-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(method: string, url: string, data?: any): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    // Don't redirect on 401 from login — let the caller show the error
    if (res.status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('asira-auth');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
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
