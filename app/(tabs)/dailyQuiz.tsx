import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { dailyquizQT } from "../(tabs)/dailyquizQT"; // Updated import

// Add safety check for imported data with proper fallbacks
const safeKnowledgeQuestions = Array.isArray(dailyquizQT) ? dailyquizQT : [];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Question {
  question: string;
  options: [string, string, string, string];
  correctAnswer: string; // Added correctAnswer to interface
}

export default function EnhancedDailyQuizScreen() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [originalIndices, setOriginalIndices] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Simplified animation values for better Android performance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
          Alert.alert("Error", "No quiz questions available. Please check your knowledge file.");
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
        Alert.alert("Error", `Failed to load quiz: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
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
        message = "Excellent work!";
        emoji = "🎉";
      } else if (percentage >= 60) {
        message = "Good job!";
        emoji = "👏";
      } else {
        message = "Keep practicing!";
        emoji = "📚";
      }

      Alert.alert(
        `${emoji} Quiz Completed!`,
        `${message}\nYou scored ${finalScore}/${questions.length} (${percentage.toFixed(0)}%)`,
        [{ text: "Amazing!", style: "default" }]
      );
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
        Alert.alert("Error", "No quiz questions available. Please check your knowledge file.");
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
      return [styles.optionBtn, { backgroundColor: `hsl(${220 + index * 15}, 70%, 55%)` }];
    }

    const currentQuestion = questions[currentIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    const isSelected = option === selectedAnswer;

    if (isSelected && isCorrect) {
      return [styles.optionBtn, styles.correctOption];
    } else if (isSelected && !isCorrect) {
      return [styles.optionBtn, styles.incorrectOption];
    } else if (isCorrect) {
      return [styles.optionBtn, styles.correctOption];
    } else {
      return [styles.optionBtn, styles.disabledOption];
    }
  };

  const getCorrectOptionIcon = (option: string) => {
    if (!isAnswered) return null;

    const currentQuestion = questions[currentIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) {
      return <Text style={styles.correctIcon}>✓</Text>;
    }

    if (isSelected && !isCorrect) {
      return <Text style={styles.incorrectIcon}>✗</Text>;
    }

    return null;
  };

  // Show error state if there's an error
  if (hasError) {
    return (
      <LinearGradient
        colors={['#434D57', '#6B5B95']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <View style={styles.errorCard}>
              <Text style={styles.errorEmoji}>😔</Text>
              <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
              <Text style={styles.errorText}>
                Unable to load quiz questions. Please check that your knowledge file is properly configured.
              </Text>
              <TouchableOpacity style={styles.retryBtn} onPress={resetQuiz}>
                <Text style={styles.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Show loading state
  if (isLoading || questions.length === 0) {
    return (
      <LinearGradient
        colors={['#434D57', '#6B5B95']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Animated.View style={[styles.loadingCard, { transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.loadingEmoji}>🧠</Text>
              <Text style={styles.loadingText}>Preparing your daily challenge...</Text>
              <View style={styles.loadingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </Animated.View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (showResult) {
    const finalScore = score;
    const percentage = (finalScore / questions.length) * 100;

    return (
      <LinearGradient
        colors={['#6B5B95', '#434D57']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" />
          <Animated.View 
            style={[
              styles.resultContainer,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}
          >
            <View style={styles.resultCard}>
              <Text style={styles.resultEmoji}>
                {percentage >= 80 ? '🏆' : percentage >= 60 ? '🌟' : '💪'}
              </Text>
              <Text style={styles.resultTitle}>Quiz Complete!</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreNumber}>{finalScore}</Text>
                <Text style={styles.scoreDivider}>/</Text>
                <Text style={styles.scoreTotal}>{questions.length}</Text>
              </View>
              <Text style={styles.percentageText}>{percentage.toFixed(0)}% Correct</Text>

              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <Animated.View 
                    style={[
                      styles.progressFill, 
                      { width: `${percentage}%` }
                    ]} 
                  />
                </View>
              </View>

              <Text style={styles.motivationText}>
                {percentage >= 80 
                  ? "Outstanding! You're a quiz master!" 
                  : percentage >= 60 
                  ? "Well done! Keep up the great work!"
                  : "Practice makes perfect! Try again tomorrow!"}
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.resetBtn} onPress={resetQuiz}>
                  <LinearGradient
                    colors={['#434D57', '#6B5B95']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.resetBtnGradient}
                  >
                    <Text style={styles.resetBtnText}>🔄Try New Quiz</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <Text style={styles.comeBackText}>New questions available tomorrow! ⏰</Text>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#434D57', '#6B5B95']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <Animated.View 
          style={[
            styles.headerContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Text style={styles.headerTitle}>Daily Quiz 🧠</Text>
          <Text style={styles.headerSubtitle}>Test Your Knowledge</Text>
        </Animated.View>

        <View style={styles.progressBarContainer}>
          <Text style={styles.progressText}>
            Question {currentIndex + 1} of {questions.length}
          </Text>
          <View style={styles.progressTrack}>
            <Animated.View 
              style={[
                styles.progressBar,
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
            styles.questionContainer,
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
          <View style={styles.questionCard}>
            <View style={styles.questionIconContainer}>
              <Image 
                source={require('../../assets/images/trophy.png')}
                style={styles.questionIconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.questionText}>
              {questions[currentIndex]?.question || "Loading question..."}
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {questions[currentIndex]?.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={getOptionStyle(option, index)}
                onPress={() => handleAnswer(option)}
                disabled={isAnswered}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.optionText,
                  isAnswered && selectedAnswer === option && styles.selectedOptionText
                ]}>
                  {String.fromCharCode(65 + index)}. {option}
                </Text>
                {getCorrectOptionIcon(option)}
              </TouchableOpacity>
            )) || (
              <View style={styles.loadingOptions}>
                <Text style={styles.loadingOptionsText}>Loading options...</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
    // Remove the fixed width: 350
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
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0,
    shadowRadius: Platform.OS === 'ios' ? 20 : 0,
    elevation: Platform.OS === 'android' ? 8 : 0,
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
  questionIcon: {
    fontSize: 40,
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
    elevation: Platform.OS === 'android' ? 4 : 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: '#27ae60',
  },
  incorrectOption: {
    backgroundColor: '#e74c3c',
  },
  disabledOption: {
    backgroundColor: 'rgba(108, 117, 125, 0.6)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingEmoji: {
    fontSize: 50,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#2c3e50',
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
    backgroundColor: '#434D57',
    marginHorizontal: 3,
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.7 },
  dot3: { opacity: 1 },
  errorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
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
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  retryBtn: {
    backgroundColor: '#434D57',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
  resultEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2c3e50',
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
    color: '#6B5B95',
  },
  scoreDivider: {
    fontSize: 36,
    fontWeight: '600',
    color: '#7f8c8d',
    marginHorizontal: 8,
  },
  scoreTotal: {
    fontSize: 36,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  percentageText: {
    fontSize: 18,
    color: '#34495e',
    fontWeight: '600',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 25,
    //paddingHorizontal: 16,
  },
  motivationText: {
    fontSize: 16,
    color: '#7f8c8d',
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
    color: '#95a5a6',
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
});