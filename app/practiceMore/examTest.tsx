import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Pressable, ScrollView, StyleSheet, Text, View, PanResponder } from 'react-native';
import { knowledgeAnswerKeyLetters, knowledgeQuestions } from './knowledge';
let SecureStore: any;
try {
  // Lazy import to avoid type errors if module types are missing during lint
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SecureStore = require('expo-secure-store');
} catch {}

export default function examTestScreen() {
  const TOTAL_TIME = 120; // seconds (2 minutes)
  const TOTAL_QUESTIONS = 20;
  const PASS_PERCENT = 40;
  const router = useRouter();
  const [selectedTestIndex, setSelectedTestIndex] = useState(0); // 0-based: Test 1..7
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [showResults, setShowResults] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<any[]>([]);
  const [unlockedTests, setUnlockedTests] = useState<number>(1); // Only Test 1 unlocked initially
  const [hasPassed, setHasPassed] = useState<boolean>(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState<boolean>(false);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [showSheet, setShowSheet] = useState(true);

  // Animations (reused from quiz screens)
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const buttonWidthAnim = useRef(new Animated.Value(100)).current;
  const liquidProgressAnim = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const lastScrollYRef = useRef(0);
  const questionOffsetsRef = useRef<number[]>([]);
  const testSelectorRef = useRef<ScrollView>(null);
  const sheetHeightRef = useRef(0);
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) sheetTranslateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100) {
          closeSheetAndStart();
        } else {
          Animated.spring(sheetTranslateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const closeSheetAndStart = () => {
    Animated.timing(sheetTranslateY, { toValue: 600, duration: 220, useNativeDriver: true }).start(() => {
      setShowSheet(false);
      handleStart();
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

  const handleStart = () => {
    const baseSet = getTestSlice(selectedTestIndex);
    // Do NOT shuffle questions or options. Keep the original order and map the correct answer from the key.
    const startIndex = selectedTestIndex * 20;
    const quiz = baseSet.map((q, idx) => {
      const globalIndex = startIndex + idx; // 0-based across all questions
      const letter = knowledgeAnswerKeyLetters[globalIndex] ?? 'a';
      const correctFromLetter = ({ a: 0, b: 1, c: 2, d: 3 } as const)[letter];
      const correctAnswerOriginal = q.options[correctFromLetter];
      const options = [...q.options];
      return { ...q, options, correctAnswer: correctAnswerOriginal };
    });

    setCurrentQuiz(quiz);
    setScore(0);
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
        const saved = await SecureStore.getItemAsync('exam_unlocked_tests');
        if (saved) setUnlockedTests(Number(saved) || 1);
      } catch {}
    })();
  }, []);

  const persistUnlocked = async (next: number) => {
    try {
      await SecureStore.setItemAsync('exam_unlocked_tests', String(next));
    } catch {}
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
    // Auto-scroll so that the next question takes the current question's position
    const nextIndex = qIndex + 1;
    const currentTop = questionOffsetsRef.current[qIndex];
    const nextTop = questionOffsetsRef.current[nextIndex];
    if (typeof currentTop === 'number' && typeof nextTop === 'number') {
      const delta = nextTop - currentTop;
      const targetY = Math.max(0, lastScrollYRef.current + delta);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: targetY, animated: true });
      });
    }
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
    liquidProgressAnim.setValue(0);
    Animated.spring(buttonWidthAnim, { toValue: 100, useNativeDriver: false, friction: 8 }).start();
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Exam Test",
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#434D57',
          },
          headerTitleStyle: {
            fontSize: 20,
            color: '#FFFFFF',
          },
          headerTintColor: '#FFFFFF',
          headerRight: () => (
            <View style={styles.headerTimerCapsule}>
              <Image source={require('../../assets/images/stopwatch.png')} style={styles.headerTimerIcon} />
              <View style={styles.headerTimerDivider} />
              <Text style={styles.headerTimerText}>{formatTime(timeLeft)}</Text>
            </View>
          ),
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
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 96 }}
          onScroll={(e) => {
            lastScrollYRef.current = e.nativeEvent.contentOffset.y;
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
            return (
              <Pressable
                key={i}
                style={[styles.testCard, isActive && styles.testCardActive, isLocked && styles.testCardLocked]}
                onPress={() => {
                  if (i >= unlockedTests) {
                    Alert.alert('Locked', 'Complete the previous test to unlock this level.');
                    return;
                  }
                  // Selecting another test should only switch the visible question set
                  if (selectedTestIndex !== i) {
                    setSelectedTestIndex(i);
                    const nextBase = getTestSlice(i);
                    const startIndex = i * 20;
                    const nextQuiz = nextBase.map((q, idx) => {
                      const letter = knowledgeAnswerKeyLetters[startIndex + idx] ?? 'a';
                      const correctFromLetter = ({ a: 0, b: 1, c: 2, d: 3 } as const)[letter];
                      return { ...q, options: [...q.options], correctAnswer: q.options[correctFromLetter] };
                    });
                    setCurrentQuiz(nextQuiz);
                    setAnswers(Array(nextQuiz.length).fill(null));
                    setShowResults(false);
                    setScore(0);
                    setTimeLeft(TOTAL_TIME);
                  }
                }}
             >
                <View style={styles.testCardRow}>
                  <View style={styles.testIconCircle}>
                    <Image source={require('../../assets/images/exam.png')} style={styles.testIcon} resizeMode="contain" />
                  </View>
                  <View style={styles.testCardTextArea}>
                    <Text style={styles.testTitle}>Test {i + 1}</Text>
                    <Text style={styles.testSubtitle}>
                      {i === 0
                        ? 'Complete this test in time to unlock test 2'
                        : isLocked
                          ? 'Complete previous test to unlock'
                          : 'You are ready to start'}
                    </Text>
                  </View>
                  <View style={[styles.testArrowCircle, isActive && styles.testArrowCircleActive]}>
                    <Ionicons name="chevron-forward" size={16} color={isActive ? '#fff' : '#9AA0A6'} />
                  </View>
                  {isLocked && <Ionicons name="lock-closed" size={14} color="#9AA0A6" style={styles.testLockBadge} />}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Timer row removed - using header timer after sheet dismiss */}

        {/* Score and Counter hidden in this flow */}

        {/* Questions List */}
        {gameState !== 'idle' && currentQuiz.length > 0 && (
            currentQuiz.map((q, qIndex) => (
              <View
                key={qIndex}
                onLayout={(e) => {
                  questionOffsetsRef.current[qIndex] = e.nativeEvent.layout.y;
                }}
                style={[styles.qaCard, { marginBottom: 14, marginTop: qIndex === 0 ? 0 : 0 }]}
              > 
                <View style={styles.questionHeader}>
                  <View style={styles.flagBadge}>
                    <Image source={require('../../assets/images/nepal.png')} style={styles.flagIcon} resizeMode="contain" />
                  </View>
                  <View style={styles.questionBubble}>
                    <Text style={styles.questionTitle}>{q.question}</Text>
                  </View>
                </View>
                <View style={styles.optionsContainer}>
                  {q.options.map((opt: string, idx: number) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const userAns = answers[qIndex];
                    // Display text without (a)/(b)/(c)/(d) prefixes
                    const displayText = String(opt).replace(/^\s*\(?[a-dA-D]\)?[.)]?\s*/,'').trim();
                    // Base styles
                    let rowStyle: any = styles.optionRow;
                    let letterStyle: any = styles.optionLetter;
                    let letterTextStyle: any = styles.optionLetterText;
                    let optionTextStyle: any = styles.optionTextRow;
                    let checkActive = false;

                    if (showResults) {
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
                        <View style={letterStyle}><Text style={letterTextStyle}>{letters[idx]}</Text></View>
                        <Text style={optionTextStyle}>{displayText}</Text>
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
        {gameState !== 'idle' && (
          <View style={styles.bottomBar}>
            {!showResults ? (
              <Pressable
                style={[styles.bottomButton, { opacity: answers.filter((a) => a !== null).length === currentQuiz.length ? 1 : 0.5 }]}
                onPress={calculateAndShowResults}
                disabled={answers.filter((a) => a !== null).length !== currentQuiz.length}
              >
                <Text style={styles.bottomButtonText}>View Score</Text>
              </Pressable>
            ) : (
              <View style={styles.resultBar}>
                <View style={styles.resultCapsule}>
                  <Text style={styles.resultText}>Score: {score}/{currentQuiz.length || TOTAL_QUESTIONS}</Text>
                  <Text style={styles.resultDivider}>•</Text>
                  <Text style={styles.resultText}>Time: {TOTAL_TIME - timeLeft}s</Text>
                </View>
                <Pressable
                  style={[styles.bottomButton, { opacity: hasPassed ? 1 : 0.5 }]}
                  onPress={() => {
                    if (!hasPassed) return;
                    const next = selectedTestIndex + 1;
                    const totalTests = Math.ceil(knowledgeQuestions.length / 20);
                    if (next >= totalTests) return;
                    // unlock next and navigate
                    const nextCount = Math.max(unlockedTests, next + 1);
                    setUnlockedTests(nextCount);
                    persistUnlocked(nextCount);
                    // Slide to the newly unlocked test card
                    setTimeout(() => {
                      const CARD_W = 300;
                      const GAP = 12;
                      const PADDING = 20;
                      const x = Math.max(0, next * (CARD_W + GAP) - PADDING);
                      testSelectorRef.current?.scrollTo({ x, y: 0, animated: true });
                    }, 50);
                    setSelectedTestIndex(next);
                    // start next test immediately with reset timer
                    setShowSheet(false);
                    setScore(0);
                    setTimeLeft(TOTAL_TIME);
                    setShowResults(false);
                    setAnswers([]);
                    // Delay to ensure state update before generating quiz for next test
                    setTimeout(() => handleStart(), 0);
                  }}
                  disabled={!hasPassed}
                >
                  <Text style={styles.bottomButtonText}>Next Test</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* Bottom Sheet (Get ready) */}
        {showSheet && (
          <Animated.View
            style={[styles.sheetOverlay, { opacity: sheetTranslateY.interpolate({ inputRange: [0, 300], outputRange: [1, 0.5] }) }]}
          >
            <Animated.View
              {...panResponder.panHandlers}
              style={[styles.sheetContainer, { transform: [{ translateY: sheetTranslateY }] }]}
              onLayout={(e) => {
                sheetHeightRef.current = e.nativeEvent.layout.height;
              }}
            >
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Get ready?</Text>
              <Text style={styles.sheetSubtitle}>#test series {selectedTestIndex + 1}</Text>
              <View style={styles.sheetStatsRow}>
                <View style={styles.sheetStatBox}><Text style={styles.sheetStatLabel}>Questions</Text><Text style={styles.sheetStatValue}>20</Text></View>
                <View style={styles.sheetStatBox}><Text style={styles.sheetStatLabel}>Choices</Text><Text style={styles.sheetStatValue}>4</Text></View>
                <View style={styles.sheetStatBox}><Text style={styles.sheetStatLabel}>Marks</Text><Text style={styles.sheetStatValue}>1</Text></View>
              </View>
              <Text style={styles.sheetInstructionTitle}>Instruction</Text>
              <View style={styles.instructionList}>
                <Text style={styles.instructionItem}>• The quiz has a 2-minute time limit.</Text>
                <Text style={styles.instructionItem}>• There are 20 objective questions.</Text>
                <Text style={styles.instructionItem}>• You need 60% to pass.</Text>
                <Text style={styles.instructionItem}>• Questions cover driving, vehicle laws, mechanics, pollution, accidents, and traffic signals.</Text>
              </View>
              <Pressable style={styles.sheetStartButton} onPress={() => closeSheetAndStart()}>
                <Text style={styles.sheetStartButtonText}>Start</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}

        {/* Outcome modal */}
        {showOutcomeModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={[styles.modalTitle, { color: hasPassed ? '#2E7D32' : '#C62828' }]}>
                {hasPassed ? 'Passed!' : 'Failed'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {hasPassed ? 'you have successfully scored above 40%' : 'you have scored below 60%'}
              </Text>
              <View style={styles.modalButtonsRow}>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={() => {
                    // Dismiss modal so user can review correct/incorrect answers
                    setShowOutcomeModal(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Okay</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  testCardRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  testCardActive: {
    borderColor: '#434D57',
    elevation: 3,
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
    fontSize: 16,
    color: '#333',
  },
  testSubtitle: {
    fontSize: 12,
    color: '#777',
  },
  testArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EEF1F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testArrowCircleActive: { backgroundColor: '#434D57' },
  testLockBadge: { marginLeft: 8 },
  testPill: {
    backgroundColor: '#fff',
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
    color: '#999',
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
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    color: '#333',
    marginBottom: 2,
  },
  timerSubtext: {
    fontSize: 14,
    color: '#999',
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
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreText: {
    fontSize: 16,
    color: '#333',
  },
  questionCounter: {
    fontSize: 14,
    color: '#666',
  },
  qaCard: {
    //backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
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
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  questionTitle: {
    fontSize: 18,
    color: '#333',
  },
  optionsContainer: {
    gap: 10,
  },
  dottedSeparator: {
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  optionLetterSelected: { backgroundColor: '#2E3740', borderColor: '#2E3740' },
  optionLetterCorrect: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  optionLetterIncorrect: { backgroundColor: '#C62828', borderColor: '#C62828' },
  optionLetterText: { color: '#64748B', fontWeight: '700' },
  optionLetterTextOnDark: { color: '#FFFFFF', fontWeight: '700' },
  optionTextRow: {
    flex: 1,
    color: '#333',
  },
  optionCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  optionCheckActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gameOverScore: {
    fontSize: 24,
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },
  gameOverTime: {
    fontSize: 16,
    color: '#666',
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
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#ECECEC',
  },
  bottomButton: {
    backgroundColor: '#434D57',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  bottomButtonText: { color: '#fff', fontSize: 16 },
  resultCapsule: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  resultBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultText: { color: '#333' },
  resultDivider: { color: '#999', marginHorizontal: 6 },
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
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '78%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalSubtitle: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 12 },
  modalButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  modalButtonSecondary: {},
  modalButtonPrimary: {},
  modalButtonDisabled: { opacity: 0.5 },
  modalButtonText: { fontSize: 14, color: '#333' },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00000020',
    marginBottom: 10,
  },
  sheetTitle: { fontSize: 22, color: '#333', marginBottom: 4 },
  sheetSubtitle: { fontSize: 14, color: '#888', marginBottom: 12 },
  sheetStatsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  sheetStatBox: { flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 12, alignItems: 'center', paddingVertical: 12 },
  sheetStatLabel: { color: '#777', marginBottom: 4 },
  sheetStatValue: { color: '#333', fontSize: 20 },
  sheetInstructionTitle: { fontSize: 16, color: '#333', marginBottom: 8 },
  sheetStartButton: { backgroundColor: '#434D57', paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
  sheetStartButtonText: { color: '#fff', fontSize: 16 },
  instructionList: { marginBottom: 16 },
  instructionItem: { color: '#555', marginBottom: 6, lineHeight: 20 },
  headerBackButton: {
    padding: 8,
    marginLeft: 10,
    borderRadius: 20,
  },
});