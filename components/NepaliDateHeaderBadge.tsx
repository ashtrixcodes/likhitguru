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
      const yearNp = toNepaliDigits(todayBS.year);
      return unicodeToAakriti(`${dayNp} ${todayBS.monthNameNp}, ${yearNp} | ${todayBS.dayNameNp}`);
    } else {
      return `${todayBS.monthNameEn} ${todayBS.day}, ${todayBS.year} BS | ${todayBS.dayNameEn}`;
    }
  }, [todayBS, isNepali]);

  const fontStyle = isNepali ? { fontFamily: 'Aakriti', fontWeight: 'normal' as const } : {};

  return (
    <TouchableOpacity
      style={[
        styles.badgeContainer,
        {
          backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.25)',
          borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.4)',
        },
      ]}
      onPress={() => router.push('/others/nepaliCalendar' as any)}
      activeOpacity={0.8}
    >
      <Ionicons name="calendar-outline" size={14} color="#FFD700" style={styles.icon} />
      <Text style={[styles.badgeText, fontStyle]}>
        {formattedDateStr}
      </Text>
      <Ionicons name="chevron-forward" size={12} color="rgba(255, 255, 255, 0.7)" style={styles.arrowIcon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginVertical: 6,
    alignSelf: 'center',
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
