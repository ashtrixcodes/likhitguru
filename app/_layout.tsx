import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { DarkTheme as NavDarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SidebarProvider } from '@/components/SidebarContext';
import SidebarOverlay from '@/components/SidebarOverlay';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeBackground, ThemeProvider, useTheme } from '@/context/ThemeContext';
import { initializeMobileAds } from '@/utils/mobileAds';

import { HapticsProvider } from '@/context/HapticsContext';
import { VoiceProvider } from '@/context/VoiceContext';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';

// Keep native splash screen visible until all initial resources are loaded and rendered
SplashScreen.preventAutoHideAsync().catch(() => {});

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
          headerBackTitle: '',
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
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Aakriti: require('../assets/fonts/Aakriti.ttf'),
    AakritiBold: require('../assets/fonts/Aakriti Bold.ttf'),
    'Aakriti Bold': require('../assets/fonts/Aakriti Bold.ttf'),
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

  const isReady = fontsLoaded || !!fontError;

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AuthProvider>
        <NotificationProvider>
          <HapticsProvider>
            <LanguageProvider>
              <ThemeProvider>
                <VoiceProvider>
                  <SidebarProvider>
                    <InnerLayout />
                  </SidebarProvider>
                </VoiceProvider>
              </ThemeProvider>
            </LanguageProvider>
          </HapticsProvider>
        </NotificationProvider>
      </AuthProvider>
    </View>
  );
}
