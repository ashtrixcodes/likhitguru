import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { triggerHapticLight } from '@/context/HapticsContext';

import { useTheme, ThemeBackground } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNotifications } from '@/context/NotificationContext';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';
import { themedHeaderOptions } from '@/constants/screenHelpers';
import type { AppTheme } from '@/constants/theme';
import type { AppNotification } from '@/utils/notificationStorage';

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function NotificationCard({
  notification,
  onPress,
  onDismiss,
  s,
  isNepali,
  isDark,
}: {
  notification: AppNotification;
  onPress: () => void;
  onDismiss: () => void;
  s: ReturnType<typeof createStyles>;
  isNepali: boolean;
  isDark: boolean;
}) {
  const title = isNepali ? unicodeToAakriti(notification.titleNp) : notification.title;
  const body = isNepali ? unicodeToAakriti(notification.bodyNp) : notification.body;

  return (
    <TouchableOpacity
      style={[s.notificationCard, !notification.read && s.notificationCardUnread]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[s.notifIconContainer, { backgroundColor: isDark ? `${notification.color}25` : `${notification.color}15` }]}>
        <Ionicons
          name={notification.icon as any}
          size={22}
          color={notification.color}
        />
      </View>

      <View style={s.notifContent}>
        <View style={s.notifTitleRow}>
          <Text style={s.notifTitle} numberOfLines={1}>{title}</Text>
          {!notification.read && <View style={s.unreadDot} />}
        </View>
        <Text style={s.notifBody} numberOfLines={2}>{body}</Text>
        <Text style={s.notifTime}>{getRelativeTime(notification.createdAt)}</Text>
      </View>

      <TouchableOpacity style={s.dismissButton} onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="close" size={16} color={isDark ? 'rgba(255,255,255,0.6)' : '#94A3B8'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isNepali } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllRead, removeOne, clearAll, sendTestNotification } = useNotifications();
  const [isSendingTest, setIsSendingTest] = React.useState(false);
  const s = useMemo(() => createStyles(theme, isNepali), [theme, isNepali]);

  const handleSendTestNotification = useCallback(async () => {
    triggerHapticLight();
    setIsSendingTest(true);
    const success = await sendTestNotification();
    setIsSendingTest(false);
    if (success) {
      Alert.alert(
        '🔔 Notification Scheduled in 3s!',
        'Swipe up to your home screen now to see the notification drop down from the top notification bar of your phone.',
        [{ text: 'OK, I will minimize' }]
      );
    } else {
      Alert.alert(
        'Rebuild Required for Phone Bar',
        'Because "expo-notifications" is a new native module, please restart your iOS build (npx expo run:ios) in the terminal so iOS compiles the native Notification Center capability.',
        [{ text: 'Got it' }]
      );
    }
  }, [sendTestNotification]);

  const handleNotificationPress = useCallback(async (notification: AppNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.route) {
      router.push(notification.route as any);
    }
  }, [markAsRead, router]);

  const handleDismiss = useCallback(async (id: string) => {
    await removeOne(id);
  }, [removeOne]);

  return (
    <ThemeBackground>
      <Stack.Screen
        options={{
          title: isNepali ? unicodeToAakriti('सूचनाहरू') : 'Notifications',
          ...themedHeaderOptions(theme),
          headerTitleStyle: {
            fontSize: isNepali ? 22 : 20,
            color: '#FFFFFF',
            fontFamily: isNepali ? 'AakritiBold' : undefined,
          },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ padding: 6, marginLeft: 6, borderRadius: 20 }}
              hitSlop={10}
            >
              <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
            </Pressable>
          ),
          headerRight: () => unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead} style={{ marginRight: 8, paddingVertical: 4, paddingHorizontal: 8 }}>
              <Text style={s.markAllReadText}>
                {isNepali ? unicodeToAakriti('सबै पढ्नुहोस्') : 'Mark All Read'}
              </Text>
            </TouchableOpacity>
          ) : null,
        }}
      />

      <View style={s.container}>
        {notifications.length === 0 ? (
          <View style={s.emptyState}>
            <View style={s.emptyIconContainer}>
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color={theme.isDark ? '#60A5FA' : '#3B82F6'}
              />
            </View>
            <Text style={s.emptyTitle}>
              {isNepali ? unicodeToAakriti('सबै पढियो!') : "You're all caught up!"}
            </Text>
            <Text style={s.emptySubtitle}>
              {isNepali
                ? unicodeToAakriti('कुनै नयाँ सूचना छैन। दैनिक क्विज खेल्दा सूचना आउनेछ।')
                : 'No new notifications. Complete your daily quiz to receive updates!'}
            </Text>
            <TouchableOpacity
              style={s.testNotificationButton}
              onPress={handleSendTestNotification}
              disabled={isSendingTest}
              activeOpacity={0.8}
            >
              <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
              <Text style={s.testNotificationButtonText}>
                {isNepali ? unicodeToAakriti('मोबाइलमा सूचना पठाउनुहोस्') : 'Push Test Notification to Device'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={s.scrollView}
            contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 30 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Test Notification Quick Action */}
            <TouchableOpacity
              style={s.testNotificationBanner}
              onPress={handleSendTestNotification}
              disabled={isSendingTest}
              activeOpacity={0.8}
            >
              <View style={s.testIconCircle}>
                <Image
                  source={require('@/assets/images/logo-transparent.png')}
                  style={{ width: 24, height: 24 }}
                  resizeMode="contain"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.testBannerTitle}>
                  {isNepali ? unicodeToAakriti('मोबाइल सूचना परीक्षण') : 'Push Test Notification'}
                </Text>
                <Text style={s.testBannerSubtitle}>
                  {isNepali
                    ? unicodeToAakriti('मोबाइलमा प्रत्यक्ष सिस्टम सूचना हेर्न थिच्नुहोस्')
                    : 'Tap to trigger a live notification banner on your phone'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>

            {/* Notification Summary Bar */}
            {unreadCount > 0 && (
              <View style={s.summaryBar}>
                <Ionicons name="mail-unread" size={16} color={theme.isDark ? '#93C5FD' : '#2563EB'} />
                <Text style={s.summaryText}>
                  {isNepali
                    ? unicodeToAakriti(`${unreadCount} नपढेका सूचना`)
                    : `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
                </Text>
              </View>
            )}

            {/* Notification Cards */}
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onPress={() => handleNotificationPress(notification)}
                onDismiss={() => handleDismiss(notification.id)}
                s={s}
                isNepali={isNepali}
                isDark={theme.isDark}
              />
            ))}

            {/* Clear All Button */}
            {notifications.length > 2 && (
              <TouchableOpacity style={s.clearAllButton} onPress={clearAll} activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={s.clearAllText}>
                  {isNepali ? unicodeToAakriti('सबै मेटाउनुहोस्') : 'Clear All Notifications'}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </View>
    </ThemeBackground>
  );
}

function createStyles(theme: AppTheme, isNepali: boolean) {
  const { isDark } = theme;
  const fontNormal = isNepali ? 'Aakriti' : undefined;
  const fontBold = isNepali ? 'AakritiBold' : undefined;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      gap: 12,
    },
    markAllReadText: {
      color: '#60A5FA',
      fontSize: isNepali ? 16 : 13,
      fontWeight: isNepali ? 'normal' : '600',
      fontFamily: fontBold || fontNormal,
    },

    // ── Summary Bar ──
    summaryBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.18)' : '#EFF6FF',
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(96, 165, 250, 0.3)' : '#DBEAFE',
      elevation: 0,
      overflow: 'hidden',
    },
    summaryText: {
      color: isDark ? '#93C5FD' : '#1D4ED8',
      fontSize: isNepali ? 16 : 13,
      fontWeight: isNepali ? 'normal' : '600',
      fontFamily: fontNormal,
    },

    // ── Notification Card ──
    notificationCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF',
      borderRadius: 16,
      padding: 14,
      gap: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 6,
      elevation: 0,
      overflow: 'hidden',
    },
    notificationCardUnread: {
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.18)' : '#F0F7FF',
      borderColor: isDark ? 'rgba(96, 165, 250, 0.35)' : 'rgba(59, 130, 246, 0.25)',
    },
    notifIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
      overflow: 'hidden',
    },
    notifContent: {
      flex: 1,
    },
    notifTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    notifTitle: {
      fontSize: isNepali ? 18 : 15,
      fontWeight: isNepali ? 'normal' : '700',
      color: isDark ? '#FFFFFF' : '#0F172A',
      flex: 1,
      fontFamily: fontBold,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#3B82F6',
    },
    notifBody: {
      fontSize: isNepali ? 16 : 13,
      color: isDark ? 'rgba(255, 255, 255, 0.75)' : '#475569',
      lineHeight: isNepali ? 22 : 18,
      marginBottom: 6,
      fontFamily: fontNormal,
      fontWeight: isNepali ? 'normal' : undefined,
    },
    notifTime: {
      fontSize: 11,
      color: isDark ? '#94A3B8' : '#94A3B8',
      fontWeight: '500',
    },
    dismissButton: {
      padding: 6,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
      marginTop: 2,
    },

    // ── Empty State ──
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingBottom: 80,
    },
    emptyIconContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(96, 165, 250, 0.25)' : '#DBEAFE',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: isNepali ? 22 : 20,
      fontWeight: isNepali ? 'normal' : '700',
      color: isDark ? '#FFFFFF' : '#0F172A',
      marginBottom: 8,
      textAlign: 'center',
      fontFamily: fontBold,
    },
    emptySubtitle: {
      fontSize: isNepali ? 17 : 14,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#64748B',
      textAlign: 'center',
      lineHeight: isNepali ? 24 : 20,
      fontFamily: fontNormal,
      fontWeight: isNepali ? 'normal' : undefined,
    },

    // ── Clear All ──
    clearAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.06)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.15)',
      marginTop: 8,
    },
    clearAllText: {
      color: '#EF4444',
      fontSize: isNepali ? 16 : 14,
      fontWeight: isNepali ? 'normal' : '600',
      fontFamily: fontNormal,
    },

    // ── Test Notification UI ──
    testNotificationBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : '#F0FDF4',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : '#BBF7D0',
      borderRadius: 16,
      padding: 12,
      marginBottom: 2,
      elevation: 0,
      overflow: 'hidden',
    },
    testIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    testBannerTitle: {
      fontSize: isNepali ? 16 : 14,
      fontWeight: isNepali ? 'normal' : '700',
      color: isDark ? '#FFFFFF' : '#166534',
      fontFamily: fontBold,
    },
    testBannerSubtitle: {
      fontSize: isNepali ? 14 : 11,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#15803D',
      fontFamily: fontNormal,
      fontWeight: isNepali ? 'normal' : undefined,
      marginTop: 1,
    },
    testNotificationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#22C55E',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 24,
      marginTop: 20,
      shadowColor: '#22C55E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    testNotificationButtonText: {
      color: '#FFFFFF',
      fontSize: isNepali ? 16 : 14,
      fontWeight: isNepali ? 'normal' : '700',
      fontFamily: fontBold || fontNormal,
    },
  });
}
