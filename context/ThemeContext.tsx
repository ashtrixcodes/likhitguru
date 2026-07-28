import LoadingScreen from '@/components/LoadingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ─── Hook ────────────────────────────────────────────────────────────
/**
 * Access the current theme. Must be used inside `<ThemeProvider>`.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────
interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isReady, setIsReady] = useState(false);

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
      } finally {
        setIsReady(true);
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

  // Don't render children until we've hydrated the stored preference
  // so there's no flash of wrong theme.
  if (!isReady) {
    return <LoadingScreen />;
  }

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
          style={StyleSheet.absoluteFill}
          resizeMode="stretch"
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
  backgroundImage: {
    flex: 1,
  },
  backgroundSolid: {
    flex: 1,
  },
});
