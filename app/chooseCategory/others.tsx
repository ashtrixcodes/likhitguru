import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View, LayoutAnimation } from 'react-native';
import { knowledgeAnswerKeyLetters, knowledgeQuestions } from '../practiceMore/knowledge';
import { actRegulationAnswerKeyIndices, actRegulationQuestions, techAndMechanicalAnswerKeyIndices, techAndMechanicalQuestions, trafficSignalKnowledgeAnswerKeyIndices, trafficSignalKnowledgeQuestions, vehiclePollutionAnswerKeyIndices, vehiclePollutionQuestions } from './constant';

import { useTheme } from '@/context/ThemeContext';
import { themedHeaderOptions } from '@/constants/screenHelpers';
import type { AppTheme } from '@/constants/theme';

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
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

interface SectionHeaderProps {
  totalQuestions: number;
  currentPage: number;
  totalPages: number;
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
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      <View style={styles.questionHeader}>
        <Animated.View style={[styles.skeletonTag, { opacity }]} />
      </View>
      <Animated.View style={[styles.skeletonQuestion, { opacity }]} />
      <Animated.View style={[styles.skeletonQuestionSmall, { opacity }]} />
      <View style={styles.dashed} />
      <View style={styles.optionGrid}>
        {[0, 1, 2, 3].map((i: number) => (
          <View key={i} style={styles.optionCell}>
            <Animated.View style={[styles.skeletonOption, { opacity }]} />
          </View>
        ))}
      </View>
      <View style={styles.revealRow}>
        <Animated.View style={[styles.skeletonReveal, { opacity }]} />
      </View>
    </View>
  );
});

// Strip prefix utility moved outside component to avoid recreation
const stripPrefix = (text: string): string => {
  return String(text).replace(/^\s*\(?[a-dA-D]\)?[.)]?\s*/, '').trim();
};

// Memoized individual question card component with better optimization
const QuestionCard = memo(({ 
  item, 
  show, 
  onToggleReveal, 
  anim 
}: QuestionCardProps) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  // Pre-calculate interpolated values to avoid recreation
  const animatedStyles = useMemo(() => ({
    pillTranslateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-52, 0] }),
    spacerHeight: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 52] }),
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })
  }), [anim]);

  // Pre-calculate static values
  const staticValues = useMemo(() => {
    const letter = ['a','b','c','d'][item.correctIndex];
    const strippedOptions = item.opts.map(stripPrefix);
    const correctAnswerText = `${letter}. ${strippedOptions[item.correctIndex]}`;
    
    return {
      letter,
      strippedOptions,
      correctAnswerText
    };
  }, [item.opts, item.correctIndex]);

  const handleToggle = useCallback(() => {
    onToggleReveal(item.id);
  }, [item.id, onToggleReveal]);

  return (
    <View style={{ zIndex: show ? 2 : 1 }}>
      <View style={[styles.card, { zIndex: 10 }]}>
        <View style={styles.questionHeader}>
          <Text style={styles.sectionTag}>{item.section}</Text>
        </View>
        <Text style={styles.questionText}>{item.q}</Text>
        <View style={styles.dashed} />
        <View style={styles.optionGrid}>
          {staticValues.strippedOptions.map((option: string, index: number) => (
            <View key={index} style={styles.optionCell}>
              <Text style={[
                styles.optionText, 
                show && item.correctIndex === index && styles.optionCorrect
              ]}>
                {['a', 'b', 'c', 'd'][index]}. {option}
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
            <Text style={styles.revealText}>{show ? 'Hide answer' : 'Show answer'}</Text>
            <Ionicons name={show ? 'chevron-up' : 'chevron-down'} size={14} color="#FF6B35" />
          </View>
        </Pressable>
      </View>
      
      {show && (
        <View style={{ overflow: 'hidden', zIndex: 1 }}>
          <View style={styles.answerPill} pointerEvents="none">
            <Text numberOfLines={2} ellipsizeMode="tail" style={styles.answerPillText}>
              {staticValues.letter}. {staticValues.strippedOptions[item.correctIndex]}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return prevProps.item.id === nextProps.item.id && 
         prevProps.show === nextProps.show;
});

// Pagination controls component
const PaginationControls = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange,
  isLoading 
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
          Previous
        </Text>
      </Pressable>

      <View style={styles.pageInfo}>
        <Text style={styles.pageInfoText}>
          Page {currentPage} of {totalPages}
        </Text>
        <Text style={styles.pageInfoSubtext}>
          {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalPages * ITEMS_PER_PAGE)} questions
        </Text>
      </View>

      <Pressable 
        style={[styles.paginationButton, !canGoNext && styles.paginationButtonDisabled]}
        onPress={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
      >
        <Text style={[styles.paginationText, !canGoNext && styles.paginationTextDisabled]}>
          Next
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
  totalPages 
}: SectionHeaderProps) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (totalQuestions === 0) return null;

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionRow}>
        <View style={styles.sectionIcon}>
          <Ionicons name="document-text-outline" size={22} color="#434D57" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>All Questions</Text>
          <Text style={styles.sectionSubtitle}>
            Complete collection of all driving test questions ({totalQuestions} total)
          </Text>
          <Text style={styles.loadingInfo}>
            Page {currentPage} of {totalPages} • {ITEMS_PER_PAGE} questions per page
          </Text>
        </View>
      </View>
    </View>
  );
});

