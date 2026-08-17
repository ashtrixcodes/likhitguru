import React, { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, LayoutAnimation, UIManager, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';
import { toNepaliDigits } from '@/utils/nepaliCalendar';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const EXAM_DATE_STORAGE_KEY = '@lekhitguru/exam-date';

export interface ExamDateRecord {
  typeNp: string; // e.g. 'लिखित परीक्षा' or 'ट्रायल परीक्षा'
  typeEn: string; // e.g. 'Written Exam' or 'Trial Exam'
  bsDateStrNp: string; // e.g. '२०८३ साउन २५'
  bsDateStrEn: string;
  targetAdTimestamp: number;
}

export default function ExamCountdownBanner() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isNepali } = useLanguage();

  const [examRecord, setExamRecord] = useState<ExamDateRecord | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isSubscribed = true;
      const loadExamRecord = async () => {
        try {
          const stored = await AsyncStorage.getItem(EXAM_DATE_STORAGE_KEY);
          if (stored && isSubscribed) {
            setExamRecord(JSON.parse(stored));
          }
        } catch (err) {
          console.warn('Failed to load saved exam date:', err);
        }
      };

      loadExamRecord();
      return () => {
        isSubscribed = false;
      };
    }, [])
  );

  const daysRemaining = useMemo(() => {
    if (!examRecord) return null;
    const now = new Date().getTime();
    const diff = examRecord.targetAdTimestamp - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  }, [examRecord]);

  // Fire exam countdown milestone notifications
  useEffect(() => {
    if (!examRecord || daysRemaining === null || daysRemaining <= 0) return;

    const milestones = [30, 14, 7, 3, 1];
    if (!milestones.includes(daysRemaining)) return;

    (async () => {
      try {
        const alertKey = `@lekhitguru/exam_notif_${daysRemaining}d_${examRecord.targetAdTimestamp}`;
        const alreadySent = await AsyncStorage.getItem(alertKey);
        if (alreadySent) return;

        const { addNotification, NotificationTemplates } = await import('@/utils/notificationStorage');
        await addNotification(
          NotificationTemplates.examCountdown(daysRemaining, examRecord.typeEn, examRecord.typeNp)
        );
        await AsyncStorage.setItem(alertKey, 'true');
      } catch {}
    })();
  }, [daysRemaining, examRecord]);

  useEffect(() => {
    if (isExpanded) {
      // Auto-collapse after 3 minutes (180,000 ms)
      timerRef.current = setTimeout(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(false);
      }, 180000);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isExpanded]);

  if (!examRecord || daysRemaining === null) {
    return null;
  }

  const fontStyle = isNepali ? { fontFamily: 'Aakriti', fontWeight: 'normal' as const } : {};
  const fontBoldStyle = isNepali ? { fontFamily: 'AakritiBold', fontWeight: 'normal' as const } : {};

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  };

  return (
    <TouchableOpacity
      style={[
        styles.bannerContainer,
        {
          backgroundColor: theme.isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(235, 245, 255, 0.95)',
          borderColor: theme.isDark ? 'transparent' : '#93c5fd',
        },
      ]}
      onPress={toggleExpand}
      activeOpacity={0.85}
    >
      <View style={styles.iconBadge}>
        <Ionicons name="timer-outline" size={22} color={theme.isDark ? '#60a5fa' : '#2563eb'} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, fontBoldStyle, { color: theme.isDark ? '#ffffff' : '#1e3a8a' }]}>
          {isNepali
            ? unicodeToAakriti(`${examRecord.typeNp}: ${toNepaliDigits(daysRemaining)} दिन बाँकी`)
            : `${examRecord.typeEn}: ${daysRemaining} Days Left`}
        </Text>
        {isExpanded && (
          <Text style={[styles.subtitle, fontStyle, { color: theme.isDark ? '#93c5fd' : '#3b82f6' }]}>
            {isNepali
              ? unicodeToAakriti(`मिति: ${examRecord.bsDateStrNp}`)
              : `Date: ${examRecord.bsDateStrEn}`}
          </Text>
        )}
      </View>
      <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color={theme.isDark ? '#93c5fd' : '#2563eb'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: -20, // Negative margin to tuck it under the header
    marginBottom: 6,
    borderWidth: 1,
    position: 'relative',
    zIndex: -1, // Keep it under the header curve (which has zIndex: 1000)
    elevation: 0, // Android shadow order
    paddingTop: 28, // Extra padding top so content clears the header curve when tucked
  },
  iconBadge: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
