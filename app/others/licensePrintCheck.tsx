import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { WebView } from 'react-native-webview';

import LoadingDots from '@/components/LoadingDots';
import { createWebViewScreenStyles, themedHeaderOptions } from '@/constants/screenHelpers';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export default function LicensePrintCheckScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const { isNepali } = useLanguage();
  const s = useMemo(() => createWebViewScreenStyles(theme), [theme]);

  return (
    <>
      <Stack.Screen
        options={{
          title: isNepali ? "लाइसेन्स प्रिन्ट अवस्था" : "License Print Check",
          ...themedHeaderOptions(theme),
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={s.headerBackButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
          ),
        }}
      />
      <View style={s.container}>
        {isLoading && (
          <View style={s.loadingOverlay}>
            <LoadingDots size={12} />
          </View>
        )}
        <WebView
          source={{ uri: 'https://licenseprintcheck.app/' }}
          style={s.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      </View>
    </>
  );
}