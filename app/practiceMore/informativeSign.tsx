import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import AdBanner from '@/components/AdBanner';
import { Skeleton } from '@/components/Skeleton';
import { createSignGridStyles, themedHeaderOptions } from '@/constants/screenHelpers';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme, ThemeBackground } from '@/context/ThemeContext';
import { informativeSign } from './constant';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';

// Memoized skeleton sign card
const SignSkeleton = memo(({ isLarge }: { isLarge: boolean }) => {
  const { theme } = useTheme();
  const s = useMemo(() => createSignGridStyles(theme), [theme]);

  return (
    <View style={[s.card, isLarge && { width: '100%', marginBottom: 18 }]}>
      <View style={s.cardInner}>
        <Skeleton
          height={isLarge ? 180 : 110}
          style={[
            s.cardImage,
            isLarge && { height: 180, marginBottom: 14 }
          ]}
        />
        <Skeleton
          height={isLarge ? 20 : 16}
          style={[
            { width: isLarge ? '60%' : '80%', alignSelf: 'center' }
          ]}
        />
      </View>
    </View>
  );
});

// Grid loading skeletons wrapper
const LoadingSkeletons = memo(({ isLarge }: { isLarge: boolean }) => (
  <>
    {Array.from({ length: 6 }, (_, i: number) => (
      <SignSkeleton key={`skeleton-${i}`} isLarge={isLarge} />
    ))}
  </>
));

export default function InformativeSignScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isNepali } = useLanguage();
  const s = useMemo(() => createSignGridStyles(theme), [theme]);
  const [isLarge, setIsLarge] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const scrollViewRef = useRef<ScrollView>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 300);
  };

  return (
    <ThemeBackground>
      <Stack.Screen
        options={{
          title: isNepali ? unicodeToAakriti("सूचनामूलक ट्राफिक सङ्केतहरू") : "Informative Sign",
          ...themedHeaderOptions(theme),
          headerTitleStyle: {
            fontSize: isNepali ? 22 : 20,
            color: '#FFFFFF',
            fontFamily: isNepali ? 'AakritiBold' : undefined,
          },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={s.headerBackButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => setIsLarge(prev => !prev)}
              style={({ pressed }) => [
                s.headerBackButton,
                { marginRight: 10, opacity: pressed ? 0.7 : 1 }
              ]}
              accessibilityLabel={isLarge ? "Switch to standard grid view" : "Switch to enlarged list view"}
              accessibilityHint="Toggles between small 2-column cards and large full-width cards for better visibility"
            >
              <Ionicons name={isLarge ? "grid-outline" : "resize-outline"} size={24} color="#FFFFFF" />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={s.content}
        style={{ flex: 1 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={s.grid}>
          {isLoading ? (
            <LoadingSkeletons isLarge={isLarge} />
          ) : (
            informativeSign.map((item) => (
              <View
                key={item.key}
                style={[
                  s.card,
                  isLarge && { width: '100%', marginBottom: 18 }
                ]}
              >
                <View style={s.cardInner}>
                  <Image
                    source={item.src}
                    style={[
                      s.cardImage,
                      isLarge && { height: 180, marginBottom: 14 }
                    ]}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      s.cardLabel,
                      isLarge && { fontSize: 18, lineHeight: 24, fontWeight: '600' }
                    ]}
                    numberOfLines={isLarge ? undefined : 2}
                  >
                    {isNepali ? item.labelNp : item.label}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
        <AdBanner />
      </ScrollView>
      {showScrollTop && (
        <Pressable
          onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
          style={({ pressed }) => [
            {
              position: 'absolute',
              bottom: 30,
              right: 20,
              backgroundColor: theme.isDark ? 'rgba(255,255,255,0.15)' : '#FF6B35',
              borderWidth: theme.isDark ? 1 : 0,
              borderColor: theme.isDark ? 'rgba(255,255,255,0.3)' : 'transparent',
              width: 50,
              height: 50,
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 8,
              zIndex: 100,
              opacity: pressed ? 0.8 : 1,
            }
          ]}
          accessibilityLabel="Scroll to top"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
        </Pressable>
      )}
    </ThemeBackground>
  );
}