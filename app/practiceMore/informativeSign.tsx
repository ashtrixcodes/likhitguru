import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState, useRef } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { createSignGridStyles, themedHeaderOptions } from '@/constants/screenHelpers';
import { informativeSign } from './constant';

export default function InformativeSignScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const s = useMemo(() => createSignGridStyles(theme), [theme]);
  const [isLarge, setIsLarge] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 300);
  };

  return (
    <View style={s.container}>
      <Stack.Screen
        options={{
          title: "Informative Sign",
          ...themedHeaderOptions(theme),
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
        style={s.container}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={s.grid}>
          {informativeSign.map((item) => (
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
                  {item.label}
                </Text>
              </View>
            </View>
          ))}
        </View>
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
    </View>
  );
}