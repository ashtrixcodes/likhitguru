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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import WeatherOverlay from '@/components/WeatherOverlay';
import { RewardedInterstitialAd, AdEventType, RewardedAdEventType, AD_UNITS } from '@/utils/mobileAds';
import {
  DailyQuizProgress,
  getDailyQuizProgress,
  getDailyQuestionsForDate,
  getTodayDateString,
  recordQuizCompletion,
  Question,
} from '@/utils/dailyQuizStorage';
import { fetchLeaderboardData, LeaderboardEntry } from '@/utils/leaderboardService';

import type { AppTheme } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useHaptics } from '@/context/HapticsContext';
import { useAuth } from '@/context/AuthContext';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';
import QuestionSpeechButton from '@/components/QuestionSpeechButton';
import { ShimmerBox, AvatarShimmer } from '@/components/ProfileShimmer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const backgroundImage = require('../../assets/images/background.jpg');

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

const interstitialAdUnitId = AD_UNITS.REWARDED_INTERSTITIAL;
const interstitial = RewardedInterstitialAd.createForAdRequest(interstitialAdUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

const BackgroundWrapper = React.memo(({ isDark, theme, style, children }: { isDark: boolean; theme?: AppTheme; style: any; children: React.ReactNode }) => {
  return (
    <View style={[style, { backgroundColor: isDark ? 'transparent' : theme?.colors?.background || '#F8FAFC' }]}>
      {children}
    </View>
  );
});

export default function GamifiedDailyQuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isNepali, fontFamily, fontFamilyBold } = useLanguage();
  const { triggerImpact, triggerNotification } = useHaptics();
  const { user, userName: authUserName, userAvatar, isSyncing, signInWithGoogle } = useAuth();
  const [avatarLoading, setAvatarLoading] = useState(false);
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
  const [progress, setProgress] = useState<DailyQuizProgress | null>(null);
  const [isTodayCompleted, setIsTodayCompleted] = useState(false);
  const [todayScore, setTodayScore] = useState<number | null>(null);
  const [completionStats, setCompletionStats] = useState<{
    xpEarned: number;
    streakIncremented: boolean;
  } | null>(null);

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
  const [userXP, setUserXP] = useState(0);
  const [userStreak, setUserStreak] = useState(0);
  const [userName, setUserName] = useState('Prashant');

  // Compute first name dynamically
  const firstName = useMemo(() => {
    const effectiveName = authUserName || userName;
    if (effectiveName && effectiveName.trim() !== '') {
      return effectiveName.trim().split(' ')[0];
    }
    return 'Prashant';
  }, [authUserName, userName]);

  const greetingSub = useMemo(() => {
    return isNepali ? unicodeToAakriti('दैनिक चुनौती') : (firstName ? `${firstName}'s` : "Driver's");
  }, [firstName, isNepali]);

  const greetingTitle = useMemo(() => {
    return isNepali ? unicodeToAakriti('दैनिक प्रश्नोत्तरी') : 'Daily Quiz';
  }, [isNepali]);

  const levelTitle = useMemo(() => {
    if (!isNepali) {
      return userXP >= 1000 ? 'Pro Rider' : userXP >= 400 ? 'Active Learner' : 'Novice Driver';
    }
    return unicodeToAakriti(
      userXP >= 1000 ? 'अनुभवी चालक' : userXP >= 400 ? 'सक्रिय शिक्षार्थी' : 'नयाँ चालक'
    );
  }, [userXP, isNepali]);

  // Sync auth name
  useEffect(() => {
    if (authUserName) {
      setUserName(authUserName);
    }
  }, [authUserName]);

  // Leaderboard state
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [leaderboardOnline, setLeaderboardOnline] = useState(false);

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

  const loadProgress = useCallback(async () => {
    const p = await getDailyQuizProgress();
    setProgress(p);
    setUserXP(p.totalXP);
    setUserStreak(p.currentStreak);

    const today = getTodayDateString();
    const todayRecord = p.history[today];
    if (todayRecord) {
      setIsTodayCompleted(true);
      setTodayScore(todayRecord.score);
    } else {
      setIsTodayCompleted(false);
      setTodayScore(null);
    }
  }, []);

  // Load leaderboard from Supabase
  const loadLeaderboard = useCallback(async () => {
    const data = await fetchLeaderboardData(3);
    setTopPlayers(data.topPlayers);
    setUserRank(data.userRank);
    setLeaderboardOnline(data.isOnline);
  }, []);

  // Load User Stats & Ads
  useEffect(() => {
    AsyncStorage.getItem('user_name').then((name) => {
      if (name) setUserName(name);
    }).catch(() => {});

    loadProgress();
    loadLeaderboard();

    const unsubscribeLoaded = interstitial.addAdEventListener(RewardedAdEventType.LOADED, () => setAdLoaded(true));
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
  }, [loadProgress, loadLeaderboard]);

  // Start Gameplay
  const handleStartDailyQuiz = () => {
    triggerImpact();
    setIsLoading(true);
    const newQuestions = getDailyQuestionsForDate(getTodayDateString(), isNepali, 5);
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

  const finishQuiz = async () => {
    triggerNotification();
    try {
      const result = await recordQuizCompletion(score, questions.length);
      setProgress(result.progress);
      setUserXP(result.progress.totalXP);
      setUserStreak(result.progress.currentStreak);
      setIsTodayCompleted(true);
      setTodayScore(score);
      setCompletionStats({
        xpEarned: result.xpEarned,
        streakIncremented: result.streakIncremented,
      });
      // Refresh leaderboard after completion (non-blocking)
      loadLeaderboard().catch(() => {});
    } catch (e) {
      console.warn('Failed to record quiz completion:', e);
    }

    if (adLoaded) {
      try { interstitial.show(); } catch (e) {}
    }
    setShowResult(true);
  };

  // Progress Bar Animation
  useEffect(() => {
    if (isQuizActive && questions.length > 0) {
      const progressRatio = (currentIndex + 1) / questions.length;
      Animated.timing(progressAnim, {
        toValue: progressRatio,
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
    const percentage = Math.round((finalScore / (questions.length || 1)) * 100);
    const earnedXP = completionStats?.xpEarned ?? finalScore * 10;
    const streakAdded = completionStats?.streakIncremented ?? false;

    return (
      <BackgroundWrapper isDark={theme.isDark} theme={theme} style={s.container}>
        <SafeAreaView style={s.safeArea}>
          <StatusBar barStyle="light-content" />
          <View style={s.resultContainer}>
            <View style={s.resultCard}>
              <Text style={s.resultEmoji}>{percentage >= 80 ? '🏆' : percentage >= 60 ? '🌟' : '💪'}</Text>
              <Text style={[s.resultTitle, fontBoldStyle]}>
                {isNepali ? unicodeToAakriti("दैनिक प्रश्नोत्तरी पूरा भयो!") : "Daily Challenge Complete!"}
              </Text>
              <Text style={s.xpEarnedBadge}>+{earnedXP} XP EARNED! 🪙</Text>

              {streakAdded && (
                <View style={s.streakMilestoneBadge}>
                  <Text style={s.streakMilestoneText}>
                    ⚡ STREAK: {userStreak} {userStreak === 1 ? 'DAY' : 'DAYS'} ACTIVE! 🔥
                  </Text>
                </View>
              )}

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
                style={s.resultActionBtn}
                onPress={() => {
                  triggerImpact();
                  setIsQuizActive(false);
                  setShowResult(false);
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.resultBtnGradient}
                >
                  <View style={s.resultBtnIconWrap}>
                    <Ionicons name="trophy" size={17} color="#FFFFFF" />
                  </View>
                  <Text style={[s.resultBtnText, fontBoldStyle]}>
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
      <BackgroundWrapper isDark={theme.isDark} theme={theme} style={s.container}>
        <SafeAreaView style={s.safeArea}>
          <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />

          {/* Active Quiz Header */}
          <View style={s.activeHeaderRow}>
            <View style={s.activeHeaderLeftGroup}>
              <TouchableOpacity
                style={s.backCircleBtn}
                onPress={() => {
                  triggerImpact();
                  setIsQuizActive(false);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={20} color={theme.isDark ? "#FFFFFF" : theme.colors.text} />
              </TouchableOpacity>
              <Text style={[s.activeHeaderTitle, fontBoldStyle]} numberOfLines={1}>
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
    <BackgroundWrapper isDark={theme.isDark} theme={theme} style={s.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView style={s.hubScrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* ══════════════════════════════════════════════════════════════
            1. UNIFIED DASHBOARD-MATCHING TOP NAV HEADER (Weather & Sky)
        ══════════════════════════════════════════════════════════════ */}
        <View style={[s.dashboardHeader, { paddingTop: Math.max(insets.top, 20) + 24 }]}>
          <WeatherOverlay />

          <View style={s.dashboardHeaderContent}>
            {/* Top Action Bar (Avatar + Title) */}
            <View style={s.headerTopRow}>
              {isSyncing ? (
                <View style={s.headerLeftGroup}>
                  <View style={s.topAvatarWrapper}>
                    <AvatarShimmer size={48} isDark={true} />
                  </View>
                  <View style={s.headerTitleCol}>
                    <ShimmerBox width={90} height={12} borderRadius={6} isDark={true} style={{ marginBottom: 6 }} />
                    <ShimmerBox width={150} height={18} borderRadius={8} isDark={true} />
                  </View>
                </View>
              ) : (
                <View style={s.headerLeftGroup}>
                  <View style={s.topAvatarWrapper}>
                    <LinearGradient
                      colors={user ? ['#60A5FA', '#3B82F6', '#1D4ED8'] : ['#94A3B8', '#64748B']}
                      style={s.topAvatarGlowBorder}
                    >
                      {userAvatar ? (
                        <View style={{ width: '100%', height: '100%', position: 'relative' }}>
                          {avatarLoading && (
                            <AvatarShimmer size={44} isDark={true} style={{ position: 'absolute', top: 0, left: 0 }} />
                          )}
                          <Image
                            source={{ uri: userAvatar }}
                            style={s.topAvatarImage}
                            onLoadStart={() => setAvatarLoading(true)}
                            onLoadEnd={() => setAvatarLoading(false)}
                          />
                        </View>
                      ) : (
                        <View style={s.topAvatarPlaceholder}>
                          <Ionicons name="person" size={24} color="#FFFFFF" />
                        </View>
                      )}
                    </LinearGradient>
                    {user && <View style={s.topActiveBeacon} />}
                  </View>

                  <View style={s.headerTitleCol}>
                    <Text style={s.headerSubGreeting}>
                      {greetingSub}
                    </Text>
                    <Text style={s.headerMainTitle}>
                      {greetingTitle}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Integrated Driver Telemetry Bar */}
            <View style={s.telemetryContainer}>
              <View style={s.telemetryItem}>
                <View style={s.telemetryIconRow}>
                  <Ionicons name="flash" size={13} color="#FBBF24" />
                  <Text style={s.telemetryLabel}>
                    {isNepali ? unicodeToAakriti('कुल अंक') : 'Total XP'}
                  </Text>
                </View>
                <Text style={s.telemetryValue}>{userXP.toLocaleString()}</Text>
                <Text style={s.telemetrySub}>{levelTitle}</Text>
              </View>

              <View style={s.telemetryDivider} />

              <View style={s.telemetryItem}>
                <View style={s.telemetryIconRow}>
                  <Ionicons name="flame" size={13} color="#EF4444" />
                  <Text style={s.telemetryLabel}>
                    {isNepali ? unicodeToAakriti('स्ट्रिक') : 'Streak'}
                  </Text>
                </View>
                <Text style={s.telemetryValue}>
                  {userStreak}{' '}
                  <Text style={{ fontFamily: isNepali ? fontFamily || 'Aakriti' : undefined, fontSize: isNepali ? 14 : 12, fontWeight: 'normal' }}>
                    {isNepali ? unicodeToAakriti('दिन') : userStreak === 1 ? 'Day' : 'Days'}
                  </Text>
                </Text>
                <Text style={s.telemetrySub}>
                  {isNepali ? unicodeToAakriti('दैनिक क्विज') : 'Daily Quiz'}
                </Text>
              </View>

              <View style={s.telemetryDivider} />

              <View style={s.telemetryItem}>
                <View style={s.telemetryIconRow}>
                  <Ionicons name="trophy" size={13} color="#4ADE80" />
                  <Text style={s.telemetryLabel}>
                    {isNepali ? unicodeToAakriti('स्थान') : 'Rank'}
                  </Text>
                </View>
                <Text style={s.telemetryValue}>
                  {userRank ? (
                    `#${userRank}`
                  ) : leaderboardOnline ? (
                    isNepali ? (
                      <>
                        <Text style={{ fontFamily: isNepali ? fontFamily || 'Aakriti' : undefined, fontSize: 13, fontWeight: 'normal' }}>
                          {unicodeToAakriti('शीर्ष ')}
                        </Text>
                        10
                      </>
                    ) : (
                      'Top 10'
                    )
                  ) : isNepali ? (
                    unicodeToAakriti('अफलाइन')
                  ) : (
                    'Offline'
                  )}
                </Text>
                <Text style={s.telemetrySub}>
                  {isNepali ? unicodeToAakriti('लिडरबोर्ड') : 'Leaderboard'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={s.hubBodyContent}>
          {/* Daily Challenge Hero Banner */}
          <View style={s.heroCardContainer}>
            <View style={s.heroHeaderRow}>
              <View>
                <Text style={[s.heroBadgeTag, isTodayCompleted && { color: '#60A5FA' }]}>
                  {isTodayCompleted ? '✅ COMPLETED TODAY' : '🔥 DAILY LIVE ARENA'}
                </Text>
                <Text style={[s.heroTitleText, fontBoldStyle]}>
                  {isNepali ? unicodeToAakriti("दैनिक सवारी ज्ञान परीक्षा") : "Daily Driving Challenge"}
                </Text>
              </View>
            </View>

            {/* Countdown Circular Ring */}
            <View style={s.countdownRingContainer}>
              <View
                style={[
                  s.countdownRingBg,
                  isTodayCompleted && {
                    borderColor: '#3B82F6',
                    shadowColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.06)',
                  },
                ]}
              >
                <Text style={s.countdownNumber}>{timeLeft.hours}:{timeLeft.mins}:{timeLeft.secs}</Text>
                <Text style={s.countdownSubLabel}>
                  {isTodayCompleted ? 'NEXT CHALLENGE IN' : 'REMAINING UNTIL RESET'}
                </Text>
              </View>
            </View>

            <View style={s.heroMetaRow}>
              <View style={s.heroMetaItem}>
                <Ionicons
                  name={isTodayCompleted ? 'checkmark-circle' : 'flame'}
                  size={16}
                  color={isTodayCompleted ? '#3B82F6' : '#22C55E'}
                />
                <Text style={s.heroMetaText}>
                  {isTodayCompleted
                    ? `Today: ${todayScore !== null ? (isNepali ? toNepaliNumber(todayScore) : todayScore) : 5}/5 Correct`
                    : `Streak: ${userStreak} Days Active`}
                </Text>
              </View>
              <View style={s.heroMetaItem}>
                <Ionicons name="ribbon" size={16} color="#F59E0B" />
                <Text style={s.heroMetaText}>Prize: +50-70 XP</Text>
              </View>
            </View>

            {/* CTA Join / Practice Button */}
            <Animated.View style={{ transform: [{ scale: isTodayCompleted ? 1 : pulseBtnAnim }] }}>
              <TouchableOpacity
                style={s.heroJoinBtn}
                onPress={handleStartDailyQuiz}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={isTodayCompleted ? ['#2563EB', '#1D4ED8'] : ['#22C55E', '#16A34A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.heroBtnGradient}
                >
                  <Ionicons
                    name={isTodayCompleted ? 'repeat' : 'play'}
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[s.heroBtnText, fontBoldStyle]}>
                    {isTodayCompleted
                      ? (isNepali ? unicodeToAakriti("पुन: अभ्यास गर्नुहोस्") : "Practice Again (Review)")
                      : (isNepali ? unicodeToAakriti("आजको प्रश्नोत्तरी सुरु गर्नुहोस्") : "Join Daily Challenge")}
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

              <Text style={s.arenaCardTitle}>
                {isNepali ? unicodeToAakriti('ट्राफिक चिन्ह') : 'Sign Test'}
              </Text>
              <Text style={s.arenaCardSub}>
                {isNepali ? unicodeToAakriti('भिजुअल संकेतहरू') : 'Traffic Signals'}
              </Text>
              <View style={s.arenaLiveRow}>
                <Ionicons name="person" size={12} color="#94A3B8" />
                <Text style={s.arenaLiveText}>
                  650{' '}
                  <Text style={isNepali ? { fontFamily: 'Aakriti', fontSize: 13 } : undefined}>
                    {isNepali ? unicodeToAakriti('खेल्दै') : 'playing'}
                  </Text>
                </Text>
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

              <Text style={s.arenaCardTitle}>
                {isNepali ? unicodeToAakriti('दृष्टि परीक्षण') : 'Eye Test'}
              </Text>
              <Text style={s.arenaCardSub}>
                {isNepali ? unicodeToAakriti('इशिहारा प्लेट्स') : 'Numbers Pattern'}
              </Text>
              <View style={s.arenaLiveRow}>
                <Ionicons name="person" size={12} color="#94A3B8" />
                <Text style={s.arenaLiveText}>
                  420{' '}
                  <Text style={isNepali ? { fontFamily: 'Aakriti', fontSize: 13 } : undefined}>
                    {isNepali ? unicodeToAakriti('खेल्दै') : 'playing'}
                  </Text>
                </Text>
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

              <Text style={s.arenaCardTitle}>
                {isNepali ? (
                  <>
                    <Text style={{ fontFamily: 'AakritiBold' }}>{unicodeToAakriti('वर्ग ')}</Text>
                    A / B
                  </>
                ) : (
                  'Category A/B'
                )}
              </Text>
              <Text style={s.arenaCardSub}>
                {isNepali ? unicodeToAakriti('सवारी चालक नियम') : 'Driving Rules'}
              </Text>
              <View style={s.arenaLiveRow}>
                <Ionicons name="person" size={12} color="#94A3B8" />
                <Text style={s.arenaLiveText}>
                  890{' '}
                  <Text style={isNepali ? { fontFamily: 'Aakriti', fontSize: 13 } : undefined}>
                    {isNepali ? unicodeToAakriti('खेल्दै') : 'playing'}
                  </Text>
                </Text>
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

              <Text style={s.arenaCardTitle}>
                {isNepali ? unicodeToAakriti('द्रुत चुनौती') : 'Speed Challenge'}
              </Text>
              <Text style={s.arenaCardSub}>
                {isNepali ? (
                  <>
                    5 <Text style={{ fontFamily: 'Aakriti' }}>{unicodeToAakriti('द्रुत प्रश्नहरू')}</Text>
                  </>
                ) : (
                  '5 Quick Qs'
                )}
              </Text>
              <View style={s.arenaLiveRow}>
                <Ionicons name="person" size={12} color="#94A3B8" />
                <Text style={s.arenaLiveText}>
                  310{' '}
                  <Text style={isNepali ? { fontFamily: 'Aakriti', fontSize: 13 } : undefined}>
                    {isNepali ? unicodeToAakriti('खेल्दै') : 'playing'}
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* 3D Daily Leaderboard Podium */}
          <View style={s.leaderboardHeaderRow}>
            <Text style={[s.sectionTitleLabel, fontBoldStyle]}>
              {isNepali ? unicodeToAakriti("शीर्ष स्थान लिडरबोर्ड 🏆") : "Daily Leaderboard 🏆"}
            </Text>
            <View style={s.liveBadgePill}>
              <View style={s.liveBadgeDot} />
              <Text style={s.liveBadgeText}>LIVE</Text>
            </View>
          </View>

          <View style={s.podiumCardContainer}>
            {(() => {
              // Pad to always have 3 slots — fill missing positions with placeholders
              const p1 = topPlayers[0] ?? null;
              const p2 = topPlayers[1] ?? null;
              const p3 = topPlayers[2] ?? null;

              return (
                <View style={s.podiumRow}>
                  {/* 2nd Place (Silver) */}
                  <View style={s.podiumColumn}>
                    <View style={s.podiumAvatarWrap}>
                      <LinearGradient
                        colors={['#94A3B8', '#CBD5E1', '#64748B']}
                        style={s.podiumAvatarRingSilver}
                      >
                        <Image
                          source={p2?.avatar_url ? { uri: p2.avatar_url } : require('../../assets/images/profile.png')}
                          style={s.podiumAvatar}
                        />
                      </LinearGradient>
                      <View style={s.podiumBadgeSilver}>
                        <Text style={s.podiumRankText}>2</Text>
                      </View>
                    </View>
                    <Text style={s.podiumName} numberOfLines={1}>
                      {p2?.user_name ?? (isNepali ? unicodeToAakriti('प्रतियोगी') : 'Challenger')}
                    </Text>
                    <View style={s.podiumScorePill}>
                      <Text style={s.podiumScoreText}>{p2 ? `${p2.total_xp.toLocaleString()} XP` : '--- XP'}</Text>
                    </View>
                    <LinearGradient
                      colors={theme.isDark ? ['rgba(148, 163, 184, 0.25)', 'rgba(148, 163, 184, 0.05)'] : ['rgba(148, 163, 184, 0.35)', 'rgba(148, 163, 184, 0.1)']}
                      style={s.podiumPedestalSilver}
                    >
                      <Text style={s.pedestalRankNumberSilver}>2</Text>
                      <View style={s.pedestalTopRimSilver} />
                    </LinearGradient>
                  </View>

                  {/* 1st Place (Gold / Champion) */}
                  <View style={[s.podiumColumn, s.podiumColumnChampion]}>
                    <View style={s.crownContainer}>
                      <Ionicons name="trophy" size={24} color="#FFD700" />
                    </View>
                    <View style={s.podiumAvatarWrap}>
                      <LinearGradient
                        colors={['#F59E0B', '#FDE047', '#D97706']}
                        style={s.podiumAvatarRingGold}
                      >
                        <Image
                          source={p1?.avatar_url ? { uri: p1.avatar_url } : require('../../assets/images/profile.png')}
                          style={s.podiumAvatarGold}
                        />
                      </LinearGradient>
                      <View style={s.podiumBadgeGold}>
                        <Ionicons name="star" size={10} color="#000000" style={{ marginRight: 2 }} />
                        <Text style={s.podiumRankText}>1</Text>
                      </View>
                    </View>
                    <Text style={[s.podiumName, s.podiumNameChampion]} numberOfLines={1}>
                      {p1?.user_name ?? (leaderboardOnline ? (isNepali ? unicodeToAakriti('शीर्ष चालक') : 'Top Driver') : 'Offline')}
                    </Text>
                    <View style={s.podiumScorePillGold}>
                      <Text style={s.podiumScoreTextGold}>{p1 ? `${p1.total_xp.toLocaleString()} XP` : '--- XP'}</Text>
                    </View>
                    <LinearGradient
                      colors={theme.isDark ? ['rgba(245, 158, 11, 0.3)', 'rgba(245, 158, 11, 0.06)'] : ['rgba(245, 158, 11, 0.4)', 'rgba(245, 158, 11, 0.15)']}
                      style={s.podiumPedestalGold}
                    >
                      <Text style={s.pedestalRankNumberGold}>1</Text>
                      <View style={s.pedestalTopRimGold} />
                    </LinearGradient>
                  </View>

                  {/* 3rd Place (Bronze) */}
                  <View style={s.podiumColumn}>
                    <View style={s.podiumAvatarWrap}>
                      <LinearGradient
                        colors={['#D97706', '#F59E0B', '#92400E']}
                        style={s.podiumAvatarRingBronze}
                      >
                        <Image
                          source={p3?.avatar_url ? { uri: p3.avatar_url } : require('../../assets/images/profile.png')}
                          style={s.podiumAvatar}
                        />
                      </LinearGradient>
                      <View style={s.podiumBadgeBronze}>
                        <Text style={s.podiumRankText}>3</Text>
                      </View>
                    </View>
                    <Text style={s.podiumName} numberOfLines={1}>
                      {p3?.user_name ?? (isNepali ? unicodeToAakriti('प्रतियोगी') : 'Challenger')}
                    </Text>
                    <View style={s.podiumScorePill}>
                      <Text style={s.podiumScoreText}>{p3 ? `${p3.total_xp.toLocaleString()} XP` : '--- XP'}</Text>
                    </View>
                    <LinearGradient
                      colors={theme.isDark ? ['rgba(217, 119, 6, 0.22)', 'rgba(217, 119, 6, 0.04)'] : ['rgba(217, 119, 6, 0.3)', 'rgba(217, 119, 6, 0.08)']}
                      style={s.podiumPedestalBronze}
                    >
                      <Text style={s.pedestalRankNumberBronze}>3</Text>
                      <View style={s.pedestalTopRimBronze} />
                    </LinearGradient>
                  </View>
                </View>
              );
            })()}

            {/* Google Sign-In Banner if Not Signed In */}
            {!user && (
              <TouchableOpacity
                style={s.googleSignInBanner}
                onPress={() => {
                  triggerImpact();
                  signInWithGoogle().catch((e) => {
                    console.warn('Google Sign-In failed:', e);
                  });
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="logo-google" size={18} color="#EA4335" style={{ marginRight: 8 }} />
                <Text style={[s.googleSignInText, fontBoldStyle]}>
                  {isNepali ? unicodeToAakriti("Google खाताबाट साइन इन गर्नुहोस्") : "Sign in with Google for Global Rank"}
                </Text>
              </TouchableOpacity>
            )}

            {/* Your Live Rank Card */}
            <View style={s.yourRankRow}>
              <View style={s.yourRankLeft}>
                <View style={s.yourRankAvatarWrap}>
                  <Image
                    source={userAvatar ? { uri: userAvatar } : require('../../assets/images/profile.png')}
                    style={s.yourRankAvatar}
                  />
                  {user && <View style={s.yourRankActiveDot} />}
                </View>
                <View style={s.yourRankInfo}>
                  <View style={s.yourRankNameRow}>
                    <Text style={s.yourRankName} numberOfLines={1}>
                      {userName}
                    </Text>
                    <View style={s.youBadge}>
                      <Text style={s.youBadgeText}>YOU</Text>
                    </View>
                  </View>
                  <View style={s.yourRankStreakRow}>
                    <Ionicons name="flame" size={12} color="#EF4444" />
                    <Text style={s.yourRankSub}>{userStreak} {userStreak === 1 ? 'Day' : 'Days'} Streak</Text>
                  </View>
                </View>
              </View>

              <View style={s.yourRankRight}>
                <View style={s.yourRankXpBadge}>
                  <Ionicons name="flash" size={12} color="#FBBF24" />
                  <Text style={s.yourRankScore}>{userXP.toLocaleString()} XP</Text>
                </View>
                <Text style={s.yourRankNum}>
                  {userRank ? `#${userRank}` : (leaderboardOnline ? 'Top 10' : 'Offline')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </BackgroundWrapper>
  );
}

function createDailyQuizStyles(theme: AppTheme, isNepali: boolean) {
  const { isDark, colors } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
      flex: 1,
    },
    hubScrollView: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // ── DASHBOARD UNIFIED HEADER ──
    dashboardHeader: {
      backgroundColor: theme.colors.header || '#0B1120',
      paddingHorizontal: 18,
      paddingBottom: 22,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 36,
      borderBottomRightRadius: 36,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 12,
      position: 'relative',
      overflow: 'hidden',
    },
    dashboardHeaderContent: {
      zIndex: 10,
      position: 'relative',
    },
    headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeftGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    topAvatarWrapper: {
      position: 'relative',
    },
    topAvatarGlowBorder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      padding: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    topAvatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 22,
      backgroundColor: '#1E293B',
    },
    topAvatarPlaceholder: {
      width: '100%',
      height: '100%',
      borderRadius: 22,
      backgroundColor: '#1E293B',
      justifyContent: 'center',
      alignItems: 'center',
    },
    topActiveBeacon: {
      position: 'absolute',
      bottom: -1,
      right: -1,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#22C55E',
      borderWidth: 2,
      borderColor: '#0B1120',
    },
    headerTitleCol: {
      flexDirection: 'column',
      justifyContent: 'center',
    },
    headerSubGreeting: {
      color: theme.colors.headerText || '#FFFFFF',
      fontSize: isNepali ? 15 : 13,
      opacity: 0.8,
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
      fontFamily: isNepali ? 'Aakriti' : undefined,
      fontWeight: isNepali ? 'normal' : undefined,
    },
    headerMainTitle: {
      color: theme.colors.headerText || '#FFFFFF',
      fontSize: 20,
      fontWeight: isNepali ? 'normal' : 'bold',
      fontFamily: isNepali ? 'AakritiBold' : undefined,
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    telemetryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(0, 0, 0, 0.28)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderRadius: 18,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginTop: 14,
    },
    telemetryItem: {
      flex: 1,
      alignItems: 'center',
    },
    telemetryIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 2,
    },
    telemetryLabel: {
      fontSize: isNepali ? 11 : 10,
      color: '#94A3B8',
      fontWeight: isNepali ? 'normal' : '700',
      textTransform: isNepali ? 'none' : 'uppercase',
      fontFamily: isNepali ? 'AakritiBold' : undefined,
    },
    telemetryValue: {
      fontSize: 15,
      fontWeight: '900',
      color: '#FFFFFF',
      marginBottom: 1,
    },
    telemetrySub: {
      fontSize: isNepali ? 11 : 10,
      color: '#38BDF8',
      fontWeight: isNepali ? 'normal' : '600',
      fontFamily: isNepali ? 'Aakriti' : undefined,
    },
    telemetryDivider: {
      width: 1,
      height: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    hubBodyContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    heroCardContainer: {
      backgroundColor: isDark ? 'rgba(20, 24, 33, 0.95)' : colors.card,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.35)',
      marginBottom: 24,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.35 : 0.08,
      shadowRadius: 16,
      elevation: 0,
      overflow: 'hidden',
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
      color: isDark ? '#FFFFFF' : colors.text,
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
      color: isDark ? '#FFFFFF' : colors.text,
      letterSpacing: 1,
    },
    countdownSubLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: isDark ? '#94A3B8' : colors.textSecondary,
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
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    heroMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    heroMetaText: {
      fontSize: 13,
      fontWeight: '600',
      color: isDark ? '#CBD5E1' : colors.textSecondary,
    },
    heroJoinBtn: {
      marginTop: 8,
      width: '100%',
      borderRadius: 18,
      overflow: 'hidden',
      shadowColor: '#22C55E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
    },
    heroBtnGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 15,
      paddingHorizontal: 18,
      borderRadius: 18,
      width: '100%',
      gap: 8,
    },
    heroBtnText: {
      fontSize: isNepali ? 17 : 15,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.2,
    },
    sectionTitleLabel: {
      fontSize: 18,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : colors.text,
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
      backgroundColor: isDark ? 'rgba(20, 24, 33, 0.95)' : colors.card,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 6,
      elevation: 0,
      overflow: 'hidden',
    },
    arenaIconBadge: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      overflow: 'hidden',
    },
    arenaCardTitle: {
      fontSize: 15,
      fontWeight: isNepali ? 'normal' : '700',
      color: isDark ? '#FFFFFF' : colors.text,
      fontFamily: isNepali ? 'AakritiBold' : undefined,
    },
    arenaCardSub: {
      fontSize: 12,
      color: isDark ? '#94A3B8' : colors.textSecondary,
      marginTop: 2,
      marginBottom: 10,
      fontFamily: isNepali ? 'Aakriti' : undefined,
      fontWeight: isNepali ? 'normal' : undefined,
    },
    arenaLiveRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    arenaLiveText: {
      fontSize: isNepali ? 12 : 11,
      color: isDark ? '#94A3B8' : colors.textTertiary,
      fontWeight: '500',
    },
    // ── 3D LEADERBOARD PODIUM ──
    leaderboardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
      marginTop: 6,
    },
    liveBadgePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(34, 197, 94, 0.15)',
      borderColor: 'rgba(34, 197, 94, 0.35)',
      borderWidth: 1,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    liveBadgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#22C55E',
    },
    liveBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#22C55E',
      letterSpacing: 0.5,
    },
    podiumCardContainer: {
      backgroundColor: isDark ? 'rgba(20, 24, 33, 0.95)' : colors.card,
      borderRadius: 24,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 16,
      elevation: 4,
      marginBottom: 20,
    },
    podiumRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingTop: 10,
      paddingBottom: 16,
      gap: 8,
    },
    podiumColumn: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'flex-end',
    },
    podiumColumnChampion: {
      marginTop: -16,
    },
    crownContainer: {
      marginBottom: 2,
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 6,
      elevation: 3,
    },
    podiumAvatarWrap: {
      position: 'relative',
      marginBottom: 6,
    },
    podiumAvatarRingGold: {
      width: 58,
      height: 58,
      borderRadius: 29,
      padding: 2.5,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#F59E0B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 6,
    },
    podiumAvatarRingSilver: {
      width: 48,
      height: 48,
      borderRadius: 24,
      padding: 2,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#94A3B8',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
    podiumAvatarRingBronze: {
      width: 44,
      height: 44,
      borderRadius: 22,
      padding: 2,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#CD7F32',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
    podiumAvatar: {
      width: '100%',
      height: '100%',
      borderRadius: 22,
      backgroundColor: '#1E293B',
    },
    podiumAvatarGold: {
      width: '100%',
      height: '100%',
      borderRadius: 27,
      backgroundColor: '#1E293B',
    },
    podiumBadgeGold: {
      position: 'absolute',
      bottom: -6,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFD700',
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: '#B45309',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 4,
    },
    podiumBadgeSilver: {
      position: 'absolute',
      bottom: -6,
      alignSelf: 'center',
      backgroundColor: '#E2E8F0',
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: '#64748B',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 3,
    },
    podiumBadgeBronze: {
      position: 'absolute',
      bottom: -6,
      alignSelf: 'center',
      backgroundColor: '#CD7F32',
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: '#78350F',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 3,
    },
    podiumRankText: {
      fontSize: 10,
      fontWeight: '900',
      color: '#1E293B',
    },
    podiumName: {
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? '#E2E8F0' : colors.text,
      textAlign: 'center',
      marginTop: 4,
      marginBottom: 2,
    },
    podiumNameChampion: {
      fontSize: 13,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : colors.text,
    },
    podiumScorePill: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      marginBottom: 8,
    },
    podiumScorePillGold: {
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
      borderColor: isDark ? 'rgba(245, 158, 11, 0.4)' : '#FDE68A',
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 10,
      marginBottom: 8,
    },
    podiumScoreText: {
      fontSize: 10,
      fontWeight: '700',
      color: isDark ? '#94A3B8' : colors.textSecondary,
    },
    podiumScoreTextGold: {
      fontSize: 11,
      fontWeight: '800',
      color: '#F59E0B',
    },
    podiumPedestalGold: {
      width: '100%',
      height: 86,
      borderTopLeftRadius: 14,
      borderTopRightRadius: 14,
      borderWidth: 1.5,
      borderColor: 'rgba(245, 158, 11, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    podiumPedestalSilver: {
      width: '100%',
      height: 62,
      borderTopLeftRadius: 14,
      borderTopRightRadius: 14,
      borderWidth: 1.5,
      borderColor: 'rgba(148, 163, 184, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    podiumPedestalBronze: {
      width: '100%',
      height: 46,
      borderTopLeftRadius: 14,
      borderTopRightRadius: 14,
      borderWidth: 1.5,
      borderColor: 'rgba(205, 127, 50, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    pedestalRankNumberGold: {
      fontSize: 32,
      fontWeight: '900',
      color: 'rgba(245, 158, 11, 0.45)',
    },
    pedestalRankNumberSilver: {
      fontSize: 26,
      fontWeight: '900',
      color: 'rgba(148, 163, 184, 0.4)',
    },
    pedestalRankNumberBronze: {
      fontSize: 22,
      fontWeight: '900',
      color: 'rgba(205, 127, 50, 0.4)',
    },
    pedestalTopRimGold: {
      position: 'absolute',
      top: 0,
      left: 8,
      right: 8,
      height: 3,
      backgroundColor: '#F59E0B',
      borderBottomLeftRadius: 3,
      borderBottomRightRadius: 3,
      opacity: 0.8,
    },
    pedestalTopRimSilver: {
      position: 'absolute',
      top: 0,
      left: 6,
      right: 6,
      height: 3,
      backgroundColor: '#CBD5E1',
      borderBottomLeftRadius: 3,
      borderBottomRightRadius: 3,
      opacity: 0.8,
    },
    pedestalTopRimBronze: {
      position: 'absolute',
      top: 0,
      left: 6,
      right: 6,
      height: 3,
      backgroundColor: '#CD7F32',
      borderBottomLeftRadius: 3,
      borderBottomRightRadius: 3,
      opacity: 0.8,
    },

    // Google Sign In Banner
    googleSignInBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(234, 67, 53, 0.12)' : '#FEF2F2',
      borderColor: isDark ? 'rgba(234, 67, 53, 0.35)' : '#FECACA',
      borderWidth: 1,
      borderRadius: 14,
      paddingVertical: 11,
      paddingHorizontal: 14,
      marginBottom: 12,
    },
    googleSignInText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#EA4335',
    },

    // Your Live Rank VIP Card
    yourRankRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#F0FDF4',
      borderColor: isDark ? 'rgba(16, 185, 129, 0.35)' : '#BBF7D0',
      borderWidth: 1.5,
      borderRadius: 18,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginTop: 4,
    },
    yourRankLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    yourRankAvatarWrap: {
      position: 'relative',
    },
    yourRankAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: isDark ? '#34D399' : '#10B981',
      backgroundColor: '#1E293B',
    },
    yourRankActiveDot: {
      position: 'absolute',
      bottom: -1,
      right: -1,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#22C55E',
      borderWidth: 1.5,
      borderColor: isDark ? '#141821' : '#FFFFFF',
    },
    yourRankInfo: {
      flex: 1,
    },
    yourRankNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 2,
    },
    yourRankName: {
      fontSize: 14,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : colors.text,
    },
    youBadge: {
      backgroundColor: '#10B981',
      paddingHorizontal: 6,
      paddingVertical: 1.5,
      borderRadius: 6,
    },
    youBadgeText: {
      fontSize: 9,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    yourRankStreakRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    yourRankSub: {
      fontSize: 11,
      fontWeight: '600',
      color: isDark ? '#94A3B8' : colors.textSecondary,
    },
    yourRankRight: {
      alignItems: 'flex-end',
      gap: 3,
    },
    yourRankXpBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.18)' : '#FEF3C7',
      borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : '#FDE68A',
      borderWidth: 1,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    yourRankScore: {
      fontSize: 12,
      fontWeight: '800',
      color: '#F59E0B',
    },
    yourRankNum: {
      fontSize: 11,
      fontWeight: '700',
      color: isDark ? '#34D399' : '#059669',
    },

    // Active Gameplay Styles
    activeHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    activeHeaderLeftGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
      marginRight: 10,
    },
    backCircleBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F1F5F9',
      justifyContent: 'center',
      alignItems: 'center',
    },
    activeHeaderTitle: {
      fontSize: isNepali ? 18 : 17,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : colors.text,
      flexShrink: 1,
    },
    xpBadgeTop: {
      backgroundColor: isDark ? 'rgba(34, 197, 94, 0.18)' : '#DCFCE7',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : '#86EFAC',
    },
    xpBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: isDark ? '#4ADE80' : '#16A34A',
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
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F1F5F9',
      borderColor: isDark ? 'transparent' : '#E2E8F0',
      borderWidth: isDark ? 0 : 1,
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderRadius: 12,
    },
    progressPillText: {
      fontSize: 13,
      color: isDark ? '#FFFFFF' : colors.text,
      fontWeight: '600',
    },
    progressTrack: {
      height: 6,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
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
      backgroundColor: isDark ? 'rgba(20, 24, 33, 0.95)' : colors.card,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    questionText: {
      fontSize: isNepali ? 22 : 18,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : colors.text,
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
      backgroundColor: isDark ? 'rgba(20, 24, 33, 0.95)' : colors.card,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.15 : 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    correctOption: {
      backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7',
      borderWidth: 1.5,
      borderColor: '#22C55E',
    },
    incorrectOption: {
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
      borderWidth: 1.5,
      borderColor: '#EF4444',
    },
    disabledOption: {
      backgroundColor: isDark ? 'rgba(20, 24, 33, 0.5)' : '#F8FAFC',
      borderWidth: 1,
      borderColor: isDark ? 'transparent' : '#E2E8F0',
      opacity: 0.6,
    },
    optionBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F1F5F9',
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
      color: isDark ? '#FFFFFF' : colors.text,
      fontWeight: '700',
    },
    optionText: {
      flex: 1,
      fontSize: isNepali ? 18 : 14,
      color: isDark ? '#FFFFFF' : colors.text,
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
      backgroundColor: isDark ? 'rgba(20, 24, 33, 0.95)' : colors.card,
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.4)',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    resultEmoji: {
      fontSize: 48,
      marginBottom: 10,
    },
    resultTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : colors.text,
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
      marginBottom: 10,
    },
    streakMilestoneBadge: {
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      borderColor: 'rgba(245, 158, 11, 0.4)',
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 14,
      marginBottom: 16,
    },
    streakMilestoneText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#FBBF24',
      textAlign: 'center',
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
      color: isDark ? '#94A3B8' : colors.textSecondary,
      marginHorizontal: 4,
    },
    scoreTotal: {
      fontSize: 28,
      color: isDark ? '#94A3B8' : colors.textSecondary,
    },
    resultActionBtn: {
      width: '100%',
      borderRadius: 18,
      marginTop: 8,
      overflow: 'hidden',
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
    resultBtnGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      width: '100%',
      gap: 10,
    },
    resultBtnIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    resultBtnText: {
      fontSize: isNepali ? 17 : 16,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
  });
}