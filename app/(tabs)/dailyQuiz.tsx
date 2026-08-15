import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { RewardedInterstitialAd, AdEventType, AD_UNITS } from '@/utils/mobileAds';
import { dailyquizQT } from "./dailyquizQT";
import { knowledgeQuestions as nepaliKnowledgeQuestions } from "../practiceMore/bikeKnowledge";

import type { AppTheme } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useHaptics } from '@/context/HapticsContext';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';
import QuestionSpeechButton from '@/components/QuestionSpeechButton';

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

function getOptionBadgeLetter(index: number, isNepali: boolean): string {
  if (!isNepali) {
    return String.fromCharCode(65 + index);
  }
  const nepaliLetters = ['क', 'ख', 'ग', 'घ'];
  const letter = nepaliLetters[index] || 'क';
  return unicodeToAakriti(letter);
}

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

const interstitialAdUnitId = AD_UNITS.REWARDED_INTERSTITIAL;
const interstitial = RewardedInterstitialAd.createForAdRequest(interstitialAdUnitId, {
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

export default function GamifiedDailyQuizScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isNepali, fontFamily, fontFamilyBold } = useLanguage();
  const { triggerImpact, triggerNotification } = useHaptics();
  const s = useMemo(() => createDailyQuizStyles(theme, isNepali), [theme, isNepali]);

  const fontStyle = isNepali ? { fontFamily: fontFamily || 'Aakriti', fontWeight: 'normal' as const } : {};
  const fontBoldStyle = isNepali ? { fontFamily: fontFamilyBold || 'AakritiBold', fontWeight: 'normal' as const } : fontStyle;

  const gradientPrimary: [string, string] = theme.isDark
    ? ['#0B0E14', '#141821']
    : ['#434D57', '#6B5B95'];
  const gradientReverse: [string, string] = theme.isDark
    ? ['#141821', '#0B0E14']
    : ['#6B5B95', '#434D57'];

  // State
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [userXP, setUserXP] = useState(450);
  const [userStreak, setUserStreak] = useState(5);
  const [userName, setUserName] = useState('Prashant');

  // Realtime Countdown
  const [timeLeft, setTimeLeft] = useState<{ hours: string; mins: string; secs: string }>({
    hours: '12',
    mins: '45',
    secs: '30',
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseBtnAnim = useRef(new Animated.Value(1)).current;

  // Timeout refs
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

  // Pulsing animation for Hero Join Button
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseBtnAnim, {
          toValue: 1.04,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseBtnAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, []);

  // Countdown timer to midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diffMs / (1000 * 60)) % 60);
      const secs = Math.floor((diffMs / 1000) % 60);

      setTimeLeft({
        hours: hours < 10 ? `0${hours}` : `${hours}`,
        mins: mins < 10 ? `0${mins}` : `${mins}`,
        secs: secs < 10 ? `0${secs}` : `${secs}`,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load User Stats & Ads
  useEffect(() => {
    AsyncStorage.getItem('user_name').then((name) => {
      if (name) setUserName(name);
    }).catch(() => {});

    AsyncStorage.getItem('@user_xp').then((val) => {
      if (val) setUserXP(parseInt(val, 10));
    }).catch(() => {});

    AsyncStorage.getItem('@user_streak').then((val) => {
      if (val) setUserStreak(parseInt(val, 10));
    }).catch(() => {});

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

  // Generate quiz set
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

    return dailySet;
  }, [isNepali]);

  // Start Gameplay
  const handleStartDailyQuiz = async () => {
    triggerImpact();
    setIsLoading(true);
    const newQuestions = await generateNewQuizSet();
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsLoading(false);
    setIsQuizActive(true);
  };

  // Answer handler
  const handleAnswer = (selectedOption: string) => {
    if (isAnswered || !questions[currentIndex]) return;

    setSelectedAnswer(selectedOption);
    setIsAnswered(true);

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    if (isCorrect) {
      triggerImpact();
      setScore(prev => prev + 1);
    } else {
      triggerNotification();
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
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 200, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      }
    });
  };

  const finishQuiz = () => {
    triggerNotification();
    const newXP = userXP + 100;
    setUserXP(newXP);
    AsyncStorage.setItem('@user_xp', String(newXP)).catch(() => {});

    if (adLoaded) {
      try { interstitial.show(); } catch (e) {}
    }
    setShowResult(true);
  };

  // Progress Bar Animation
  useEffect(() => {
    if (isQuizActive && questions.length > 0) {
      const progress = (currentIndex + 1) / questions.length;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentIndex, questions.length, isQuizActive]);

  // Entrance Fade & Scale for active question
  useEffect(() => {
    if (isQuizActive && !isLoading && questions.length > 0 && !showResult) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [isQuizActive, isLoading, currentIndex, showResult, questions.length]);

  const getOptionStyle = (option: string, index: number) => {
    if (!isAnswered) {
      return [s.optionBtn, s.optionBtnDarkNormal];
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

  // ─── 1. QUIZ RESULTS VIEW ──────────────────────────────────────────
  if (showResult) {
    const finalScore = score;
    const percentage = Math.round((finalScore / questions.length) * 100);

    return (
      <BackgroundWrapper isDark={theme.isDark} colors={gradientReverse} style={s.container}>
        <SafeAreaView style={s.safeArea}>
          <StatusBar barStyle="light-content" />
          <View style={s.resultContainer}>
            <View style={s.resultCard}>
              <Text style={s.resultEmoji}>{percentage >= 80 ? '🏆' : percentage >= 60 ? '🌟' : '💪'}</Text>
              <Text style={[s.resultTitle, fontBoldStyle]}>
                {isNepali ? unicodeToAakriti("दैनिक प्रश्नोत्तरी पूरा भयो!") : "Daily Challenge Complete!"}
              </Text>
              <Text style={s.xpEarnedBadge}>+100 XP EARNED! 🪙</Text>

              <View style={s.scoreContainer}>
                <Text style={[s.scoreNumber, fontBoldStyle]}>
                  {isNepali ? toNepaliNumber(finalScore) : finalScore}
                </Text>
                <Text style={[s.scoreDivider, fontStyle]}>/</Text>
                <Text style={[s.scoreTotal, fontStyle]}>
                  {isNepali ? toNepaliNumber(questions.length) : questions.length}
                </Text>
              </View>

              <TouchableOpacity
                style={s.heroJoinBtn}
                onPress={() => {
                  triggerImpact();
                  setIsQuizActive(false);
                  setShowResult(false);
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#22C55E', '#16A34A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.heroBtnGradient}
                >
                  <Ionicons name="trophy" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={[s.heroBtnText, fontBoldStyle]}>
                    {isNepali ? unicodeToAakriti("एरेनामा फर्कनुहोस्") : "Return to Quiz Arena"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  // ─── 2. ACTIVE QUIZ GAMEPLAY VIEW ──────────────────────────────────
  if (isQuizActive && questions.length > 0) {
    const currentQuestion = questions[currentIndex];

    return (
      <BackgroundWrapper isDark={theme.isDark} colors={gradientPrimary} style={s.container}>
        <SafeAreaView style={s.safeArea}>
          <StatusBar barStyle="light-content" />

          {/* Active Quiz Header */}
          <View style={s.activeHeaderRow}>
            <TouchableOpacity
              style={s.backCircleBtn}
              onPress={() => {
                triggerImpact();
                setIsQuizActive(false);
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={s.activeTitleContainer}>
              <Text style={[s.activeHeaderTitle, fontBoldStyle]}>
                {isNepali ? unicodeToAakriti("दैनिक चुनौती 🧠") : "Daily Quiz Challenge"}
              </Text>
            </View>
            <View style={s.xpBadgeTop}>
              <Text style={s.xpBadgeText}>🪙 {userXP} XP</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={s.progressBarContainer}>
            <View style={s.progressHeaderRow}>
              <View style={s.progressPillBadge}>
                <Text style={[s.progressPillText, fontBoldStyle]}>
                  {isNepali
                    ? unicodeToAakriti(`प्रश्न ${toNepaliNumber(currentIndex + 1)} ÷ ${toNepaliNumber(questions.length)}`)
                    : `Question ${currentIndex + 1} of ${questions.length}`}
                </Text>
              </View>
            </View>
            <View style={s.progressTrack}>
              <Animated.View style={[s.progressBar, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
            </View>
          </View>

          {/* Question Card */}
          <Animated.View style={[s.questionContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <View style={s.questionCard}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <QuestionSpeechButton
                  rawNepaliText={currentQuestion?.question || ''}
                  englishText={currentQuestion?.question || ''}
                />
                <Text style={[s.questionText, fontBoldStyle, { flex: 1, textAlign: 'left' }]}>
                  {currentQuestion?.question ? (isNepali ? unicodeToAakriti(currentQuestion.question) : currentQuestion.question) : ""}
                </Text>
              </View>
            </View>

            <View style={s.optionsContainer}>
              {currentQuestion?.options?.map((option, index) => {
                const isSelected = option === selectedAnswer;
                const isCorrect = option === currentQuestion?.correctAnswer;
                return (
                  <TouchableOpacity
                    key={index}
                    style={getOptionStyle(option, index)}
                    onPress={() => handleAnswer(option)}
                    disabled={isAnswered}
                    activeOpacity={0.85}
                  >
                    <View style={[
                      s.optionBadge,
                      isAnswered && isCorrect && s.optionBadgeCorrect,
                      isAnswered && isSelected && !isCorrect && s.optionBadgeIncorrect,
                    ]}>
                      <Text style={[s.optionBadgeText, fontBoldStyle]}>
                        {getOptionBadgeLetter(index, isNepali)}
                      </Text>
                    </View>
                    <Text style={[s.optionText, fontStyle]}>
                      {isNepali ? unicodeToAakriti(option) : option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  // ─── 3. GAMIFIED LANDING QUIZ ARENA HUB ─────────────────────────────
  return (
    <BackgroundWrapper isDark={theme.isDark} colors={gradientPrimary} style={s.container}>
      <SafeAreaView style={s.safeArea}>
        <StatusBar barStyle="light-content" />

        <ScrollView style={s.hubScrollView} showsVerticalScrollIndicator={false}>
          {/* Top Bar Header (XP & Streaks) */}
          <View style={s.topBarRow}>
            <View style={s.userWelcomeBox}>
              <Text style={s.welcomeTag}>WELCOME BACK!</Text>
              <Text style={s.userTitleName}>{userName}</Text>
            </View>
            <View style={s.statsRowRight}>
              <View style={s.statBadgeItem}>
                <Text style={s.statBadgeText}>🪙 {userXP} XP</Text>
              </View>
              <View style={s.statBadgeItemFlame}>
                <Text style={s.statBadgeTextFlame}>⚡ {userStreak} Days</Text>
              </View>
            </View>
          </View>

          {/* Daily Challenge Hero Banner */}
          <View style={s.heroCardContainer}>
            <View style={s.heroHeaderRow}>
              <View>
                <Text style={s.heroBadgeTag}>🔥 DAILY LIVE ARENA</Text>
                <Text style={[s.heroTitleText, fontBoldStyle]}>
                  {isNepali ? unicodeToAakriti("दैनिक सवारी ज्ञान परीक्षा") : "Daily Driving Challenge"}
                </Text>
              </View>
            </View>

            {/* Countdown Circular Ring */}
            <View style={s.countdownRingContainer}>
              <View style={s.countdownRingBg}>
                <Text style={s.countdownNumber}>{timeLeft.hours}:{timeLeft.mins}:{timeLeft.secs}</Text>
                <Text style={s.countdownSubLabel}>REMAINING UNTIL RESET</Text>
              </View>
            </View>

            <View style={s.heroMetaRow}>
              <View style={s.heroMetaItem}>
                <Ionicons name="people" size={16} color="#22C55E" />
                <Text style={s.heroMetaText}>1,292 Playing Today</Text>
              </View>
              <View style={s.heroMetaItem}>
                <Ionicons name="ribbon" size={16} color="#F59E0B" />
                <Text style={s.heroMetaText}>Prize: +100 XP</Text>
              </View>
            </View>

            {/* Pulsing CTA Join Button */}
            <Animated.View style={{ transform: [{ scale: pulseBtnAnim }] }}>
              <TouchableOpacity
                style={s.heroJoinBtn}
                onPress={handleStartDailyQuiz}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#22C55E', '#16A34A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.heroBtnGradient}
                >
                  <Ionicons name="play" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={[s.heroBtnText, fontBoldStyle]}>
                    {isNepali ? unicodeToAakriti("आजको प्रश्नोत्तरी सुरु गर्नुहोस्") : "Join Daily Challenge"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Category Quiz Arenas Grid */}
          <Text style={[s.sectionTitleLabel, fontBoldStyle]}>
            {isNepali ? unicodeToAakriti("प्रश्नोत्तरी एरेना") : "Quiz Arenas"}
          </Text>

          <View style={s.arenaGrid}>
            <TouchableOpacity
              style={s.arenaCard}
              onPress={() => {
                triggerImpact();
                router.push('/quiz/signTest');
              }}
              activeOpacity={0.8}
            >
              <View style={[s.arenaIconBadge, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Ionicons name="warning" size={24} color="#EF4444" />
              </View>

              <Text style={s.arenaCardTitle}>Sign Test</Text>
              <Text style={s.arenaCardSub}>Traffic Signals</Text>
              <View style={s.arenaLiveRow}>
                <Ionicons name="person" size={12} color="#94A3B8" />
                <Text style={s.arenaLiveText}>650 playing</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.arenaCard}
              onPress={() => {
                triggerImpact();
                router.push('/quiz/eyeTest');
              }}
              activeOpacity={0.8}
            >
              <View style={[s.arenaIconBadge, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="eye" size={24} color="#3B82F6" />
              </View>

              <Text style={s.arenaCardTitle}>Eye Test</Text>
              <Text style={s.arenaCardSub}>Numbers Pattern</Text>
              <View style={s.arenaLiveRow}>
                <Ionicons name="person" size={12} color="#94A3B8" />
                <Text style={s.arenaLiveText}>420 playing</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.arenaCard}
              onPress={() => {
                triggerImpact();
                router.push('/chooseCategory/fourWheeler');
              }}
              activeOpacity={0.8}
            >
              <View style={[s.arenaIconBadge, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                <Ionicons name="car" size={24} color="#A855F7" />
              </View>

              <Text style={s.arenaCardTitle}>Category A/B</Text>
              <Text style={s.arenaCardSub}>Driving Rules</Text>
              <View style={s.arenaLiveRow}>
                <Ionicons name="person" size={12} color="#94A3B8" />
                <Text style={s.arenaLiveText}>890 playing</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.arenaCard}
              onPress={handleStartDailyQuiz}
              activeOpacity={0.8}
            >
              <View style={[s.arenaIconBadge, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                <Ionicons name="flash" size={24} color="#22C55E" />
              </View>

              <Text style={s.arenaCardTitle}>Speed Challenge</Text>
              <Text style={s.arenaCardSub}>5 Quick Qs</Text>
              <View style={s.arenaLiveRow}>
                <Ionicons name="person" size={12} color="#94A3B8" />
                <Text style={s.arenaLiveText}>310 playing</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* 3D Daily Leaderboard Podium */}
          <Text style={[s.sectionTitleLabel, fontBoldStyle]}>
            {isNepali ? unicodeToAakriti("शीर्ष स्थान लिडरबोर्ड 🏆") : "Daily Leaderboard 🏆"}
          </Text>

          <View style={s.podiumCardContainer}>
            <View style={s.podiumRow}>
              {/* 2nd Place */}
              <View style={s.podiumColumn}>
                <Image source={require('../../assets/images/profile.png')} style={s.podiumAvatar} />
                <View style={s.podiumBadgeSilver}>
                  <Text style={s.podiumRankText}>2</Text>
                </View>
                <Text style={s.podiumName}>Nick G.</Text>
                <Text style={s.podiumScore}>3,000 XP</Text>
                <View style={s.podiumBar2} />
              </View>

              {/* 1st Place */}
              <View style={s.podiumColumn}>
                <View style={s.crownContainer}>
                  <Ionicons name="trophy" size={22} color="#FFD700" />
                </View>
                <Image source={require('../../assets/images/profile.png')} style={[s.podiumAvatar, s.podiumAvatarGold]} />
                <View style={s.podiumBadgeGold}>
                  <Text style={s.podiumRankText}>1</Text>
                </View>
                <Text style={[s.podiumName, { fontWeight: '700' }]}>Maria P.</Text>
                <Text style={[s.podiumScore, { color: '#4ADE80' }]}>5,000 XP</Text>
                <View style={s.podiumBar1} />
              </View>

              {/* 3rd Place */}
              <View style={s.podiumColumn}>
                <Image source={require('../../assets/images/profile.png')} style={s.podiumAvatar} />
                <View style={s.podiumBadgeBronze}>
                  <Text style={s.podiumRankText}>3</Text>
                </View>
                <Text style={s.podiumName}>Joanne A.</Text>
                <Text style={s.podiumScore}>2,000 XP</Text>
                <View style={s.podiumBar3} />
              </View>
            </View>

            {/* Your Live Rank Card */}
            <View style={s.yourRankRow}>
              <Image source={require('../../assets/images/profile.png')} style={s.yourRankAvatar} />
              <View style={s.yourRankInfo}>
                <Text style={s.yourRankName}>{userName} (You)</Text>
                <Text style={s.yourRankSub}>Streak: {userStreak} Days</Text>
              </View>
              <View style={s.yourRankPill}>
                <Text style={s.yourRankScore}>{userXP} XP</Text>
                <Text style={s.yourRankNum}>#14</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

function createDailyQuizStyles(theme: AppTheme, isNepali: boolean) {
  const { isDark } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    hubScrollView: {
      flex: 1,
      paddingHorizontal: 16,
    },
    topBarRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      marginBottom: 10,
    },
    userWelcomeBox: {
      flex: 1,
    },
    welcomeTag: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: '#94A3B8',
    },
    userTitleName: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    statsRowRight: {
      flexDirection: 'row',
      gap: 8,
    },
    statBadgeItem: {
      backgroundColor: 'rgba(34, 197, 94, 0.15)',
      borderColor: 'rgba(34, 197, 94, 0.3)',
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    statBadgeText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#4ADE80',
    },
    statBadgeItemFlame: {
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    statBadgeTextFlame: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FBBF24',
    },
    heroCardContainer: {
      backgroundColor: 'rgba(20, 24, 33, 0.95)',
      borderRadius: 24,
      padding: 20,
      borderWidth: 1.5,
      borderColor: 'rgba(34, 197, 94, 0.25)',
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 10,
    },
    heroHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    heroBadgeTag: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.2,
      color: '#22C55E',
      marginBottom: 4,
    },
    heroTitleText: {
      fontSize: 22,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    countdownRingContainer: {
      alignItems: 'center',
      marginVertical: 14,
    },
    countdownRingBg: {
      width: 160,
      height: 160,
      borderRadius: 80,
      borderWidth: 6,
      borderColor: '#22C55E',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(34, 197, 94, 0.06)',
      shadowColor: '#22C55E',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
    },
    countdownNumber: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 1,
    },
    countdownSubLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: '#94A3B8',
      marginTop: 4,
      letterSpacing: 0.5,
    },
    heroMetaRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: 12,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    heroMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    heroMetaText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#CBD5E1',
    },
    heroJoinBtn: {
      marginTop: 8,
      borderRadius: 16,
      overflow: 'hidden',
    },
    heroBtnGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 15,
      borderRadius: 16,
    },
    heroBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    sectionTitleLabel: {
      fontSize: 18,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 12,
      marginTop: 4,
    },
    arenaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    },
    arenaCard: {
      width: (SCREEN_WIDTH - 44) / 2,
      backgroundColor: 'rgba(20, 24, 33, 0.95)',
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    arenaIconBadge: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    arenaCardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    arenaCardSub: {
      fontSize: 12,
      color: '#94A3B8',
      marginTop: 2,
      marginBottom: 10,
    },
    arenaLiveRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    arenaLiveText: {
      fontSize: 11,
      color: '#94A3B8',
      fontWeight: '500',
    },
    podiumCardContainer: {
      backgroundColor: 'rgba(20, 24, 33, 0.95)',
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    podiumRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      height: 180,
      marginBottom: 16,
    },
    podiumColumn: {
      alignItems: 'center',
      flex: 1,
    },
    crownContainer: {
      marginBottom: -4,
    },
    podiumAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 2,
      borderColor: '#94A3B8',
    },
    podiumAvatarGold: {
      width: 52,
      height: 52,
      borderRadius: 26,
      borderColor: '#FFD700',
    },
    podiumBadgeGold: {
      backgroundColor: '#FFD700',
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -10,
    },
    podiumBadgeSilver: {
      backgroundColor: '#94A3B8',
      width: 18,
      height: 18,
      borderRadius: 9,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -9,
    },
    podiumBadgeBronze: {
      backgroundColor: '#CD7F32',
      width: 18,
      height: 18,
      borderRadius: 9,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -9,
    },
    podiumRankText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#000000',
    },
    podiumName: {
      fontSize: 12,
      color: '#FFFFFF',
      marginTop: 4,
    },
    podiumScore: {
      fontSize: 11,
      color: '#94A3B8',
      marginBottom: 6,
    },
    podiumBar1: {
      width: '80%',
      height: 70,
      backgroundColor: 'rgba(34, 197, 94, 0.25)',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(34, 197, 94, 0.4)',
    },
    podiumBar2: {
      width: '80%',
      height: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    podiumBar3: {
      width: '80%',
      height: 35,
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    yourRankRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(34, 197, 94, 0.16)',
      borderColor: 'rgba(34, 197, 94, 0.35)',
      borderWidth: 1.5,
      borderRadius: 16,
      padding: 12,
    },
    yourRankAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 10,
    },
    yourRankInfo: {
      flex: 1,
    },
    yourRankName: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    yourRankSub: {
      fontSize: 11,
      color: '#4ADE80',
    },
    yourRankPill: {
      alignItems: 'flex-end',
    },
    yourRankScore: {
      fontSize: 13,
      fontWeight: '700',
      color: '#4ADE80',
    },
    yourRankNum: {
      fontSize: 11,
      color: '#94A3B8',
    },

    // Active Gameplay Styles
    activeHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    backCircleBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    activeTitleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    activeHeaderTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    xpBadgeTop: {
      backgroundColor: 'rgba(34, 197, 94, 0.18)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    xpBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#4ADE80',
    },
    progressBarContainer: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    progressHeaderRow: {
      alignItems: 'center',
      marginBottom: 8,
    },
    progressPillBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderRadius: 12,
    },
    progressPillText: {
      fontSize: 13,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    progressTrack: {
      height: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#22C55E',
      borderRadius: 3,
    },
    questionContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    questionCard: {
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      backgroundColor: 'rgba(20, 24, 33, 0.95)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    questionText: {
      fontSize: isNepali ? 22 : 18,
      fontWeight: '700',
      color: '#FFFFFF',
      textAlign: 'center',
      lineHeight: isNepali ? 32 : 24,
    },
    optionsContainer: {
      flex: 1,
    },
    optionBtn: {
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 14,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 58,
    },
    optionBtnDarkNormal: {
      backgroundColor: 'rgba(20, 24, 33, 0.95)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    correctOption: {
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      borderWidth: 1.5,
      borderColor: '#22C55E',
    },
    incorrectOption: {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      borderWidth: 1.5,
      borderColor: '#EF4444',
    },
    disabledOption: {
      backgroundColor: 'rgba(20, 24, 33, 0.5)',
      borderWidth: 1,
      borderColor: 'transparent',
      opacity: 0.5,
    },
    optionBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    optionBadgeCorrect: {
      backgroundColor: '#22C55E',
    },
    optionBadgeIncorrect: {
      backgroundColor: '#EF4444',
    },
    optionBadgeText: {
      fontSize: 14,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    optionText: {
      flex: 1,
      fontSize: isNepali ? 18 : 14,
      color: '#FFFFFF',
    },

    // Results View
    resultContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    resultCard: {
      width: '100%',
      backgroundColor: 'rgba(20, 24, 33, 0.95)',
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    resultEmoji: {
      fontSize: 48,
      marginBottom: 10,
    },
    resultTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    xpEarnedBadge: {
      fontSize: 13,
      fontWeight: '800',
      color: '#4ADE80',
      backgroundColor: 'rgba(34, 197, 94, 0.15)',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 16,
    },
    scoreContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 20,
    },
    scoreNumber: {
      fontSize: 48,
      fontWeight: '900',
      color: '#22C55E',
    },
    scoreDivider: {
      fontSize: 28,
      color: '#94A3B8',
      marginHorizontal: 4,
    },
    scoreTotal: {
      fontSize: 28,
      color: '#94A3B8',
    },
  });
}