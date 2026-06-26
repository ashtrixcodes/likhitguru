import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

// ─── Constants ───────────────────────────────────────────────────────
const TOGGLE_SIZE = 36;
const ANIMATION_DURATION = 300;

/**
 * Compact dark-mode toggle button.
 *
 * Renders a moon icon (dark mode off) or a sun icon (dark mode on)
 * with a smooth crossfade/rotation animation.
 *
 * Consumes `useTheme()` internally — no props required.
 */
export default function DarkModeToggle() {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const rotateAnim = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isDarkMode ? 1 : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [isDarkMode, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const iconName = isDarkMode ? 'sunny' : 'moon';
  const iconColor = isDarkMode ? '#FFC107' : theme.colors.headerText;

  return (
    <Pressable
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.colors.headerAccent,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      accessibilityLabel={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDarkMode }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        <Ionicons name={iconName} size={20} color={iconColor} />
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    width: TOGGLE_SIZE,
    height: TOGGLE_SIZE,
    borderRadius: TOGGLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
