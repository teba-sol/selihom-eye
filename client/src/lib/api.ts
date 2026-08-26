const API_BASE = '/api';

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
    if (res.status === 401) {
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
  post: <T>(url: string, data?: any) => request<T>('POST', url, data),
  patch: <T>(url: string, data?: any) => request<T>('PATCH', url, data),
  delete: <T>(url: string) => request<T>('DELETE', url),
};
