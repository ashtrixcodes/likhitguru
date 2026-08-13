import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';
import { getTodayBS, toNepaliDigits } from '@/utils/nepaliCalendar';

export default function NepaliDateHeaderBadge() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isNepali } = useLanguage();

  const todayBS = useMemo(() => getTodayBS(), []);

  const formattedDateStr = useMemo(() => {
    if (isNepali) {
      const dayNp = toNepaliDigits(todayBS.day);
      const shortDayNp = todayBS.dayNameNp.replace('बार', '');
      return unicodeToAakriti(`${shortDayNp}, ${todayBS.monthNameNp} ${dayNp}`);
    } else {
      const shortDayEn = todayBS.dayNameEn.substring(0, 3);
      return `${shortDayEn}, ${todayBS.monthNameEn} ${todayBS.day}`;
    }
  }, [todayBS, isNepali]);

  const fontStyle = isNepali ? { fontFamily: 'Aakriti', fontWeight: 'normal' as const } : {};

  return (
    <TouchableOpacity
      style={[
        styles.badgeContainer,
        {
          backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
        },
      ]}
      onPress={() => router.push('/others/nepaliCalendar' as any)}
      activeOpacity={0.8}
    >
      <Ionicons name="calendar-outline" size={14} color="#FFD700" style={styles.icon} />
      <Text style={[styles.badgeText, fontStyle]}>
        {formattedDateStr}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.15)', // subtle dark background
  },
  icon: {
    marginRight: 6,
  },
  badgeText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  arrowIcon: {
    marginLeft: 4,
  },
});
