import CustomGlassAlert from '@/components/CustomGlassAlert';
import { themedHeaderOptions } from '@/constants/screenHelpers';
import type { AppTheme } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme, ThemeBackground } from '@/context/ThemeContext';
import { useRewardedAd, AD_UNITS } from '@/utils/mobileAds';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';
import { triggerHapticLight } from '@/context/HapticsContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Image, PanResponder, Pressable, ScrollView, StyleSheet, Text, View, findNodeHandle } from 'react-native';
import * as nepaliKnowledge from './bikeKnowledge';
import * as englishKnowledge from './knowledge';

import AsyncStorage from '@react-native-async-storage/async-storage';

const rewardedAdUnitId = AD_UNITS.REWARDED;

let SecureStore: any;
try {
  // Lazy import to avoid type errors if module types are missing during lint
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SecureStore = require('expo-secure-store');
} catch { }

async function getStorageItem(key: string): Promise<string | null> {
  try {
    if (SecureStore?.getItemAsync) {
      const val = await SecureStore.getItemAsync(key);
      if (val !== null && val !== undefined) return val;
    }
  } catch { }
  try {
    return await AsyncStorage.getItem(key);
  } catch { }
  return null;
}

async function setStorageItem(key: string, value: string): Promise<void> {
  try {
    if (SecureStore?.setItemAsync) {
      await SecureStore.setItemAsync(key, value);
    }
  } catch { }
  try {
    await AsyncStorage.setItem(key, value);
  } catch { }
}

function toNepaliNumber(num: number | string): string {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/[0-9]/g, (d) => nepaliDigits[parseInt(d, 10)]);
}

