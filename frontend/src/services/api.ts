import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const ACCESS_KEY = 'apimocker.accessToken';
const REFRESH_KEY = 'apimocker.refreshToken';

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY) || '',
  getRefresh: () => localStorage.getItem(REFRESH_KEY) || '',
  setTokens(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  setAccess(access: string) {
    localStorage.setItem(ACCESS_KEY, access);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((cfg) => {
  const token = tokenStore.getAccess();
  if (token) {
    cfg.headers = cfg.headers || {};
    cfg.headers['Authorization'] = `Bearer ${token}`;
  }
  return cfg;
});

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new Error('no-refresh');
  const res = await axios.post('/api/auth/refresh', { refreshToken });
  const { accessToken } = res.data.data;
  tokenStore.setAccess(accessToken);
  return accessToken;
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    const url = original?.url || '';
    const isAuthEndpoint = url.startsWith('/auth/') || url.includes('/auth/');

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        original.headers = original.headers || {};
        original.headers['Authorization'] = `Bearer ${newToken}`;
        return api(original);
      } catch {
        tokenStore.clear();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.assign('/login');
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;

// Project APIs
export const projectApi = {
  list: () => api.get('/projects'),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: { name: string; description?: string }) => api.post('/projects', data),
  update: (id: string, data: { name?: string; description?: string }) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Endpoint APIs
export const endpointApi = {
  list: (projectId: string) => api.get(`/projects/${projectId}/endpoints`),
  get: (projectId: string, id: string) => api.get(`/projects/${projectId}/endpoints/${id}`),
  create: (projectId: string, data: { name: string; description?: string; baseEndpoint?: string; isCustomEndpoint?: boolean }) =>
    api.post(`/projects/${projectId}/endpoints`, data),
  add: (projectId: string, data: {
    name: string;
    description?: string;
    basePath: string;
    customEndpoint?: string;
    httpMethod: string;
    statusCode?: number;
    responseStructure?: string;
  }) => api.post(`/projects/${projectId}/endpoints/add`, data),
  update: (projectId: string, id: string, data: Record<string, unknown>) =>
    api.put(`/projects/${projectId}/endpoints/${id}`, data),
  delete: (projectId: string, id: string) => api.delete(`/projects/${projectId}/endpoints/${id}`),
  deleteResource: (projectId: string, basePath: string) =>
    api.delete(`/projects/${projectId}/resources/${encodeURIComponent(basePath)}`),
  generate: (projectId: string, id: string, data?: Record<string, unknown>) =>
    api.post(`/projects/${projectId}/endpoints/${id}/generate`, data),
};

// Settings APIs
export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: Record<string, unknown>) => api.put('/settings', data),
};

// Auth APIs
export const authApi = {
  status: () => api.get('/auth/status'),
  register: (data: { username: string; password: string }) => api.post('/auth/register', data),
  login: (data: { username: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};
