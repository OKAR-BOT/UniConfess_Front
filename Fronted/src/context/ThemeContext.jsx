import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'uconfess-theme';

const ThemeContext = createContext(null);

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStoredTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

function applyTheme(resolved) {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', resolved === 'dark' ? '#0a0a12' : '#B50D30');
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readStoredTheme);
  const [resolved, setResolved] = useState(() =>
    preference === 'system' ? getSystemTheme() : preference
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const sync = () => {
      const next = preference === 'system' ? getSystemTheme() : preference;
      setResolved(next);
      applyTheme(next);
    };

    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [preference]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, preference);
  }, [preference]);

  const value = useMemo(
    () => ({
      preference,
      resolved,
      isDark: resolved === 'dark',
      setTheme: setPreference,
      toggleTheme: () => setPreference((prev) => {
        const current = prev === 'system' ? getSystemTheme() : prev;
        return current === 'dark' ? 'light' : 'dark';
      }),
    }),
    [preference, resolved]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