export default function OthersScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  // Pre-process all questions once and memoize
  const allQuestions = useMemo((): Question[] => {
    let QUESTIONS: any[] = Array.isArray(actRegulationQuestions) ? actRegulationQuestions : [];
    let ANSWER_KEYS: number[] = Array.isArray(actRegulationAnswerKeyIndices) ? actRegulationAnswerKeyIndices : [];
    let TECH_QUESTIONS: any[] = Array.isArray(techAndMechanicalQuestions) ? techAndMechanicalQuestions : [];
    let TECH_ANSWER_KEYS: number[] = Array.isArray(techAndMechanicalAnswerKeyIndices) ? techAndMechanicalAnswerKeyIndices : [];
    let POLLUTION_QUESTIONS: any[] = Array.isArray(vehiclePollutionQuestions) ? vehiclePollutionQuestions : [];
    let POLLUTION_ANSWER_KEYS: number[] = Array.isArray(vehiclePollutionAnswerKeyIndices) ? vehiclePollutionAnswerKeyIndices : [];
    let DRIVE_QUESTIONS: any[] = Array.isArray(knowledgeQuestions) ? knowledgeQuestions : [];
    let SIGNAL_QUESTIONS: any[] = Array.isArray(trafficSignalKnowledgeQuestions) ? trafficSignalKnowledgeQuestions : [];
    let SIGNAL_ANSWER_KEYS: number[] = Array.isArray(trafficSignalKnowledgeAnswerKeyIndices) ? trafficSignalKnowledgeAnswerKeyIndices : [];
    
    const letterToIndex = (l: string): number => ({ a: 0, b: 1, c: 2, d: 3 } as const)[String(l).toLowerCase() as 'a'|'b'|'c'|'d'] ?? 0;
    let DRIVE_ANSWER_KEYS: number[] = Array.isArray(knowledgeAnswerKeyLetters) ? knowledgeAnswerKeyLetters.map(letterToIndex) : [];
    
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

    addQuestions(QUESTIONS, ANSWER_KEYS, 'Vehicular Act/Regulation');
    addQuestions(TECH_QUESTIONS, TECH_ANSWER_KEYS, 'Technical Knowledge');
    addQuestions(POLLUTION_QUESTIONS, POLLUTION_ANSWER_KEYS, 'Environment Pollution');
    addQuestions(DRIVE_QUESTIONS, DRIVE_ANSWER_KEYS, 'Driving Knowledge');
    addQuestions(SIGNAL_QUESTIONS, SIGNAL_ANSWER_KEYS, 'Traffic Signals');

    return combinedQuestions;
  }, []); // Empty dependency array since data is static

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [revealedSet, setRevealedSet] = useState<Set<number>>(new Set());
  const answerAnimMapRef = useRef<Map<number, Animated.Value>>(new Map());
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

  // Animation value getter with better caching
  const getAnimForId = useCallback((id: number) => {
    const map = answerAnimMapRef.current;
    if (!map.has(id)) {
      map.set(id, new Animated.Value(0));
    }
    return map.get(id)!;
  }, []);

  // Optimized toggle reveal with immediate state update
  const toggleReveal = useCallback((id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Update state immediately for instant UI feedback
    setRevealedSet(prev => {
      const next = new Set(prev);
      if (!prev.has(id)) next.add(id); else next.delete(id);
      return next;
    });
  }, [revealedSet, getAnimForId]);

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

  // Throttled scroll handler for smooth scrolling
  const handleScroll = useCallback(
    throttle((event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // You can add scroll-based logic here if needed
    }, THROTTLE_DELAY),
    []
  );

  // Render questions with proper memoization
  const renderedQuestions = useMemo(() => {
    if (isLoading) return <LoadingSkeletons />;
    
    return currentQuestions.map((item: Question) => {
      const show = revealedSet.has(item.id);
      const anim = getAnimForId(item.id);
      
      return (
        <QuestionCard
          key={item.id}
          item={item}
          show={show}
          onToggleReveal={toggleReveal}
          anim={anim}
        />
      );
    });
  }, [currentQuestions, revealedSet, isLoading, toggleReveal, getAnimForId]);

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Other Exam Test",
          ...themedHeaderOptions(theme),
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()}
              style={styles.headerBackButton}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
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
          />
        )}

        {/* Empty state */}
        {allQuestions.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color="#CCC" />
            <Text style={styles.emptyStateText}>No questions available</Text>
            <Text style={styles.emptyStateSubtext}>Questions will be added soon.</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}
