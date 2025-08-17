import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { quizEyeTest } from './constant'; // Import the quiz data
// Quiz data structure with correct answers

export default function SignTest() {
    const router = useRouter();
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState<any[]>([]);
    const [attempts, setAttempts] = useState(0);
    
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
        let interval: NodeJS.Timeout;
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

    // Handle time up
    const handleTimeUp = () => {
        setGameState('finished');
        liquidProgressAnim.stopAnimation();
        //liquidProgressAnim.setValue(1);
        Alert.alert(
            "Time's Up!",
            `Your score: ${score}/20\nTime taken: ${60 - timeLeft} seconds`,
            [
                {
                    text: "Okay",
                    onPress: () => {
                        //resetGame();
                    }
                }
            ]
        );
    };

    // Handle answer selection
    const handleAnswerSelect = (answer: string) => {
        if (selectedAnswer || gameState !== 'playing') return;
        
        setSelectedAnswer(answer);
        setShowResult(true);
        
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
               // liquidProgressAnim.setValue(1);
                Alert.alert(
                    "Eye Test Completed!",
                    `Congratulations! Your score: ${isCorrect ? score + 1 : score}/20\nTime taken: ${60 - timeLeft} seconds`,
                    [
                        {
                            text: "Okay",
                            onPress: () => {
                                //resetGame();
                            }
                        }
                    ]
                );
            }
        }, 800);
    };

    // Reset game
    const resetGame = () => {
        setGameState('idle');
        setCurrentQuestionIndex(0);
        setScore(0);
        setTimeLeft(60);
        setSelectedAnswer(null);
        setShowResult(false);
        setCurrentQuiz([]);
        
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
        <>
            <Stack.Screen 
                options={{
                    title: "Eye Test",
                    headerTitleAlign: 'center',
                    headerStyle: {
                        backgroundColor: '#434D57',
                    },
                    headerTitleStyle: {
                        fontSize: 20,
                        color: '#FFFFFF',
                    },
                    headerTintColor: '#FFFFFF',
                    headerLeft: () => (
                        <Pressable 
                            onPress={() => router.replace("/")}
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
                            <Text style={styles.timerLabel}>Timer</Text>
                            <Text style={styles.timerSubtext}>
                                {gameState === 'playing' ? "Time is running" : 
                                 gameState === 'finished' ? "Time has ended" : 
                                 "Press start to begin"}
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
                                <Text style={styles.startButtonText}>Start</Text>
                            </Pressable>
                        )}
                    </Animated.View>
                </View>

                {/* Score Display */}
                {gameState === 'playing' && (
                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreText}>Score: {score}/20</Text>
                        <Text style={styles.questionCounter}>Question {currentQuestionIndex + 1}/20</Text>
                    </View>
                )}

                {/* Question Section */}
                {gameState === 'playing' && currentQuiz.length > 0 && (
                    <View style={styles.questionSection}>
                        <Text style={styles.questionTitle}>Which sign is this?</Text>
                        <Text style={styles.questionSubtitle}>Please identify the sign</Text>
                        
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
                    <View style={styles.gameOverContainer}>
                        <Text style={styles.gameOverTitle}>Quiz Completed!</Text>
                        <Text style={styles.gameOverScore}>Final Score: {score}/20</Text>
                        <Text style={styles.gameOverTime}>Time Taken: {60 - timeLeft} seconds</Text>
                        <Pressable style={styles.restartButton} onPress={resetGame}>
                            <Text style={styles.restartButtonText}>Play Again</Text>
                        </Pressable>
                    </View>
                )}

                {/* Instructions */}
                {gameState === 'idle' && (
                    <View style={styles.instructionsContainer}>
                        <Text style={styles.instructionsTitle}>How to Play</Text>
                        <Text style={styles.instructionsText}>
                            • Identify 20 numbers within 60 seconds{'\n'}
                            • Click the correct answer from 3 options{'\n'}
                            • Green glow → correct answer{'\n'}
                            • Red glow → incorrect answer{'\n'}
                            • Complete all questions before time runs out!
                        </Text>
                    </View>
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
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
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
        color: '#333',
        marginBottom: 2,
    },
    timerSubtext: {
        fontFamily: 'Raleway-Medium',
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
        fontFamily: 'Raleway-Medium',
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
        fontFamily: 'Raleway-Bold',
        fontSize: 16,
        color: '#333',
    },
    questionCounter: {
        fontFamily: 'Raleway-Medium',
        fontSize: 14,
        color: '#666',
    },
    questionSection: {
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
    questionTitle: {
        fontFamily: 'Raleway-Bold',
        fontSize: 20,
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    questionSubtitle: {
        fontFamily: 'Raleway-Medium',
        fontSize: 14,
        color: '#999',
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
        gap: 12,
        paddingBottom: 30,
    },
    optionButton: {
        backgroundColor: '#434D57',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    correctAnswer: {
        backgroundColor: '#4CAF50',
    },
    incorrectAnswer: {
        backgroundColor: '#F44336',
    },
    optionText: {
        color: '#fff',
        fontFamily: 'Raleway-Medium',
        fontSize: 16,
        textAlign: 'center',
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
    gameOverTitle: {
        fontFamily: 'Raleway-Bold',
        fontSize: 24,
        color: '#333',
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
        color: '#666',
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
    instructionsTitle: {
        fontFamily: 'Raleway-Bold',
        fontSize: 24,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    instructionsText: {
        fontFamily: 'Raleway-Medium',
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        textAlign: 'center',
    },
    headerBackButton: {
        padding: 8,
        marginLeft: 10,
        borderRadius: 20,
    },
});