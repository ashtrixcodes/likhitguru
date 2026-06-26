import { DarkTheme as NavDarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform, UIManager } from 'react-native';
import 'react-native-reanimated';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import LoadingScreen from '@/components/LoadingScreen';
import { SidebarProvider } from '@/components/SidebarContext';
import SidebarOverlay from '@/components/SidebarOverlay';
import { ThemeBackground, ThemeProvider, useTheme } from '@/context/ThemeContext';

// ─── Inner layout that has access to ThemeContext ────────────────────
function InnerLayout() {
  const { theme } = useTheme();

  // Create a custom nav theme to ensure the background is transparent
  // so that ThemeBackground (the image) is visible behind the screens.
  const customNavTheme = {
    ...(theme.isDark ? NavDarkTheme : DefaultTheme),
    colors: {
      ...(theme.isDark ? NavDarkTheme.colors : DefaultTheme.colors),
      background: 'transparent',
    },
  };

  return (
    <NavThemeProvider value={customNavTheme}>
      <ThemeBackground>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Hide header for the slider stack and present transparently over current screen */}
          <Stack.Screen
            name="slider"
            options={{
              headerShown: false,
              presentation: 'transparentModal',
              animation: 'fade',
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
        </Stack>
      </ThemeBackground>

      <StatusBar style={theme.colors.statusBarStyle} />

      {/* Sidebar overlay at root level to cover everything including footer */}
      <SidebarOverlay />
    </NavThemeProvider>
  );
}

// ─── Root layout ─────────────────────────────────────────────────────
export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Show custom loading screen while fonts are loading
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <InnerLayout />
      </SidebarProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#434D57',
  },
});
