import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  isAdmin,
  isPremium,
  canPostAnonymously,
  getAllUsers,
  updateUserRole,
  toggleUserBan,
  deleteConfessionById,
  setUserPremium,
  ensureAdminSeeded,
} from '../service/localAuth';

/** @typedef {import('../service/localAuth').PublicUser} PublicUser */

const AuthContext = createContext(
  /** @type {{ user: PublicUser | null, login: Function, register: Function, logout: Function, refresh: Function } | null} */ (
    null
  )
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    ensureAdminSeeded();
    return getCurrentUser();
  });

  const refresh = useCallback(() => {
    setUser(getCurrentUser());
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await loginUser(email, password);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const u = await registerUser(data);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      refresh,
      isAdmin: isAdmin(user),
      isPremium: isPremium(user),
      canPostAnonymously: canPostAnonymously(user),
      getAllUsers,
      updateUserRole,
      toggleUserBan,
      deleteConfessionById,
      setUserPremium,
      ensureAdminSeeded,
    }),
    [user, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
