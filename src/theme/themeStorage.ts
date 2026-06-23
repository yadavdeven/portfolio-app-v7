import { createMMKV } from 'react-native-mmkv';
import { ThemeMode } from './themes';

// Plain (non-secret) UI preferences live in MMKV — synchronous reads let us
// resolve the saved theme during the very first render with no flash of the
// wrong theme. Secrets stay in the keychain (see api/authStorage).
const storage = createMMKV({ id: 'app-preferences' });

const THEME_MODE_KEY = 'theme.mode';

export const getStoredThemeMode = (): ThemeMode | null => {
  const value = storage.getString(THEME_MODE_KEY);
  return value === 'light' || value === 'dark' ? value : null;
};

export const setStoredThemeMode = (mode: ThemeMode): void => {
  storage.set(THEME_MODE_KEY, mode);
};
