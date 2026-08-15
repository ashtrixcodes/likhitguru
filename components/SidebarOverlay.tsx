import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerHapticLight } from '@/context/HapticsContext';

import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import type { AppTheme } from '@/constants/theme';
import { useSidebar } from './SidebarContext';
import DarkModeToggle from './DarkModeToggle';
import LanguageToggle from './LanguageToggle';
import HapticsToggle from './HapticsToggle';
import VoiceToggle from './VoiceToggle';
import { shareApp } from '@/app/(tabs)/shareapp';
import { EXAM_DATE_STORAGE_KEY, ExamDateRecord } from './ExamCountdownBanner';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';
import { toNepaliDigits } from '@/utils/nepaliCalendar';

export default function SidebarOverlay() {
  const { sidebarVisible, setSidebarVisible } = useSidebar();
  const { theme } = useTheme();
  const { isNepali } = useLanguage();
  const router = useRouter();
  const s = useMemo(() => createStyles(theme, isNepali), [theme, isNepali]);

  const [userName, setUserName] = useState<string>('Prashant');
  const [examRecord, setExamRecord] = useState<ExamDateRecord | null>(null);

  const slideAnim = useRef(new Animated.Value(-320)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const onClose = () => {
    triggerHapticLight();
    setSidebarVisible(false);
  };

  useEffect(() => {
    if (sidebarVisible) {
      // Load latest user details and exam countdown record
      AsyncStorage.getItem('user_name').then((name) => {
        if (name) setUserName(name);
      }).catch(() => {});

      AsyncStorage.getItem(EXAM_DATE_STORAGE_KEY).then((data) => {
        if (data) setExamRecord(JSON.parse(data));
      }).catch(() => {});

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 350,
          delay: 80,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -320,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [sidebarVisible]);

  const daysRemaining = useMemo(() => {
    if (!examRecord) return null;
    const diff = examRecord.targetAdTimestamp - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }, [examRecord]);

  const handleNavigate = (route: string) => {
    triggerHapticLight();
    onClose();
    router.push(route as any);
  };

  if (!sidebarVisible) return null;

  const utilities = [
    {
      id: 'calendar',
      titleEn: 'Nepali Calendar & Exam Date',
      titleNp: 'नेपाली पात्रो र परीक्षा मिति',
      icon: 'calendar' as const,
      color: '#3B82F6',
      route: '/others/nepaliCalendar',
    },
    {
      id: 'license-form',
      titleEn: 'License Application Portal',
      titleNp: 'लाइसेन्स फारम भर्ने पोर्टल',
      icon: 'document-text' as const,
      color: '#10B981',
      route: '/others/licenseForm',
    },
    {
      id: 'print-check',
      titleEn: 'License Print Status Check',
      titleNp: 'लाइसेन्स प्रिन्ट अवस्था',
      icon: 'print' as const,
      color: '#8B5CF6',
      route: '/others/licensePrintCheck',
    },
    {
      id: 'traffic-fines',
      titleEn: 'Traffic Rules & Fines',
      titleNp: 'सवारी नियम र जरिवाना',
      icon: 'warning' as const,
      color: '#F59E0B',
      route: '/others/trafficFines',
    },
    {
      id: 'nagdhunga',
      titleEn: 'Nagdhunga Tunnel Pass',
      titleNp: 'नागढुङ्गा सुरुङमार्ग जानकारी',
      icon: 'navigate' as const,
      color: '#EC4899',
      route: '/others/nagdhungaPass',
    },
  ];

  const supportItems = [
    {
      id: 'share',
      titleEn: 'Share Likhit Guru App',
      titleNp: 'एप सेयर गर्नुहोस्',
      icon: 'share-social' as const,
      color: '#22C55E',
      action: async () => {
        triggerHapticLight();
        onClose();
        await shareApp();
      },
    },
    {
      id: 'privacy',
      titleEn: 'Privacy Policy',
      titleNp: 'गोपनीयता नीति',
      icon: 'shield-checkmark' as const,
      color: '#10B981',
      action: async () => {
        triggerHapticLight();
        onClose();
        try {
          await WebBrowser.openBrowserAsync('https://likhitguru.com/privacy-policy.html');
        } catch {}
      },
    },
    {
      id: 'more-info',
      titleEn: 'About & FAQs',
      titleNp: 'एप जानकारी र सोधपुछ',
      icon: 'information-circle' as const,
      color: '#6366F1',
      route: '/others/moreInfo',
    },
  ];

  return (
    <View style={s.sidebarOverlay}>
      {/* Animated backdrop */}
      <Animated.View style={[s.sidebarBackdrop, { opacity: backdropOpacity }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Animated sidebar drawer */}
      <Animated.View
        style={[
          s.sidebarDrawer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <Animated.View style={[s.sidebarContent, { opacity: contentOpacity }]}>
          {/* Header Profile Section */}
          <View style={s.profileHeader}>
            <View style={s.avatarContainer}>
              <Image source={require('@/assets/images/profile.png')} style={s.avatar} />
            </View>
            <View style={s.userInfo}>
              <Text style={s.userName}>{userName}</Text>
              <Text style={s.userSubtitle}>
                {isNepali ? unicodeToAakriti('लिखित गुरु विद्यार्थी') : 'Likhit Guru Learner'}
              </Text>
            </View>
            <TouchableOpacity style={s.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Exam Countdown Card Banner */}
          <TouchableOpacity
            style={s.countdownCard}
            onPress={() => handleNavigate('/others/nepaliCalendar')}
            activeOpacity={0.8}
          >
            <View style={s.countdownHeader}>
              <Ionicons name="time" size={18} color="#22C55E" />
              <Text style={s.countdownTitle}>
                {examRecord
                  ? isNepali
                    ? unicodeToAakriti(examRecord.typeNp)
                    : examRecord.typeEn
                  : isNepali
                  ? unicodeToAakriti('परीक्षा मिति तय गर्नुहोस्')
                  : 'Set Exam Target Date'}
              </Text>
            </View>
            <Text style={s.countdownValue}>
              {daysRemaining !== null
                ? isNepali
                  ? `${unicodeToAakriti(toNepaliDigits(daysRemaining))} ${unicodeToAakriti('दिन बाँकी')}`
                  : `${daysRemaining} Days Left`
                : isNepali
                ? unicodeToAakriti('नेपाली पात्रोमा मिति छान्नुहोस् →')
                : 'Tap to pick date on calendar →'}
            </Text>
          </TouchableOpacity>

          <ScrollView style={s.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Section 1: UTILITIES & TOOLS */}
            <Text style={s.sectionHeader}>
              {isNepali ? unicodeToAakriti('उपकरण र सुविधाहरू') : 'UTILITIES & TOOLS'}
            </Text>

            {utilities.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={s.menuItem}
                onPress={() => handleNavigate(item.route)}
                activeOpacity={0.7}
              >
                <View style={[s.menuIconBox, { backgroundColor: item.color + '1F' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={s.menuItemLabel}>
                  {isNepali ? unicodeToAakriti(item.titleNp) : item.titleEn}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            ))}

            {/* Section 2: PREFERENCES */}
            <Text style={s.sectionHeader}>
              {isNepali ? unicodeToAakriti('सेटिङहरू') : 'PREFERENCES'}
            </Text>

            <View style={s.preferenceRow}>
              <View style={s.preferenceLeft}>
                <View style={[s.menuIconBox, { backgroundColor: '#F59E0B1F' }]}>
                  <Ionicons name="moon" size={20} color="#F59E0B" />
                </View>
                <Text style={s.menuItemLabel}>
                  {isNepali ? unicodeToAakriti('डार्क मोड') : 'Dark Theme'}
                </Text>
              </View>
              <DarkModeToggle />
            </View>

            <View style={s.preferenceRow}>
              <View style={s.preferenceLeft}>
                <View style={[s.menuIconBox, { backgroundColor: '#3B82F61F' }]}>
                  <Ionicons name="language" size={20} color="#3B82F6" />
                </View>
                <Text style={s.menuItemLabel}>
                  {isNepali ? unicodeToAakriti('भाषा') : 'Language'}
                </Text>
              </View>
              <LanguageToggle />
            </View>

            <View style={s.preferenceRow}>
              <View style={s.preferenceLeft}>
                <View style={[s.menuIconBox, { backgroundColor: '#10B9811F' }]}>
                  <Ionicons name="phone-portrait" size={20} color="#10B981" />
                </View>
                <Text style={s.menuItemLabel}>
                  {isNepali ? unicodeToAakriti('ह्याप्टिक फिडब्याक') : 'Haptic Feedback'}
                </Text>
              </View>
              <HapticsToggle />
            </View>

            <View style={s.preferenceRow}>
              <View style={s.preferenceLeft}>
                <View style={[s.menuIconBox, { backgroundColor: '#8B5CF61F' }]}>
                  <Ionicons name="volume-high" size={20} color="#8B5CF6" />
                </View>
                <Text style={s.menuItemLabel}>
                  {isNepali ? unicodeToAakriti('बोल्ने स्वर') : 'TTS Voice'}
                </Text>
              </View>
              <VoiceToggle />
            </View>

            {/* Section 3: SUPPORT */}
            <Text style={s.sectionHeader}>
              {isNepali ? unicodeToAakriti('अन्य र सहयोग') : 'SUPPORT & ABOUT'}
            </Text>

            {supportItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={s.menuItem}
                onPress={() => (item.action ? item.action() : handleNavigate(item.route!))}
                activeOpacity={0.7}
              >
                <View style={[s.menuIconBox, { backgroundColor: item.color + '1F' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={s.menuItemLabel}>
                  {isNepali ? unicodeToAakriti(item.titleNp) : item.titleEn}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            ))}

            <View style={s.footerSpace} />
          </ScrollView>

          {/* Sidebar Footer */}
          <Text style={s.copy}>Likhit Guru v1.0 • © 2026</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function createStyles(theme: AppTheme, isNepali: boolean = false) {
  const { colors, isDark } = theme;
  const fontNormal = isNepali ? 'Aakriti' : undefined;
  const fontBold = isNepali ? 'AakritiBold' : undefined;

  return StyleSheet.create({
    sidebarOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      zIndex: 9999,
    },
    sidebarBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.modalOverlay,
      zIndex: 9998,
    },
    sidebarDrawer: {
      width: 310,
      backgroundColor: colors.sidebarBackground,
      paddingTop: 56,
      paddingHorizontal: 18,
      shadowColor: colors.shadow,
      shadowOpacity: 0.3,
      shadowRadius: 16,
      shadowOffset: { width: 4, height: 0 },
      elevation: 16,
      overflow: 'hidden',
      zIndex: 9999,
      borderRightWidth: 1,
      borderRightColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    sidebarContent: {
      flex: 1,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingVertical: 4,
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 12,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: colors.accent,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 17,
      color: colors.sidebarText,
      fontWeight: '700',
    },
    userSubtitle: {
      fontSize: isNepali ? 15 : 12,
      color: colors.sidebarTextSecondary,
      marginTop: 2,
      fontFamily: fontNormal,
      fontWeight: isNepali ? 'normal' : undefined,
    },
    closeButton: {
      padding: 6,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
    },
    countdownCard: {
      backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.08)',
      borderRadius: 14,
      padding: 14,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.2)',
    },
    countdownHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    countdownTitle: {
      fontSize: isNepali ? 15 : 12,
      color: colors.sidebarTextSecondary,
      fontFamily: fontBold || fontNormal,
      fontWeight: isNepali ? 'normal' : '600',
    },
    countdownValue: {
      fontSize: isNepali ? 16 : 14,
      color: isDark ? '#4ADE80' : '#15803D',
      fontFamily: fontBold || fontNormal,
      fontWeight: isNepali ? 'normal' : '700',
    },
    scrollContent: {
      flex: 1,
    },
    sectionHeader: {
      fontSize: isNepali ? 15 : 11,
      letterSpacing: isNepali ? 0 : 1.1,
      color: colors.sidebarTextSecondary,
      marginTop: 14,
      marginBottom: 10,
      fontFamily: fontBold || fontNormal,
      fontWeight: isNepali ? 'normal' : '700',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 11,
      paddingHorizontal: 10,
      borderRadius: 12,
      marginBottom: 4,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
    },
    menuIconBox: {
      width: 34,
      height: 34,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    menuItemLabel: {
      flex: 1,
      fontSize: isNepali ? 17 : 14,
      color: colors.sidebarText,
      fontFamily: fontBold || fontNormal,
      fontWeight: isNepali ? 'normal' : '600',
    },
    preferenceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRadius: 12,
      marginBottom: 6,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
    },
    preferenceLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    footerSpace: {
      height: 30,
    },
    copy: {
      textAlign: 'center',
      color: colors.textTertiary,
      fontSize: 11,
      paddingVertical: 10,
    },
  });
}
