import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'carepilot-theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {
    // fallback if localStorage is restricted
  }
  return 'system';
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreference] = useState<ThemePreference>(getInitialPreference);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    const pref = getInitialPreference();
    return pref === 'system' ? getSystemTheme() : pref;
  });

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      let active: ResolvedTheme = 'light';
      if (preference === 'system') {
        active = getSystemTheme();
      } else {
        active = preference;
      }

      setResolvedTheme(active);
      root.setAttribute('data-theme', active);
      root.setAttribute('data-theme-preference', preference);

      try {
        localStorage.setItem(THEME_STORAGE_KEY, preference);
      } catch {
        // ignore localStorage errors
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      if (preference === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [preference]);

  const setThemePreference = (pref: ThemePreference) => {
    setPreference(pref);
  };

  const toggleTheme = () => {
    setPreference((current) => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'light';
      return resolvedTheme === 'dark' ? 'light' : 'dark';
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        preference,
        resolvedTheme,
        setThemePreference,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
