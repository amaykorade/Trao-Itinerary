import type { AuthResponse, SharedTrip, TripDetail, TripSummary, User } from './types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(
  /\/$/,
  ''
);

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function clearToken(): void {
  localStorage.removeItem('token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data.error || 'Something went wrong');
  }

  return data as T;
}

export const api = {
  register: (body: { email: string; password: string; name: string }) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  googleLogin: (credential: string) =>
    request<AuthResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }),

  me: () => request<{ user: User }>('/api/auth/me'),

  listTrips: () => request<{ trips: TripSummary[] }>('/api/trips'),

  getTrip: (id: string) => request<{ trip: TripDetail }>(`/api/trips/${id}`),

  createTrip: (body: {
    destination: string;
    numDays: number;
    budgetType: string;
    interests: string[];
  }) =>
    request<{ trip: TripDetail }>('/api/trips', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  deleteTrip: (id: string) =>
    request<void>(`/api/trips/${id}`, { method: 'DELETE' }),

  regenerateTrip: (id: string) =>
    request<{ trip: TripDetail }>(`/api/trips/${id}/generate`, {
      method: 'POST',
    }),

  addActivity: (
    tripId: string,
    body: { day: number; title: string; description?: string; category?: string }
  ) =>
    request<{ trip: TripDetail }>(`/api/trips/${tripId}/activities`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  removeActivity: (tripId: string, activityId: string) =>
    request<{ trip: TripDetail }>(`/api/trips/${tripId}/activities/${activityId}`, {
      method: 'DELETE',
    }),

  regenerateDay: (tripId: string, day: number, prompt?: string) =>
    request<{ trip: TripDetail }>(`/api/trips/${tripId}/days/${day}/regenerate`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  reorderActivities: (tripId: string, day: number, activityIds: string[]) =>
    request<{ trip: TripDetail }>(`/api/trips/${tripId}/days/${day}/activities/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ activityIds }),
    }),

  finalizeTrip: (tripId: string) =>
    request<{ trip: TripDetail }>(`/api/trips/${tripId}/finalize`, { method: 'POST' }),

  unfinalizeTrip: (tripId: string) =>
    request<{ trip: TripDetail }>(`/api/trips/${tripId}/unfinalize`, { method: 'POST' }),

  enableTripShare: (tripId: string) =>
    request<{ trip: TripDetail }>(`/api/trips/${tripId}/share`, { method: 'POST' }),

  disableTripShare: (tripId: string) =>
    request<{ trip: TripDetail }>(`/api/trips/${tripId}/share`, { method: 'DELETE' }),

  restoreTripVersion: (tripId: string, versionId: string) =>
    request<{ trip: TripDetail }>(`/api/trips/${tripId}/versions/${versionId}/restore`, {
      method: 'POST',
    }),

  getSharedTrip: (token: string) => request<{ trip: SharedTrip }>(`/api/share/${token}`),
};
