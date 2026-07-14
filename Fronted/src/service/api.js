const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export function getApiUrl(path) {
  return `${API_BASE.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

function getToken() {
  try {
    return localStorage.getItem('uconfess_jwt');
  } catch {
    return null;
  }
}

apiRequest.getUrl = getApiUrl;

export async function apiRequest(method, path, body = null, auth = false) {
  const url = getApiUrl(path);
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  const opts = { method, headers };
  if (body) {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.message || `Error ${res.status}: ${res.statusText}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function getTokenExpiry() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? new Date(payload.exp * 1000) : null;
  } catch {
    return null;
  }
}

export function isTokenExpired() {
  const expiry = getTokenExpiry();
  if (!expiry) return true;
  return Date.now() >= expiry.getTime();
}

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = API_BASE.replace(/\/api\/?$/, '');
  return `${base}${path}`;
}
