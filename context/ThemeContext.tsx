import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { AppTheme, resolveTheme } from '@/constants/theme';

// ─── Constants ───────────────────────────────────────────────────────
const STORAGE_KEY = '@lekhitguru/dark-mode';

// ─── Context type ────────────────────────────────────────────────────
interface ThemeContextValue {
  /** Whether dark mode is currently active */
  isDarkMode: boolean;
  /** Toggle between light ↔ dark */
  toggleTheme: () => void;
  /** The resolved theme palette & config */
  theme: AppTheme;
}

const defaultTheme = resolveTheme(true);
const defaultThemeContext: ThemeContextValue = {
  isDarkMode: true,
  toggleTheme: () => {},
  theme: defaultTheme,
};

const ThemeContext = createContext<ThemeContextValue>(defaultThemeContext);

// ─── Hook ────────────────────────────────────────────────────────────
/**
 * Access the current theme. Must be used inside `<ThemeProvider>`.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  return ctx || defaultThemeContext;
}

// ─── Provider ────────────────────────────────────────────────────────
interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Hydrate persisted preference on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          setIsDarkMode(stored === 'true');
        }
      } catch (err) {
        console.warn('[ThemeProvider] Failed to read dark-mode preference:', err);
      }
    })();
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, String(next)).catch((err) =>
        console.warn('[ThemeProvider] Failed to persist dark-mode preference:', err),
      );
      return next;
    });
  }, []);

  const theme = useMemo(() => resolveTheme(isDarkMode), [isDarkMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ isDarkMode, toggleTheme, theme }),
    [isDarkMode, toggleTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ─── ThemeBackground ─────────────────────────────────────────────────
/**
 * Root-level background component.
 * – Light mode: solid color fill.
 * – Dark mode: renders `background.jpg` as a full-bleed image.
 *
 * Wrap this around your top-level `<Stack>` or screen content.
 */
interface ThemeBackgroundProps {
  children: ReactNode;
}

export function ThemeBackground({ children }: ThemeBackgroundProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.backgroundSolid, { backgroundColor: theme.isDark ? '#091020' : '#f5f5f5' }]}>
      {theme.isDark && (
        <Image
          source={require('@/assets/images/background.jpg')}
          style={styles.backgroundImageFixed}
          resizeMode="cover"
        />
      )}
      {children}
    </View>
  );
}

// ─── GlassCard ───────────────────────────────────────────────────────
/**
 * A card wrapper that applies glassmorphism styles in dark mode
 * and a regular opaque card style in light mode.
 *
 * Use this to wrap card content for consistent glass effect.
 */
interface GlassCardProps {
  children: ReactNode;
  style?: any;
  borderRadius?: number;
}

export function GlassCard({ children, style, borderRadius }: GlassCardProps) {
  const { theme } = useTheme();
  const radius = borderRadius ?? theme.glass.borderRadius;

  return (
    <View
      style={[
        {
          backgroundColor: theme.isDark
            ? theme.glass.backgroundColor
            : theme.colors.card,
          borderColor: theme.isDark
            ? theme.glass.borderColor
            : theme.colors.cardBorder,
          borderWidth: theme.isDark ? theme.glass.borderWidth : 0,
          borderRadius: radius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backgroundImageFixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  backgroundSolid: {
    flex: 1,
    overflow: 'hidden',
  },
});
