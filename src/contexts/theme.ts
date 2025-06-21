import { createContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);