function createStyles(theme: AppTheme) {
  const { colors, glass, isDark } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 32,
    },
    sectionCard: {
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      borderRadius: isDark ? glass.borderRadius : 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
      borderWidth: isDark ? glass.borderWidth : 1,
      borderColor: isDark ? glass.borderColor : '#434D57',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: isDark ? 8 : 6,
      elevation: isDark ? 4 : 3,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F0F0F0',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    sectionTitle: {
      fontSize: 18,
      color: colors.text,
      fontWeight: '700',
    },
    sectionSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    loadingInfo: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 4,
      fontStyle: 'italic',
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
      elevation: isDark ? 4 : 3,
    },
    questionHeader: {
      marginBottom: 8,
    },
    sectionTag: {
      fontSize: 11,
      color: isDark ? colors.text : '#434D57',
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F0F0F0',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      alignSelf: 'flex-start',
      fontWeight: '600',
    },
    questionText: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 12,
      lineHeight: 22,
    },
    dashed: {
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : '#D9D9D9',
      borderStyle: 'dashed',
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
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    optionCorrect: {
      color: '#4CAF50',
      fontWeight: '700',
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
      fontSize: 15,
      marginRight: 4,
      textTransform: 'capitalize',
      fontWeight: '600',
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
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
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
      elevation: isDark ? 4 : 3,
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
    // Skeleton styles
    skeletonTag: {
      width: 120,
      height: 16,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5',
      borderRadius: 8,
    },
    skeletonQuestion: {
      width: '100%',
      height: 20,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5',
      borderRadius: 4,
      marginBottom: 8,
    },
    skeletonQuestionSmall: {
      width: '75%',
      height: 20,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5',
      borderRadius: 4,
      marginBottom: 12,
    },
    skeletonOption: {
      width: '90%',
      height: 16,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5',
      borderRadius: 4,
      marginVertical: 2,
    },
    skeletonReveal: {
      width: 80,
      height: 14,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5',
      borderRadius: 4,
    },
  });
}