import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Image, LayoutAnimation, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as nepaliKnowledge from '../practiceMore/bikeKnowledge';
import * as englishKnowledge from '../practiceMore/knowledge';
import * as nepaliConstants from './bikeConstants';
import * as englishConstants from './constant';

import { themedHeaderOptions } from '@/constants/screenHelpers';
import type { AppTheme } from '@/constants/theme';
import { useTheme, ThemeBackground } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';
import { Skeleton } from '@/components/Skeleton';
import QuestionSpeechButton from '@/components/QuestionSpeechButton';
import AdBanner from '@/components/AdBanner';

const ITEMS_PER_PAGE = 20;
const SKELETON_COUNT = 5;

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  isNepali: boolean;
}

// Memoized skeleton component
const QuestionSkeleton = memo(() => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <Skeleton height={20} style={{ width: '100%', marginBottom: 8 }} />
      <Skeleton height={20} style={{ width: '75%', marginBottom: 12 }} />
      <View style={styles.dashed} />
      <View style={styles.optionGrid}>
        {[0, 1, 2, 3].map((i: number) => (
          <View key={i} style={styles.optionCell}>
            <Skeleton height={16} style={{ width: '90%', marginVertical: 2 }} />
          </View>
        ))}
      </View>
      <View style={styles.revealRow}>
        <Skeleton height={14} style={{ width: 80 }} />
      </View>
    </View>
  );
});

// Loading skeletons wrapper
const LoadingSkeletons = memo(() => (
  <>
    {Array.from({ length: SKELETON_COUNT }, (_, i: number) => (
      <QuestionSkeleton key={`skeleton-${i}`} />
    ))}
  </>
));

