/**
 * Centralized theme palette for LekhitGuru.
 *
 * Every color used across the app should reference a token from this file
 * rather than being hardcoded in component styles.
 */

// ─── Type definitions ────────────────────────────────────────────────
export interface ThemePalette {
  /** Primary background for screens */
  background: string;
  /** Slightly elevated surface (e.g., quiz icon circles) */
  surface: string;
  /** Card / elevated container background */
  card: string;
  /** Card border color */
  cardBorder: string;

  /** Primary text color */
  text: string;
  /** Secondary / muted text */
  textSecondary: string;
  /** Tertiary / very subtle text */
  textTertiary: string;

  /** App header bar background */
  header: string;
  /** Text / icons on the header */
  headerText: string;
  /** Header accent elements (burger bg, etc.) */
  headerAccent: string;

  /** Default icon tint */
  icon: string;
  /** General-purpose border */
  border: string;
  /** Brand accent (orange used in pagination, etc.) */
  accent: string;

  /** Footer / tab-bar background */
  footerBackground: string;
  /** Footer text and icon color */
  footerText: string;

  /** Sidebar drawer background */
  sidebarBackground: string;
  /** Sidebar primary text */
  sidebarText: string;
  /** Sidebar secondary text */
  sidebarTextSecondary: string;
  /** Sidebar category header background */
  sidebarCategoryBg: string;
  /** Sidebar sub-items background */
  sidebarSubItemBg: string;

  /** Modal overlay backdrop */
  modalOverlay: string;
  /** Modal card background */
  modalBackground: string;
  /** Modal text */
  modalText: string;

  /** Input field background */
  inputBackground: string;
  /** Input border */
  inputBorder: string;
  /** Input text */
  inputText: string;
  /** Input placeholder */
  inputPlaceholder: string;

  /** Pagination dot (inactive) */
  paginationDot: string;

  /** Cancel button background */
  cancelButtonBg: string;
  /** Cancel button border */
  cancelButtonBorder: string;
  /** Cancel button text */
  cancelButtonText: string;
  /** Save / confirm button background */
  saveButtonBg: string;
  /** Save / confirm button text */
  saveButtonText: string;

  /** Shadow color for elevation */
  shadow: string;

  /** Tag background (e.g., Car / Bike labels) */
  tagBackground: string;
  /** Tag text */
  tagText: string;

  /** View button text & icon */
  viewButtonText: string;

  /** Quiz subtitle / muted info */
  quizSubtitle: string;

  /** Practice arrow / link text */
  practiceLink: string;

  /** Search bar background */
  searchBarBg: string;
  /** Search placeholder text */
  searchPlaceholder: string;

  /** Refresh indicator color */
  refreshIndicator: string;

  /** StatusBar style — 'light' | 'dark' | 'auto' */
  statusBarStyle: 'light' | 'dark' | 'auto';
}

export interface GlassmorphismConfig {
  /** BlurView intensity (0–100) */
  intensity: number;
  /** BlurView tint */
  tint: 'light' | 'dark' | 'default';
  /** Container background (semi-transparent fallback) */
  backgroundColor: string;
  /** Border color for the glass effect */
  borderColor: string;
  /** Border width */
  borderWidth: number;
  /** Border radius */
  borderRadius: number;
}

export interface AppTheme {
  isDark: boolean;
  colors: ThemePalette;
  glass: GlassmorphismConfig;
}

// ─── Light palette ───────────────────────────────────────────────────
const lightColors: ThemePalette = {
  background: '#F4F7FA',
  surface: '#EEF2F6',
  card: '#ffffff',
  cardBorder: '#E5E9F0',

  text: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',

  header: '#434D57',
  headerText: '#ffffff',
  headerAccent: 'rgba(180, 180, 180, 0.6)',

  icon: '#687076',
  border: '#e0e0e0',
  accent: '#FF6B35',

  footerBackground: '#49515a',
  footerText: '#ffffff',

  sidebarBackground: '#ffffff',
  sidebarText: '#111827',
  sidebarTextSecondary: '#6B7280',
  sidebarCategoryBg: '#f9fafb',
  sidebarSubItemBg: '#f3f4f6',

  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  modalBackground: '#ffffff',
  modalText: '#333333',

  inputBackground: '#f9f9f9',
  inputBorder: '#e0e0e0',
  inputText: '#333333',
  inputPlaceholder: '#999999',

  paginationDot: '#dddddd',

  cancelButtonBg: '#f5f5f5',
  cancelButtonBorder: '#e0e0e0',
  cancelButtonText: '#666666',
  saveButtonBg: '#4CAF50',
  saveButtonText: '#ffffff',

  shadow: '#55708C',

  tagBackground: '#434D57',
  tagText: '#ffffff',

  viewButtonText: '#434D57',

  quizSubtitle: 'rgba(102, 102, 102, 0.46)',

  practiceLink: '#434D57',

  searchBarBg: 'rgba(255, 255, 255, 0.23)',
  searchPlaceholder: 'rgba(255, 255, 255, 0.44)',

  refreshIndicator: '#666666',

  statusBarStyle: 'auto',
};

