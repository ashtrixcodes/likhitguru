import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_STORAGE_KEY = '@lekhitguru/notifications';
const MAX_NOTIFICATIONS = 50;

export type NotificationType = 'quiz' | 'streak' | 'exam' | 'achievement' | 'tip';

export interface AppNotification {
  id: string;
  title: string;
  titleNp: string;
  body: string;
  bodyNp: string;
  icon: string;       // Ionicon name
  color: string;      // Icon accent color
  type: NotificationType;
  route?: string;      // Deep link when tapped
  read: boolean;
  createdAt: number;   // timestamp ms
}

/**
 * Reads all notifications from AsyncStorage, newest first.
 */
export async function getNotifications(): Promise<AppNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AppNotification[];
  } catch {
    return [];
  }
}

/**
 * Adds a notification to the top of the list, capping at MAX_NOTIFICATIONS.
 */
export async function addNotification(notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>): Promise<AppNotification> {
  const existing = await getNotifications();
  const newNotification: AppNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    read: false,
    createdAt: Date.now(),
  };

  const updated = [newNotification, ...existing].slice(0, MAX_NOTIFICATIONS);
  await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  return newNotification;
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  const notifications = await getNotifications();
  const updated = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Marks all notifications as read.
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const notifications = await getNotifications();
  const updated = notifications.map((n) => ({ ...n, read: true }));
  await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Returns the count of unread notifications.
 */
export async function getUnreadCount(): Promise<number> {
  const notifications = await getNotifications();
  return notifications.filter((n) => !n.read).length;
}

/**
 * Removes a single notification by id.
 */
