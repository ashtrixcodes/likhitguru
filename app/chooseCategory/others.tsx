import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, LayoutAnimation, Pressable, ScrollView, StyleSheet, Text, View, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Skeleton } from '@/components/Skeleton';
import * as nepaliKnowledge from '../practiceMore/bikeKnowledge';
import * as englishKnowledge from '../practiceMore/knowledge';
import * as nepaliConstants from './bikeConstants';
import * as englishConstants from './constant';

import { useTheme, ThemeBackground } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { themedHeaderOptions } from '@/constants/screenHelpers';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';
import type { AppTheme } from '@/constants/theme';
import AdBanner from '@/components/AdBanner';

const ITEMS_PER_PAGE = 20; // Items per page
const SKELETON_COUNT = 5;
const THROTTLE_DELAY = 16; // ~60fps for scroll events

// Define question type interface
interface Question {
  q: string;
  opts: string[];
  correctIndex: number;
  id: number;
  section: string;
}

// Define props interfaces
interface QuestionCardProps {
  item: Question;
  show: boolean;
  onToggleReveal: (id: number) => void;
  anim: Animated.Value;
  isNepali: boolean;
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  isNepali: boolean;
}

interface SectionHeaderProps {
  totalQuestions: number;
  currentPage: number;
  totalPages: number;
  isNepali: boolean;
}

// Throttle utility
function throttle<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastExecTime = 0;
  
  return ((...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  }) as T;
}

// Memoized skeleton component
const QuestionSkeleton = memo(() => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <View style={styles.questionHeader}>
        <Skeleton height={20} style={{ width: 80, marginBottom: 8 }} />
      </View>
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

// Strip prefix utility moved outside component to avoid recreation
const stripPrefix = (text: string): string => {
  return String(text).replace(/^\s*\(?[a-dA-Dक-घ]\)?[.)]?\s*/, '').trim();
};

// Memoized individual question card component with better optimization
const QuestionCard = memo(({ 
  item, 
  show, 
  onToggleReveal, 
  anim,
  isNepali 
}: QuestionCardProps) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme, isNepali), [theme, isNepali]);
  const optionPrefixes = isNepali ? ['(क)', '(ख)', '(ग)', '(घ)'] : ['a.', 'b.', 'c.', 'd.'];

  // Pre-calculate static values
  const staticValues = useMemo(() => {
    const letter = optionPrefixes[item.correctIndex];
    const strippedOptions = item.opts.map(stripPrefix);
    const correctAnswerText = `${letter} ${strippedOptions[item.correctIndex]}`;
    
    return {
      letter,
      strippedOptions,
      correctAnswerText
    };
  }, [item.opts, item.correctIndex, optionPrefixes]);

  const handleToggle = useCallback(() => {
    onToggleReveal(item.id);
  }, [item.id, onToggleReveal]);

  return (
    <View style={{ zIndex: show ? 2 : 1 }}>
      <View style={[styles.card, { zIndex: 10 }]}>
        <View style={styles.questionHeader}>
          <Text style={styles.sectionTag}>
            {isNepali ? unicodeToAakriti(item.section) : item.section}
          </Text>
        </View>
        <Text style={styles.questionText}>
          {isNepali ? unicodeToAakriti(item.q) : item.q}
        </Text>
        <View style={styles.dashed} />
        <View style={styles.optionGrid}>
          {staticValues.strippedOptions.map((option: string, index: number) => (
            <View key={index} style={styles.optionCell}>
              <Text style={[
                styles.optionText, 
                show && item.correctIndex === index && styles.optionCorrect
              ]}>
                {isNepali ? unicodeToAakriti(`${optionPrefixes[index]} ${option}`) : `${optionPrefixes[index]} ${option}`}
              </Text>
            </View>
          ))}
        </View>
        <Pressable 
          onPress={handleToggle} 
          style={styles.revealTouch} 
          hitSlop={{ top: 8, bottom: 8, left: 20, right: 20 }}
        >
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
          <View style={styles.answerPill} pointerEvents="none">
            <Text numberOfLines={2} ellipsizeMode="tail" style={styles.answerPillText}>
              {isNepali
                ? unicodeToAakriti(`${staticValues.letter} ${staticValues.strippedOptions[item.correctIndex]}`)
                : `${staticValues.letter} ${staticValues.strippedOptions[item.correctIndex]}`}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return prevProps.item.id === nextProps.item.id && 
         prevProps.show === nextProps.show &&
         prevProps.isNepali === nextProps.isNepali;
});

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
          color={canGoPrevious ? "#434D57" : "#CCC"} 
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
          color={canGoNext ? "#434D57" : "#CCC"} 
        />
      </Pressable>
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

