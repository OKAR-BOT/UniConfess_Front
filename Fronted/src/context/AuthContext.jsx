import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { apiRequest, isTokenExpired } from '../service/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('uconfess_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const refresh = useCallback(() => {
    if (!isTokenExpired()) {
      apiRequest('GET', 'auth/me', null, true)
        .then((u) => {
          setUser(u);
          localStorage.setItem('uconfess_user', JSON.stringify(u));
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem('uconfess_user');
          localStorage.removeItem('uconfess_jwt');
        });
    } else {
      setUser(null);
      localStorage.removeItem('uconfess_user');
      localStorage.removeItem('uconfess_jwt');
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiRequest('POST', 'auth/login', { email, password });
    localStorage.setItem('uconfess_jwt', data.token);
    localStorage.setItem('uconfess_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (input) => {
    const data = await apiRequest('POST', 'auth/register', input);
    localStorage.setItem('uconfess_jwt', data.token);
    localStorage.setItem('uconfess_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('uconfess_jwt');
    localStorage.removeItem('uconfess_user');
    setUser(null);
  }, []);

  const isAdmin = useMemo(() => user?.role === 'admin', [user]);
  const isPremium = useMemo(() => user?.role === 'premium', [user]);
  const canPostAnonymously = useMemo(() => user?.role === 'premium' || user?.role === 'admin', [user]);

  const getAllUsers = useCallback(async () => {
    return apiRequest('GET', 'users', null, true);
  }, []);

  const updateUserRole = useCallback(async (userId, role) => {
    return apiRequest('PUT', `users/${userId}/role`, { role }, true);
  }, []);

  const toggleUserBan = useCallback(async (userId) => {
    return apiRequest('PUT', `users/${userId}/ban`, {}, true);
  }, []);

  const setUserPremium = useCallback(async (userId, expiryDate) => {
    return apiRequest('PUT', `users/${userId}/premium`, { membershipExpiresAt: expiryDate }, true);
  }, []);

  const deleteConfessionById = useCallback(async (postId) => {
    return apiRequest('DELETE', `confessions/${postId}`, null, true);
  }, []);

  const value = useMemo(() => ({
    user, login, register, logout, refresh,
    isAdmin, isPremium, canPostAnonymously,
    getAllUsers, updateUserRole, toggleUserBan,
    deleteConfessionById, setUserPremium,
  }), [user, login, register, logout, refresh,
      isAdmin, isPremium, canPostAnonymously,
      getAllUsers, updateUserRole, toggleUserBan,
      deleteConfessionById, setUserPremium]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