// Pagination controls component
const PaginationControls = memo(({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
  isNepali
}: PaginationControlsProps) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const canGoPrevious = currentPage > 1 && !isLoading;
  const canGoNext = currentPage < totalPages && !isLoading;

  return (
    <View style={styles.paginationContainer}>
      <Pressable
        style={[styles.paginationButton, !canGoPrevious && styles.paginationButtonDisabled]}
        onPress={() => canGoPrevious && onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
      >
        <Ionicons
          name="chevron-back"
          size={16}
          color={canGoPrevious ? (theme.isDark ? "#E8EAED" : "#434D57") : "#CCC"}
        />
        <Text style={[styles.paginationText, !canGoPrevious && styles.paginationTextDisabled]}>
          {isNepali ? 'अघिल्लो' : 'Previous'}
        </Text>
      </Pressable>

      <View style={styles.pageInfo}>
        <Text style={styles.pageInfoText}>
          {isNepali ? `पृष्ठ ${currentPage} / ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
        </Text>
        <Text style={styles.pageInfoSubtext}>
          {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalPages * ITEMS_PER_PAGE)} {isNepali ? 'प्रश्नहरू' : 'questions'}
        </Text>
      </View>

      <Pressable
        style={[styles.paginationButton, !canGoNext && styles.paginationButtonDisabled]}
        onPress={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
      >
        <Text style={[styles.paginationText, !canGoNext && styles.paginationTextDisabled]}>
          {isNepali ? 'पछिल्लो' : 'Next'}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={canGoNext ? (theme.isDark ? "#E8EAED" : "#434D57") : "#CCC"}
        />
      </Pressable>
    </View>
  );
});

export default function FourWheelerScreen() {
  const { isNepali } = useLanguage();
  const activeConstants = isNepali ? nepaliConstants : englishConstants;
  const activeKnowledge = isNepali ? nepaliKnowledge : englishKnowledge;

  let QUESTIONS: any[] = Array.isArray(activeConstants.actRegulationQuestions) ? (activeConstants.actRegulationQuestions as any[]) : [];
  let ANSWER_KEYS: number[] = Array.isArray(activeConstants.actRegulationAnswerKeyIndices) ? (activeConstants.actRegulationAnswerKeyIndices as number[]) : [];
  let TECH_QUESTIONS: any[] = Array.isArray(activeConstants.techAndMechanicalQuestions) ? (activeConstants.techAndMechanicalQuestions as any[]) : [];
  let TECH_ANSWER_KEYS: number[] = Array.isArray(activeConstants.techAndMechanicalAnswerKeyIndices) ? (activeConstants.techAndMechanicalAnswerKeyIndices as number[]) : [];
  let POLLUTION_QUESTIONS: any[] = Array.isArray(activeConstants.vehiclePollutionQuestions) ? (activeConstants.vehiclePollutionQuestions as any[]) : [];
  let POLLUTION_ANSWER_KEYS: number[] = Array.isArray(activeConstants.vehiclePollutionAnswerKeyIndices) ? (activeConstants.vehiclePollutionAnswerKeyIndices as number[]) : [];
  let DRIVE_QUESTIONS: any[] = Array.isArray(activeKnowledge.knowledgeQuestions) ? (activeKnowledge.knowledgeQuestions as any[]) : [];
  const letterToIndex = (l: string): number => ({ a: 0, b: 1, c: 2, d: 3 } as const)[String(l).toLowerCase() as 'a' | 'b' | 'c' | 'd'] ?? 0;
  let DRIVE_ANSWER_KEYS: number[] = Array.isArray(activeKnowledge.knowledgeAnswerKeyLetters) ? (activeKnowledge.knowledgeAnswerKeyLetters as any[]).map(letterToIndex) : [];
  let ACC_QUESTIONS: any[] = Array.isArray((activeConstants as any).accidentalAwarenessQuestions) ? ((activeConstants as any).accidentalAwarenessQuestions as any[]) : [];
  let ACC_ANSWER_KEYS: number[] = Array.isArray((activeConstants as any).accidentalAwarenessAnswerKeyIndices) ? ((activeConstants as any).accidentalAwarenessAnswerKeyIndices as number[]) : [];
  let SIGNAL_QUESTIONS: any[] = Array.isArray(activeConstants.trafficSignalKnowledgeQuestions) ? (activeConstants.trafficSignalKnowledgeQuestions as any[]) : [];
  let SIGNAL_ANSWER_KEYS: number[] = Array.isArray(activeConstants.trafficSignalKnowledgeAnswerKeyIndices) ? (activeConstants.trafficSignalKnowledgeAnswerKeyIndices as number[]) : [];

  const sections = useMemo(() => [
    { id: '1', title: isNepali ? 'खण्ड १' : 'Section 1', subtitle: isNepali ? 'सवारी ऐन तथा नियम सम्बन्धी ज्ञान' : 'Vehicular Act & Regulation Knowledge', count: QUESTIONS.length },
    { id: '2', title: isNepali ? 'खण्ड २' : 'Section 2', subtitle: isNepali ? 'सवारीको प्राविधिक तथा यान्त्रिक ज्ञान' : 'Technical & Mechanical Knowledge of Vehicle', count: TECH_QUESTIONS.length },
    { id: '3', title: isNepali ? 'खण्ड ३' : 'Section 3', subtitle: isNepali ? 'वातावरण प्रदूषण सम्बन्धी अवधारणात्मक ज्ञान' : 'Conceptual Knowledge of Vehicle Pollution', count: POLLUTION_QUESTIONS.length },
    { id: '4', title: isNepali ? 'खण्ड ४' : 'Section 4', subtitle: isNepali ? 'सवारी सञ्चालन सम्बन्धी ज्ञान' : 'Vehicle Driving Knowledge', count: DRIVE_QUESTIONS.length },
    { id: '5', title: isNepali ? 'खण्ड ५' : 'Section 5', subtitle: isNepali ? 'दुर्घटना सचेतना सम्बन्धी ज्ञान' : 'Accident Awareness Knowledge', count: ACC_QUESTIONS.length },
    { id: '6', title: isNepali ? 'खण्ड ६' : 'Section 6', subtitle: isNepali ? 'ट्राफिक संकेत सम्बन्धी ज्ञान' : 'Traffic Signal Knowledge', count: SIGNAL_QUESTIONS.length },
  ], [isNepali, QUESTIONS.length, TECH_QUESTIONS.length, POLLUTION_QUESTIONS.length, DRIVE_QUESTIONS.length, ACC_QUESTIONS.length, SIGNAL_QUESTIONS.length]);

  const [activeSectionId, setActiveSectionId] = useState<string>('1');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [revealedSet, setRevealedSet] = useState<Set<number>>(new Set());
  const [showGoTop, setShowGoTop] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionTabsRef = useRef<ScrollView>(null);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme, isNepali), [theme, isNepali]);
  const router = useRouter();

  const currentSectionData = useMemo(() => {
    switch (activeSectionId) {
      case '1': return { questions: QUESTIONS, answerKeys: ANSWER_KEYS };
      case '2': return { questions: TECH_QUESTIONS, answerKeys: TECH_ANSWER_KEYS };
      case '3': return { questions: POLLUTION_QUESTIONS, answerKeys: POLLUTION_ANSWER_KEYS };
      case '4': return { questions: DRIVE_QUESTIONS, answerKeys: DRIVE_ANSWER_KEYS };
      case '5': return { questions: ACC_QUESTIONS, answerKeys: ACC_ANSWER_KEYS };
      case '6': return { questions: SIGNAL_QUESTIONS, answerKeys: SIGNAL_ANSWER_KEYS };
      default: return { questions: QUESTIONS, answerKeys: ANSWER_KEYS };
    }
  }, [activeSectionId, QUESTIONS, ANSWER_KEYS, TECH_QUESTIONS, TECH_ANSWER_KEYS, POLLUTION_QUESTIONS, POLLUTION_ANSWER_KEYS, DRIVE_QUESTIONS, DRIVE_ANSWER_KEYS, ACC_QUESTIONS, ACC_ANSWER_KEYS, SIGNAL_QUESTIONS, SIGNAL_ANSWER_KEYS]);

  const allCurrentQuestions = useMemo(() => {
    return currentSectionData.questions.map((q: any, idx: number) => {
      const key = Number.isFinite(currentSectionData.answerKeys[idx]) ? Number(currentSectionData.answerKeys[idx]) : 0;
      return {
        q: q?.question ?? '',
        opts: Array.isArray(q?.options) ? q.options : ['', '', '', ''],
        correctIndex: Math.max(0, Math.min(3, key)),
        id: idx + 1,
      };
    });
  }, [currentSectionData]);

  const totalPages = Math.max(1, Math.ceil(allCurrentQuestions.length / ITEMS_PER_PAGE));
  const paginatedQuestions = useMemo(() => allCurrentQuestions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [allCurrentQuestions, currentPage]);

  const handleSectionSelect = (sectionId: string) => {
    if (sectionId === activeSectionId || isLoading) return;
    const index = sections.findIndex(s => s.id === sectionId);
    if (index !== -1) {
      sectionTabsRef.current?.scrollTo({ x: index * 290, animated: true });
    }
    setIsLoading(true);
    setActiveSectionId(sectionId);
    setCurrentPage(1);
    setRevealedSet(new Set());
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    setTimeout(() => setIsLoading(false), 200);
  };

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > totalPages || isLoading) return;
    setIsLoading(true);
    setCurrentPage(newPage);
    setRevealedSet(new Set());
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    setTimeout(() => setIsLoading(false), 200);
  }, [totalPages, isLoading]);

  const toggleReveal = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRevealedSet(prev => {
      const next = new Set(prev);
      if (!prev.has(id)) next.add(id); else next.delete(id);
      return next;
    });
  };

  const optionPrefixes = isNepali ? ['(क)', '(ख)', '(ग)', '(घ)'] : ['a.', 'b.', 'c.', 'd.'];

  return (
    <ThemeBackground>
      <Stack.Screen
        options={{
          title: isNepali ? unicodeToAakriti("४-पाङ्ग्रे लिखित परीक्षा") : "4-Wheeler Exam Test",
          ...themedHeaderOptions(theme),
          headerTitleStyle: {
            fontSize: isNepali ? 22 : 20,
            color: '#FFFFFF',
            fontFamily: isNepali ? 'AakritiBold' : undefined,
          },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerBackButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
          ),
        }}
      />
      <ScrollView 
        ref={scrollViewRef} 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 32 }}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          if (y > 400 && !showGoTop) setShowGoTop(true);
          else if (y <= 400 && showGoTop) setShowGoTop(false);
        }}
        scrollEventThrottle={16}
      >
        <ScrollView ref={sectionTabsRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionTabs}>
          {sections.map((sec) => {
            const isActive = sec.id === activeSectionId;
            return (
              <Pressable key={sec.id} style={[styles.sectionCard, isActive && styles.sectionCardActive]} onPress={() => handleSectionSelect(sec.id)}>
                <View style={styles.sectionRow}>
                  <View style={[styles.sectionIcon, isActive && styles.sectionIconActive]}>
                    <Image
                      source={require('../../assets/images/exam.png')}
                      style={styles.sectionIconImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1, paddingRight: 6 }}>
                    <Text style={[styles.sectionTitle, { color: theme.isDark ? '#FFFFFF' : '#1E293B' }]} numberOfLines={1}>
                      {isNepali ? unicodeToAakriti(sec.title) : sec.title}
                    </Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.isDark ? '#94A3B8' : '#64748B' }]} numberOfLines={1}>
                      {isNepali ? unicodeToAakriti(sec.subtitle) : sec.subtitle}
                    </Text>
                  </View>
                  {isActive && (
                    <View style={styles.sectionArrowBadge}>
                      <Ionicons name="chevron-forward" size={18} color="#000000" />
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        {isLoading ? <LoadingSkeletons /> : paginatedQuestions.map((item) => {
          const show = revealedSet.has(item.id);
          return (
            <View key={item.id} style={{ zIndex: show ? 2 : 1 }}>
              <View style={[styles.card, { zIndex: 10 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                  <QuestionSpeechButton
                    rawNepaliText={item.q}
                    englishText={item.q}
                  />
                  <Text style={[styles.questionText, { flex: 1, marginBottom: 0 }]}>
                    {isNepali ? unicodeToAakriti(item.q) : item.q}
                  </Text>
                </View>
                <View style={styles.dashed} />
                <View style={styles.optionGrid}>
                  {item.opts.map((opt: string, i: number) => (
                    <View key={i} style={styles.optionCell}>
                      <Text style={[styles.optionText, show && item.correctIndex === i && styles.optionCorrect]}>
                        {isNepali ? unicodeToAakriti(`${optionPrefixes[i]} ${stripPrefix(opt)}`) : `${optionPrefixes[i]} ${stripPrefix(opt)}`}
                      </Text>
                    </View>
                  ))}
                </View>
                <Pressable onPress={() => toggleReveal(item.id)} style={styles.revealTouch}>
                  <View style={styles.revealRow}>
                    <Text style={styles.revealText}>
                      {isNepali
                        ? unicodeToAakriti(show ? 'उत्तर लुकाउनुहोस्' : 'उत्तर हेर्नुहोस्')
                        : (show ? 'Hide answer' : 'Show answer')}
                    </Text>
                    <Ionicons name={show ? 'chevron-up' : 'chevron-down'} size={14} color="#FF6B35" />
                  </View>
                </Pressable>
              </View>
              {show && (
                <View style={{ overflow: 'hidden', zIndex: 1 }}>
                  <View style={styles.answerPill}>
                    <Text style={styles.answerPillText}>
                      {isNepali
                        ? unicodeToAakriti(`${optionPrefixes[item.correctIndex]} ${stripPrefix(item.opts[item.correctIndex])}`)
                        : `${optionPrefixes[item.correctIndex]} ${stripPrefix(item.opts[item.correctIndex])}`}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
        {!isLoading && paginatedQuestions.length === 0 && <View style={{ padding: 16, alignItems: 'center' }}><Text style={{ color: theme.colors.textSecondary }}>{isNepali ? 'प्रश्नहरू चाँडै थपिनेछन्।' : 'Questions will be added soon.'}</Text></View>}
        {!isLoading && totalPages > 1 && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} isLoading={isLoading} isNepali={isNepali} />}
        <AdBanner />
      </ScrollView>
      {showGoTop && (
        <Pressable
          style={styles.fab}
          onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
        >
          <Ionicons name="arrow-up" size={24} color={theme.isDark ? 'rgba(255,255,255,0.8)' : '#000'} />
        </Pressable>
      )}
    </ThemeBackground>
  );
}

function stripPrefix(text: string): string {
  return String(text).replace(/^\s*\(?[a-dA-Dक-घ]\)?[.)]?\s*/, '').trim();
}

function createStyles(theme: AppTheme, isNepali: boolean = false) {
  const { colors, glass, isDark } = theme;
  const fontNormal = isNepali ? 'Aakriti' : undefined;
  const fontBold = isNepali ? 'AakritiBold' : undefined;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: isDark ? 'transparent' : '#fff',
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.25,
      shadowRadius: 3.84,
      elevation: isDark ? 0 : 5,
      zIndex: 100,
    },
    sectionTabs: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 6,
    },
    sectionCard: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.card,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginRight: 12,
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.cardBorder,
      width: 300,
      justifyContent: 'center',
    },
    sectionCardActive: {
      borderWidth: 2,
      borderColor: '#22C55E',
      backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.05)',
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#F1F5F9',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    sectionIconActive: {
      backgroundColor: '#FFFFFF',
    },
    sectionIconImage: {
      width: 28,
      height: 28,
    },
    sectionArrowBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#22C55E',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
    },
    sectionTitle: {
      fontSize: isNepali ? 20 : 17,
      fontWeight: isNepali ? 'normal' : '700',
      marginBottom: 3,
      fontFamily: fontBold,
      lineHeight: isNepali ? 26 : 22,
    },
    sectionSubtitle: {
      fontSize: isNepali ? 15 : 13,
      color: isDark ? '#94A3B8' : '#64748B',
      fontFamily: fontNormal,
      lineHeight: isNepali ? 21 : 17,
    },
    card: {
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      borderRadius: isDark ? glass.borderRadius : 16,
      padding: 16,
      marginHorizontal: 16,
      marginTop: 6,
      borderWidth: isDark ? glass.borderWidth : 1,
      borderColor: isDark ? glass.borderColor : colors.cardBorder,
      position: 'relative',
      zIndex: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: isDark ? 8 : 6,
      elevation: isDark ? 0 : 3,
    },
    questionText: {
      fontSize: isNepali ? 22 : 16,
      color: isDark ? colors.text : '#252b31ff',
      marginBottom: 12,
      fontFamily: fontBold || fontNormal,
      lineHeight: isNepali ? 30 : 22,
    },
    dashed: {
      height: 1,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
      marginBottom: 12,
    },
    optionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    optionCell: {
      width: '48%',
      marginBottom: 10,
    },
    optionText: {
      fontSize: isNepali ? 19 : 14,
      color: isDark ? colors.text : '#252b31ff',
      fontFamily: fontNormal,
      lineHeight: isNepali ? 26 : 18,
    },
    optionCorrect: {
      color: '#4CAF50',
      fontWeight: isNepali ? 'normal' : '700',
      fontFamily: fontBold || fontNormal,
    },
    revealRow: {
      marginTop: 6,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    revealText: {
      color: colors.accent,
      fontSize: isNepali ? 18 : 15,
      marginRight: 4,
      fontFamily: fontBold || fontNormal,
    },
    answerPill: {
      marginHorizontal: 25,
      backgroundColor: isDark ? 'rgba(76, 175, 80, 0.15)' : '#4CAF50',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: isDark ? 1 : 0,
      borderTopWidth: 0,
      borderColor: isDark ? 'rgba(76, 175, 80, 0.3)' : 'transparent',
    },
    answerPillText: {
      color: isDark ? '#81C784' : '#FFFFFF',
      fontSize: isNepali ? 19 : 16,
      fontWeight: isNepali ? 'normal' : '700',
      textAlign: 'center',
      fontFamily: fontBold || fontNormal,
    },
    revealTouch: {
      alignSelf: 'stretch',
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    headerBackButton: {
      padding: 8,
      marginLeft: 10,
      borderRadius: 20,
    },
    // Pagination styles
    paginationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? 'transparent' : '#fff',
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: isDark ? 8 : 6,
      elevation: isDark ? 0 : 3,
    },
    paginationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F8F9FA',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
      gap: 6,
    },
    paginationButtonDisabled: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F5F5F5',
      borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E0E0E0',
    },
    paginationText: {
      fontSize: 14,
      fontWeight: isNepali ? 'normal' : '600',
      color: isDark ? colors.text : '#434D57',
      fontFamily: fontNormal,
    },
    paginationTextDisabled: {
      color: isDark ? colors.textTertiary : '#CCC',
    },
    pageInfo: {
      alignItems: 'center',
    },
    pageInfoText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    pageInfoSubtext: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },

  });
}
