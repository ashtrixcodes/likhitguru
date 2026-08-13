/**
 * Shared helpers for themed sub-screens (sign grids, webview screens, etc.)
 *
 * These helpers centralise the header styling and card-grid styling
 * so every sub-screen gets dark-mode support without duplicating logic.
 */
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { AppTheme } from '@/constants/theme';

/** Header options for Stack.Screen — adapts to current theme. */
export function themedHeaderOptions(theme: AppTheme) {
  return {
    headerStyle: {
      backgroundColor: theme.isDark ? theme.colors.header : '#434D57',
    },
    headerTitleStyle: {
      fontSize: 20,
      color: '#FFFFFF',
    },
    headerTintColor: '#FFFFFF',
    headerTitleAlign: 'center' as const,
    headerBackTitle: '',
    headerBackTitleVisible: false,
    headerLeft: () =>
      React.createElement(
        Pressable,
        {
          onPress: () => router.back(),
          style: { padding: 6, marginLeft: 4, borderRadius: 20 },
          hitSlop: 10,
        },
        React.createElement(Ionicons, {
          name: 'chevron-back',
          size: 26,
          color: '#FFFFFF',
        })
      ),
  };
}

/** Styles for the image-card grid screens (informativeSign, restrictiveSign, numberSign). */
export function createSignGridStyles(theme: AppTheme) {
  const { colors, glass, isDark } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 10,
      paddingVertical: 12,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    card: {
      width: '48%',
      marginBottom: 14,
    },
    cardInner: {
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      borderRadius: isDark ? glass.borderRadius : 14,
      borderWidth: isDark ? glass.borderWidth : 0,
      borderColor: isDark ? glass.borderColor : 'transparent',
      paddingHorizontal: 12,
      paddingVertical: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: isDark ? 6 : 3,
      elevation: isDark ? 0 : 2,
    },
    cardImage: {
      width: '100%',
      height: 110,
      marginBottom: 10,
    },
    cardLabel: {
      textAlign: 'center',
      color: colors.text,
      fontSize: 14,
    },
    headerBackButton: {
      padding: 8,
      marginLeft: 10,
      borderRadius: 20,
    },
  });
}

/** Styles for WebView-based screens (licenseForm, licensePrintCheck, etc.). */
export function createWebViewScreenStyles(theme: AppTheme) {
  const { colors, isDark } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1c2e' : colors.card,
    },
    webview: {
      flex: 1,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDark ? '#1a1c2e' : '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    headerBackButton: {
      padding: 8,
      marginLeft: 10,
      borderRadius: 20,
    },
  });
}
