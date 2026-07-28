import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { InterstitialAd, AdEventType, TestIds } from '@/utils/mobileAds';
import { dailyquizQT } from "./dailyquizQT";
import { knowledgeQuestions as nepaliKnowledgeQuestions } from "../practiceMore/bikeKnowledge";

import type { AppTheme } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const backgroundImage = require('../../assets/images/background.jpg');

interface Question {
  question: string;
  options: [string, string, string, string];
  correctAnswer: string;
}

function toNepaliNumber(num: number | string): string {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/[0-9]/g, (d) => nepaliDigits[parseInt(d, 10)]);
}

function getOptionPrefix(index: number, isNepali: boolean): string {
  if (!isNepali) {
    return `${String.fromCharCode(65 + index)}. `;
  }
  const nepaliLetters = ['(क)', '(ख)', '(ग)', '(घ)'];
  const letter = nepaliLetters[index] || '(क)';
  return unicodeToAakriti(`${letter} `);
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const TOTAL_QUESTIONS_COUNT = Math.min(dailyquizQT.length, nepaliKnowledgeQuestions.length);

function getQuestionAtIndex(index: number, isNepali: boolean): Question {
  const englishQ = dailyquizQT[index];
  const nepaliQ = nepaliKnowledgeQuestions[index];

  if (isNepali && nepaliQ && Array.isArray(nepaliQ.options) && nepaliQ.options.length === 4) {
    const cleanNepaliOptions = nepaliQ.options.map(opt => opt.replace(/^(\([a-dक-घ]\)|[a-dक-घ]\.|\([a-d]\))\s*/i, '')) as [string, string, string, string];
    const correctIdx = englishQ ? englishQ.options.indexOf(englishQ.correctAnswer) : 0;
    const validCorrectIdx = correctIdx >= 0 && correctIdx < 4 ? correctIdx : 0;
    const correctAnswer = cleanNepaliOptions[validCorrectIdx];

    return {
      question: nepaliQ.question,
      options: shuffleArray([...cleanNepaliOptions]) as [string, string, string, string],
      correctAnswer: correctAnswer,
    };
  }

  return {
    question: englishQ?.question || "Question missing",
    options: shuffleArray([...(englishQ?.options || ["Option A", "Option B", "Option C", "Option D"])]) as [string, string, string, string],
    correctAnswer: englishQ?.correctAnswer || "Option A",
  };
}

const interstitialAdUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.select({
      ios: 'YOUR_IOS_INTERSTITIAL_AD_UNIT_ID',
      android: 'YOUR_ANDROID_INTERSTITIAL_AD_UNIT_ID',
      default: TestIds.INTERSTITIAL,
    }) || TestIds.INTERSTITIAL;

const interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

const BackgroundWrapper = React.memo(({ isDark, colors, style, children }: { isDark: boolean; colors: [string, string]; style: any; children: React.ReactNode }) => {
  if (isDark) {
    return (
      <ImageBackground source={backgroundImage} style={style} resizeMode="stretch">
        {children}
      </ImageBackground>
    );
  }
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={style}>
      {children}
    </LinearGradient>
  );
});

