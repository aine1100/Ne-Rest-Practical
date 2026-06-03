import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { API_URL } from './constants';
import { clearAuth, getAccessToken, getRefreshToken, storeAuth, getStoredUser } from './auth';
import { STORAGE_KEYS } from './constants';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = false;
let queue: Array<(token: string) => void> = [];

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
  const { accessToken, user } = data.data;
  const stored = getStoredUser();

  if (stored) {
    storeAuth(user || stored, accessToken, refreshToken);
  } else if (user) {
    storeAuth(user, accessToken, refreshToken);
  } else {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  }

  return accessToken as string;
}

const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/setup-admin',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-otp',
  '/auth/resend-otp',
  '/auth/set-password',
  '/auth/refresh-token',
];

function isPublicAuthRequest(url?: string) {
  if (!url) return false;
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Let login and other public auth calls surface errors without redirect/retry.
    if (isPublicAuthRequest(original.url)) {
      return Promise.reject(error);
    }

    if (!getRefreshToken()) {
      clearAuth();
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(error);
    }

    if (refreshing) {
      return new Promise((resolve) => {
        queue.push((token) => {
          if (original.headers) original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    original._retry = true;
    refreshing = true;

    try {
      const accessToken = await refreshAccessToken();
      queue.forEach((cb) => cb(accessToken));
      queue = [];
      if (original.headers) original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch {
      clearAuth();
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(error);
    } finally {
      refreshing = false;
    }
  }
);

export default api;

export async function apiGet<T>(url: string, params?: Record<string, unknown>) {
  const { data } = await api.get(url, { params });
  return data as { success: boolean; data: T; message?: string; meta?: { page: number; limit: number; total: number; totalPages: number } };
}

export async function apiPost<T>(url: string, body?: unknown) {
  const { data } = await api.post(url, body);
  return data as { success: boolean; data: T; message?: string };
}

export async function apiPut<T>(url: string, body?: unknown) {
  const { data } = await api.put(url, body);
  return data as { success: boolean; data: T; message?: string };
}

export async function apiPatch<T>(url: string, body?: unknown) {
  const { data } = await api.patch(url, body);
  return data as { success: boolean; data: T; message?: string };
}

export async function apiDelete<T>(url: string) {
  const { data } = await api.delete(url);
  return data as { success: boolean; data: T; message?: string };
}

export async function apiDownload(url: string, filename: string) {
  let response: AxiosResponse<Blob>;

  try {
    response = await api.get(url, { responseType: 'blob' });
  } catch (error) {
    throw error;
  }

  const contentType = String(response.headers['content-type'] || '');
  if (contentType.includes('application/json')) {
    const text = await response.data.text();
    const payload = JSON.parse(text) as { message?: string };
    throw new Error(payload.message || 'Download failed');
  }

  const blobUrl = URL.createObjectURL(response.data);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(blobUrl);
}
