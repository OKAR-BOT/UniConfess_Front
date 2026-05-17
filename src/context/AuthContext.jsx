import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
} from '../service/authApi';

const AuthContext = createContext(
  /** @type {{ user: any, isAuthReady: boolean, login: Function, register: Function, logout: Function, refresh: Function } | null} */ (
    null
  )
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const refresh = useCallback(async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await loginUser(email, password);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async () => {
    throw new Error('El registro aun no esta conectado al backend.');
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const currentUser = await getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({ user, isAuthReady, login, register, logout, refresh }),
    [user, isAuthReady, login, register, logout, refresh]
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