export async function removeNotification(id: string): Promise<void> {
  const notifications = await getNotifications();
  const updated = notifications.filter((n) => n.id !== id);
  await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Clears all notifications.
 */
export async function clearAllNotifications(): Promise<void> {
  await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
}

/**
 * Notification template presets for common app events.
 */
export const NotificationTemplates = {
  dailyQuizReminder: (): Omit<AppNotification, 'id' | 'read' | 'createdAt'> => ({
    title: 'Daily Quiz Available!',
    titleNp: 'दैनिक क्विज उपलब्ध छ!',
    body: "Today's driving test quiz is ready. Answer 5 questions to keep your streak alive!",
    bodyNp: 'आजको ५-प्रश्नको ड्राइभिङ क्विज तयार छ। आफ्नो स्ट्रिक जोगाउन अहिले खेल्नुहोस्!',
    icon: 'help-circle',
    color: '#3B82F6',
    type: 'quiz' as NotificationType,
    route: '/dailyQuiz',
  }),

  streakAtRisk: (currentStreak: number): Omit<AppNotification, 'id' | 'read' | 'createdAt'> => ({
    title: 'Streak at Risk!',
    titleNp: 'स्ट्रिक जोखिममा छ!',
    body: `Your ${currentStreak}-day streak will reset at midnight. Complete today's quiz now!`,
    bodyNp: `तपाईंको ${currentStreak}-दिनको स्ट्रिक मध्यरातमा रिसेट हुन्छ। आजको क्विज अहिले पूरा गर्नुहोस्!`,
    icon: 'flame',
    color: '#F59E0B',
    type: 'streak' as NotificationType,
    route: '/dailyQuiz',
  }),

  examCountdown: (daysLeft: number, examType: string, examTypeNp: string): Omit<AppNotification, 'id' | 'read' | 'createdAt'> => ({
    title: `${daysLeft} Days Until ${examType}!`,
    titleNp: `${examType} सम्म ${daysLeft} दिन बाँकी!`,
    body: `Your ${examType} is in ${daysLeft} days. Keep practicing!`,
    bodyNp: `तपाईंको ${examTypeNp} ${daysLeft} दिनमा छ। अभ्यास जारी राख्नुहोस्!`,
    icon: 'calendar',
    color: '#22C55E',
    type: 'exam' as NotificationType,
    route: '/others/nepaliCalendar',
  }),

  achievementUnlocked: (title: string, titleNp: string, body: string, bodyNp: string): Omit<AppNotification, 'id' | 'read' | 'createdAt'> => ({
    title,
    titleNp,
    body,
    bodyNp,
    icon: 'trophy',
    color: '#FBBF24',
    type: 'achievement' as NotificationType,
    route: '/profile',
  }),

  learningTip: (tip: string, tipNp: string): Omit<AppNotification, 'id' | 'read' | 'createdAt'> => ({
    title: 'Driving Tip 💡',
    titleNp: 'ड्राइभिङ सुझाव 💡',
    body: tip,
    bodyNp: tipNp,
    icon: 'bulb',
    color: '#8B5CF6',
    type: 'tip' as NotificationType,
  }),
} as const;

/**
 * Seeds 4 sample notifications for UI testing and design preview.
 */
export async function seedSampleNotifications(): Promise<AppNotification[]> {
  const now = Date.now();
  const sampleNotifications: AppNotification[] = [
    {
      id: `sample_notif_1_${now}`,
      title: 'Daily Quiz Available!',
      titleNp: 'दैनिक क्विज उपलब्ध छ!',
      body: "Today's 5-question driving quiz is ready. Play now to keep your streak alive!",
      bodyNp: 'आजको ५-प्रश्नको ड्राइभिङ क्विज तयार छ। आफ्नो स्ट्रिक जोगाउन अहिले खेल्नुहोस्!',
      icon: 'help-circle',
      color: '#3B82F6',
      type: 'quiz',
      route: '/dailyQuiz',
      read: false,
      createdAt: now - 15 * 60 * 1000, // 15 mins ago
    },
    {
      id: `sample_notif_2_${now}`,
      title: 'Streak at Risk!',
      titleNp: 'स्ट्रिक जोखिममा छ!',
      body: "You haven't played today's quiz yet. Complete it before midnight to maintain your streak!",
      bodyNp: 'तपाईंले आजको क्विज अझै खेल्नुभएको छैन। स्ट्रिक कायम राख्न मध्यरात अघि पूरा गर्नुहोस्!',
      icon: 'flame',
      color: '#F59E0B',
      type: 'streak',
      route: '/dailyQuiz',
      read: false,
      createdAt: now - 2 * 60 * 60 * 1000, // 2 hours ago
    },
    {
      id: `sample_notif_3_${now}`,
      title: 'Written Exam in 7 Days!',
      titleNp: 'लिखित परीक्षा सम्म ७ दिन बाँकी!',
      body: 'Your driving license written exam is in 7 days. Practice more mock tests today!',
      bodyNp: 'तपाईंको सवारी चालक अनुमतिपत्र लिखित परीक्षा ७ दिनमा छ। आज थप नमुना परीक्षा अभ्यास गर्नुहोस्!',
      icon: 'calendar',
      color: '#22C55E',
      type: 'exam',
      route: '/others/nepaliCalendar',
      read: true,
      createdAt: now - 6 * 60 * 60 * 1000, // 6 hours ago
    },
    {
      id: `sample_notif_4_${now}`,
      title: '5-Day Streak Champion!',
      titleNp: '५ दिनको स्ट्रिक च्याम्पियन!',
      body: 'Congratulations! You answered all questions and reached a 5-day daily quiz streak!',
      bodyNp: 'बधाई छ! तपाईंले सबै प्रश्नको सही उत्तर दिनुभयो र ५ दिनको दैनिक क्विज स्ट्रिक पूरा गर्नुभयो!',
      icon: 'trophy',
      color: '#FBBF24',
      type: 'achievement',
      route: '/profile',
      read: true,
      createdAt: now - 24 * 60 * 60 * 1000, // 1 day ago
    },
  ];

  await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(sampleNotifications));
  return sampleNotifications;
}