export default function ExamTestScreen() {
  const { theme } = useTheme();
  const { isNepali } = useLanguage();
  const activeKnowledge = isNepali ? nepaliKnowledge : englishKnowledge;
  const knowledgeQuestions = activeKnowledge.knowledgeQuestions;

  const styles = useMemo(() => createStyles(theme, isNepali), [theme, isNepali]);
  const TOTAL_TIME = 240; // seconds (2 minutes)
  const TOTAL_QUESTIONS = 20;
  const PASS_PERCENT = 40;
  const TOTAL_TESTS = Math.ceil(knowledgeQuestions.length / 20);
  const router = useRouter();
  const [selectedTestIndex, setSelectedTestIndex] = useState(0); // 0-based: Test 1..7
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [showResults, setShowResults] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<any[]>([]);
  const [unlockedTests, setUnlockedTests] = useState<number>(1); // Only Test 1 unlocked initially
  const [clearedTests, setClearedTests] = useState<number[]>([]); // Persisted indices of passed tests
  const [hasPassed, setHasPassed] = useState<boolean>(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState<boolean>(false);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [showSheet, setShowSheet] = useState(false);
  const [showGoTop, setShowGoTop] = useState(false);
  const [isReviewUnlocked, setIsReviewUnlocked] = useState(false);
  const [pendingAction, setPendingAction] = useState<'review' | 'restart' | 'back' | null>(null);
  const [lockedAlertVisible, setLockedAlertVisible] = useState(false);
  const [showLeaveAlert, setShowLeaveAlert] = useState(false);
  const [pendingSwitchIndex, setPendingSwitchIndex] = useState<number | null>(null);

  // Hook for AdMob Rewarded Ad
  const { isLoaded, isClosed, show, reward, load } = useRewardedAd(rewardedAdUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  // Proactively load the ad when the screen mounts
  useEffect(() => {
    load();
  }, [load]);

  const switchTestSeries = (i: number) => {
    setSelectedTestIndex(i);
    setGameState('idle');
    setCurrentQuiz([]);
    setAnswers([]);
    setShowResults(false);
    setShowSheet(false);
    resetScrollToTop();

    const CARD_W = 300;
    const GAP = 12;
    const PADDING = 20;
    const x = Math.max(0, i * (CARD_W + GAP) - PADDING);
    setTimeout(() => {
      testSelectorRef.current?.scrollTo({ x, y: 0, animated: true });
    }, 50);
  };

  const handleConfirmLeave = () => {
    setShowLeaveAlert(false);
    if (pendingSwitchIndex === -1) {
      router.back();
    } else if (pendingSwitchIndex !== null) {
      switchTestSeries(pendingSwitchIndex);
    }
    setPendingSwitchIndex(null);
  };

  const handleNextTest = () => {
    const next = selectedTestIndex + 1;
    const totalTests = Math.ceil(knowledgeQuestions.length / 20);
    if (next >= totalTests) return;
    const nextCount = Math.max(unlockedTests, next + 1);
    setUnlockedTests(nextCount);
    persistUnlocked(nextCount);
    setSelectedTestIndex(next);
    setShowSheet(false);
    setShowResults(false);
    setScore(0);
    setTimeLeft(TOTAL_TIME);
    requestAnimationFrame(() => {
      handleStart(next);
      setTimeout(() => {
        const CARD_W = 300;
        const GAP = 12;
        const PADDING = 20;
        const x = Math.max(0, next * (CARD_W + GAP) - PADDING);
        testSelectorRef.current?.scrollTo({ x, y: 0, animated: true });
      }, 200);
    });
  };

  const handleBackPress = () => {
    if (gameState === 'playing') {
      setPendingSwitchIndex(-1);
      setShowLeaveAlert(true);
      return;
    }
    if (gameState === 'finished' && !isReviewUnlocked) {
      if (isLoaded) {
        setPendingAction('back');
        show();
      } else {
        router.back();
      }
    } else {
      router.back();
    }
  };

  // Handle reward and unlock reviews
  useEffect(() => {
    if (isClosed && reward) {
      setIsReviewUnlocked(true);
      if (pendingAction === 'review') {
        setShowOutcomeModal(false);
      } else if (pendingAction === 'restart') {
        setShowOutcomeModal(false);
        if (hasPassed) {
          handleNextTest();
        } else {
          resetScrollToTop();
          handleStart(selectedTestIndex);
        }
      } else if (pendingAction === 'back') {
        router.back();
      }
      setPendingAction(null);
    } else if (isClosed) {
      // User closed early - reload ad, don't unlock/go back
      setPendingAction(null);
      load();
    }
  }, [isClosed, reward, pendingAction, load, selectedTestIndex, hasPassed]);

  // Animations (reused from quiz screens)
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const buttonWidthAnim = useRef(new Animated.Value(100)).current;
  const liquidProgressAnim = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(600)).current;
  const scrollRef = useRef<ScrollView>(null);
  const lastScrollYRef = useRef(0);
  const questionOffsetsRef = useRef<number[]>([]);
  const questionRefsRef = useRef<Array<View | null>>([]);
  const testSelectorRef = useRef<ScrollView>(null);
  const sheetHeightRef = useRef(0);
  const MAX_SCROLL_RETRY = 80;

  const openGetReadySheet = () => {
    triggerHapticLight();
    setShowSheet(true);
    sheetTranslateY.setValue(600);
    Animated.spring(sheetTranslateY, {
      toValue: 0,
      tension: 65,
      friction: 9,
      useNativeDriver: true,
    }).start();
  };

  const dismissSheet = () => {
    Animated.timing(sheetTranslateY, { toValue: 600, duration: 200, useNativeDriver: true }).start(() => {
      setShowSheet(false);
    });
  };

  const scrollToNextQuestionWithRetry = (currentIndex: number, attempt: number = 0) => {
    const nextIndex = currentIndex + 1;
    const currentTop = questionOffsetsRef.current[currentIndex];
    const nextTop = questionOffsetsRef.current[nextIndex];
    const firstTop = questionOffsetsRef.current[0];
    const canUseAbsoluteToFirst = typeof nextTop === 'number' && typeof firstTop === 'number';
    const canUseDelta = typeof currentTop === 'number' && typeof nextTop === 'number';
    const canUseAbsolute = typeof nextTop === 'number';
    if (canUseAbsoluteToFirst) {
      const targetY = Math.max(0, nextTop - firstTop);
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
      return;
    }
    if (canUseDelta) {
      const delta = nextTop - currentTop;
      const targetY = Math.max(0, lastScrollYRef.current + delta);
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
      return;
    }
    if (canUseAbsolute) {
      const targetY = Math.max(0, nextTop);
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
      return;
    }
    // Measurement-based fallback relative to ScrollView when offsets aren't ready
    const nextRef = questionRefsRef.current[nextIndex] as any;
    const scrollNode = scrollRef.current as any;
    if (nextRef) {
      try {
        const scrollHandle = scrollNode ? findNodeHandle(scrollNode) : null;
        if (scrollHandle && typeof nextRef.measureLayout === 'function') {
          nextRef.measureLayout(scrollHandle, (lx: number, ly: number) => {
            const targetY = Math.max(0, ly);
            scrollRef.current?.scrollTo({ y: targetY, animated: true });
          }, () => { });
          return;
        }
      } catch { }
    }
    if (nextRef && typeof nextRef.measure === 'function' && scrollNode && typeof scrollNode.measure === 'function') {
      try {
        nextRef.measure((nx: number, ny: number, nw: number, nh: number, npx: number, npy: number) => {
          scrollNode.measure((sx: number, sy: number, sw: number, sh: number, spx: number, spy: number) => {
            const relativeY = npy - spy; // distance from ScrollView top
            const targetY = Math.max(0, lastScrollYRef.current + relativeY);
            scrollRef.current?.scrollTo({ y: targetY, animated: true });
          });
        });
        return;
      } catch { }
    }
    if (attempt < MAX_SCROLL_RETRY) {
      setTimeout(() => scrollToNextQuestionWithRetry(currentIndex, attempt + 1), 16);
    }
  };
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) sheetTranslateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100 || gesture.vy > 0.5) {
          dismissSheet();
        } else {
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            tension: 70,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const closeSheetAndStart = () => {
    Animated.timing(sheetTranslateY, { toValue: 600, duration: 220, useNativeDriver: true }).start(() => {
      setShowSheet(false);
      // Always regenerate the quiz to ensure fresh questions
      handleStart(selectedTestIndex);
    });
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameState === 'playing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev: number) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimeUp();
            return 0;
          }
          pulseAnimation();
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState, timeLeft]);

  const pulseAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Build non-overlapping tests: 20 questions per test for first 6 tests (120), last test has remaining 10
  const getTestSlice = (testIndex: number) => {
    const start = testIndex * 20;
    const end = Math.min(start + 20, knowledgeQuestions.length);
    return knowledgeQuestions.slice(start, end);
  };

  const resetScrollToTop = () => {
    questionOffsetsRef.current = [];
    questionRefsRef.current = [];
    lastScrollYRef.current = 0;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
  };

  function handleStart(testIndex?: number) {
    const effectiveIndex = typeof testIndex === 'number' ? testIndex : selectedTestIndex;
    resetScrollToTop();
    const baseSet = getTestSlice(effectiveIndex);
    // Do NOT shuffle questions or options. Keep the original order and map the correct answer from the key.
    const startIndex = effectiveIndex * 20;
    const quiz = baseSet.map((q, idx) => {
      const globalIndex = startIndex + idx; // 0-based across all questions
      const letter = activeKnowledge.knowledgeAnswerKeyLetters[globalIndex] ?? 'a';
      const letterLower = String(letter).toLowerCase() as 'a' | 'b' | 'c' | 'd';
      const correctFromLetter = ({ a: 0, b: 1, c: 2, d: 3 } as const)[letterLower] ?? 0;
      const correctAnswerOriginal = q.options[correctFromLetter];
      const options = [...q.options];
      return { ...q, options, correctAnswer: correctAnswerOriginal };
    });

    setCurrentQuiz(quiz);
    setScore(0);
    setIsReviewUnlocked(false);
    setTimeLeft(TOTAL_TIME);
    setGameState('playing');
    setShowResults(false);
    setAnswers(Array(quiz.length).fill(null));
    liquidProgressAnim.setValue(0);
    Animated.spring(buttonWidthAnim, { toValue: 140, useNativeDriver: false, friction: 8 }).start();
    Animated.timing(liquidProgressAnim, { toValue: 1, duration: TOTAL_TIME * 1000, useNativeDriver: false }).start();
  };

  // Persisted unlock state
  useEffect(() => {
    (async () => {
      try {
        const saved = await getStorageItem('exam_unlocked_tests');
        if (saved) setUnlockedTests(Number(saved) || 1);
        const savedSelected = await getStorageItem('exam_selected_test_index');
        if (savedSelected !== null && savedSelected !== undefined) {
          const parsed = Number(savedSelected);
          if (!Number.isNaN(parsed)) setSelectedTestIndex(parsed);
        }
        const savedCleared = await getStorageItem('exam_cleared_tests');
        if (savedCleared) {
          try {
            const parsed: number[] = JSON.parse(savedCleared);
            if (Array.isArray(parsed)) setClearedTests(parsed.filter((n) => Number.isFinite(n)));
          } catch { }
        }
      } catch { }
    })();
  }, []);

  useEffect(() => {
    // Keep selected index within unlocked range
    if (selectedTestIndex >= unlockedTests) {
      setSelectedTestIndex(Math.max(0, unlockedTests - 1));
    }
  }, [unlockedTests]);

  useEffect(() => {
    (async () => {
      try {
        await setStorageItem('exam_selected_test_index', String(selectedTestIndex));
      } catch { }
    })();
  }, [selectedTestIndex]);

  useEffect(() => {
    (async () => {
      try {
        await setStorageItem('exam_cleared_tests', JSON.stringify(clearedTests));
      } catch { }
    })();
  }, [clearedTests]);

  const persistAllProgress = async () => {
    try {
      await setStorageItem('exam_unlocked_tests', String(unlockedTests));
      await setStorageItem('exam_selected_test_index', String(selectedTestIndex));
      await setStorageItem('exam_cleared_tests', JSON.stringify(clearedTests));
    } catch { }
  };

  // Ensure persistence when screen gains focus and before it unfocuses
  useFocusEffect(
    useCallback(() => {
      // On focus, ensure any in-memory changes are flushed soon after
      persistAllProgress();
      return () => {
        // On blur/unmount, persist again
        persistAllProgress();
      };
    }, [unlockedTests, selectedTestIndex, clearedTests])
  );

  const persistUnlocked = async (next: number) => {
    try {
      await setStorageItem('exam_unlocked_tests', String(next));
    } catch { }
  };

  const handleTimeUp = () => {
    setGameState('finished');
    liquidProgressAnim.stopAnimation();
    // Reveal results automatically on time up
    calculateAndShowResults();
  };

  const handleOptionSelect = (qIndex: number, option: string) => {
    if (showResults || gameState !== 'playing') return;
    // Allow changing selection before results are shown
    const next = [...answers];
    next[qIndex] = option;
    setAnswers(next);
    // Auto-advance to next question with retries until layouts are captured
    requestAnimationFrame(() => scrollToNextQuestionWithRetry(qIndex));
  };

  const calculateAndShowResults = () => {
    let computedScore = 0;
    currentQuiz.forEach((q, idx) => {
      if (answers[idx] && answers[idx] === q.correctAnswer) computedScore += 1;
    });
    setScore(computedScore);
    setShowResults(true);
    setGameState('finished');
    // Evaluate pass/fail
    const passThreshold = Math.ceil((currentQuiz.length || TOTAL_QUESTIONS) * (PASS_PERCENT / 100));
    const passed = computedScore >= passThreshold;
    setHasPassed(passed);
    if (passed) {
      // Mark current test as cleared and persist
      setClearedTests((prev) => {
        if (prev.includes(selectedTestIndex)) return prev;
        const next = [...prev, selectedTestIndex].sort((a, b) => a - b);
        return next;
      });
      // Sequential unlock: only unlock the immediate next test
      const nextIndex = selectedTestIndex + 1; // 0-based
      const shouldUnlock = unlockedTests < nextIndex + 1; // unlockedTests is a count
      if (shouldUnlock) {
        const nextCount = nextIndex + 1;
        setUnlockedTests(nextCount);
        persistUnlocked(nextCount);
        // Gently slide the test selector to reveal the next test card
        setTimeout(() => {
          const CARD_W = 300; // match styles.testCard width
          const GAP = 12;     // match styles.testCard marginRight
          const PADDING = 20; // match styles.testSelectorContent horizontal padding
          const x = Math.max(0, nextIndex * (CARD_W + GAP) - PADDING);
          testSelectorRef.current?.scrollTo({ x, y: 0, animated: true });
        }, 50);
      }
    }
    setShowOutcomeModal(true);
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    setTimeLeft(TOTAL_TIME);
    setShowResults(false);
    setCurrentQuiz([]);
    setAnswers([]);
    setShowSheet(true);
    sheetTranslateY.setValue(0);
    liquidProgressAnim.setValue(0);
    Animated.spring(buttonWidthAnim, { toValue: 100, useNativeDriver: false, friction: 8 }).start();
  };

  return (
    <ThemeBackground>
      <Stack.Screen
        options={{
          title: isNepali ? unicodeToAakriti("लिखित परीक्षा अभ्यास") : "Exam Test",
          ...themedHeaderOptions(theme),
          headerTitleStyle: {
            fontFamily: isNepali ? 'AakritiBold' : undefined,
            fontSize: isNepali ? 22 : undefined,
          },
          headerRight: () => (
            <View style={styles.headerTimerCapsule}>
              <Image source={require('../../assets/images/stopwatch.png')} style={styles.headerTimerIcon} />
              <View style={styles.headerTimerDivider} />
              <Text style={styles.headerTimerText}>{formatTime(timeLeft)}</Text>
            </View>
          ),
          headerLeft: () => (
            <Pressable
              onPress={handleBackPress}
              style={styles.headerBackButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 96 }}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            lastScrollYRef.current = y;
            if (y > 400 && !showGoTop) setShowGoTop(true);
            else if (y <= 400 && showGoTop) setShowGoTop(false);
          }}
          scrollEventThrottle={16}
        >
          {/* Test selector - always visible so cards are clickable */}
          <ScrollView
            ref={testSelectorRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.testSelector}
            contentContainerStyle={styles.testSelectorContent}
            decelerationRate="fast"
          >
            {Array.from({ length: Math.ceil(knowledgeQuestions.length / 20) }, (_, i) => {
              const isLocked = i >= unlockedTests;
              const isActive = selectedTestIndex === i && !isLocked;
              const isCleared = clearedTests.includes(i);
              return (
                <Pressable
                  key={i}
                  style={[styles.testCard, isActive && styles.testCardActive, isLocked && styles.testCardLocked]}
                  onPress={() => {
                    if (i >= unlockedTests) {
                      setLockedAlertVisible(true);
                      return;
                    }
                    if (i === selectedTestIndex && gameState === 'idle') return;

                    // If a test is in progress, confirm before switching/leaving
                    if (gameState === 'playing') {
                      setPendingSwitchIndex(i);
                      setShowLeaveAlert(true);
                      return;
                    }

                    switchTestSeries(i);
                  }}
                >
                  <View style={styles.testCardRow}>
                    <View style={styles.testIconCircle}>
                      <Image
                        source={require('@/assets/images/exam.png')}
                        style={styles.testIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.testCardTextArea}>
                      <Text style={styles.testTitle}>
                        {isNepali ? unicodeToAakriti(`परीक्षा सेट ${toNepaliNumber(i + 1)}`) : `Test Series ${i + 1}`}
                      </Text>
                      <Text style={styles.testSubtitle} numberOfLines={2}>
                        {isCleared
                          ? (isNepali ? unicodeToAakriti('पूरा भयो') : 'Completed')
                          : isLocked
                            ? (isNepali ? unicodeToAakriti('अनलक गर्न अघिल्लो परीक्षा पूरा गर्नुहोस्') : 'Complete previous test to unlock')
                            : (isNepali ? unicodeToAakriti('सुरु गर्न तयार हुनुहुन्छ') : 'Ready to start')}
                      </Text>
                    </View>
                    <View style={[styles.testArrowCircle, isActive && styles.testArrowCircleActive]}>
                      <Ionicons name="chevron-forward" size={16} color={isActive ? (theme.isDark ? '#111827' : '#fff') : '#9AA0A6'} />
                    </View>
                    {isLocked && <Ionicons name="lock-closed" size={14} color="#9AA0A6" style={styles.testLockBadge} />}
                    {!isLocked && isCleared && <Ionicons name="checkmark-circle" size={16} color="#2E7D32" style={{ marginLeft: 6 }} />}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Timer row removed - using header timer after sheet dismiss */}

          {/* Progress Dashboard - shown only in lobby (idle state) */}
          {gameState === 'idle' && (
            <View style={styles.dashboardContainer}>
              <Text style={styles.dashboardTitle}>
                {isNepali ? unicodeToAakriti("तपाईंको प्रगति") : "Your Progress"}
              </Text>

              <View style={styles.dashboardGrid}>
                {/* Completed Card */}
                <View style={styles.dashboardCard}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.dashboardCardIcon} />
                  <Text style={styles.dashboardCardLabel}>
                    {isNepali ? unicodeToAakriti("पूरा सेट") : "Completed Sets"}
                  </Text>
                  <Text style={styles.dashboardCardValue}>
                    {isNepali ? unicodeToAakriti(`${toNepaliNumber(clearedTests.length)}÷${toNepaliNumber(TOTAL_TESTS)}`) : `${clearedTests.length}/${TOTAL_TESTS}`}
                  </Text>
                </View>

                {/* Unlocked Card */}
                <View style={styles.dashboardCard}>
                  <Ionicons name="lock-open" size={20} color="#FF6B35" style={styles.dashboardCardIcon} />
                  <Text style={styles.dashboardCardLabel}>
                    {isNepali ? unicodeToAakriti("अनलक सेट") : "Unlocked Sets"}
                  </Text>
                  <Text style={styles.dashboardCardValue}>
                    {isNepali ? unicodeToAakriti(`${toNepaliNumber(unlockedTests)}÷${toNepaliNumber(TOTAL_TESTS)}`) : `${unlockedTests}/${TOTAL_TESTS}`}
                  </Text>
                </View>

                {/* Progress Card */}
                <View style={styles.dashboardCard}>
                  <Ionicons name="trending-up" size={20} color="#2196F3" style={styles.dashboardCardIcon} />
                  <Text style={styles.dashboardCardLabel}>
                    {isNepali ? unicodeToAakriti("सफलता दर") : "Success Rate"}
                  </Text>
                  <Text style={styles.dashboardCardValue}>
                    {isNepali
                      ? unicodeToAakriti(`${toNepaliNumber(Math.round((clearedTests.length / TOTAL_TESTS) * 100))}%`)
                      : `${Math.round((clearedTests.length / TOTAL_TESTS) * 100)}%`}
                  </Text>
                </View>
              </View>

              {/* Progress track line */}
              <View style={styles.dashboardProgressWrapper}>
                <View style={styles.dashboardProgressBarTrack}>
                  <View
                    style={[
                      styles.dashboardProgressBarFill,
                      { width: `${Math.max(5, (clearedTests.length / TOTAL_TESTS) * 100)}%` }
                    ]}
                  />
                </View>
              </View>

              {/* Ready / Start Exam Action Button */}
              <Pressable
                style={styles.dashboardReadyBtn}
                onPress={openGetReadySheet}
              >
                <LinearGradient
                  colors={['#2563EB', '#1D4ED8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dashboardReadyGradient}
                >
                  <View style={styles.dashboardReadyLeft}>
                    <View style={styles.dashboardReadyIconCircle}>
                      <Ionicons name="play" size={16} color="#FFFFFF" />
                    </View>
                    <View style={styles.dashboardReadyTextArea}>
                      <Text style={styles.dashboardReadyTitle} numberOfLines={1} ellipsizeMode="tail">
                        {isNepali
                          ? unicodeToAakriti(`सेट ${toNepaliNumber(selectedTestIndex + 1)} सुरु गर्नुहोस्`)
                          : `Start Series ${selectedTestIndex + 1}`}
                      </Text>
                      <Text style={styles.dashboardReadySubtitle} numberOfLines={1} ellipsizeMode="tail">
                        {isNepali
                          ? unicodeToAakriti('२० प्रश्नहरू • ४ मिनेट')
                          : '20 Questions • 4 Mins'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.dashboardReadyPill}>
                    <Text style={styles.dashboardReadyPillText}>
                      {isNepali ? unicodeToAakriti('तयार') : 'Get Ready'}
                    </Text>
                    <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                  </View>
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {/* Questions List */}
          {gameState !== 'idle' && currentQuiz.length > 0 && (
            currentQuiz.map((q, qIndex) => (
              <View
                key={`${selectedTestIndex}-${qIndex}`}
                ref={(el) => { questionRefsRef.current[qIndex] = el; }}
                onLayout={(e) => {
                  questionOffsetsRef.current[qIndex] = e.nativeEvent.layout.y;
                }}
                style={[styles.qaCard, { marginBottom: 14, marginTop: qIndex === 0 ? 0 : 0 }]}
              >
                <View style={styles.questionHeader}>
                  <View style={styles.flagBadge}>
                    <Image source={require('@/assets/images/nepal.png')} style={styles.flagIcon} resizeMode="contain" />
                  </View>
                  <View style={styles.questionBubble}>
                    <Text style={styles.questionTitle}>{isNepali ? unicodeToAakriti(q.question) : q.question}</Text>
                  </View>
                </View>
                <View style={styles.optionsContainer}>
                  {q.options.map((opt: string, idx: number) => {
                    const letters = isNepali ? ['क', 'ख', 'ग', 'घ'] : ['A', 'B', 'C', 'D'];
                    const userAns = answers[qIndex];
                    // Display text without (a)/(b)/(c)/(d) or (क)/(ख)/(ग)/(घ) prefixes
                    const displayText = String(opt).replace(/^\s*\(?[a-dA-Dक-घ]\)?[.)]?\s*/, '').trim();
                    // Base styles
                    let rowStyle: any = styles.optionRow;
                    let letterStyle: any = styles.optionLetter;
                    let letterTextStyle: any = styles.optionLetterText;
                    let optionTextStyle: any = styles.optionTextRow;
                    let checkActive = false;

                    const shouldShowReview = showResults && isReviewUnlocked;
                    if (shouldShowReview) {
                      if (userAns === q.correctAnswer) {
                        if (opt === userAns) {
                          rowStyle = [rowStyle, styles.optionRowCorrect];
                          letterStyle = [letterStyle, styles.optionLetterCorrect];
                          letterTextStyle = styles.optionLetterTextOnDark;
                          optionTextStyle = [optionTextStyle, { color: '#FFFFFF' }];
                          checkActive = true;
                        }
                      } else {
                        if (opt === q.correctAnswer) {
                          rowStyle = [rowStyle, styles.optionRowCorrect];
                          letterStyle = [letterStyle, styles.optionLetterCorrect];
                          letterTextStyle = styles.optionLetterTextOnDark;
                          optionTextStyle = [optionTextStyle, { color: '#FFFFFF' }];
                        } else {
                          rowStyle = [rowStyle, styles.optionRowIncorrect];
                          letterStyle = [letterStyle, styles.optionLetterIncorrect];
                          letterTextStyle = styles.optionLetterTextOnDark;
                          optionTextStyle = [optionTextStyle, { color: '#FFFFFF' }];
                          if (opt === userAns) checkActive = true;
                        }
                      }
                    } else if (userAns === opt) {
                      rowStyle = [rowStyle, styles.optionRowSelected];
                      letterStyle = [letterStyle, styles.optionLetterSelected];
                      letterTextStyle = styles.optionLetterTextOnDark;
                      optionTextStyle = [optionTextStyle, { color: '#FFFFFF' }];
                      checkActive = true;
                    }

                    return (
                      <Pressable
                        key={idx}
                        style={rowStyle}
                        onPress={() => handleOptionSelect(qIndex, opt)}
                        disabled={showResults}
                      >
                        <View style={letterStyle}><Text style={letterTextStyle}>{isNepali ? unicodeToAakriti(letters[idx]) : letters[idx]}</Text></View>
                        <Text style={optionTextStyle}>{isNepali ? unicodeToAakriti(displayText) : displayText}</Text>
                        <View style={[styles.optionCheck, checkActive && styles.optionCheckActive]}>
                          {checkActive && <Ionicons name="checkmark" size={14} color="#fff" />}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
                {qIndex < currentQuiz.length - 1 && <View style={styles.dottedSeparator} />}
              </View>
            ))
          )}

        </ScrollView>

        {/* Bottom action bar */}
        {gameState !== 'idle' && (showResults || answers.filter((a) => a !== null).length === currentQuiz.length) && (
          <View style={styles.bottomBar}>
            {!showResults ? (
              <Pressable
                style={[styles.bottomButton, { opacity: answers.filter((a) => a !== null).length === currentQuiz.length ? 1 : 0.5 }]}
                onPress={calculateAndShowResults}
                disabled={answers.filter((a) => a !== null).length !== currentQuiz.length}
              >
                <Text style={styles.bottomButtonText}>
                  {isNepali ? unicodeToAakriti('नतिजा हेर्नुहोस्') : 'View Score'}
                </Text>
              </Pressable>
            ) : (
              <View style={styles.resultBar}>
                <View style={styles.resultDetails}>
                  <View style={styles.resultChip}>
                    <Ionicons name="trophy-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.resultChipText}>{score}/{currentQuiz.length || TOTAL_QUESTIONS}</Text>
                  </View>
                  <View style={styles.resultChip}>
                    <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.resultChipText}>{TOTAL_TIME - timeLeft}s</Text>
                  </View>
                </View>
                <Pressable
                  style={[
                    styles.resultActionButton,
                    {
                      backgroundColor: 'transparent',
                      borderWidth: 0,
                    }
                  ]}
                  onPress={() => {
                    if (isReviewUnlocked) {
                      if (hasPassed) {
                        handleNextTest();
                      } else {
                        setShowOutcomeModal(false);
                        resetScrollToTop();
                        handleStart(selectedTestIndex);
                      }
                    } else {
                      if (isLoaded) {
                        setPendingAction('restart');
                        show();
                      } else {
                        // Fallback directly
                        setShowOutcomeModal(false);
                        resetScrollToTop();
                        handleStart(selectedTestIndex);
                      }
                    }
                  }}
                  disabled={false}
                >
                  <Text style={[styles.resultActionText, { color: theme.isDark ? '#8AB4F8' : '#1A73E8' }]}>
                    {hasPassed
                      ? (isNepali ? unicodeToAakriti('अगिल्लो परीक्षा') : 'Next Test')
                      : (isNepali ? unicodeToAakriti('पुनः प्रयास गर्नुहोस्') : 'Try Again')}
                  </Text>
                  {hasPassed && <Ionicons name="arrow-forward" size={18} color={theme.isDark ? '#8AB4F8' : '#1A73E8'} style={{ marginLeft: 6 }} />}
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* Bottom Sheet (Get ready) */}
        {showSheet && (
          <Animated.View
            style={[
              styles.sheetOverlay,
              {
                opacity: sheetTranslateY.interpolate({
                  inputRange: [0, 600],
                  outputRange: [1, 0],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={dismissSheet} />
            <Animated.View
              {...panResponder.panHandlers}
              style={[styles.sheetContainer, { transform: [{ translateY: sheetTranslateY }] }]}
              onLayout={(e) => {
                sheetHeightRef.current = e.nativeEvent.layout.height;
              }}
            >
              <View style={styles.sheetHandle} />

              {/* Sheet Header Row */}
              <View style={styles.sheetHeaderRow}>
                <View style={styles.sheetHeaderLeft}>
                  <View style={styles.sheetBadge}>
                    <Ionicons name="sparkles" size={13} color="#3B82F6" />
                    <Text style={styles.sheetBadgeText}>
                      {isNepali ? unicodeToAakriti(`नमुना सेट ${toNepaliNumber(selectedTestIndex + 1)}`) : `Test Series ${selectedTestIndex + 1}`}
                    </Text>
                  </View>
                  <Text style={styles.sheetTitle}>
                    {isNepali ? unicodeToAakriti('तयार हुनुहुन्छ?') : 'Get Ready?'}
                  </Text>
                </View>

                <View style={styles.sheetIconCircle}>
                  <Image
                    source={require('@/assets/images/exam.png')}
                    style={styles.sheetHeaderIcon}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Bento Stats Row */}
              <View style={styles.sheetStatsRow}>
                {/* Stat 1: Questions */}
                <View style={[styles.sheetStatBox, { backgroundColor: theme.isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.06)' }]}>
                  <View style={[styles.sheetStatIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <Ionicons name="document-text" size={16} color="#3B82F6" />
                  </View>
                  <Text style={styles.sheetStatValue}>
                    {isNepali ? unicodeToAakriti('२०') : '20'}
                  </Text>
                  <Text style={styles.sheetStatLabel}>
                    {isNepali ? unicodeToAakriti('प्रश्नहरू') : 'Questions'}
                  </Text>
                </View>

                {/* Stat 2: Time */}
                <View style={[styles.sheetStatBox, { backgroundColor: theme.isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.06)' }]}>
                  <View style={[styles.sheetStatIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                    <Ionicons name="time" size={16} color="#F59E0B" />
                  </View>
                  <Text style={styles.sheetStatValue}>
                    {isNepali ? unicodeToAakriti('४ मिनेट') : '4 Mins'}
                  </Text>
                  <Text style={styles.sheetStatLabel}>
                    {isNepali ? unicodeToAakriti('समय सीमा') : 'Time Limit'}
                  </Text>
                </View>

                {/* Stat 3: Pass Mark */}
                <View style={[styles.sheetStatBox, { backgroundColor: theme.isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.06)' }]}>
                  <View style={[styles.sheetStatIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Ionicons name="trophy" size={16} color="#10B981" />
                  </View>
                  <Text style={styles.sheetStatValue}>
                    {isNepali ? unicodeToAakriti('४०%') : '40%'}
                  </Text>
                  <Text style={styles.sheetStatLabel}>
                    {isNepali ? unicodeToAakriti('उत्तीर्ण लक्ष्य') : 'Pass Mark'}
                  </Text>
                </View>
              </View>

              {/* Instructions Header */}
              <Text style={styles.sheetInstructionTitle}>
                {isNepali ? unicodeToAakriti('परीक्षा निर्देशनहरू') : 'Key Instructions'}
              </Text>

              {/* Instruction Cards List */}
              <View style={styles.instructionList}>
                {/* Guideline 1 */}
                <View style={styles.instructionCard}>
                  <View style={[styles.instructionBullet, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                    <Ionicons name="timer-outline" size={15} color="#F59E0B" />
                  </View>
                  <Text style={styles.instructionItem}>
                    {isNepali
                      ? unicodeToAakriti('४ मिनेटको समय सीमा सकिनासाथ परीक्षा स्वतः सबमिट हुनेछ।')
                      : 'The quiz will automatically submit when the 4-minute timer ends.'}
                  </Text>
                </View>

                {/* Guideline 2 */}
                <View style={styles.instructionCard}>
                  <View style={[styles.instructionBullet, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <Ionicons name="checkbox-outline" size={15} color="#3B82F6" />
                  </View>
                  <Text style={styles.instructionItem}>
                    {isNepali
                      ? unicodeToAakriti('प्रत्येक प्रश्नमा ४ वटा बहुविकल्पहरू रहनेछन् (१ सही उत्तर)।')
                      : 'Each question has 4 objective multiple-choice options.'}
                  </Text>
                </View>

                {/* Guideline 3 */}
                <View style={styles.instructionCard}>
                  <View style={[styles.instructionBullet, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Ionicons name="ribbon-outline" size={15} color="#10B981" />
                  </View>
                  <Text style={styles.instructionItem}>
                    {isNepali
                      ? unicodeToAakriti('उत्तीर्ण हुन कम्तिमा ८ प्रश्न (४०% अङ्क) सही हुनुपर्छ।')
                      : 'You need at least 8 correct answers (40%) to pass the test.'}
                  </Text>
                </View>
              </View>

              {/* Glowing LinearGradient Start Button */}
              <Pressable
                style={styles.sheetStartButton}
                onPress={() => {
                  triggerHapticLight();
                  closeSheetAndStart();
                }}
              >
                <LinearGradient
                  colors={['#2563EB', '#1D4ED8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sheetStartGradient}
                >
                  <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.sheetStartButtonText}>
                    {isNepali ? unicodeToAakriti('परीक्षा सुरु गर्नुहोस्') : 'Start Exam'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}

        {/* Outcome modal */}
        {showOutcomeModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {/* Close button */}
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowOutcomeModal(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
              </Pressable>
              <View style={[styles.modalIconContainer, { backgroundColor: hasPassed ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 67, 54, 0.15)' }]}>
                <Ionicons name={hasPassed ? 'checkmark-circle' : 'close-circle'} size={56} color={hasPassed ? '#4CAF50' : '#F44336'} />
              </View>

              <Text style={styles.modalTitle}>
                {hasPassed
                  ? (isNepali ? unicodeToAakriti('बधाई छ!') : 'Congratulations!')
                  : (isNepali ? unicodeToAakriti('अझै अभ्यास गर्नुहोस्') : 'Keep Practicing')}
              </Text>

              <Text style={styles.modalSubtitle}>
                {hasPassed
                  ? (isNepali ? unicodeToAakriti('तपाईंले सफलतापूर्वक लिखित परीक्षा उत्तीर्ण गर्नुभयो।') : 'You have successfully passed the exam.')
                  : (isNepali ? unicodeToAakriti('तपाईंको प्राप्ताङ्क उत्तीर्ण अङ्कभन्दा कम छ।') : 'You scored below the passing requirement.')}
              </Text>

              <View style={styles.modalScoreCard}>
                <View style={styles.modalScoreItem}>
                  <Text style={styles.modalScoreLabel}>{isNepali ? unicodeToAakriti('प्राप्ताङ्क') : 'Score'}</Text>
                  <Text style={[styles.modalScoreValue, { color: hasPassed ? '#4CAF50' : '#F44336' }]}>
                    {isNepali ? `${toNepaliNumber(score)}/${toNepaliNumber(currentQuiz.length || TOTAL_QUESTIONS)}` : `${score}/${currentQuiz.length || TOTAL_QUESTIONS}`}
                  </Text>
                </View>
                <View style={styles.modalScoreDivider} />
                <View style={styles.modalScoreItem}>
                  <Text style={styles.modalScoreLabel}>{isNepali ? unicodeToAakriti('समय') : 'Time'}</Text>
                  <Text style={styles.modalScoreValue}>
                    {isNepali ? `${toNepaliNumber(TOTAL_TIME - timeLeft)} से.` : `${TOTAL_TIME - timeLeft}s`}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginTop: 20 }}>
                {/* Play Again / Next Test Button */}
                <Pressable
                  style={[styles.modalButton, { flex: 1, backgroundColor: '#7f8c8d' }]}
                  onPress={() => {
                    if (isReviewUnlocked) {
                      if (hasPassed) {
                        handleNextTest();
                      } else {
                        setShowOutcomeModal(false);
                        resetScrollToTop();
                        handleStart(selectedTestIndex);
                      }
                    } else {
                      if (isLoaded) {
                        setPendingAction('restart');
                        show();
                      } else {
                        // Fallback directly
                        setShowOutcomeModal(false);
                        resetScrollToTop();
                        handleStart(selectedTestIndex);
                      }
                    }
                  }}
                >
                  <Text style={styles.modalButtonText}>
                    {hasPassed
                      ? (isNepali ? unicodeToAakriti('अर्को परीक्षा') : 'Next Test')
                      : (isNepali ? unicodeToAakriti('पुनः खेल्नुहोस्') : 'Play Again')}
                  </Text>
                </Pressable>

                {/* View Result Button */}
                <Pressable
                  style={[
                    styles.modalButton,
                    {
                      flex: 1.5,
                      backgroundColor: hasPassed ? '#4CAF50' : '#F44336',
                    }
                  ]}
                  onPress={() => {
                    if (isReviewUnlocked) {
                      setShowOutcomeModal(false);
                    } else {
                      if (isLoaded) {
                        setPendingAction('review');
                        show();
                      } else {
                        setIsReviewUnlocked(true);
                        setShowOutcomeModal(false);
                      }
                    }
                  }}
                >
                  <Text style={styles.modalButtonText}>
                    {isNepali ? unicodeToAakriti('नतिजा हेर्नुहोस्') : 'View Result'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Go to Top FAB */}
        {showGoTop && (
          <Pressable
            style={[
              styles.fab,
              { bottom: (gameState !== 'idle' && (showResults || answers.filter(a => a !== null).length === currentQuiz.length)) ? 90 : 30 }
            ]}
            onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
          >
            <Ionicons name="arrow-up" size={24} color="#FFF" />
          </Pressable>
        )}
        <CustomGlassAlert
          visible={lockedAlertVisible}
          title={isNepali ? 'अनलक गरिएको छैन' : 'Locked'}
          message={isNepali ? 'यो स्तर अनलक गर्न अघिल्लो परीक्षा पूरा गर्नुहोस्।' : 'Complete the previous test to unlock this level.'}
          iconName="lock-closed"
          iconColor="#F59E0B"
          buttonColor="#22C55E"
          buttonText={isNepali ? 'ठीक छ' : 'Understood'}
          onClose={() => setLockedAlertVisible(false)}
        />
        <CustomGlassAlert
          visible={showLeaveAlert}
          title={isNepali ? 'परीक्षा छोड्न चाहनुहुन्छ?' : 'Leave Current Test?'}
          message={
            isNepali
              ? 'अर्को परीक्षामा जाँदा वा पछाडि फर्कँदा तपाईंको हालको परीक्षा समाप्त हुनेछ।'
              : 'Switching tests or leaving will end your current active test attempt.'
          }
          iconName="alert-circle"
          iconColor="#EF4444"
          buttonColor="#EF4444"
          confirmText={isNepali ? 'छोड्नुहोस्' : 'Leave'}
          cancelText={isNepali ? 'जारी राख्नुहोस्' : 'Stay'}
          onConfirm={handleConfirmLeave}
          onCancel={() => {
            setShowLeaveAlert(false);
            setPendingSwitchIndex(null);
          }}
          onClose={() => {
            setShowLeaveAlert(false);
            setPendingSwitchIndex(null);
          }}
        />
      </View>
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
      paddingHorizontal: 0,
      paddingTop: 0,
    },
    testSelector: {
      marginBottom: 6,
    },
    testSelectorContent: {
      paddingHorizontal: 20,
    },
    testCard: {
      width: 300,
      height: 90,
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      borderRadius: 16,
      marginRight: 12,
      marginTop: 20,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#eee',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: isDark ? 0 : 2,
    },
    testCardRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
    },
    testCardActive: {
      borderColor: isDark ? '#4ade80' : '#434D57',
      borderWidth: 2,
      elevation: isDark ? 0 : 3,
    },
    testCardLocked: {
      opacity: 0.6,
    },
    testIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#f0f0f0',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    testIcon: {
      width: 22,
      height: 22,
    },
    testCardTextArea: { flex: 1 },
    testTitle: {
      fontSize: isNepali ? 18 : 16,
      color: colors.text,
      fontFamily: fontBold,
    },
    testSubtitle: {
      fontSize: isNepali ? 14 : 12,
      color: '#777',
      fontFamily: fontNormal,
    },
    testArrowCircle: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#EEF1F5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    testArrowCircleActive: { backgroundColor: isDark ? '#4ade80' : '#434D57' },
    testLockBadge: { marginLeft: 8 },
    testPill: {
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 18,
      marginRight: 8,
      borderWidth: 1,
      borderColor: '#eee',
    },
    testPillRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    testPillActive: {
      backgroundColor: '#434D57',
      borderColor: '#434D57',
    },
    testPillLocked: {
      opacity: 0.5,
    },
    testPillText: {
      color: '#434D57',
    },
    testPillTextActive: {
      color: '#fff',
    },
    testPillTextLocked: {
      color: colors.textTertiary,
    },
    buttonContainer: {
      overflow: 'hidden',
      borderRadius: 20,
    },
    liquidFill: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      borderRadius: 20,
      zIndex: 0,
    },
    timerText: {
      position: 'relative',
      zIndex: 1,
      color: '#FFFFFF',
    },
    timerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      padding: 25,
      borderRadius: 12,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: isDark ? 0 : 3,
    },
    timerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    timerIconBackground: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#F0F0F0',
    },
    timerTextContainer: {
      marginRight: 10,
    },
    timerLabel: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 2,
    },
    timerSubtext: {
      fontSize: 14,
      color: colors.textTertiary,
    },
    startButton: {
      backgroundColor: '#666',
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 30,
    },
    startButtonText: {
      color: '#fff',
      fontSize: 14,
      textAlign: 'center',
    },
    scoreContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      padding: 15,
      borderRadius: 12,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: isDark ? 0 : 3,
    },
    scoreText: {
      fontSize: 16,
      color: colors.text,
    },
    questionCounter: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    qaCard: {
      //backgroundColor: isDark ? glass.backgroundColor : colors.card,
      borderRadius: 16,
      padding: 16,
      gap: 12,
      marginHorizontal: 16,
    },
    questionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    flagBadge: {
      width: 20,
      height: 0,
      alignItems: 'center',
      justifyContent: 'center',


    },
    flagIcon: { width: 90, height: 30 },
    questionBubble: {
      flex: 1,
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? 'transparent' : colors.cardBorder,
    },
    questionTitle: {
      fontSize: isNepali ? 20 : 18,
      color: isDark ? colors.text : '#434D57',
      fontFamily: fontBold,
    },
    optionsContainer: {
      gap: 10,
    },
    dottedSeparator: {
      marginTop: 12,
      height: 1,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      borderRadius: 12,
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? 'transparent' : colors.cardBorder,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    optionRowSelected: {
      backgroundColor: '#434D57',
      borderColor: '#434D57',
    },
    optionRowCorrect: {
      backgroundColor: '#4CAF50',
      borderColor: '#4CAF50',
    },
    optionRowIncorrect: {
      backgroundColor: isDark ? 'rgba(244, 67, 54, 0.3)' : '#F44336',
      borderColor: isDark ? 'rgba(244, 67, 54, 0.5)' : '#F44336',
    },
    optionLetter: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: isDark ? 'transparent' : '#FFFFFF',
      borderWidth: 2,
      borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    optionLetterSelected: { backgroundColor: '#2E3740', borderColor: '#2E3740' },
    optionLetterCorrect: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
    optionLetterIncorrect: { backgroundColor: isDark ? 'rgba(244, 67, 54, 0.6)' : '#C62828', borderColor: isDark ? 'rgba(244, 67, 54, 0.8)' : '#C62828' },
    optionLetterText: { color: '#64748B', fontWeight: isNepali ? 'normal' : '700', fontFamily: fontBold, fontSize: isNepali ? 16 : 14 },
    optionLetterTextOnDark: { color: '#FFFFFF', fontWeight: isNepali ? 'normal' : '700', fontFamily: fontBold, fontSize: isNepali ? 16 : 14 },
    optionTextRow: {
      flex: 1,
      color: isDark ? colors.text : '#434D57',
      fontFamily: fontNormal,
      fontSize: isNepali ? 19 : 14,
    },
    optionCheck: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'transparent' : colors.card,
    },
    optionCheckActive: {
      backgroundColor: '#FF6B35',
      borderColor: '#FF6B35',
    },
    gameOverContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      borderRadius: 12,
      padding: 30,
      marginBottom: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: isDark ? 0 : 3,
    },
    gameOverScore: {
      fontSize: 24,
      color: '#4CAF50',
      marginBottom: 10,
      textAlign: 'center',
    },
    gameOverTime: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 20,
      textAlign: 'center',
    },
    restartButton: {
      backgroundColor: '#FF6B35',
      paddingHorizontal: 30,
      paddingVertical: 12,
      borderRadius: 25,
    },
    restartButtonText: {
      color: '#fff',
      fontSize: 18,
    },
    bottomBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : '#ECECEC',
    },
    bottomButton: {
      backgroundColor: isDark ? 'transparent' : '#434D57',
      borderWidth: 0,
      borderColor: 'transparent',
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 10,
      alignItems: 'center',
    },
    bottomButtonText: { color: '#fff', fontSize: isNepali ? 18 : 16, fontFamily: fontBold },
    resultBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    },
    resultDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    resultChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F3F4',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 16,
      gap: 4,
    },
    resultChipText: {
      fontSize: 13,
      fontWeight: isNepali ? 'normal' : '600',
      color: colors.text,
      fontFamily: fontNormal,
    },
    resultActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    resultActionText: {
      fontSize: 14,
      fontWeight: isNepali ? 'normal' : '600',
      fontFamily: fontBold,
    },
    headerTimerCapsule: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.12)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.6)',
      marginRight: 16,
    },
    // Do not tint so the stopwatch keeps its original colors
    headerTimerIcon: { width: 20, height: 16 },
    headerTimerDivider: { width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.8)', marginHorizontal: 6 },
    headerTimerText: { color: '#fff', fontSize: 12, paddingLeft: 2, paddingRight: 2 },
    dashboardContainer: {
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      marginHorizontal: 20,
      marginTop: 20,
      padding: 16,
      borderRadius: isDark ? glass.borderRadius : 16,
      borderWidth: isDark ? glass.borderWidth : 1,
      borderColor: isDark ? glass.borderColor : '#E5E7EB',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: isDark ? 8 : 10,
      elevation: isDark ? 0 : 2,
    },
    dashboardTitle: {
      fontSize: isNepali ? 20 : 16,
      color: colors.text,
      fontFamily: fontBold,
      marginBottom: 14,
    },
    dashboardGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    dashboardCard: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : (colors.surface || '#F9FAFB'),
      borderRadius: 12,
      padding: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6',
    },
    dashboardCardIcon: {
      marginBottom: 6,
    },
    dashboardCardLabel: {
      fontSize: isNepali ? 13 : 11,
      color: colors.textSecondary,
      fontFamily: fontNormal,
      textAlign: 'center',
      marginBottom: 4,
    },
    dashboardCardValue: {
      fontSize: isNepali ? 20 : 16,
      color: colors.text,
      fontFamily: fontBold,
    },
    dashboardProgressWrapper: {
      marginTop: 16,
    },
    dashboardProgressBarTrack: {
      height: 6,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6',
      borderRadius: 3,
      overflow: 'hidden',
    },
    dashboardProgressBarFill: {
      height: '100%',
      backgroundColor: '#2E7D32',
      borderRadius: 3,
    },
    dashboardReadyBtn: {
      marginTop: 18,
      borderRadius: 14,
      overflow: 'hidden',
      shadowColor: '#2563EB',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.4 : 0.2,
      shadowRadius: 8,
      elevation: isDark ? 0 : 4,
    },
    dashboardReadyGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    dashboardReadyLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
      minWidth: 0,
    },
    dashboardReadyIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
      flexShrink: 0,
    },
    dashboardReadyTextArea: {
      flex: 1,
      justifyContent: 'center',
      minWidth: 0,
    },
    dashboardReadyTitle: {
      color: '#FFFFFF',
      fontSize: isNepali ? 16 : 14.5,
      fontWeight: isNepali ? 'normal' : '700',
      fontFamily: fontBold,
      marginBottom: 2,
    },
    dashboardReadySubtitle: {
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: isNepali ? 12 : 11,
      fontFamily: fontNormal,
    },
    dashboardReadyPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.35)',
      flexShrink: 0,
    },
    dashboardReadyPillText: {
      color: '#FFFFFF',
      fontSize: isNepali ? 13 : 11.5,
      fontWeight: isNepali ? 'normal' : '700',
      fontFamily: fontBold || fontNormal,
    },
    sheetOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)',
      justifyContent: 'flex-end',
    },
    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.25)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCard: {
      width: '85%',
      backgroundColor: isDark ? 'rgba(20,20,25,0.95)' : colors.card,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'transparent',
      borderRadius: 24,
      paddingVertical: 24,
      paddingHorizontal: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: isDark ? 0 : 10,
    },
    modalCloseButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    modalIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: isNepali ? 26 : 24,
      fontWeight: isNepali ? 'normal' : '800',
      color: colors.text,
      marginBottom: 8,
      fontFamily: fontBold,
    },
    modalSubtitle: {
      fontSize: isNepali ? 16 : 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: isNepali ? 22 : 20,
      fontFamily: fontNormal,
    },
    modalScoreCard: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F7FA',
      borderRadius: 16,
      padding: 16,
      width: '100%',
      marginBottom: 24,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
    },
    modalScoreItem: {
      flex: 1,
      alignItems: 'center',
    },
    modalScoreDivider: {
      width: 1,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
      marginHorizontal: 10,
    },
    modalScoreLabel: {
      fontSize: isNepali ? 14 : 12,
      color: colors.textSecondary,
      textTransform: isNepali ? 'none' : 'uppercase',
      letterSpacing: isNepali ? 0 : 1,
      marginBottom: 4,
      fontFamily: fontNormal,
    },
    modalScoreValue: {
      fontSize: isNepali ? 24 : 22,
      fontWeight: '800',
      color: colors.text,
    },
    modalButton: {
      width: '100%',
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    modalButtonText: {
      fontSize: isNepali ? 18 : 16,
      fontWeight: isNepali ? 'normal' : '700',
      color: '#FFFFFF',
      fontFamily: fontBold,
    },
    sheetContainer: {
      backgroundColor: isDark ? 'rgba(24, 28, 36, 0.98)' : colors.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 32,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: isDark ? 0.4 : 0.1,
      shadowRadius: 16,
      elevation: isDark ? 0 : 12,
    },
    sheetHandle: {
      alignSelf: 'center',
      width: 44,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
      marginBottom: 16,
    },
    sheetHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    sheetHeaderLeft: {
      flex: 1,
    },
    sheetBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.18)' : 'rgba(59, 130, 246, 0.1)',
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 12,
      gap: 5,
      marginBottom: 6,
    },
    sheetBadgeText: {
      fontSize: isNepali ? 13 : 11,
      color: '#3B82F6',
      fontWeight: isNepali ? 'normal' : '700',
      fontFamily: fontBold || fontNormal,
    },
    sheetTitle: {
      fontSize: isNepali ? 24 : 22,
      color: colors.text,
      fontFamily: fontBold,
      fontWeight: isNepali ? 'normal' : '800',
    },
    sheetIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetHeaderIcon: {
      width: 28,
      height: 28,
    },
    sheetStatsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 18,
    },
    sheetStatBox: {
      flex: 1,
      borderRadius: 16,
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 6,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    },
    sheetStatIconBg: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    sheetStatValue: {
      color: colors.text,
      fontSize: isNepali ? 18 : 16,
      fontWeight: isNepali ? 'normal' : '700',
      fontFamily: fontBold,
      marginBottom: 2,
    },
    sheetStatLabel: {
      color: colors.textSecondary,
      fontFamily: fontNormal,
      fontSize: isNepali ? 12 : 11,
    },
    sheetInstructionTitle: {
      fontSize: isNepali ? 16 : 14,
      color: colors.text,
      marginBottom: 10,
      fontFamily: fontBold,
      fontWeight: isNepali ? 'normal' : '700',
    },
    instructionList: {
      marginBottom: 20,
      gap: 8,
    },
    instructionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
    },
    instructionBullet: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    instructionItem: {
      flex: 1,
      color: colors.textSecondary,
      lineHeight: isNepali ? 18 : 16,
      fontFamily: fontNormal,
      fontSize: isNepali ? 13 : 12,
    },
    sheetStartButton: {
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#2563EB',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: isDark ? 0 : 4,
    },
    sheetStartGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    sheetStartButtonText: {
      color: '#FFFFFF',
      fontSize: isNepali ? 18 : 16,
      fontWeight: isNepali ? 'normal' : '700',
      fontFamily: fontBold,
      letterSpacing: 0.3,
    },
    headerBackButton: {
      padding: 8,
      marginLeft: 10,
      borderRadius: 20,
    },
    fab: {
      position: 'absolute',
      right: 20,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#FF6B35',
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: isDark ? 0 : 8,
      zIndex: 100,
    },
  });
}