// ─── Dark palette ────────────────────────────────────────────────────
const darkColors: ThemePalette = {
  background: 'transparent', // background.jpg image is shown underneath
  surface: 'rgba(255, 255, 255, 0.06)',
  card: 'rgba(255, 255, 255, 0.08)',
  cardBorder: 'rgba(255, 255, 255, 0.12)',

  text: '#E8EAED',
  textSecondary: '#B0B3B8',
  textTertiary: '#8A8D91',

  header: '#1E2126',
  headerText: '#ffffff',
  headerAccent: 'rgba(255, 255, 255, 0.12)',

  icon: '#9BA1A6',
  border: 'rgba(255, 255, 255, 0.10)',
  accent: '#FF8C5A',

  footerBackground: 'rgba(30, 33, 38, 0.85)',
  footerText: '#E8EAED',

  sidebarBackground: 'rgba(28, 31, 36, 0.95)',
  sidebarText: '#E8EAED',
  sidebarTextSecondary: '#9BA1A6',
  sidebarCategoryBg: 'rgba(255, 255, 255, 0.06)',
  sidebarSubItemBg: 'rgba(255, 255, 255, 0.04)',

  modalOverlay: 'rgba(0, 0, 0, 0.7)',
  modalBackground: 'rgba(35, 38, 44, 0.95)',
  modalText: '#E8EAED',

  inputBackground: 'rgba(255, 255, 255, 0.08)',
  inputBorder: 'rgba(255, 255, 255, 0.15)',
  inputText: '#E8EAED',
  inputPlaceholder: '#8A8D91',

  paginationDot: 'rgba(255, 255, 255, 0.20)',

  cancelButtonBg: 'rgba(255, 255, 255, 0.08)',
  cancelButtonBorder: 'rgba(255, 255, 255, 0.15)',
  cancelButtonText: '#B0B3B8',
  saveButtonBg: '#4CAF50',
  saveButtonText: '#ffffff',

  shadow: '#000000',

  tagBackground: 'rgba(255, 255, 255, 0.12)',
  tagText: '#E8EAED',

  viewButtonText: '#E8EAED',

  quizSubtitle: 'rgba(176, 179, 184, 0.6)',

  practiceLink: '#B0B3B8',

  searchBarBg: 'rgba(255, 255, 255, 0.10)',
  searchPlaceholder: 'rgba(255, 255, 255, 0.35)',

  refreshIndicator: '#B0B3B8',

  statusBarStyle: 'light',
};

// ─── Glassmorphism config ────────────────────────────────────────────
const lightGlass: GlassmorphismConfig = {
  intensity: 0,
  tint: 'light',
  backgroundColor: '#ffffff',
  borderColor: 'transparent',
  borderWidth: 0,
  borderRadius: 15,
};

const darkGlass: GlassmorphismConfig = {
  intensity: 40,
  tint: 'dark',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  borderColor: 'transparent',
  borderWidth: 0,
  borderRadius: 15,
};

// ─── Theme builders ──────────────────────────────────────────────────
export const LightTheme: AppTheme = {
  isDark: false,
  colors: lightColors,
  glass: lightGlass,
};

export const DarkTheme: AppTheme = {
  isDark: true,
  colors: darkColors,
  glass: darkGlass,
};

/**
 * Resolve the theme object from a boolean.
 */
export function resolveTheme(isDark: boolean): AppTheme {
  return isDark ? DarkTheme : LightTheme;
}
