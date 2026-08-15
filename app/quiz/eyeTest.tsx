import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme, ThemeBackground } from '@/context/ThemeContext';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';
import { themedHeaderOptions } from '@/constants/screenHelpers';
import type { AppTheme } from '@/constants/theme';
import { Animated, Image, Modal, Pressable, StyleSheet, Text, View, Platform, ScrollView } from 'react-native';
import { quizEyeTest } from './constant';
import { useLanguage } from '@/context/LanguageContext';
import { useRewardedAd, AD_UNITS } from '@/utils/mobileAds';

const rewardedAdUnitId = AD_UNITS.REWARDED;

import AdBanner from '@/components/AdBanner';
// Quiz data structure with correct answers

export default function EyeTest() {
    const { theme } = useTheme();
    const { isNepali } = useLanguage();
    const styles = useMemo(() => createStyles(theme, isNepali), [theme, isNepali]);
    const router = useRouter();
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState<any[]>([]);
    const [attempts, setAttempts] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState<{ title: string; score: number; timeTaken: number; isTimeUp: boolean }>({ title: '', score: 0, timeTaken: 0, isTimeUp: false });
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [isReviewUnlocked, setIsReviewUnlocked] = useState(false);
    const [pendingAction, setPendingAction] = useState<'review' | 'restart' | 'back' | null>(null);

    // Hook for AdMob Rewarded Ad
    const { isLoaded, isClosed, show, reward, load } = useRewardedAd(rewardedAdUnitId, {
        requestNonPersonalizedAdsOnly: true,
    });

    // Proactively load the ad when the screen mounts
    useEffect(() => {
        load();
    }, [load]);

    // Handle reward and unlock reviews
    useEffect(() => {
        if (isClosed && reward) {
            setIsReviewUnlocked(true);
            if (pendingAction === 'review') {
                setShowModal(false);
            } else if (pendingAction === 'restart') {
                setShowModal(false);
                resetGame();
            } else if (pendingAction === 'back') {
                router.back();
            }
            setPendingAction(null);
        } else if (isClosed) {
            // User closed early - reload ad, don't unlock/go back
            setPendingAction(null);
            load();
        }
    }, [isClosed, reward, pendingAction, load]);

    const handleBackPress = () => {
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
    const modalScaleAnim = useRef(new Animated.Value(0)).current;

    // Animation refs
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const buttonWidthAnim = useRef(new Animated.Value(100)).current;
    const liquidProgressAnim = useRef(new Animated.Value(0)).current;
    const optionAnimations = useRef([
        new Animated.Value(1),
        new Animated.Value(1),
        new Animated.Value(1)
    ]).current;

    // Timer countdown logic
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

    // Generate random quiz questions with randomized answer positions
    const generateRandomQuiz = () => {
        const shuffled = [...quizEyeTest].sort(() => Math.random() - 0.2);
        const selectedQuestions = shuffled.slice(0, 20);

        // Randomize the position of correct answers in options
        return selectedQuestions.map(question => {
            const options = [...question.options];
            const correctAnswer = question.correctAnswer;

            // Shuffle the options array to randomize positions
            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
            }

            return {
                ...question,
                options: options,
                correctAnswer: correctAnswer // Keep the correct answer reference
            };
        });
    };

    // Timer animation
    const pulseAnimation = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle start button press
    const handleStart = () => {
        const newQuiz = generateRandomQuiz();
        setCurrentQuiz(newQuiz);
        setCurrentQuestionIndex(0);
        setScore(0);
        setTimeLeft(60);
        setGameState('playing');
        setSelectedAnswer(null);
        setShowResult(false);
        setAttempts(prev => prev + 1);

        // Reset liquid animation
        liquidProgressAnim.setValue(0);

        // Animate button width
        Animated.spring(buttonWidthAnim, {
            toValue: 140,
            useNativeDriver: false,
            friction: 8,
        }).start();

        // Animate liquid progress
        Animated.timing(liquidProgressAnim, {
            toValue: 1,
            duration: 60 * 1000,
            useNativeDriver: false,
        }).start();
    };

    // Show custom result modal
    const showResultModal = (title: string, finalScore: number, timeTaken: number, isTimeUp: boolean) => {
        setModalData({ title, score: finalScore, timeTaken, isTimeUp });
        setShowModal(true);
        modalScaleAnim.setValue(0);
        Animated.spring(modalScaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 6,
            tension: 80,
        }).start();
    };

    const dismissModal = () => {
        Animated.timing(modalScaleAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => setShowModal(false));
    };

    // Handle time up
    const handleTimeUp = () => {
        setGameState('finished');
        liquidProgressAnim.stopAnimation();
        showResultModal("Time's Up!", score, 60 - timeLeft, true);
    };

    // Handle answer selection
    const handleAnswerSelect = (answer: string) => {
        if (selectedAnswer || gameState !== 'playing') return;

        setSelectedAnswer(answer);
        setShowResult(true);
        setUserAnswers(prev => [...prev, answer]);

        const isCorrect = answer === currentQuiz[currentQuestionIndex].correctAnswer;

        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        // Animate the selected button
        const buttonIndex = currentQuiz[currentQuestionIndex].options.indexOf(answer);
        Animated.sequence([
            Animated.timing(optionAnimations[buttonIndex], {
                toValue: 1.2,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(optionAnimations[buttonIndex], {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        // Move to next question after delay
        setTimeout(() => {
            if (currentQuestionIndex < 19) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setShowResult(false);
            } else {
                // Quiz completed
                setGameState('finished');
                liquidProgressAnim.stopAnimation();
                showResultModal('Eye Test Completed!', isCorrect ? score + 1 : score, 60 - timeLeft, false);
            }
        }, 800);
    };

    // Reset game
    function resetGame() {
        setGameState('idle');
        setCurrentQuestionIndex(0);
        setScore(0);
        setTimeLeft(60);
        setSelectedAnswer(null);
        setShowResult(false);
        setCurrentQuiz([]);
        setUserAnswers([]);
        setIsReviewUnlocked(false);

        // Reset animations
        liquidProgressAnim.setValue(0);
        Animated.spring(buttonWidthAnim, {
            toValue: 100,
            useNativeDriver: false,
            friction: 8,
        }).start();
    };

    // Get button style based on answer state
    const getButtonStyle = (option: string, index: number) => {
        if (!showResult) return styles.optionButton;

        if (option === currentQuiz[currentQuestionIndex].correctAnswer) {
            return [styles.optionButton, styles.correctAnswer];
        } else if (option === selectedAnswer && option !== currentQuiz[currentQuestionIndex].correctAnswer) {
            return [styles.optionButton, styles.incorrectAnswer];
        }

        return styles.optionButton;
    };

    // Get button text color
    const getButtonTextColor = (option: string) => {
        if (!showResult) return '#fff';

        if (option === currentQuiz[currentQuestionIndex].correctAnswer) {
            return '#fff';
        } else if (option === selectedAnswer && option !== currentQuiz[currentQuestionIndex].correctAnswer) {
            return '#fff';
        }

        return '#fff';
    };

    return (
        <ThemeBackground>
            <Stack.Screen
                options={{
                    title: isNepali ? unicodeToAakriti("दृष्टि परीक्षा (आई टेस्ट)") : "Eye Test",
                    ...themedHeaderOptions(theme),
                    headerTitleStyle: {
                        fontSize: isNepali ? 22 : 20,
                        color: '#FFFFFF',
                        fontFamily: isNepali ? 'AakritiBold' : undefined,
                    },
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
                {/* Timer Section */}
                <View style={styles.timerContainer}>
                    <View style={styles.timerLeft}>
                        <Animated.View
                            style={[
                                styles.timerIconBackground,
                                { transform: [{ scale: scaleAnim }] },
                            ]}
                        >
                            <Image
                                source={require('../../assets/images/stopwatch.png')}
                                style={styles.timerIcon}
                                resizeMode="contain"
                            />
                        </Animated.View>
                        <View style={styles.timerTextContainer}>
                            <Text style={styles.timerLabel}>{isNepali ? 'समय' : 'Timer'}</Text>
                            <Text style={styles.timerSubtext}>
                                {gameState === 'playing' ? (isNepali ? "समय चलिरहेको छ" : "Time is running") :
                                    gameState === 'finished' ? (isNepali ? "समय समाप्त भयो" : "Time has ended") :
                                        (isNepali ? "सुरु गर्न Start थिच्नुहोस्" : "Press start to begin")}
                            </Text>
                        </View>
                    </View>
                    <Animated.View style={[styles.buttonContainer, { width: buttonWidthAnim }]}>
                        {gameState === 'playing' || gameState === 'finished' ? (
                            <View style={styles.startButton}>
                                <Animated.View
                                    style={[
                                        styles.liquidFill,
                                        {
                                            width: liquidProgressAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0%', '100%'],
                                            }),
                                            backgroundColor: '#FE8153',
                                        },
                                    ]}
                                >
                                    <View style={styles.liquidBubble} />
                                </Animated.View>
                                <Text style={[styles.startButtonText, styles.timerText]}>
                                    {formatTime(timeLeft)}
                                </Text>
                            </View>
                        ) : (
                            <Pressable
                                style={styles.startButton}
                                onPress={handleStart}
                            >
                                <Text style={styles.startButtonText}>{isNepali ? 'सुरु गर्नुहोस्' : 'Start'}</Text>
                            </Pressable>
                        )}
                    </Animated.View>
                </View>

                {/* Score Display */}
                {gameState === 'playing' && (
                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreText}>{isNepali ? `प्राप्तांक: ${score}/२०` : `Score: ${score}/20`}</Text>
                        <Text style={styles.questionCounter}>{isNepali ? `प्रश्न ${currentQuestionIndex + 1}/२०` : `Question ${currentQuestionIndex + 1}/20`}</Text>
                    </View>
                )}

                {/* Question Section */}
                {gameState === 'playing' && currentQuiz.length > 0 && (
                    <View style={styles.questionSection}>
                        <Text style={styles.questionTitle}>{isNepali ? 'यो कुन संख्या हो?' : 'Which number is this?'}</Text>
                        <Text style={styles.questionSubtitle}>{isNepali ? 'चित्रमा देखिएको संख्या पहिचान गर्नुहोस्' : 'Please identify the number'}</Text>

                        <View style={styles.signContainer}>
                            <Image
                                source={currentQuiz[currentQuestionIndex].image}
                                style={styles.signImage}
                                resizeMode="contain"
                            />
                            {/* Progress dots */}
                            <View style={styles.progressDots}>
                                {Array.from({ length: 20 }, (_, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.dot,
                                            i <= currentQuestionIndex ? styles.activeDot : null
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {/* Options Section */}
                {gameState === 'playing' && currentQuiz.length > 0 && (
                    <View style={styles.optionsContainer}>
                        {currentQuiz[currentQuestionIndex].options.map((option: string, index: number) => (
                            <Animated.View
                                key={index}
                                style={{ transform: [{ scale: optionAnimations[index] }] }}
                            >
                                <Pressable
                                    style={getButtonStyle(option, index)}
                                    onPress={() => handleAnswerSelect(option)}
                                    disabled={selectedAnswer !== null}
                                >
                                    <Text style={[styles.optionText, { color: getButtonTextColor(option) }]}>
                                        {option}
                                    </Text>
                                </Pressable>
                            </Animated.View>
                        ))}
                    </View>
                )}

                {/* Game Over Screen */}
                {gameState === 'finished' && (
                    <ScrollView
                        style={styles.gameOverContainer}
                        contentContainerStyle={{ paddingBottom: 40, alignItems: 'center' }}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.gameOverScore}>{isNepali ? `अन्तिम प्राप्तांक: ${score}/२०` : `Final Score: ${score}/20`}</Text>
                        <Text style={styles.gameOverTime}>{isNepali ? `लागेको समय: ${60 - timeLeft} सेकेन्ड` : `Time Taken: ${60 - timeLeft} seconds`}</Text>

                        {isReviewUnlocked && currentQuiz.map((item, index) => {
                            const userAns = userAnswers[index];
                            const isCorrect = userAns === item.correctAnswer;
                            return (
                                <View key={index} style={styles.reviewCard}>
                                    <Text style={styles.reviewNumber}>{isNepali ? `प्रश्न ${index + 1}` : `Question ${index + 1}`}</Text>
                                    <Image source={item.image} style={styles.reviewImage} resizeMode="contain" />

                                    <View style={styles.reviewAnswers}>
                                        <Text style={styles.reviewTextLabel}>{isNepali ? 'तपाईंको उत्तर:' : 'Your Answer:'}</Text>
                                        <Text style={[styles.reviewTextValue, { color: isCorrect ? '#4CAF50' : '#F44336' }]}>
                                            {userAns || (isNepali ? 'उत्तर नदिएको' : 'Unanswered')}
                                        </Text>

                                        {!isCorrect && (
                                            <>
                                                <Text style={styles.reviewTextLabel}>{isNepali ? 'सही उत्तर:' : 'Correct Answer:'}</Text>
                                                <Text style={[styles.reviewTextValue, { color: '#4CAF50' }]}>
                                                    {item.correctAnswer}
                                                </Text>
                                            </>
                                        )}
                                    </View>
                                </View>
                            );
                        })}

                        <Pressable style={styles.restartButton} onPress={resetGame}>
                            <Text style={styles.restartButtonText}>{isNepali ? 'पुनः परीक्षा दिनुहोस्' : 'Play Again'}</Text>
                        </Pressable>
                        <AdBanner />
                    </ScrollView>
                )}

                {/* Instructions */}
                {gameState === 'idle' && (
                    <View style={styles.instructionsContainer}>
                        <Text style={styles.instructionsTitle}>{isNepali ? 'परीक्षा निर्देशनहरू' : 'How to Play'}</Text>
                        <Text style={styles.instructionsText}>
                            • {isNepali ? '६० सेकेन्डभित्र २० वटा संख्याहरूको पहिचान गर्नुहोस्' : 'Identify 20 numbers within 60 seconds'}{'\n'}
                            • {isNepali ? '३ वटा विकल्पहरू मध्ये सही उत्तर छान्नुहोस्' : 'Click the correct answer from 3 options'}{'\n'}
                            • {isNepali ? 'हरियो रङ्ग → सही उत्तर' : 'Green glow → correct answer'}{'\n'}
                            • {isNepali ? 'रातो रङ्ग → गलत उत्तर' : 'Red glow → incorrect answer'}{'\n'}
                            • {isNepali ? 'समय सकिनु अघि सबै प्रश्न पूरा गर्नुहोस्!' : 'Complete all questions before time runs out!'}
                        </Text>
                    </View>
                )}
            </View>

            {/* Custom Result Modal */}
            <Modal
                visible={showModal}
                transparent
                statusBarTranslucent
                animationType="fade"
                onRequestClose={dismissModal}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View style={[styles.modalContainer, { transform: [{ scale: modalScaleAnim }] }]}>
                        {/* Icon */}
                        <View style={[styles.modalIconCircle, modalData.isTimeUp ? styles.modalIconTimeUp : styles.modalIconComplete]}>
                            <Ionicons
                                name={modalData.isTimeUp ? 'alarm-outline' : 'eye-outline'}
                                size={36}
                                color={modalData.isTimeUp ? '#FF6B35' : '#4CAF50'}
                            />
                        </View>

                        {/* Title */}
                        <Text style={styles.modalTitle}>{modalData.title}</Text>

                        {/* Score */}
                        <View style={styles.modalScoreRow}>
                            <Text style={[
                                styles.modalScoreValue,
                                { color: modalData.score >= 14 ? '#4CAF50' : modalData.score >= 10 ? '#FF9800' : '#F44336' }
                            ]}>
                                {modalData.score}
                            </Text>
                            <Text style={styles.modalScoreTotal}>/20</Text>
                        </View>
                        <Text style={styles.modalScoreLabel}>
                            {modalData.score >= 14 ? 'Great job! 🎉' : modalData.score >= 10 ? 'Good effort! 💪' : 'Keep practicing! 📚'}
                        </Text>

                        {/* Stats */}
                        <View style={styles.modalStatsRow}>
                            <View style={styles.modalStatItem}>
                                <Ionicons name="time-outline" size={18} color={theme.colors.textSecondary} />
                                <Text style={styles.modalStatValue}>{modalData.timeTaken}s</Text>
                                <Text style={styles.modalStatLabel}>Time</Text>
                            </View>
                            <View style={styles.modalStatDivider} />
                            <View style={styles.modalStatItem}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
                                <Text style={styles.modalStatValue}>{modalData.score}</Text>
                                <Text style={styles.modalStatLabel}>Correct</Text>
                            </View>
                            <View style={styles.modalStatDivider} />
                            <View style={styles.modalStatItem}>
                                <Ionicons name="close-circle-outline" size={18} color="#F44336" />
                                <Text style={styles.modalStatValue}>{20 - modalData.score}</Text>
                                <Text style={styles.modalStatLabel}>Wrong</Text>
                            </View>
                        </View>

                        {/* Buttons */}
                        <View style={styles.modalButtonRow}>
                            <Pressable
                                style={styles.modalButtonSecondary}
                                onPress={() => {
                                    if (isReviewUnlocked) {
                                        dismissModal();
                                        resetGame();
                                    } else {
                                        if (isLoaded) {
                                            setPendingAction('restart');
                                            show();
                                        } else {
                                            dismissModal();
                                            resetGame();
                                        }
                                    }
                                }}
                            >
                                <Ionicons name="refresh-outline" size={18} color={theme.colors.text} style={{ marginRight: 6 }} />
                                <Text style={styles.modalButtonSecondaryText}>Play Again</Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.modalButtonPrimary,
                                    { backgroundColor: isReviewUnlocked ? '#4CAF50' : '#FF6B35' }
                                ]}
                                onPress={() => {
                                    if (isReviewUnlocked) {
                                        dismissModal();
                                    } else {
                                        if (isLoaded) {
                                            setPendingAction('review');
                                            show();
                                        } else {
                                            setIsReviewUnlocked(true);
                                            dismissModal();
                                        }
                                    }
                                }}
                            >
                                <Text style={styles.modalButtonPrimaryText}>View Result</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </ThemeBackground>
    );
}

function createStyles(theme: AppTheme, isNepali: boolean = false) {
    const { colors, glass, isDark } = theme;
    return StyleSheet.create({
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
        liquidBubble: {
            position: 'absolute',
            right: -8,
            top: '50%',
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#FFFFFF20',
            transform: [{ translateY: -8 }],
        },
        timerText: {
            position: 'relative',
            zIndex: 1,
            color: '#FFFFFF',
            fontFamily: 'Raleway-Bold',
        },
        container: {
            flex: 1,
            backgroundColor: colors.background,
            paddingHorizontal: 20,
            paddingTop: 20,
        },
        timerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
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
            justifyContent: 'center',
            alignItems: 'center',
        },
        timerIcon: {
            width: 32,
            height: 32,
        },
        timerTextContainer: {
            marginLeft: 10,
        },
        timerLabel: {
            fontFamily: 'Raleway-Bold',
            fontSize: 16,
            color: colors.text,
            marginBottom: 2,
        },
        timerSubtext: {
            fontFamily: 'Raleway-Medium',
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
            fontFamily: 'Raleway-Medium',
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
            fontFamily: 'Raleway-Bold',
            fontSize: 16,
            color: colors.text,
        },
        questionCounter: {
            fontFamily: 'Raleway-Medium',
            fontSize: 14,
            color: colors.textSecondary,
        },
        questionSection: {
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
        questionTitle: {
            fontFamily: 'Raleway-Bold',
            fontSize: 20,
            color: colors.text,
            marginBottom: 8,
            textAlign: 'center',
        },
        questionSubtitle: {
            fontFamily: 'Raleway-Medium',
            fontSize: 14,
            color: colors.textTertiary,
            marginBottom: 30,
            textAlign: 'center',
        },
        signContainer: {
            alignItems: 'center',
            width: '100%',
        },
        signImage: {
            width: 200,
            height: 200,
            marginBottom: 20,
        },
        progressDots: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            flexWrap: 'wrap',
            justifyContent: 'center',
        },
        dot: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#E0E0E0',
        },
        activeDot: {
            backgroundColor: '#FF6B35',
        },
        optionsContainer: {
            gap: 10,
            paddingBottom: 30,
        },
        optionButton: {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#434D57',
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 0,
            borderColor: 'transparent',
        },
        correctAnswer: {
            backgroundColor: isDark ? 'rgba(76, 175, 80, 0.25)' : '#4CAF50',
            borderColor: isDark ? 'rgba(76, 175, 80, 0.5)' : 'transparent',
        },
        incorrectAnswer: {
            backgroundColor: isDark ? 'rgba(244, 67, 54, 0.25)' : '#F44336',
            borderColor: isDark ? 'rgba(244, 67, 54, 0.5)' : 'transparent',
        },
        optionText: {
            color: '#fff',
            fontFamily: 'Raleway-Medium',
            fontSize: 15,
            textAlign: 'center',
        },
        gameOverContainer: {
            flex: 1,
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
        reviewCard: {
            width: '100%',
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F9F9F9',
            borderRadius: 16,
            padding: 16,
            marginVertical: 8,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#EAEAEA',
        },
        reviewNumber: {
            fontFamily: 'Raleway-Bold',
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 8,
        },
        reviewImage: {
            width: 100,
            height: 100,
            marginBottom: 12,
        },
        reviewAnswers: {
            width: '100%',
            gap: 2,
        },
        reviewTextLabel: {
            fontFamily: 'Raleway-Medium',
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 4,
        },
        reviewTextValue: {
            fontFamily: 'Raleway-Bold',
            fontSize: 14,
        },
        gameOverTitle: {
            fontFamily: 'Raleway-Bold',
            fontSize: 24,
            color: colors.text,
            marginBottom: 20,
            textAlign: 'center',
        },
        gameOverScore: {
            fontFamily: 'Raleway-Bold',
            fontSize: 20,
            color: '#4CAF50',
            marginBottom: 10,
            textAlign: 'center',
        },
        gameOverTime: {
            fontFamily: 'Raleway-Medium',
            fontSize: 16,
            color: colors.textSecondary,
            marginBottom: 30,
            textAlign: 'center',
        },
        restartButton: {
            backgroundColor: '#FF6B35',
            paddingHorizontal: 30,
            paddingVertical: 15,
            borderRadius: 25,
        },
        restartButtonText: {
            color: '#fff',
            fontFamily: 'Raleway-Bold',
            fontSize: 18,
        },
        instructionsContainer: {
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
        instructionsTitle: {
            fontFamily: 'Raleway-Bold',
            fontSize: 24,
            color: colors.text,
            marginBottom: 20,
            textAlign: 'center',
        },
        instructionsText: {
            fontFamily: 'Raleway-Medium',
            fontSize: 16,
            color: colors.textSecondary,
            lineHeight: 24,
            textAlign: 'center',
        },
        headerBackButton: {
            padding: 8,
            marginLeft: 10,
            borderRadius: 20,
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
        modalIconCircle: {
            width: 72,
            height: 72,
            borderRadius: 36,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
        },
        modalIconTimeUp: {
            backgroundColor: isDark ? 'rgba(255, 107, 53, 0.15)' : 'rgba(255, 107, 53, 0.1)',
        },
        modalIconComplete: {
            backgroundColor: isDark ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.1)',
        },
        modalTitle: {
            fontFamily: 'Raleway-Bold',
            fontSize: 22,
            color: colors.text,
            marginBottom: 16,
            textAlign: 'center',
        },
        modalScoreRow: {
            flexDirection: 'row',
            alignItems: 'baseline',
            marginBottom: 4,
        },
        modalScoreValue: {
            fontFamily: 'Raleway-Bold',
            fontSize: 48,
        },
        modalScoreTotal: {
            fontFamily: 'Raleway-Medium',
            fontSize: 24,
            color: colors.textSecondary,
        },
        modalScoreLabel: {
            fontFamily: 'Raleway-Medium',
            fontSize: 16,
            color: colors.textSecondary,
            marginBottom: 24,
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
            fontFamily: 'Raleway-Bold',
            fontSize: 18,
            color: colors.text,
        },
        modalStatLabel: {
            fontFamily: 'Raleway-Medium',
            fontSize: 12,
            color: colors.textSecondary,
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
            fontFamily: 'Raleway-Bold',
            fontSize: 15,
            color: colors.text,
        },
        modalButtonPrimary: {
            flex: 1,
            flexDirection: 'row',
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FF6B35',
            gap: 6,
        },
        modalButtonPrimaryText: {
            fontFamily: 'Raleway-Bold',
            fontSize: 15,
            color: '#FFFFFF',
        },
    });
}