// Section header component
const SectionHeader = memo(({ 
  totalQuestions, 
  currentPage, 
  totalPages,
  isNepali
}: SectionHeaderProps) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme, isNepali), [theme, isNepali]);

  if (totalQuestions === 0) return null;

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionRow}>
        <View style={styles.sectionIcon}>
          <Ionicons name="document-text-outline" size={22} color={theme.colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>
            {isNepali ? unicodeToAakriti('सबै प्रश्नहरू') : 'All Questions'}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {isNepali
              ? unicodeToAakriti(`सवारी चालक लिखित परीक्षाका सबै प्रश्नहरूको संग्रह (जम्मा ${totalQuestions} वटा)`)
              : `Complete collection of all driving test questions (${totalQuestions} total)`}
          </Text>
          <Text style={styles.loadingInfo}>
            {isNepali
              ? unicodeToAakriti(`पृष्ठ ${currentPage} / ${totalPages} • प्रति पृष्ठ ${ITEMS_PER_PAGE} प्रश्नहरू`)
              : `Page ${currentPage} of ${totalPages} • ${ITEMS_PER_PAGE} questions per page`}
          </Text>
        </View>
      </View>
    </View>
  );
});

export default function OthersScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isNepali } = useLanguage();
  const styles = useMemo(() => createStyles(theme, isNepali), [theme, isNepali]);

  const activeConstants = isNepali ? nepaliConstants : englishConstants;
  const activeKnowledge = isNepali ? nepaliKnowledge : englishKnowledge;

  // Pre-process all questions once and memoize
  const allQuestions = useMemo((): Question[] => {
    let QUESTIONS: any[] = Array.isArray(activeConstants.actRegulationQuestions) ? activeConstants.actRegulationQuestions : [];
    let ANSWER_KEYS: number[] = Array.isArray(activeConstants.actRegulationAnswerKeyIndices) ? activeConstants.actRegulationAnswerKeyIndices : [];
    let TECH_QUESTIONS: any[] = Array.isArray(activeConstants.techAndMechanicalQuestions) ? activeConstants.techAndMechanicalQuestions : [];
    let TECH_ANSWER_KEYS: number[] = Array.isArray(activeConstants.techAndMechanicalAnswerKeyIndices) ? activeConstants.techAndMechanicalAnswerKeyIndices : [];
    let POLLUTION_QUESTIONS: any[] = Array.isArray(activeConstants.vehiclePollutionQuestions) ? activeConstants.vehiclePollutionQuestions : [];
    let POLLUTION_ANSWER_KEYS: number[] = Array.isArray(activeConstants.vehiclePollutionAnswerKeyIndices) ? activeConstants.vehiclePollutionAnswerKeyIndices : [];
    let DRIVE_QUESTIONS: any[] = Array.isArray(activeKnowledge.knowledgeQuestions) ? activeKnowledge.knowledgeQuestions : [];
    let SIGNAL_QUESTIONS: any[] = Array.isArray(activeConstants.trafficSignalKnowledgeQuestions) ? activeConstants.trafficSignalKnowledgeQuestions : [];
    let SIGNAL_ANSWER_KEYS: number[] = Array.isArray(activeConstants.trafficSignalKnowledgeAnswerKeyIndices) ? activeConstants.trafficSignalKnowledgeAnswerKeyIndices : [];
    
    const letterToIndex = (l: string): number => ({ a: 0, b: 1, c: 2, d: 3 } as const)[String(l).toLowerCase() as 'a'|'b'|'c'|'d'] ?? 0;
    let DRIVE_ANSWER_KEYS: number[] = Array.isArray(activeKnowledge.knowledgeAnswerKeyLetters) ? activeKnowledge.knowledgeAnswerKeyLetters.map(letterToIndex) : [];
    
    const combinedQuestions: Question[] = [];
    let currentId = 0;

    const addQuestions = (questions: any[], answerKeys: number[], sectionName: string) => {
      questions.forEach((q: any, idx: number) => {
        const key = Number.isFinite(answerKeys[idx]) ? Number(answerKeys[idx]) : 0;
        combinedQuestions.push({
          q: q?.question ?? '',
          opts: Array.isArray(q?.options) ? q.options : ['', '', '', ''],
          correctIndex: Math.max(0, Math.min(3, key)),
          id: currentId++,
          section: sectionName,
        });
      });
    };

    addQuestions(QUESTIONS, ANSWER_KEYS, isNepali ? 'सवारी ऐन तथा नियम' : 'Vehicular Act & Regulation');
    addQuestions(TECH_QUESTIONS, TECH_ANSWER_KEYS, isNepali ? 'प्राविधिक ज्ञान' : 'Technical Knowledge');
    addQuestions(POLLUTION_QUESTIONS, POLLUTION_ANSWER_KEYS, isNepali ? 'वातावरण प्रदूषण' : 'Environment Pollution');
    addQuestions(DRIVE_QUESTIONS, DRIVE_ANSWER_KEYS, isNepali ? 'सवारी सञ्चालन ज्ञान' : 'Driving Knowledge');
    addQuestions(SIGNAL_QUESTIONS, SIGNAL_ANSWER_KEYS, isNepali ? 'ट्राफिक संकेत' : 'Traffic Signals');

    return combinedQuestions;
  }, [isNepali, activeConstants, activeKnowledge]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showGoTop, setShowGoTop] = useState(false);
  const [revealedSet, setRevealedSet] = useState<Set<number>>(new Set());
  const scrollViewRef = useRef<ScrollView>(null);

  // Calculate pagination values
  const totalPages = Math.ceil(allQuestions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, allQuestions.length);
  
  // Get current page questions
  const currentQuestions = useMemo(() => 
    allQuestions.slice(startIndex, endIndex),
    [allQuestions, startIndex, endIndex]
  );

  // Optimized toggle reveal with immediate state update
  const toggleReveal = useCallback((id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Update state immediately for instant UI feedback
    setRevealedSet(prev => {
      const next = new Set(prev);
      if (!prev.has(id)) next.add(id); else next.delete(id);
      return next;
    });
  }, []);

  // Page change handler
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > totalPages || isLoading) return;
    
    setIsLoading(true);
    setCurrentPage(newPage);
    
    // Clear revealed answers when changing pages for better performance
    setRevealedSet(new Set());
    
    // Scroll to top
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  }, [totalPages, isLoading]);

  const handleScroll = useCallback((event: any) => {
    const offsetY = event?.nativeEvent?.contentOffset?.y || 0;
    if (offsetY > 400 && !showGoTop) setShowGoTop(true);
    if (offsetY <= 400 && showGoTop) setShowGoTop(false);
  }, [showGoTop]);

  // Render questions with proper memoization
  const renderedQuestions = useMemo(() => {
    if (isLoading) return <LoadingSkeletons />;
    
    return currentQuestions.map((item: Question) => {
      const show = revealedSet.has(item.id);
      
      return (
        <QuestionCard
          key={item.id}
          item={item}
          show={show}
          onToggleReveal={toggleReveal}
          anim={new Animated.Value(0)}
          isNepali={isNepali}
        />
      );
    });
  }, [currentQuestions, revealedSet, isLoading, toggleReveal, isNepali]);

  return (
    <ThemeBackground>
      <Stack.Screen 
        options={{
          title: isNepali ? unicodeToAakriti("अन्य लिखित परीक्षा") : "Other Exam Test",
          ...themedHeaderOptions(theme),
          headerTitleStyle: {
            fontSize: isNepali ? 22 : 20,
            color: '#FFFFFF',
            fontFamily: isNepali ? 'AakritiBold' : undefined,
          },
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()}
              style={styles.headerBackButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
          ),
        }}
      />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={THROTTLE_DELAY}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Header */}
        <SectionHeader 
          totalQuestions={allQuestions.length} 
          currentPage={currentPage}
          totalPages={totalPages}
          isNepali={isNepali}
        />

        {/* Questions */}
        {renderedQuestions}

        {/* Bottom Pagination Controls */}
        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            isNepali={isNepali}
          />
        )}

        {/* Empty state */}
        {allQuestions.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color="#CCC" />
            <Text style={styles.emptyStateText}>कुनै प्रश्न उपलब्ध छैन</Text>
            <Text style={styles.emptyStateSubtext}>प्रश्नहरू चाँडै थपिनेछन्।</Text>
          </View>
        )}
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
    scrollContent: {
      paddingBottom: 32,
    },
    sectionCard: {
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      borderRadius: isDark ? glass.borderRadius : 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
      borderWidth: isDark ? glass.borderWidth : 1.5,
      borderColor: isDark ? glass.borderColor : colors.cardBorder,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: isDark ? 8 : 6,
      elevation: isDark ? 0 : 3,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F0F4F8',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    sectionTitle: {
      fontSize: isNepali ? 20 : 18,
      color: colors.text,
      fontWeight: '700',
      fontFamily: fontBold,
      marginBottom: 3,
      lineHeight: isNepali ? 26 : 22,
    },
    sectionSubtitle: {
      fontSize: isNepali ? 15 : 13,
      color: isDark ? '#94A3B8' : '#64748B',
      fontFamily: fontNormal,
      lineHeight: isNepali ? 21 : 17,
    },
    loadingInfo: {
      fontSize: isNepali ? 13 : 12,
      color: colors.textTertiary,
      marginTop: 4,
      fontFamily: fontNormal,
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
    questionHeader: {
      marginBottom: 8,
    },
    sectionTag: {
      fontSize: isNepali ? 14 : 11,
      color: isDark ? '#FF9800' : '#E65100',
      backgroundColor: isDark ? 'rgba(255,152,0,0.15)' : '#FFF3E0',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      alignSelf: 'flex-start',
      fontWeight: '600',
      fontFamily: fontBold || fontNormal,
    },
    questionText: {
      fontSize: isNepali ? 22 : 16,
      color: isDark ? colors.text : '#252b31ff',
      marginBottom: 12,
      lineHeight: isNepali ? 30 : 22,
      fontFamily: fontBold || fontNormal,
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
      color: isDark ? '#E5E7EB' : '#252b31ff',
      lineHeight: isNepali ? 26 : 20,
      fontFamily: fontNormal,
    },
    optionCorrect: {
      color: '#4CAF50',
      fontWeight: '700',
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
      fontWeight: '700',
      textAlign: 'center',
      fontFamily: fontBold || fontNormal,
    },
    revealTouch: {
      alignSelf: 'stretch',
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignItems: 'center',
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
      fontWeight: '600',
      color: isDark ? colors.text : '#434D57',
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
    // Empty state
    emptyState: {
      alignItems: 'center',
      padding: 32,
      marginTop: 32,
    },
    emptyStateText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 16,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: colors.textTertiary,
      marginTop: 4,
    },
  });
}