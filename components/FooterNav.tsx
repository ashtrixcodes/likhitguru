import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, Platform, PanResponder, LayoutChangeEvent, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/context/ThemeContext';
import { useHaptics } from '@/context/HapticsContext';
import type { AppTheme } from '@/constants/theme';

export default function FooterNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const { triggerImpact, triggerSelection } = useHaptics();
  const insets = useSafeAreaInsets();
  const { isDark } = theme;

  const [barBounds, setBarBounds] = useState<{ pageX: number; width: number }>({ pageX: 0, width: 380 });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const hoverIndexRef = useRef<number | null>(null);

  const activeIndex = useMemo(() => {
    if (pathname.includes('dailyQuiz')) return 0;
    if (pathname.includes('profile')) return 2;
    return 1; // home
  }, [pathname]);

  const liquidAnimX = useRef(new Animated.Value(activeIndex)).current;

  const currentTarget = hoverIndex !== null ? hoverIndex : activeIndex;

  useEffect(() => {
    Animated.spring(liquidAnimX, {
      toValue: currentTarget,
      friction: 8,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [hoverIndex, activeIndex, currentTarget]);

  const tabs = [
    {
      id: 'dailyQuiz',
      label: 'Daily Quiz',
      iconOutline: 'sparkles-outline' as const,
      iconFilled: 'sparkles' as const,
      route: '/(tabs)/dailyQuiz',
    },
    {
      id: 'home',
      label: 'Home',
      iconOutline: 'home-outline' as const,
      iconFilled: 'home' as const,
      route: '/(tabs)',
    },
    {
      id: 'profile',
      label: 'Profile',
      iconOutline: 'person-outline' as const,
      iconFilled: 'person' as const,
      route: '/(tabs)/profile',
    },
  ];

  const updateGestureIndex = (pageX: number) => {
    if (barBounds.width <= 0) return;
    const relativeX = pageX - barBounds.pageX;
    const ratio = Math.max(0, Math.min(relativeX / barBounds.width, 0.99));
    const idx = Math.floor(ratio * 3);
    if (idx !== hoverIndexRef.current) {
      hoverIndexRef.current = idx;
      setHoverIndex(idx);
      triggerSelection();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
      onMoveShouldSetPanResponderCapture: (_, gestureState) => Math.abs(gestureState.dx) > 10,
      onPanResponderGrant: (evt) => {
        updateGestureIndex(evt.nativeEvent.pageX);
      },
      onPanResponderMove: (evt) => {
        updateGestureIndex(evt.nativeEvent.pageX);
      },
      onPanResponderRelease: () => {
        const targetIdx = hoverIndexRef.current;
        setHoverIndex(null);
        hoverIndexRef.current = null;
        if (targetIdx !== null && targetIdx !== undefined && tabs[targetIdx]) {
          triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
          router.replace(tabs[targetIdx].route as any);
        }
      },
      onPanResponderTerminate: () => {
        setHoverIndex(null);
        hoverIndexRef.current = null;
      },
    })
  ).current;

  const handleTabPress = (route: string) => {
    setHoverIndex(null);
    hoverIndexRef.current = null;
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    router.replace(route as any);
  };

  const s = useMemo(() => createStyles(theme, insets), [theme, insets]);

  const innerWidth = Math.max(0, barBounds.width - 12);
  const tabWidth = innerWidth / 3;

  const translateX = liquidAnimX.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, tabWidth, tabWidth * 2],
  });

  return (
    <View style={s.container} pointerEvents="box-none">
      <View
        {...panResponder.panHandlers}
        style={s.floatingBar}
        onLayout={(e: LayoutChangeEvent) => {
          const { width } = e.nativeEvent.layout;
          e.target.measure((x, y, w, h, pageX) => {
            setBarBounds({ pageX: pageX || 0, width: w || width });
          });
        }}
      >
        {/* Liquid Flow Active Capsule */}
        {tabWidth > 0 && (
          <Animated.View
            style={[
              s.liquidCapsule,
              {
                width: tabWidth,
                transform: [{ translateX }],
                backgroundColor: isDark ? 'rgba(34, 197, 94, 0.18)' : 'rgba(34, 197, 94, 0.12)',
                borderColor: isDark ? 'rgba(34, 197, 94, 0.35)' : 'rgba(34, 197, 94, 0.25)',
              },
            ]}
          />
        )}

        {tabs.map((tab, index) => {
          const isCurrentHover = hoverIndex === index;
          const isCurrentActive = hoverIndex === null ? activeIndex === index : isCurrentHover;
          const iconName = isCurrentActive ? tab.iconFilled : tab.iconOutline;
          const activeColor = '#22C55E';
          const inactiveColor = isDark ? '#94A3B8' : '#64748B';

          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                s.tab,
                isCurrentHover && {
                  transform: [{ scale: 1.04 }],
                },
              ]}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={iconName}
                size={20}
                color={isCurrentActive ? activeColor : inactiveColor}
                style={s.icon}
              />
              <Text
                style={[
                  s.label,
                  {
                    color: isCurrentActive ? (isDark ? '#FFFFFF' : '#15803D') : inactiveColor,
                    fontWeight: isCurrentActive ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme, insets: { bottom: number }) {
  const { isDark } = theme;

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 12 : 8);

  return StyleSheet.create({
    container: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: bottomInset,
      zIndex: 1000,
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    floatingBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      width: '100%',
      maxWidth: 380,
      height: 62,
      borderRadius: 31,
      paddingHorizontal: 6,
      backgroundColor: isDark ? 'rgba(20, 24, 33, 0.95)' : 'rgba(255, 255, 255, 0.96)',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.45 : 0.15,
      shadowRadius: 20,
      elevation: 16,
      position: 'relative',
    },
    liquidCapsule: {
      position: 'absolute',
      left: 6,
      height: 46,
      borderRadius: 23,
      borderWidth: 1,
      zIndex: 0,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 46,
      borderRadius: 23,
      marginHorizontal: 3,
      borderWidth: 1,
      borderColor: 'transparent',
      zIndex: 1,
    },
    icon: {
      marginRight: 6,
    },
    label: {
      fontSize: 13,
      letterSpacing: 0.2,
    },
  });
}
