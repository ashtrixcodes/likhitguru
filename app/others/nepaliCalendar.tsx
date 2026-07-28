import React, { useState, useMemo, useEffect } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme, ThemeBackground } from '@/context/ThemeContext';
import { themedHeaderOptions } from '@/constants/screenHelpers';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';
import {
  convertADtoBS,
  convertBStoAD,
  getDaysInBSMonth,
  getTodayBS,
  NEPALI_MONTH_NAMES_EN,
  NEPALI_MONTH_NAMES_NP,
  NEPALI_SHORT_DAY_NAMES_NP,
  PUBLIC_HOLIDAYS_MAP,
  toNepaliDigits,
  parseNepaliNumber,
} from '@/utils/nepaliCalendar';
import { EXAM_DATE_STORAGE_KEY, ExamDateRecord } from '@/components/ExamCountdownBanner';
import { syncExamToNativeWidget } from '@/utils/sharedWidgetBridge';

export default function NepaliCalendarScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isNepali } = useLanguage();

  const todayBS = useMemo(() => getTodayBS(), []);

  const [currentYear, setCurrentYear] = useState(todayBS.year);
  const [currentMonth, setCurrentMonth] = useState(todayBS.month); // 1-12
  const [selectedDay, setSelectedDay] = useState(todayBS.day);
  const [activeTab, setActiveTab] = useState<'calendar' | 'converter'>('calendar');

  // Converter state
  const [convBsYear, setConvBsYear] = useState(todayBS.year.toString());
  const [convBsMonth, setConvBsMonth] = useState(todayBS.month.toString());
  const [convBsDay, setConvBsDay] = useState(todayBS.day.toString());
  const [convertedAdResult, setConvertedAdResult] = useState<string>('');

  // Exam Scheduler Modal State
  const [showExamModal, setShowExamModal] = useState(false);
  const [examType, setExamType] = useState<'written' | 'trial'>('written');
  const [examBsYear, setExamBsYear] = useState(todayBS.year.toString());
  const [examBsMonth, setExamBsMonth] = useState(todayBS.month.toString());
  const [examBsDay, setExamBsDay] = useState((todayBS.day + 7).toString());

  const fontStyle = isNepali ? { fontFamily: 'Aakriti', fontWeight: 'normal' as const } : {};
  const fontBoldStyle = isNepali ? { fontFamily: 'AakritiBold', fontWeight: 'normal' as const } : {};

  // Compute month start day of week (0=Sunday, 6=Saturday)
  const monthStartDayOfWeek = useMemo(() => {
    const firstDayAd = convertBStoAD(currentYear, currentMonth, 1);
    return firstDayAd.getDay();
  }, [currentYear, currentMonth]);

  const totalDaysInMonth = useMemo(() => {
    return getDaysInBSMonth(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Holidays for current month
  const monthHolidays = useMemo(() => {
    const key = `${currentYear}-${currentMonth}`;
    return PUBLIC_HOLIDAYS_MAP[key] || [];
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => Math.max(2080, y - 1));
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => Math.min(2090, y + 1));
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleConvertBStoAD = () => {
    const y = parseNepaliNumber(convBsYear);
    const m = parseNepaliNumber(convBsMonth);
    const d = parseNepaliNumber(convBsDay);

    if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 32) {
      Alert.alert('अवैध मिति', 'कृपया सही वि.सं. मिति प्रविष्ट गर्नुहोस्।');
      return;
    }

    const adDate = convertBStoAD(y, m, d);
    const adString = adDate.toDateString();
    setConvertedAdResult(adString);
  };

  const handleSaveExamDate = async () => {
    const y = parseNepaliNumber(examBsYear);
    const m = parseNepaliNumber(examBsMonth);
    const d = parseNepaliNumber(examBsDay);

    if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 32) {
      Alert.alert('अवैध मिति', 'कृपया सही वि.सं. परीक्षा मिति प्रविष्ट गर्नुहोस्।');
      return;
    }

    const adDate = convertBStoAD(y, m, d);
    const record: ExamDateRecord = {
      typeNp: examType === 'written' ? 'लिखित परीक्षा' : 'ट्रायल परीक्षा',
      typeEn: examType === 'written' ? 'Written Exam' : 'Trial Exam',
      bsDateStrNp: `${toNepaliDigits(y)} ${NEPALI_MONTH_NAMES_NP[m - 1]} ${toNepaliDigits(d)}`,
      bsDateStrEn: `${NEPALI_MONTH_NAMES_EN[m - 1]} ${d}, ${y} BS`,
      targetAdTimestamp: adDate.getTime(),
    };

    try {
      await syncExamToNativeWidget(record);
      setShowExamModal(false);
      Alert.alert(
        isNepali ? 'परीक्षा मिति सुरक्षित गरियो' : 'Exam Date Saved',
        isNepali ? 'तपाईंको परीक्षा मिति काउन्टडाउन गृह पृष्ठ तथा iOS विजेटमा देखिनेछ।' : 'Your exam countdown is now active on home screen & iOS Widget!'
      );
    } catch (e) {
      console.warn('Failed to save exam date:', e);
    }
  };

  const primaryColor = theme.colors.accent || '#2563eb';

  return (
    <ThemeBackground>
      <Stack.Screen
        options={{
          ...themedHeaderOptions(theme),
          title: isNepali ? unicodeToAakriti('नेपाली पात्रो र परीक्षा मिति') : 'Nepali Calendar',
        }}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
        {/* Top Tab Bar */}
        <View style={[styles.tabBar, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'calendar' && { borderBottomWidth: 3, borderBottomColor: primaryColor }]}
            onPress={() => setActiveTab('calendar')}
          >
            <Ionicons name="calendar" size={16} color={activeTab === 'calendar' ? primaryColor : '#888'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, activeTab === 'calendar' && { color: primaryColor, fontWeight: '700' }, fontStyle]}>
              {isNepali ? unicodeToAakriti('पात्रो र बिदाहरू') : 'Calendar & Holidays'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'converter' && { borderBottomWidth: 3, borderBottomColor: primaryColor }]}
            onPress={() => setActiveTab('converter')}
          >
            <Ionicons name="swap-horizontal" size={16} color={activeTab === 'converter' ? primaryColor : '#888'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, activeTab === 'converter' && { color: primaryColor, fontWeight: '700' }, fontStyle]}>
              {isNepali ? unicodeToAakriti('मिति रूपान्तरण') : 'AD/BS Converter'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {activeTab === 'calendar' ? (
            <>
              {/* Month Header Navigation */}
              <View style={[styles.monthHeaderCard, { backgroundColor: theme.colors.card }]}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
                  <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>

                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.monthTitle, fontBoldStyle, { color: theme.colors.text }]}>
                    {isNepali
                      ? unicodeToAakriti(`${NEPALI_MONTH_NAMES_NP[currentMonth - 1]} ${toNepaliDigits(currentYear)}`)
                      : `${NEPALI_MONTH_NAMES_EN[currentMonth - 1]} ${currentYear} BS`}
                  </Text>
                  <Text style={[styles.todayBadge, fontStyle]}>
                    {isNepali
                      ? unicodeToAakriti(`आज: ${toNepaliDigits(todayBS.day)} ${todayBS.monthNameNp} ${toNepaliDigits(todayBS.year)}`)
                      : `Today: ${todayBS.monthNameEn} ${todayBS.day}, ${todayBS.year} BS`}
                  </Text>
                </View>

                <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
                  <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {/* Day of Week Header */}
              <View style={styles.weekDaysRow}>
                {NEPALI_SHORT_DAY_NAMES_NP.map((dayName, idx) => (
                  <View key={idx} style={styles.weekDayCell}>
                    <Text style={[styles.weekDayText, { color: idx === 6 ? '#ef4444' : theme.colors.textSecondary }, fontBoldStyle]}>
                      {isNepali ? unicodeToAakriti(dayName) : dayName}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Month Days Grid */}
              <View style={[styles.daysGrid, { backgroundColor: theme.colors.card }]}>
                {/* Empty cells before 1st day */}
                {Array.from({ length: monthStartDayOfWeek }).map((_, idx) => (
                  <View key={`empty-${idx}`} style={styles.dayCell} />
                ))}

                {/* Day numbers */}
                {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const isToday = currentYear === todayBS.year && currentMonth === todayBS.month && dayNum === todayBS.day;
                  const isSelected = dayNum === selectedDay;
                  const dayOfWeek = (monthStartDayOfWeek + idx) % 7;
                  const isSaturday = dayOfWeek === 6;
                  const holiday = monthHolidays.find((h) => h.day === dayNum);

                  return (
                    <TouchableOpacity
                      key={`day-${dayNum}`}
                      style={[
                        styles.dayCell,
                        isToday && styles.todayCell,
                        isSelected && !isToday && styles.selectedCell,
                      ]}
                      onPress={() => {
                        setSelectedDay(dayNum);
                        setExamBsYear(currentYear.toString());
                        setExamBsMonth(currentMonth.toString());
                        setExamBsDay(dayNum.toString());
                      }}
                    >
                      <Text
                        style={[
                          styles.dayNumText,
                          { color: isToday ? '#ffffff' : isSaturday ? '#ef4444' : theme.colors.text },
                          isSaturday && { fontWeight: '700' },
                          isToday && { fontWeight: '800' },
                          fontStyle,
                        ]}
                      >
                        {isNepali ? toNepaliDigits(dayNum) : dayNum}
                      </Text>

                      {holiday && <View style={styles.holidayDot} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Driving License Exam Date Scheduler Trigger Card */}
              <TouchableOpacity
                style={[styles.examScheduleBtn, { backgroundColor: theme.isDark ? '#1e3a8a' : '#dbeafe' }]}
                onPress={() => {
                  setExamBsYear(currentYear.toString());
                  setExamBsMonth(currentMonth.toString());
                  setExamBsDay(selectedDay.toString());
                  setShowExamModal(true);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="alarm-outline" size={24} color={primaryColor} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.examBtnTitle, fontBoldStyle, { color: primaryColor }]}>
                    {isNepali ? unicodeToAakriti('परीक्षा मिति तय गर्नुहोस्') : 'Schedule Exam Date'}
                  </Text>
                  <Text style={[styles.examBtnSubtitle, fontStyle, { color: theme.isDark ? '#93c5fd' : '#1e40af' }]}>
                    {isNepali ? unicodeToAakriti('लिखित वा ट्रायल परीक्षा काउन्टडाउन सेट गर्नुहोस्') : 'Set Written or Trial exam countdown'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={primaryColor} />
              </TouchableOpacity>

              {/* Month Holidays & Events Card */}
              <View style={[styles.holidaysCard, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.holidaysCardTitle, fontBoldStyle, { color: theme.colors.text }]}>
                  {isNepali ? unicodeToAakriti('यस महिनाका बिदा तथा चाडपर्वहरू') : 'Holidays & Events'}
                </Text>

                {monthHolidays.length === 0 ? (
                  <Text style={[styles.noHolidaysText, fontStyle, { color: '#888' }]}>
                    {isNepali ? unicodeToAakriti('यस महिनामा सार्वजनिक बिदा छैन।') : 'No major public holidays this month.'}
                  </Text>
                ) : (
                  monthHolidays.map((h, i) => (
                    <View key={i} style={styles.holidayRow}>
                      <View style={styles.holidayDayBadge}>
                        <Text style={[styles.holidayDayText, fontBoldStyle]}>
                          {isNepali ? toNepaliDigits(h.day) : h.day}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.holidayTitle, fontBoldStyle, { color: theme.colors.text }]}>
                          {isNepali ? unicodeToAakriti(h.titleNp) : h.titleEn}
                        </Text>
                        <Text style={[styles.holidaySubtitle, fontStyle, { color: h.isOfficeClosed ? '#ef4444' : '#10b981' }]}>
                          {isNepali
                            ? unicodeToAakriti(h.isOfficeClosed ? 'सरकारी/यातायात कार्यालय बिदा' : 'कार्यालय खुल्ला रहने')
                            : h.isOfficeClosed ? 'Transport Office Closed' : 'Office Open'}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </>
          ) : (
            <View style={[styles.converterCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.converterTitle, fontBoldStyle, { color: theme.colors.text }]}>
                {isNepali ? unicodeToAakriti('वि.सं. बाट ई.सं. (BS to AD) रूपान्तरण') : 'Convert BS to AD Date'}
              </Text>

              <View style={styles.inputsRow}>
                <View style={styles.inputCol}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }, fontStyle]}>{isNepali ? unicodeToAakriti('वर्ष (BS)') : 'Year'}</Text>
                  <TextInput
                    style={[styles.numInput, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
                    value={convBsYear}
                    onChangeText={setConvBsYear}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>

                <View style={styles.inputCol}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }, fontStyle]}>{isNepali ? unicodeToAakriti('महिना') : 'Month'}</Text>
                  <TextInput
                    style={[styles.numInput, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
                    value={convBsMonth}
                    onChangeText={setConvBsMonth}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>

                <View style={styles.inputCol}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }, fontStyle]}>{isNepali ? unicodeToAakriti('गते') : 'Day'}</Text>
                  <TextInput
                    style={[styles.numInput, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
                    value={convBsDay}
                    onChangeText={setConvBsDay}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.convertBtn} onPress={handleConvertBStoAD} activeOpacity={0.85}>
                <Text style={[styles.convertBtnText, fontBoldStyle]}>
                  {isNepali ? unicodeToAakriti('मिति रूपान्तरण गर्नुहोस्') : 'Convert Date'}
                </Text>
              </TouchableOpacity>

              {convertedAdResult ? (
                <View style={[styles.resultBox, { backgroundColor: theme.isDark ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4', borderColor: theme.isDark ? '#10b981' : '#86efac' }]}>
                  <Text style={[styles.resultBoxLabel, { color: theme.isDark ? '#6ee7b7' : '#166534' }, fontStyle]}>
                    {isNepali ? unicodeToAakriti('अंग्रेजी (AD) मिति:') : 'Converted AD Date:'}
                  </Text>
                  <Text style={[styles.resultBoxText, { color: theme.isDark ? '#34d399' : '#15803d' }]}>{convertedAdResult}</Text>
                </View>
              ) : null}
            </View>
          )}
        </ScrollView>

        {/* Set Exam Date Modal */}
        <Modal visible={showExamModal} animationType="slide" transparent statusBarTranslucent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: theme.isDark ? '#1e293b' : '#ffffff', borderWidth: theme.isDark ? 1 : 0, borderColor: 'rgba(255, 255, 255, 0.15)' }]}>
              <Text style={[styles.modalTitle, fontBoldStyle, { color: theme.isDark ? '#ffffff' : '#0f172a' }]}>
                {isNepali ? unicodeToAakriti('परीक्षा मिति सेटिङ') : 'Set Exam Date'}
              </Text>

              <Text style={[styles.modalSubtitle, { color: theme.isDark ? '#94a3b8' : '#64748b' }, fontStyle]}>
                {isNepali
                  ? unicodeToAakriti('तपाईंको लिखित वा ट्रायल परीक्षाको मिति रोज्नुहोस्:')
                  : 'Select your scheduled Written or Trial Exam Date:'}
              </Text>

              {/* Exam Type Selector */}
              <View style={styles.typeSelectorRow}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor: examType === 'written' ? '#2563eb' : theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                      borderColor: examType === 'written' ? '#2563eb' : theme.isDark ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1',
                    },
                  ]}
                  onPress={() => setExamType('written')}
                >
                  <Text style={[styles.typeBtnText, { color: examType === 'written' ? '#ffffff' : theme.isDark ? '#e2e8f0' : '#334155' }, fontStyle]}>
                    {isNepali ? unicodeToAakriti('लिखित परीक्षा') : 'Written Exam'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor: examType === 'trial' ? '#2563eb' : theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                      borderColor: examType === 'trial' ? '#2563eb' : theme.isDark ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1',
                    },
                  ]}
                  onPress={() => setExamType('trial')}
                >
                  <Text style={[styles.typeBtnText, { color: examType === 'trial' ? '#ffffff' : theme.isDark ? '#e2e8f0' : '#334155' }, fontStyle]}>
                    {isNepali ? unicodeToAakriti('ट्रायल परीक्षा') : 'Trial Exam'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Date Inputs */}
              <View style={styles.inputsRow}>
                <View style={styles.inputCol}>
                  <Text style={[styles.inputLabel, { color: theme.isDark ? '#cbd5e1' : '#64748b' }, fontStyle]}>{isNepali ? unicodeToAakriti('वर्ष') : 'Year'}</Text>
                  <TextInput
                    style={[styles.numInput, { color: theme.isDark ? '#ffffff' : '#0f172a', backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#f8fafc', borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1' }]}
                    value={examBsYear}
                    onChangeText={setExamBsYear}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={[styles.inputLabel, { color: theme.isDark ? '#cbd5e1' : '#64748b' }, fontStyle]}>{isNepali ? unicodeToAakriti('महिना') : 'Month'}</Text>
                  <TextInput
                    style={[styles.numInput, { color: theme.isDark ? '#ffffff' : '#0f172a', backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#f8fafc', borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1' }]}
                    value={examBsMonth}
                    onChangeText={setExamBsMonth}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={[styles.inputLabel, { color: theme.isDark ? '#cbd5e1' : '#64748b' }, fontStyle]}>{isNepali ? unicodeToAakriti('गते') : 'Day'}</Text>
                  <TextInput
                    style={[styles.numInput, { color: theme.isDark ? '#ffffff' : '#0f172a', backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#f8fafc', borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1' }]}
                    value={examBsDay}
                    onChangeText={setExamBsDay}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelBtn} onPress={() => setShowExamModal(false)}>
                  <Text style={[styles.cancelBtnText, { color: theme.isDark ? '#cbd5e1' : '#64748b' }, fontStyle]}>{isNepali ? unicodeToAakriti('रद्द') : 'Cancel'}</Text>
                </Pressable>

                <Pressable style={styles.saveBtn} onPress={handleSaveExamDate}>
                  <Text style={[styles.saveBtnText, fontBoldStyle]}>{isNepali ? unicodeToAakriti('सुरक्षित गर्नुहोस्') : 'Save Exam'}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ThemeBackground>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  activeTabItem: {
    borderBottomWidth: 3,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  scrollContent: {
    padding: 16,
  },
  monthHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    elevation: 2,
  },
  navBtn: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  todayBadge: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayCell: {
    width: '14%',
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 14,
    color: '#555',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingTop: 10,
    paddingBottom: 8,
    marginBottom: 16,
    elevation: 2,
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 1,
    borderRadius: 10,
  },
  todayCell: {
    backgroundColor: '#2563eb',
  },
  selectedCell: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  dayNumText: {
    fontSize: 17,
    color: '#333',
  },
  holidayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ef4444',
    marginTop: 2,
  },
  examScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  examBtnTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  examBtnSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  holidaysCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
  },
  holidaysCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  noHolidaysText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  holidayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  holidayDayBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  holidayDayText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 15,
  },
  holidayTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  holidaySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  converterCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  converterTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputCol: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  numSelector: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  numSelectorText: {
    fontSize: 17,
    fontWeight: '600',
  },
  convertBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  convertBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultBox: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  resultBoxLabel: {
    fontSize: 13,
    color: '#166534',
    marginBottom: 4,
  },
  resultBoxText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15803d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeTypeBtn: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  typeBtnText: {
    fontSize: 14,
    color: '#444',
  },
  numBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  numBoxText: {
    fontSize: 16,
    fontWeight: '600',
  },
  numInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  cancelBtnText: {
    color: '#666',
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
