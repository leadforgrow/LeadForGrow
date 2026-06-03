'use client';

/**
 * Authenticated fetch client — JWT-only, no userId query params.
 */

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userToken') || localStorage.getItem('token') || null;
}

export function getUserId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userid') || null;
}

export function setAuthSession({ token, userId }) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('userToken', token);
    localStorage.setItem('token', token);
  }
  if (userId) localStorage.setItem('userid', userId);
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('userToken');
  localStorage.removeItem('token');
  localStorage.removeItem('userid');
}

export function authHeaders(extra = {}) {
  const token = getAuthToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Fetch with JWT auth. Never sends userId query params.
 */
export async function authFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});

  const token = getAuthToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !headers.has('Content-Type') && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (!path.startsWith('/user/')) {
      clearAuthSession();
      window.location.href = `/user/register?mode=login&redirect=${encodeURIComponent(path)}&expired=1`;
    }
  }

  return res;
}

export async function authJson(url, options = {}) {
  const res = await authFetch(url, options);
  return res.json();
}
