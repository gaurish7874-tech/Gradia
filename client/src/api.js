const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('gradia_token');
}

export async function api(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(API_BASE + url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || res.statusText || 'Request failed');
  return data;
}

export const authApi = {
  register: (body) => api('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => api('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => api('/auth/me'),
};

export const quizApi = {
  getDiagnostic: () => api('/quiz/diagnostic'),
  generate: (body) => api('/quiz/generate', { method: 'POST', body: JSON.stringify(body) }),
  list: (params) => api('/quiz?' + new URLSearchParams(params).toString()),
  getById: (id) => api('/quiz/' + id),
};

export const performanceApi = {
  submitAnswer: (body) => api('/performance/answer', { method: 'POST', body: JSON.stringify(body) }),
  submitDiagnostic: (body) => api('/performance/diagnostic', { method: 'POST', body: JSON.stringify(body) }),
  getProgress: () => api('/performance/progress'),
};

export const gamificationApi = {
  leaderboard: (limit) => api('/gamification/leaderboard?' + new URLSearchParams({ limit: limit || 20 })),
  badges: () => api('/gamification/badges'),
};

export const userApi = {
  getRoadmap: () => api('/user/roadmap'),
  updateProfile: (body) => api('/user/profile', { method: 'PATCH', body: JSON.stringify(body) }),
};
