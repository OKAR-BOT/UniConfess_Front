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
    if (data?.token && data?.user) {
      localStorage.setItem('uconfess_jwt', data.token);
      localStorage.setItem('uconfess_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  }, []);

  const register = useCallback(async (input) => {
  const data = await apiRequest('POST', 'auth/register', input);

  if (data?.requiresOtp) {
    return data; 
  }

  if (data?.token && data?.user) {
    localStorage.setItem('uconfess_jwt', data.token);
    localStorage.setItem('uconfess_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }
  return data;
}, []);

  const verifyOtp = useCallback(async ({ challengeId, code }) => {
    const data = await apiRequest('POST', 'auth/otp/verify', { challengeId, code });
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

  const updateConfessionById = useCallback(async (postId, data) => {
    return apiRequest('PUT', `confessions/${postId}`, data, true);
  }, []);

  const blockUser = useCallback(async (blockedId) => {
    return apiRequest('POST', 'blocks', { blockedId }, true);
  }, []);

  const unblockUser = useCallback(async (blockedId) => {
    return apiRequest('DELETE', `blocks/${blockedId}`, null, true);
  }, []);

  const getBlockedUsers = useCallback(async () => {
    return apiRequest('GET', 'blocks', null, true);
  }, []);

  const createReport = useCallback(async (data) => {
    return apiRequest('POST', 'reports', data, true);
  }, []);

  const uploadAvatar = useCallback(async (handle, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const token = localStorage.getItem('uconfess_jwt');
    const url = apiRequest.getUrl ? apiRequest.getUrl(`users/profile/${handle}/avatar`) : `${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/users/profile/${handle}/avatar`;
    const res = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || 'Error al subir avatar');
    }
    return data;
  }, []);

  const value = useMemo(() => ({
    user, login, register, logout, refresh,
    verifyOtp,
    isAdmin, isPremium, canPostAnonymously,
    getAllUsers, updateUserRole, toggleUserBan,
    deleteConfessionById, setUserPremium,
    updateConfessionById, blockUser, unblockUser,
    getBlockedUsers, createReport, uploadAvatar,
  }), [user, login, register, logout, refresh,
      verifyOtp,
      isAdmin, isPremium, canPostAnonymously,
      getAllUsers, updateUserRole, toggleUserBan,
      deleteConfessionById, setUserPremium,
      updateConfessionById, blockUser, unblockUser,
      getBlockedUsers, createReport, uploadAvatar]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
