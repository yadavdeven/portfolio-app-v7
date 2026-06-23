import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import { Theme, ThemeMode, themes } from './themes';
import { getStoredThemeMode, setStoredThemeMode } from './themeStorage';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const DEFAULT_MODE: ThemeMode = 'light';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Resolve the persisted choice synchronously on first render so there's no
  // flash of the default theme before MMKV is read.
  const [mode, setModeState] = useState<ThemeMode>(
    () => getStoredThemeMode() ?? DEFAULT_MODE,
  );

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    setStoredThemeMode(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setModeState(prev => {
      const next: ThemeMode = prev === 'light' ? 'dark' : 'light';
      setStoredThemeMode(next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: themes[mode],
      mode,
      isDark: mode === 'dark',
      setMode,
      toggleTheme,
    }),
    [mode, setMode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};

/**
 * Builds a themed StyleSheet from a factory and memoizes it per theme, so the
 * sheet is only rebuilt when the theme actually changes. Keep the factory at
 * module scope (a stable reference) so the memo isn't invalidated each render.
 *
 *   const createStyles = (theme: Theme) => StyleSheet.create({ ... });
 *   const styles = useThemedStyles(createStyles);
 */
export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: Theme) => T,
): T => {
  const { theme } = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
};