export default function EnhancedDailyQuizScreen() {
  const { theme } = useTheme();
  const { isNepali, fontFamily, fontFamilyBold } = useLanguage();
  const s = useMemo(() => createDailyQuizStyles(theme, isNepali), [theme, isNepali]);

  const fontStyle = isNepali ? { fontFamily: fontFamily || 'Aakriti', fontWeight: 'normal' as const } : {};
  const fontBoldStyle = isNepali ? { fontFamily: fontFamilyBold || 'AakritiBold', fontWeight: 'normal' as const } : fontStyle;

  const gradientPrimary: [string, string] = theme.isDark
    ? ['#1a1c2e', '#2d2b55']
    : ['#434D57', '#6B5B95'];
  const gradientReverse: [string, string] = theme.isDark
    ? ['#2d2b55', '#1a1c2e']
    : ['#6B5B95', '#434D57'];

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  // Animation references
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Timeout refs to prevent unmount memory leaks
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addTimeout = (fn: () => void, ms: number) => {
    const timeout = setTimeout(fn, ms);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  // Handle Ads
  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => setAdLoaded(true));
    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setAdLoaded(false);
      interstitial.load();
    });
    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, () => setAdLoaded(false));

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  // Generate a fresh set of daily questions
  const generateNewQuizSet = useCallback(async () => {
    if (TOTAL_QUESTIONS_COUNT === 0) {
      setHasError(true);
      setIsLoading(false);
      return [];
    }

    const indices = Array.from({ length: TOTAL_QUESTIONS_COUNT }, (_, i) => i);
    const shuffledIndices = shuffleArray(indices);
    const selectedIndices = shuffledIndices.slice(0, Math.min(5, TOTAL_QUESTIONS_COUNT));

    const dailySet: Question[] = selectedIndices.map(idx => getQuestionAtIndex(idx, isNepali));

    const today = new Date().toDateString();
    try {
      await AsyncStorage.setItem("dailyQuiz", JSON.stringify({ questions: dailySet, isNepali }));
      await AsyncStorage.setItem("quizDate", today);
    } catch (e) {
      console.warn("Failed to persist daily quiz cache", e);
    }

    return dailySet;
  }, [isNepali]);

  // Main loader effect
  useEffect(() => {
    let isSubscribed = true;

    const loadDailyQuiz = async () => {
      setIsLoading(true);
      setHasError(false);

      if (TOTAL_QUESTIONS_COUNT === 0) {
        if (isSubscribed) {
          setHasError(true);
          setIsLoading(false);
        }
        return;
      }

      try {
        const today = new Date().toDateString();
        const savedQuiz = await AsyncStorage.getItem("dailyQuiz");
        const savedDate = await AsyncStorage.getItem("quizDate");

        let loadedQuestions: Question[] = [];

        if (savedQuiz && savedDate === today) {
          try {
            const parsed = JSON.parse(savedQuiz);
            if (Array.isArray(parsed.questions) && parsed.questions.length > 0 && parsed.isNepali === isNepali) {
              loadedQuestions = parsed.questions;
            }
          } catch (e) {
            console.warn("Corrupted daily quiz cache, generating new one...");
          }
        }

        if (loadedQuestions.length === 0) {
          loadedQuestions = await generateNewQuizSet();
        }

        if (isSubscribed) {
          setQuestions(loadedQuestions);
          setCurrentIndex(0);
          setScore(0);
          setShowResult(false);
          setSelectedAnswer(null);
          setIsAnswered(false);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load daily quiz:", err);
        if (isSubscribed) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    addTimeout(loadDailyQuiz, 50);

    return () => {
      isSubscribed = false;
    };
  }, [generateNewQuizSet, isNepali]);

  // Handle smooth entrance animations when questions load or index changes
  useEffect(() => {
    if (!isLoading && questions.length > 0 && !showResult) {
      fadeAnim.setValue(0);
      slideAnim.setValue(0);
      scaleAnim.setValue(0.95);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, currentIndex, showResult, questions.length]);

  // Handle smooth entrance animation when result screen mounts
  useEffect(() => {
    if (showResult) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.85);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showResult]);

  // Update progress bar
  useEffect(() => {
    if (questions.length > 0) {
      const progress = (currentIndex + 1) / questions.length;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentIndex, questions.length]);

  const handleAnswer = (selectedOption: string) => {
    if (isAnswered || !questions[currentIndex]) return;

    setSelectedAnswer(selectedOption);
    setIsAnswered(true);

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    addTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        nextQuestion();
      } else {
        finishQuiz();
      }
    }, 1200);
  };

  const nextQuestion = () => {
    Animated.timing(slideAnim, {
      toValue: -SCREEN_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        slideAnim.setValue(SCREEN_WIDTH);
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);

        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });
  };

  const finishQuiz = () => {
    if (adLoaded) {
      try {
        interstitial.show();
      } catch (e) {
        console.warn('Failed to show interstitial ad:', e);
      }
    }
    setShowResult(true);
  };

  const resetQuiz = async () => {
    clearAllTimeouts();
    setIsLoading(true);
    setHasError(false);

    try {
      await AsyncStorage.removeItem("dailyQuiz");
      await AsyncStorage.removeItem("quizDate");
      const newQuestions = await generateNewQuizSet();
      setQuestions(newQuestions);
      setCurrentIndex(0);
      setScore(0);
      setShowResult(false);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsLoading(false);
    } catch (e) {
      console.error("Error resetting quiz:", e);
      setHasError(true);
      setIsLoading(false);
    }
  };

  const getOptionStyle = (option: string, index: number) => {
    if (!isAnswered) {
      if (theme.isDark) {
        return [s.optionBtn, s.optionBtnDarkNormal];
      } else {
        const hue = 220 + index * 15;
        return [s.optionBtn, { backgroundColor: `hsl(${hue}, 70%, 50%)` }];
      }
    }

    const currentQuestion = questions[currentIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    const isSelected = option === selectedAnswer;

    if (isSelected && isCorrect) {
      return [s.optionBtn, s.correctOption];
    } else if (isSelected && !isCorrect) {
      return [s.optionBtn, s.incorrectOption];
    } else if (isCorrect) {
      return [s.optionBtn, s.correctOption];
    } else {
      return [s.optionBtn, s.disabledOption];
    }
  };

  const getOptionIcon = (option: string) => {
    if (!isAnswered) return null;

    const currentQuestion = questions[currentIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) {
      return <Text style={s.correctIcon}>✓</Text>;
    }
    if (isSelected && !isCorrect) {
      return <Text style={s.incorrectIcon}>✗</Text>;
    }
    return null;
  };

  // Error view
  if (hasError) {
    return (
      <BackgroundWrapper isDark={theme.isDark} colors={gradientPrimary} style={s.container}>
        <SafeAreaView style={s.safeArea}>
          <View style={s.loadingContainer}>
            <View style={s.errorCard}>
              <Text style={s.errorEmoji}>😔</Text>
              <Text style={[s.errorTitle, fontBoldStyle]}>
                {isNepali ? unicodeToAakriti("प्रश्नोत्तरी उपलब्ध भएन") : "Oops! Quiz Unavailable"}
              </Text>
              <Text style={[s.errorText, fontStyle]}>
                {isNepali ? unicodeToAakriti("हामीले आजका प्रश्नहरू लोड गर्न सकेनौं। कृपया पुनः प्रयास गर्नुहोस्।") : "We couldn't load the questions for today. Please try again."}
              </Text>
              <TouchableOpacity style={s.retryBtn} onPress={resetQuiz} activeOpacity={0.8}>
                <Text style={[s.retryBtnText, fontBoldStyle]}>
                  {isNepali ? unicodeToAakriti("पुनः लोड गर्नुहोस्") : "Reload Quiz"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  // Loading view
  if (isLoading || questions.length === 0) {
    return (
      <BackgroundWrapper isDark={theme.isDark} colors={gradientPrimary} style={s.container}>
        <SafeAreaView style={s.safeArea}>
          <View style={s.loadingContainer}>
            <View style={s.loadingCard}>
              <Text style={s.loadingEmoji}>🧠</Text>
              <Text style={[s.loadingText, fontStyle]}>
                {isNepali ? unicodeToAakriti("तपाईंको दैनिक चुनौती तयार हुँदैछ...") : "Preparing your daily challenge..."}
              </Text>
              <View style={s.loadingDots}>
                <View style={[s.dot, s.dot1]} />
                <View style={[s.dot, s.dot2]} />
                <View style={[s.dot, s.dot3]} />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  // Results screen
  if (showResult) {
    const finalScore = score;
    const percentage = Math.round((finalScore / questions.length) * 100);

    return (
      <BackgroundWrapper isDark={theme.isDark} colors={gradientReverse} style={s.container}>
        <SafeAreaView style={s.safeArea}>
          <StatusBar barStyle="light-content" />
          <Animated.View style={[s.resultContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <View style={s.resultCard}>
              <Text style={s.resultEmoji}>{percentage >= 80 ? '🏆' : percentage >= 60 ? '🌟' : '💪'}</Text>
              <Text style={[s.resultTitle, fontBoldStyle]}>
                {isNepali ? unicodeToAakriti("प्रश्नोत्तरी समाप्त भयो!") : "Quiz Complete!"}
              </Text>
              <View style={s.scoreContainer}>
                <Text style={[s.scoreNumber, fontBoldStyle]}>
                  {isNepali ? toNepaliNumber(finalScore) : finalScore}
                </Text>
                <Text style={[s.scoreDivider, fontStyle]}>/</Text>
                <Text style={[s.scoreTotal, fontStyle]}>
                  {isNepali ? toNepaliNumber(questions.length) : questions.length}
                </Text>
              </View>
              <Text style={[s.percentageText, fontStyle]}>
                {isNepali ? unicodeToAakriti(`${toNepaliNumber(percentage)}% सही`) : `${percentage}% Correct`}
              </Text>

              <View style={s.resultProgressTrack}>
                <View style={[s.resultProgressFill, { width: `${percentage}%` }]} />
              </View>

              <Text style={[s.motivationText, fontStyle]}>
                {percentage >= 80
                  ? (isNepali ? unicodeToAakriti("उत्कृष्ट! तपाईं ज्ञानी हुनुहुन्छ!") : "Outstanding! You're a quiz master!")
                  : percentage >= 60
                    ? (isNepali ? unicodeToAakriti("स्याबास! अझै प्रयास जारी राख्नुहोस्!") : "Well done! Keep up the great work!")
                    : (isNepali ? unicodeToAakriti("अभ्यासले पोख्त बनाउँछ! पुनः प्रयास गर्नुहोस्!") : "Practice makes perfect! Try again!")}
              </Text>

              <TouchableOpacity style={s.resetBtn} onPress={resetQuiz} activeOpacity={0.8}>
                <LinearGradient
                  colors={gradientPrimary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.resetBtnGradient}
                >
                  <Text style={[s.resetBtnText, fontBoldStyle]}>
                    {isNepali ? unicodeToAakriti("🔄 नयाँ प्रश्नोत्तरी सुरु गर्नुहोस्") : "🔄 Try New Quiz"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  const currentQuestion = questions[currentIndex];

  // Active Quiz View
  return (
    <BackgroundWrapper isDark={theme.isDark} colors={gradientPrimary} style={s.container}>
      <SafeAreaView style={s.safeArea}>
        <StatusBar barStyle="light-content" />

        <View style={s.headerContainer}>
          <Text style={[s.headerTitle, fontBoldStyle]}>
            {isNepali ? unicodeToAakriti("दैनिक प्रश्नोत्तरी 🧠") : "Daily Quiz 🧠"}
          </Text>
          <Text style={[s.headerSubtitle, fontStyle]}>
            {isNepali ? unicodeToAakriti("ज्ञान परीक्षण गर्नुहोस्") : "Test Your Knowledge"}
          </Text>
        </View>

        <View style={s.progressBarContainer}>
          <Text style={[s.progressText, fontStyle]}>
            {isNepali
              ? unicodeToAakriti(`प्रश्न ${toNepaliNumber(currentIndex + 1)} ÷ ${toNepaliNumber(questions.length)}`)
              : `Question ${currentIndex + 1} of ${questions.length}`}
          </Text>
          <View style={s.progressTrack}>
            <Animated.View style={[s.progressBar, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
          </View>
        </View>

        <Animated.View
          style={[
            s.questionContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateX: slideAnim }
              ]
            }
          ]}
        >
          <View style={s.questionCard}>
            <View style={s.questionIconContainer}>
              <Image
                source={require('../../assets/images/trophy.png')}
                style={s.questionIconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={[s.questionText, fontStyle]}>
              {currentQuestion?.question ? (isNepali ? unicodeToAakriti(currentQuestion.question) : currentQuestion.question) : ""}
            </Text>
          </View>

          <View style={s.optionsContainer}>
            {currentQuestion?.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={getOptionStyle(option, index)}
                onPress={() => handleAnswer(option)}
                disabled={isAnswered}
                activeOpacity={0.8}
              >
                <Text style={[
                  s.optionText,
                  isAnswered && selectedAnswer === option && s.selectedOptionText,
                  fontStyle
                ]}>
                  {getOptionPrefix(index, isNepali)}
                  {isNepali ? unicodeToAakriti(option) : option}
                </Text>
                {getOptionIcon(option)}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

function createDailyQuizStyles(theme: AppTheme, isNepali: boolean) {
  const { isDark } = theme;
  const cardBg = isDark ? 'rgba(30, 32, 48, 0.85)' : 'rgba(255, 255, 255, 0.95)';
  const cardTextPrimary = isDark ? '#FFFFFF' : '#2c3e50';
  const cardTextSecondary = isDark ? '#B0B3B8' : '#7f8c8d';

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      paddingHorizontal: 20,
    },
    headerContainer: {
      alignItems: 'center',
      paddingTop: 15,
      paddingBottom: 20,
    },
    headerTitle: {
      fontSize: isNepali ? 32 : 28,
      fontWeight: '800',
      color: '#ffffff',
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    headerSubtitle: {
      fontSize: isNepali ? 18 : 15,
      color: 'rgba(255, 255, 255, 0.85)',
      marginTop: 4,
      fontWeight: '500',
    },
    progressBarContainer: {
      marginBottom: 20,
      paddingHorizontal: 4,
    },
    progressText: {
      fontSize: isNepali ? 18 : 15,
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 10,
      fontWeight: '600',
    },
    progressTrack: {
      height: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#38ef7d',
      borderRadius: 4,
    },
    questionContainer: {
      flex: 1,
      justifyContent: 'flex-start',
    },
    questionCard: {
      borderRadius: 18,
      padding: 20,
      marginBottom: 20,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(255, 255, 255, 0.95)',
      borderWidth: isDark ? 1 : 0,
      borderColor: 'rgba(255, 255, 255, 0.18)',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
        },
        android: {
          elevation: isDark ? 0 : 4,
        },
      }),
    },
    questionIconContainer: {
      alignItems: 'center',
      marginBottom: 12,
    },
    questionIconImage: {
      width: 44,
      height: 44,
      tintColor: isDark ? '#FFD700' : '#434D57',
    },
    questionText: {
      fontSize: isNepali ? 23 : 19,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1A202C',
      textAlign: 'center',
      lineHeight: isNepali ? 32 : 26,
    },
    optionsContainer: {
      flex: 1,
    },
    optionBtn: {
      borderRadius: 14,
      paddingVertical: 18,
      paddingHorizontal: 20,
      marginBottom: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 62,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    optionBtnDarkNormal: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    optionText: {
      fontSize: isNepali ? 24 : 18,
      color: '#ffffff',
      fontWeight: '600',
      flex: 1,
      marginRight: 10,
      lineHeight: isNepali ? 32 : 24,
    },
    selectedOptionText: {
      fontWeight: '800',
    },
    correctOption: {
      backgroundColor: '#2e7d32',
      borderWidth: 1,
      borderColor: '#4caf50',
    },
    incorrectOption: {
      backgroundColor: '#c62828',
      borderWidth: 1,
      borderColor: '#ef5350',
    },
    disabledOption: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(200, 200, 200, 0.5)',
      opacity: 0.6,
    },
    correctIcon: {
      fontSize: 18,
      color: '#ffffff',
      fontWeight: 'bold',
    },
    incorrectIcon: {
      fontSize: 18,
      color: '#ffffff',
      fontWeight: 'bold',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    loadingCard: {
      backgroundColor: cardBg,
      borderRadius: 20,
      padding: 36,
      alignItems: 'center',
      width: '100%',
      maxWidth: 340,
    },
    loadingEmoji: {
      fontSize: 48,
      marginBottom: 16,
    },
    loadingText: {
      fontSize: isNepali ? 20 : 17,
      color: cardTextPrimary,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 16,
    },
    loadingDots: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isDark ? '#9BA1A6' : '#434D57',
      marginHorizontal: 4,
    },
    dot1: { opacity: 0.4 },
    dot2: { opacity: 0.7 },
    dot3: { opacity: 1 },
    errorCard: {
      backgroundColor: cardBg,
      borderRadius: 20,
      padding: 36,
      alignItems: 'center',
      width: '100%',
      maxWidth: 340,
    },
    errorEmoji: {
      fontSize: 48,
      marginBottom: 16,
    },
    errorTitle: {
      fontSize: isNepali ? 26 : 22,
      fontWeight: '700',
      color: '#e74c3c',
      marginBottom: 12,
      textAlign: 'center',
    },
    errorText: {
      fontSize: isNepali ? 18 : 15,
      color: cardTextSecondary,
      textAlign: 'center',
      lineHeight: isNepali ? 25 : 22,
      marginBottom: 24,
    },
    retryBtn: {
      backgroundColor: isDark ? '#3b82f6' : '#2563eb',
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 28,
    },
    retryBtnText: {
      color: '#ffffff',
      fontSize: isNepali ? 18 : 16,
      fontWeight: '700',
    },
    resultContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    resultCard: {
      backgroundColor: cardBg,
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      width: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 6,
    },
    resultEmoji: {
      fontSize: 64,
      marginBottom: 16,
    },
    resultTitle: {
      fontSize: isNepali ? 30 : 26,
      fontWeight: '800',
      color: cardTextPrimary,
      marginBottom: 16,
    },
    scoreContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 8,
    },
    scoreNumber: {
      fontSize: isNepali ? 52 : 48,
      fontWeight: '800',
      color: '#38ef7d',
    },
    scoreDivider: {
      fontSize: 32,
      color: cardTextSecondary,
      marginHorizontal: 4,
    },
    scoreTotal: {
      fontSize: isNepali ? 32 : 28,
      fontWeight: '600',
      color: cardTextSecondary,
    },
    percentageText: {
      fontSize: isNepali ? 21 : 18,
      fontWeight: '700',
      color: cardTextPrimary,
      marginBottom: 20,
    },
    resultProgressTrack: {
      height: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: 5,
      width: '100%',
      overflow: 'hidden',
      marginBottom: 20,
    },
    resultProgressFill: {
      height: '100%',
      backgroundColor: '#38ef7d',
      borderRadius: 5,
    },
    motivationText: {
      fontSize: isNepali ? 19 : 16,
      color: cardTextSecondary,
      textAlign: 'center',
      lineHeight: isNepali ? 27 : 22,
      marginBottom: 28,
      fontWeight: '500',
    },
    resetBtn: {
      width: '100%',
      borderRadius: 14,
      overflow: 'hidden',
    },
    resetBtnGradient: {
      paddingVertical: 16,
      alignItems: 'center',
      borderRadius: 14,
    },
    resetBtnText: {
      color: '#ffffff',
      fontSize: isNepali ? 20 : 17,
      fontWeight: '700',
    },
  });
}