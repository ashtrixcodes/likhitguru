import { useEffect } from 'react';
import { DarkTheme as NavDarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import 'react-native-reanimated';
import LoadingScreen from '@/components/LoadingScreen';
import { SidebarProvider } from '@/components/SidebarContext';
import SidebarOverlay from '@/components/SidebarOverlay';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeBackground, ThemeProvider, useTheme } from '@/context/ThemeContext';
import { initializeMobileAds } from '@/utils/mobileAds';

// ─── Inner layout that has access to ThemeContext ────────────────────
function InnerLayout() {
  const { theme } = useTheme();

  const customNavTheme = {
    ...(theme.isDark ? NavDarkTheme : DefaultTheme),
    colors: {
      ...(theme.isDark ? NavDarkTheme.colors : DefaultTheme.colors),
      background: 'transparent',
    },
  };

  return (
    <NavThemeProvider value={customNavTheme}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
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
    Aakriti: require('../assets/fonts/Aakriti.ttf'),
    AakritiBold: require('../assets/fonts/Aakriti Bold.ttf'),
  });

  useEffect(() => {
    initializeMobileAds()
      .then((adapterStatuses: any) => {
        console.log('AdMob SDK Initialized:', adapterStatuses);
      })
      .catch((error: any) => {
        console.error('AdMob initialization error:', error);
      });
  }, []);

  if (!loaded) {
    // Show custom loading screen while fonts are loading
    return <LoadingScreen />;
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <SidebarProvider>
          <InnerLayout />
        </SidebarProvider>
      </ThemeProvider>
    </LanguageProvider>
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
