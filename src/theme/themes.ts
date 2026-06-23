import Colors from '../constants/Colors';

// Theme support is currently a manual light/dark toggle (no OS-following). The
// raw palette lives in constants/Colors; a Theme maps those raw values onto
// *semantic* tokens (background, surface, text, …) so components describe the
// role a color plays rather than hard-coding a specific hex. Adding a new theme
// later means supplying another token set — components don't change.

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  /** App / screen background. */
  background: string;
  /** Cards, headers and other raised surfaces sitting on the background. */
  surface: string;
  /** Card / category-row surfaces sitting on the background. */
  surfaceVariant: string;
  /** Text/icons rendered on top of `surfaceVariant`. */
  onSurfaceVariant: string;
  /** Brand accent used for icons and primary actions. */
  primary: string;
  /** Section headings (slightly lighter accent than `primary`). */
  heading: string;
  /** Default body text. */
  text: string;
  /** De-emphasized text. */
  textSecondary: string;
  /** Placeholder / empty value text inside inputs and trigger fields. */
  placeholder: string;
  /** Bottom-sheet / elevated modal backdrop, distinct from `surface` so rows
   * sitting on it read as raised. */
  sheetBackground: string;
  /** Hairlines, card outlines and dividers. */
  border: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: Colors.white,
    surface: Colors.white,
    surfaceVariant: Colors.primary_100,
    onSurfaceVariant: Colors.white,
    primary: Colors.primary,
    heading: Colors.primary,
    text: Colors.grey_primary,
    textSecondary: Colors.grey_300,
    placeholder: Colors.grey_600,
    sheetBackground: Colors.bg_600,
    border: Colors.bg_600,
  },
};

// Dark palette supplied from the target design spec.
export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#0F1117',
    surface: '#1B1E2B',
    surfaceVariant: '#1B1E2B',
    onSurfaceVariant: '#F5F6FA',
    primary: '#6D6FC7',
    heading: '#A9ABFF',
    text: '#F5F6FA',
    textSecondary: '#B8BDD0',
    placeholder: '#6E7488',
    sheetBackground: '#171A23',
    border: '#2C3147',
  },
};

export const themes: Record<ThemeMode, Theme> = {
  light: lightTheme,
  dark: darkTheme,
};
