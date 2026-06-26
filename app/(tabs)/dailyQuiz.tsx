import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { dailyquizQT } from "../(tabs)/dailyquizQT"; // Updated import

import type { AppTheme } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

// Add safety check for imported data with proper fallbacks
const safeKnowledgeQuestions = Array.isArray(dailyquizQT) ? dailyquizQT : [];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Question {
  question: string;
  options: [string, string, string, string];
  correctAnswer: string; // Added correctAnswer to interface
}

export default function EnhancedDailyQuizScreen() {
  const { theme } = useTheme();
  const s = useMemo(() => createDailyQuizStyles(theme), [theme]);

  // Gradient colors based on theme
  const gradientPrimary: [string, string] = theme.isDark
    ? ['#1a1c2e', '#2d2b55']
    : ['#434D57', '#6B5B95'];
  const gradientReverse: [string, string] = theme.isDark
    ? ['#2d2b55', '#1a1c2e']
    : ['#6B5B95', '#434D57'];

  const backgroundImage = require('../../assets/images/background.jpg');

  // Wrapper component that uses ImageBackground in dark mode, LinearGradient in light
  const BackgroundWrapper = ({ colors, children }: { colors: [string, string]; children: React.ReactNode }) => {
    if (theme.isDark) {
      return (
        <ImageBackground source={backgroundImage} style={s.container} resizeMode="stretch">
          {children}
        </ImageBackground>
      );
    }
    return (
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.container}>
        {children}
      </LinearGradient>
    );
  };
  const [questions, setQuestions] = useState<Question[]>([]);
  const [originalIndices, setOriginalIndices] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; score: number; total: number; percentage: number; message: string; emoji: string }>({ title: '', score: 0, total: 0, percentage: 0, message: '', emoji: '' });

  // Simplified animation values for better Android performance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalScaleAnim = useRef(new Animated.Value(0)).current;

  // Start entrance animations with Android optimization
  useEffect(() => {
    if (questions.length > 0) {
      // Simplified animation sequence for better Android performance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: Platform.OS === 'ios', // Use native driver only on iOS
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: Platform.OS === 'ios',
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: Platform.OS === 'ios',
        }),
      ]).start();
    }
  }, [questions.length]);

  // Update progress animation
  useEffect(() => {
    if (questions.length > 0) {
      const progress = (currentIndex + 1) / questions.length;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false, // Keep false for width interpolation
      }).start();
    }
  }, [currentIndex, questions.length]);

  // Load daily quiz
  useEffect(() => {
    const loadDailyQuiz = async () => {
      try {
        console.log("Starting to load daily quiz...");
        console.log("Safe knowledge questions length:", safeKnowledgeQuestions.length);

        setIsLoading(true);
        setHasError(false);

        // Check if we have questions available
        if (safeKnowledgeQuestions.length === 0) {
          console.error("No knowledge questions available");
          setHasError(true);
          setIsLoading(false);
          return;
        }

        // Add Android-specific delay for better stability
        if (Platform.OS === 'android') {
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        const today = new Date().toDateString();
        console.log("Today's date:", today);

        const savedQuiz = await AsyncStorage.getItem("dailyQuiz");
        const savedDate = await AsyncStorage.getItem("quizDate");

        console.log("Saved quiz exists:", !!savedQuiz);
        console.log("Saved date:", savedDate);

        if (savedQuiz && savedDate === today) {
          console.log("Loading saved quiz for today");
          const parsedQuiz = JSON.parse(savedQuiz);
          const loadedQuestions = parsedQuiz.questions || [];
          const loadedIndices = parsedQuiz.originalIndices || [];

          console.log("Loaded questions count:", loadedQuestions.length);
          setQuestions(loadedQuestions);
          setOriginalIndices(loadedIndices);
        } else {
          console.log("Creating new daily quiz");
          const indices = Array.from({ length: safeKnowledgeQuestions.length }, (_, i) => i);
          const shuffledIndices = indices.sort(() => Math.random() - 0.5);
          const selectedIndices = shuffledIndices.slice(0, Math.min(5, safeKnowledgeQuestions.length));

          console.log("Selected indices:", selectedIndices);

          const dailySet: Question[] = selectedIndices.map(index => {
            const q = safeKnowledgeQuestions[index];
            if (!q || !q.question || !q.options || !q.correctAnswer) {
              console.warn(`Question at index ${index} is invalid:`, q);
              return {
                question: "Question data is missing",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: "Option A"
              };
            }

            // Validate options array
            if (!Array.isArray(q.options) || q.options.length !== 4) {
              console.warn(`Question at index ${index} has invalid options:`, q.options);
              return {
                question: q.question,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: q.correctAnswer
              };
            }

            return {
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer
            };
          });

          console.log("Created daily set with", dailySet.length, "questions");
          setQuestions(dailySet);
          setOriginalIndices(selectedIndices);

          await AsyncStorage.setItem("dailyQuiz", JSON.stringify({
            questions: dailySet,
            originalIndices: selectedIndices
          }));
          await AsyncStorage.setItem("quizDate", today);
          console.log("Saved new quiz to storage");
        }

        console.log("Quiz loading completed successfully");
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading daily quiz:", error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure proper state initialization
    const timer = setTimeout(loadDailyQuiz, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleAnswer = (selectedOption: string) => {
    if (isAnswered) return;

    setSelectedAnswer(selectedOption);
    setIsAnswered(true);

    // Updated answer validation logic
    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        nextQuestion();
      } else {
        finishQuiz();
      }
    }, 1500);
  };

  const nextQuestion = () => {
    Animated.timing(slideAnim, {
      toValue: -SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: Platform.OS === 'ios',
    }).start(() => {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);

      slideAnim.setValue(0); // Reset slideAnim to 0
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: Platform.OS === 'ios',
      }).start();
    });
  };

  const finishQuiz = () => {
    setShowResult(true);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: Platform.OS === 'ios',
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: Platform.OS === 'ios',
      }),
    ]).start();

    setTimeout(() => {
      const finalScore = score;
      const percentage = (finalScore / questions.length) * 100;
      let message = "";
      let emoji = "";

      if (percentage >= 80) {
        message = "Outstanding! You're a quiz master!";
        emoji = "🎉";
      } else if (percentage >= 60) {
        message = "Well done! Keep up the great work!";
        emoji = "👏";
      } else {
        message = "Practice makes perfect!";
        emoji = "📚";
      }

      setModalData({ title: 'Quiz Completed!', score: finalScore, total: questions.length, percentage, message, emoji });
      setShowModal(true);
      modalScaleAnim.setValue(0);
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 80,
      }).start();
    }, 500);
  };

  const resetQuiz = async () => {
    try {
      await AsyncStorage.removeItem("dailyQuiz");
      await AsyncStorage.removeItem("quizDate");
      setCurrentIndex(0);
      setScore(0);
      setShowResult(false);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsLoading(true);
      setHasError(false);

      if (safeKnowledgeQuestions.length === 0) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      const indices = Array.from({ length: safeKnowledgeQuestions.length }, (_, i) => i);
      const shuffledIndices = indices.sort(() => Math.random() - 0.5);
      const selectedIndices = shuffledIndices.slice(0, Math.min(5, safeKnowledgeQuestions.length));

      const dailySet: Question[] = selectedIndices.map(index => {
        const q = safeKnowledgeQuestions[index];
        return {
          question: q?.question ?? "Missing question",
          options: Array.isArray(q?.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: q?.correctAnswer ?? "Option A"
        };
      });

      setQuestions(dailySet);
      setOriginalIndices(selectedIndices);

      const today = new Date().toDateString();
      await AsyncStorage.setItem("dailyQuiz", JSON.stringify({
        questions: dailySet,
        originalIndices: selectedIndices
      }));
      await AsyncStorage.setItem("quizDate", today);
      setIsLoading(false);
    } catch (error) {
      console.error("Error resetting quiz:", error);
      setHasError(true);
      setIsLoading(false);
    }
  };

  const getOptionStyle = (option: string, index: number) => {
    if (!isAnswered) {
      const hue = theme.isDark ? 230 + index * 12 : 220 + index * 15;
      const lightness = theme.isDark ? 35 : 55;
      return [s.optionBtn, { backgroundColor: `hsl(${hue}, 70%, ${lightness}%)` }];
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

  const getCorrectOptionIcon = (option: string) => {
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

  // Show error state if there's an error
  if (hasError) {
    return (
      <BackgroundWrapper colors={gradientPrimary}>
        <SafeAreaView style={s.safeArea}>
          <View style={s.loadingContainer}>
            <View style={s.errorCard}>
              <Text style={s.errorEmoji}>😔</Text>
              <Text style={s.errorTitle}>Oops! Something went wrong</Text>
              <Text style={s.errorText}>
                Unable to load quiz questions. Please check that your knowledge file is properly configured.
              </Text>
              <TouchableOpacity style={s.retryBtn} onPress={resetQuiz}>
                <Text style={s.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  // Show loading state
  if (isLoading || questions.length === 0) {
    return (
      <BackgroundWrapper colors={gradientPrimary}>
        <SafeAreaView style={s.safeArea}>
          <View style={s.loadingContainer}>
            <Animated.View style={[s.loadingCard, { transform: [{ scale: scaleAnim }] }]}>
              <Text style={s.loadingEmoji}>🧠</Text>
              <Text style={s.loadingText}>Preparing your daily challenge...</Text>
              <View style={s.loadingDots}>
                <View style={[s.dot, s.dot1]} />
                <View style={[s.dot, s.dot2]} />
                <View style={[s.dot, s.dot3]} />
              </View>
            </Animated.View>
          </View>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  if (showResult) {
    const finalScore = score;
    const percentage = (finalScore / questions.length) * 100;

    return (
      <BackgroundWrapper colors={gradientReverse}>
        <SafeAreaView style={s.safeArea}>
          <StatusBar barStyle="light-content" />
          <Animated.View
            style={[
              s.resultContainer,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}
          >
            <View style={s.resultCard}>
              <Text style={s.resultEmoji}>
                {percentage >= 80 ? '🏆' : percentage >= 60 ? '🌟' : '💪'}
              </Text>
              <Text style={s.resultTitle}>Quiz Complete!</Text>
              <View style={s.scoreContainer}>
                <Text style={s.scoreNumber}>{finalScore}</Text>
                <Text style={s.scoreDivider}>/</Text>
                <Text style={s.scoreTotal}>{questions.length}</Text>
              </View>
              <Text style={s.percentageText}>{percentage.toFixed(0)}% Correct</Text>

              <View style={s.progressContainer}>
                <View style={s.progressTrack}>
                  <Animated.View
                    style={[
                      s.progressFill,
                      { width: `${percentage}%` }
                    ]}
                  />
                </View>
              </View>

              <Text style={s.motivationText}>
                {percentage >= 80
                  ? "Outstanding! You're a quiz master!"
                  : percentage >= 60
                    ? "Well done! Keep up the great work!"
                    : "Practice makes perfect! Try again tomorrow!"}
              </Text>

              <View style={s.buttonContainer}>
                <TouchableOpacity style={s.resetBtn} onPress={resetQuiz}>
                  <LinearGradient
                    colors={gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.resetBtnGradient}
                  >
                    <Text style={s.resetBtnText}>🔄Try New Quiz</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <Text style={s.comeBackText}>New questions available tomorrow! ⏰</Text>
            </View>
          </Animated.View>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper colors={gradientPrimary}>
      <SafeAreaView style={s.safeArea}>
        <StatusBar barStyle="light-content" />

        <Animated.View
          style={[
            s.headerContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Text style={s.headerTitle}>Daily Quiz 🧠</Text>
          <Text style={s.headerSubtitle}>Test Your Knowledge</Text>
        </Animated.View>

        <View style={s.progressBarContainer}>
          <Text style={s.progressText}>
            Question {currentIndex + 1} of {questions.length}
          </Text>
          <View style={s.progressTrack}>
            <Animated.View
              style={[
                s.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  })
                }
              ]}
            />
          </View>
        </View>

        <Animated.View
          style={[
            s.questionContainer,
            {
              opacity: fadeAnim,
              transform: [{
                translateX: slideAnim.interpolate({
                  inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                  outputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                })
              }]
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
            <Text style={s.questionText}>
              {questions[currentIndex]?.question || "Loading question..."}
            </Text>
          </View>

          <View style={s.optionsContainer}>
            {questions[currentIndex]?.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={getOptionStyle(option, index)}
                onPress={() => handleAnswer(option)}
                disabled={isAnswered}
                activeOpacity={0.8}
              >
                <Text style={[
                  s.optionText,
                  isAnswered && selectedAnswer === option && s.selectedOptionText
                ]}>
                  {String.fromCharCode(65 + index)}. {option}
                </Text>
                {getCorrectOptionIcon(option)}
              </TouchableOpacity>
            )) || (
                <View style={s.loadingOptions}>
                  <Text style={s.loadingOptionsText}>Loading options...</Text>
                </View>
              )}
          </View>
        </Animated.View>
      </SafeAreaView>

      {/* Custom Result Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          Animated.timing(modalScaleAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => setShowModal(false));
        }}
      >
        <View style={s.modalOverlay}>
          <Animated.View style={[s.modalContainer, { transform: [{ scale: modalScaleAnim }] }]}>
            {/* Icon */}
            <Text style={s.modalEmoji}>{modalData.emoji}</Text>

            {/* Title */}
            <Text style={s.modalTitle}>{modalData.title}</Text>

            {/* Score */}
            <View style={s.modalScoreRow}>
              <Text style={[
                s.modalScoreValue,
                { color: modalData.percentage >= 80 ? '#4CAF50' : modalData.percentage >= 60 ? '#FF9800' : '#F44336' }
              ]}>
                {modalData.score}
              </Text>
              <Text style={s.modalScoreTotal}>/{modalData.total}</Text>
            </View>
            <Text style={s.modalPercentage}>{modalData.percentage.toFixed(0)}% Correct</Text>
            <Text style={s.modalMessage}>{modalData.message}</Text>

            {/* Stats */}
            <View style={s.modalStatsRow}>
              <View style={s.modalStatItem}>
                <Text style={s.modalStatValue}>{modalData.score}</Text>
                <Text style={s.modalStatLabel}>Correct</Text>
              </View>
              <View style={s.modalStatDivider} />
              <View style={s.modalStatItem}>
                <Text style={s.modalStatValue}>{modalData.total - modalData.score}</Text>
                <Text style={s.modalStatLabel}>Wrong</Text>
              </View>
              <View style={s.modalStatDivider} />
              <View style={s.modalStatItem}>
                <Text style={s.modalStatValue}>{modalData.total}</Text>
                <Text style={s.modalStatLabel}>Total</Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={s.modalButtonRow}>
              <TouchableOpacity style={s.modalButtonSecondary} onPress={() => {
                Animated.timing(modalScaleAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => setShowModal(false));
              }}>
                <Text style={s.modalButtonSecondaryText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalButtonPrimary} onPress={() => {
                Animated.timing(modalScaleAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
                  setShowModal(false);
                  resetQuiz();
                });
              }}>
                <Text style={s.modalButtonPrimaryText}>🔄 New Quiz</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </BackgroundWrapper>
  );
}

function createDailyQuizStyles(theme: AppTheme) {
  const { isDark } = theme;
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.95)';
  const cardTextPrimary = isDark ? '#E8EAED' : '#2c3e50';
  const cardTextSecondary = isDark ? '#B0B3B8' : '#7f8c8d';

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      paddingHorizontal: 24,
    },
    headerContainer: {
      alignItems: 'center',
      paddingTop: 20,
      paddingBottom: 30,
      paddingHorizontal: 16,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: '800',
      color: '#ffffff',
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: 5,
      fontWeight: '500',
    },
    progressBarContainer: {
      marginBottom: 30,
      paddingHorizontal: 8,
    },
    progressText: {
      fontSize: 16,
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 15,
      fontWeight: '600',
    },
    progressTrack: {
      height: 8,
      backgroundColor: 'rgba(146, 255, 146, 0.41)',
      borderRadius: 4,
      overflow: 'hidden',
      marginHorizontal: 5,
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#38ef7d',
      borderRadius: 4,
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#38ef7d',
      borderRadius: 4,
    },
    questionContainer: {
      flex: 1,
      paddingBottom: 20,
      paddingHorizontal: 3,
    },
    questionCard: {
      borderRadius: 20,
      padding: 10,
      marginBottom: 25,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      ...(isDark && {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.10)',
      }),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0,
      shadowRadius: Platform.OS === 'ios' ? 20 : 0,
      elevation: (Platform.OS === 'android' && !isDark) ? 8 : 0,
    },
    questionIconContainer: {
      alignItems: 'center',
      marginBottom: 15,
    },
    questionIconImage: {
      width: 50,
      height: 50,
      tintColor: '#ffffff',
    },
    questionText: {
      fontSize: 20,
      fontWeight: '600',
      color: '#ffffff',
      textAlign: 'center',
      lineHeight: 28,
    },
    optionsContainer: {
      flex: 1,
      paddingHorizontal: 4,
    },
    optionBtn: {
      borderRadius: 15,
      padding: 15,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0,
      shadowRadius: Platform.OS === 'ios' ? 8 : 0,
      elevation: (Platform.OS === 'android' && !isDark) ? 4 : 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...(isDark && {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
      }),
    },
    optionText: {
      fontSize: 16,
      color: '#ffffff',
      fontWeight: '600',
      flex: 1,
    },
    selectedOptionText: {
      fontWeight: '700',
    },
    correctOption: {
      backgroundColor: isDark ? 'rgba(76, 175, 80, 0.3)' : '#27ae60',
      borderColor: isDark ? 'rgba(76, 175, 80, 0.5)' : 'transparent',
    },
    incorrectOption: {
      backgroundColor: isDark ? 'rgba(231, 76, 60, 0.3)' : '#e74c3c',
      borderColor: isDark ? 'rgba(231, 76, 60, 0.5)' : 'transparent',
    },
    disabledOption: {
      backgroundColor: isDark ? 'rgba(108, 117, 125, 0.4)' : 'rgba(108, 117, 125, 0.6)',
    },
    correctIcon: {
      fontSize: 20,
      color: '#ffffff',
      fontWeight: 'bold',
    },
    incorrectIcon: {
      fontSize: 20,
      color: '#ffffff',
      fontWeight: 'bold',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    loadingCard: {
      backgroundColor: cardBg,
      borderRadius: 20,
      padding: 40,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: isDark ? 0 : 10,
      ...(isDark && {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.10)',
      }),
    },
    loadingEmoji: {
      fontSize: 50,
      marginBottom: 20,
    },
    loadingText: {
      fontSize: 18,
      color: cardTextPrimary,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 20,
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
      marginHorizontal: 3,
    },
    dot1: { opacity: 0.4 },
    dot2: { opacity: 0.7 },
    dot3: { opacity: 1 },
    errorCard: {
      backgroundColor: cardBg,
      borderRadius: 20,
      padding: 40,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: isDark ? 0 : 10,
      ...(isDark && {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.10)',
      }),
    },
    errorEmoji: {
      fontSize: 50,
      marginBottom: 20,
    },
    errorTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#e74c3c',
      marginBottom: 15,
      textAlign: 'center',
    },
    errorText: {
      fontSize: 16,
      color: cardTextSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 30,
    },
    retryBtn: {
      backgroundColor: isDark ? 'rgba(67, 77, 87, 0.8)' : '#434D57',
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 15,
      shadowColor: '#434D57',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    retryBtnText: {
      fontSize: 16,
      color: '#ffffff',
      fontWeight: '700',
    },
    resultContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    resultCard: {
      backgroundColor: cardBg,
      borderRadius: 25,
      padding: 40,
      alignItems: 'center',
      width: '100%',
      maxWidth: 350,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 15 },
      shadowOpacity: 0.3,
      shadowRadius: 25,
      elevation: isDark ? 0 : 15,
      ...(isDark && {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.10)',
      }),
    },
    resultEmoji: {
      fontSize: 60,
      marginBottom: 20,
    },
    resultTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: cardTextPrimary,
      marginBottom: 20,
    },
    scoreContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 10,
    },
    scoreNumber: {
      fontSize: 48,
      fontWeight: '900',
      color: isDark ? '#9B8DC7' : '#6B5B95',
    },
    scoreDivider: {
      fontSize: 36,
      fontWeight: '600',
      color: cardTextSecondary,
      marginHorizontal: 8,
    },
    scoreTotal: {
      fontSize: 36,
      fontWeight: '600',
      color: cardTextSecondary,
    },
    percentageText: {
      fontSize: 18,
      color: isDark ? '#B0B3B8' : '#34495e',
      fontWeight: '600',
      marginBottom: 20,
    },
    progressContainer: {
      width: '100%',
      marginBottom: 25,
    },
    motivationText: {
      fontSize: 16,
      color: cardTextSecondary,
      textAlign: 'center',
      marginBottom: 30,
      lineHeight: 22,
      fontWeight: '500',
    },
    buttonContainer: {
      width: '100%',
      marginBottom: 20,
    },
    resetBtn: {
      borderRadius: 15,
      shadowColor: '#434D57',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    resetBtnGradient: {
      padding: 15,
      borderRadius: 15,
      alignItems: 'center',
    },
    resetBtnText: {
      fontSize: 16,
      color: '#ffffff',
      fontWeight: '700',
    },
    comeBackText: {
      fontSize: 14,
      color: isDark ? '#8A8D91' : '#95a5a6',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    loadingOptions: {
      padding: 20,
      alignItems: 'center',
    },
    loadingOptionsText: {
      fontSize: 16,
      color: '#ffffff',
      opacity: 0.7,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 30,
    },
    modalContainer: {
      width: '100%',
      backgroundColor: isDark ? 'rgba(30, 35, 45, 0.95)' : '#FFFFFF',
      borderRadius: 24,
      paddingVertical: 32,
      paddingHorizontal: 24,
      alignItems: 'center',
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: isDark ? 0 : 10,
    },
    modalEmoji: {
      fontSize: 56,
      marginBottom: 12,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: isDark ? '#E8EAED' : '#2c3e50',
      marginBottom: 16,
      textAlign: 'center',
    },
    modalScoreRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 4,
    },
    modalScoreValue: {
      fontSize: 48,
      fontWeight: '900',
    },
    modalScoreTotal: {
      fontSize: 24,
      fontWeight: '600',
      color: isDark ? '#B0B3B8' : '#7f8c8d',
    },
    modalPercentage: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#B0B3B8' : '#34495e',
      marginBottom: 8,
    },
    modalMessage: {
      fontSize: 15,
      color: isDark ? '#8A8D91' : '#7f8c8d',
      marginBottom: 24,
      textAlign: 'center',
    },
    modalStatsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA',
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 20,
      width: '100%',
      marginBottom: 24,
    },
    modalStatItem: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    modalStatValue: {
      fontSize: 18,
      fontWeight: '800',
      color: isDark ? '#E8EAED' : '#2c3e50',
    },
    modalStatLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: isDark ? '#8A8D91' : '#7f8c8d',
    },
    modalStatDivider: {
      width: 1,
      height: 36,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E0E0E0',
    },
    modalButtonRow: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    modalButtonSecondary: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F0F0F0',
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
    },
    modalButtonSecondaryText: {
      fontSize: 15,
      fontWeight: '700',
      color: isDark ? '#E8EAED' : '#2c3e50',
    },
    modalButtonPrimary: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FF6B35',
    },
    modalButtonPrimaryText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
}