import React, { useCallback, useState, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';
import { toNepaliDigits } from '@/utils/nepaliCalendar';

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

  if (!examRecord || daysRemaining === null) {
    return null;
  }

  const fontStyle = isNepali ? { fontFamily: 'Aakriti', fontWeight: 'normal' as const } : {};
  const fontBoldStyle = isNepali ? { fontFamily: 'AakritiBold', fontWeight: 'normal' as const } : {};

  return (
    <TouchableOpacity
      style={[
        styles.bannerContainer,
        {
          backgroundColor: theme.isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(235, 245, 255, 0.95)',
          borderColor: theme.isDark ? '#3b82f6' : '#93c5fd',
        },
      ]}
      onPress={() => router.push('/others/nepaliCalendar' as any)}
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
        <Text style={[styles.subtitle, fontStyle, { color: theme.isDark ? '#93c5fd' : '#3b82f6' }]}>
          {isNepali
            ? unicodeToAakriti(`मिति: ${examRecord.bsDateStrNp}`)
            : `Date: ${examRecord.bsDateStrEn}`}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.isDark ? '#93c5fd' : '#2563eb'} />
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
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    borderWidth: 1,
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
