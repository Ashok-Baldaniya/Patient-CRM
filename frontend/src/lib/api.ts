const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window === 'undefined' ? null : window.localStorage.getItem('patient-crm-token');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const errorBody = (await response.json()) as {
        message?: string | string[];
        error?: string;
      };

      if (Array.isArray(errorBody.message)) {
        errorMessage = errorBody.message.join(', ');
      } else if (errorBody.message) {
        errorMessage = errorBody.message;
      } else if (errorBody.error) {
        errorMessage = errorBody.error;
      }
    } catch {
      // Leave the fallback message if the response body is not JSON.
    }

    if (response.status === 401) {
      throw new Error(errorMessage || 'Unauthorized');
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export const api = {
  login: (username: string, password: string) =>
    request<{ accessToken: string; user: { username: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  getCurrentUser: () =>
    request<{ user: { username: string } | null }>('/auth/me'),
  getDashboardSummary: () =>
    request<{ dueToday: number; overdue: number; sentToday: number; revisitsToday: number }>(
      '/dashboard/summary',
    ),
  getPatients: () => request<Array<Record<string, unknown>>>('/patients'),
  getPatientHistory: (id: string) =>
    request<{ patient: Record<string, unknown>; history: { visits: Array<Record<string, unknown>>; followups: Array<Record<string, unknown>> } }>(
      `/patients/${id}/history`,
    ),
  createPatient: (payload: Record<string, unknown>) =>
    request('/patients', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getQueue: () => request<Array<Record<string, unknown>>>('/followups/queue'),
  markFollowupOpened: (id: string) =>
    request(`/followups/${id}/opened`, { method: 'PATCH' }),
  markFollowupSent: (id: string) =>
    request(`/followups/${id}/sent`, { method: 'PATCH' }),
  markFollowupSkipped: (id: string) =>
    request(`/followups/${id}/skipped`, { method: 'PATCH' }),
  createVisit: (payload: Record<string, unknown>) =>
    request('/visits', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getTemplates: () => request<Array<Record<string, unknown>>>('/templates'),
  createTemplate: (payload: Record<string, unknown>) =>
    request('/templates', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateTemplate: (id: string, payload: Record<string, unknown>) =>
    request(`/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
