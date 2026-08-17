import React, { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import { Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppNotification,
  getNotifications,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  removeNotification,
  clearAllNotifications,
  NotificationTemplates,
  seedSampleNotifications,
} from '@/utils/notificationStorage';
import { getDailyQuizProgress, getTodayDateString } from '@/utils/dailyQuizStorage';

import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NOTIFICATION_SETTINGS_KEY = '@lekhitguru/notification_settings';

interface NotificationSettings {
  quizReminder: boolean;
  streakAlert: boolean;
  examCountdown: boolean;
  achievements: boolean;
  reminderHour: number; // 0-23
  reminderMinute: number;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  quizReminder: true,
  streakAlert: true,
  examCountdown: true,
  achievements: true,
  reminderHour: 8,
  reminderMinute: 0,
};

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  settings: NotificationSettings;
  hasPermission: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  removeOne: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  addInAppNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => Promise<void>;
  scheduleQuizReminders: () => Promise<void>;
  cancelAllScheduled: () => Promise<void>;
  updateSettings: (s: Partial<NotificationSettings>) => Promise<void>;
  sendTestNotification: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  settings: DEFAULT_SETTINGS,
  hasPermission: false,
  refreshNotifications: async () => {},
  markAsRead: async () => {},
  markAllRead: async () => {},
  removeOne: async () => {},
  clearAll: async () => {},
  addInAppNotification: async () => {},
  scheduleQuizReminders: async () => {},
  cancelAllScheduled: async () => {},
  updateSettings: async () => {},
  sendTestNotification: async () => false,
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const appState = useRef(AppState.currentState);

  // ─── Request permissions on mount ──────────────────────────────────
  useEffect(() => {
    (async () => {
      // Load settings
      try {
        const raw = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
        if (raw) setSettings(JSON.parse(raw));
      } catch {}

      // Request permission
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
            },
          });
          finalStatus = status;
        }
        setHasPermission(finalStatus === 'granted');

        // Configure Android notification channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Likhit Guru',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#3B82F6',
          });
        }
      } catch (e) {
        console.warn('[NotificationContext] Permission request failed:', e);
      }

      // Load initial notifications (seed sample notifications if empty so user can preview design)
      const existing = await getNotifications();
      if (existing.length === 0) {
        await seedSampleNotifications();
      }
      await refreshNotifications();

      // Schedule daily reminders
      await scheduleQuizReminders();
    })();
  }, []);

  // ─── Refresh on app foreground ─────────────────────────────────────
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        await refreshNotifications();
        await checkAndFireStreakAlert();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  // ─── Listen for received notifications ─────────────────────────────
  useEffect(() => {
    if (!Notifications) return;

    const receivedSub = Notifications.addNotificationReceivedListener(async (notification: any) => {
      const data = notification.request?.content?.data;
      if (data?.template) {
        // This is one of our scheduled notifications → add to inbox
        await addInAppNotification(data.template);
      }
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((response: any) => {
      // User tapped on a notification — could navigate via route
      // This is handled by the notification inbox when opened
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);

  // ─── Core functions ────────────────────────────────────────────────
  const refreshNotifications = useCallback(async () => {
    const notifs = await getNotifications();
    setNotifications(notifs);
    const count = notifs.filter((n) => !n.read).length;
    setUnreadCount(count);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    await markNotificationAsRead(id);
    await refreshNotifications();
  }, [refreshNotifications]);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsAsRead();
    await refreshNotifications();
  }, [refreshNotifications]);

  const removeOne = useCallback(async (id: string) => {
    await removeNotification(id);
    await refreshNotifications();
  }, [refreshNotifications]);

  const clearAllFn = useCallback(async () => {
    await clearAllNotifications();
    await refreshNotifications();
  }, [refreshNotifications]);

  const addInAppNotification = useCallback(async (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => {
    await addNotification(n);
    await refreshNotifications();
  }, [refreshNotifications]);

  const updateSettings = useCallback(async (partial: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, ...partial };
    setSettings(newSettings);
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
    // Re-schedule with new settings
    await scheduleQuizReminders();
  }, [settings]);

  // ─── Scheduling ────────────────────────────────────────────────────
  const scheduleQuizReminders = useCallback(async () => {
    if (!Notifications || !hasPermission) return;

    try {
      // Cancel all existing scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule daily quiz reminder
      if (settings.quizReminder) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Daily Quiz Available!',
            body: "Today's driving test quiz is ready. Answer 5 questions to keep your streak alive!",
            data: { template: NotificationTemplates.dailyQuizReminder() },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: settings.reminderHour,
            minute: settings.reminderMinute,
            repeats: true,
          },
        });
      }
    } catch (e) {
      console.warn('[NotificationContext] Schedule failed:', e);
    }
  }, [hasPermission, settings]);

  const cancelAllScheduled = useCallback(async () => {
    if (!Notifications) return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {}
  }, []);

  // ─── Streak-at-risk check ──────────────────────────────────────────
  const checkAndFireStreakAlert = useCallback(async () => {
    if (!settings.streakAlert) return;

    try {
      const progress = await getDailyQuizProgress();
      if (!progress) return;

      const today = getTodayDateString();
      const alreadyCompleted = progress.lastCompletedDate === today;

      if (!alreadyCompleted && progress.currentStreak > 0) {
        const hour = new Date().getHours();
        // Only fire streak alert in the evening (after 6 PM)
        if (hour >= 18) {
          // Check if we already sent a streak alert today
          const alertKey = `@lekhitguru/streak_alert_${today}`;
          const alreadySent = await AsyncStorage.getItem(alertKey);
          if (!alreadySent) {
            await addInAppNotification(NotificationTemplates.streakAtRisk(progress.currentStreak));
            await AsyncStorage.setItem(alertKey, 'true');
          }
        }
      }
    } catch {}
  }, [settings.streakAlert, addInAppNotification]);

  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    try {
      const { status: currentStatus } = await Notifications.getPermissionsAsync();
      if (currentStatus !== 'granted') {
        const { status: reqStatus } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        if (reqStatus !== 'granted') {
          return false;
        }
        setHasPermission(true);
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Quiz Available!',
          body: "Today's driving test quiz is ready. Answer 5 questions to keep your streak alive!",
          sound: true,
          badge: 1,
          data: {
            template: NotificationTemplates.dailyQuizReminder(),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
        },
      });

      return true;
    } catch (e) {
      console.warn('[NotificationContext] Failed to send test notification:', e);
      return false;
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        settings,
        hasPermission,
        refreshNotifications,
        markAsRead,
        markAllRead,
        removeOne,
        clearAll: clearAllFn,
        addInAppNotification,
        scheduleQuizReminders,
        cancelAllScheduled,
        updateSettings,
        sendTestNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
