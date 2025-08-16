import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

export default function SignTest() {
    const router = useRouter();
    const [started, setStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds = 1 minute
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const buttonWidthAnim = React.useRef(new Animated.Value(100)).current;
    const liquidProgressAnim = React.useRef(new Animated.Value(0)).current;

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

    // Timer countdown logic
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (started && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev: number) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setStarted(false);
                        // Reset the liquid animation
                        liquidProgressAnim.setValue(0);
                        return 0;
                    }
                    pulseAnimation(); // Animate on each second
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [started]);

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle start button press
    const handleStart = () => {
        setTimeLeft(60);
        setStarted(true);
        
        // Animate button width
        Animated.spring(buttonWidthAnim, {
            toValue: 140,
            useNativeDriver: false,
            friction: 8
        }).start();

        // Animate liquid progress
        Animated.timing(liquidProgressAnim, {
            toValue: 1,
            duration: 60000, // 60 seconds
            useNativeDriver: false
        }).start();
    };

    return (
        <>
            <Stack.Screen 
                options={{
                    title: "Sign Test",
                    headerTitleAlign: 'center',
                    headerStyle: {
                        backgroundColor: '#434D57',
                    },
                    headerTitleStyle: {
                        fontFamily: 'Raleway-Bold',
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
                                { transform: [{ scale: scaleAnim }] }
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
                                {started ? "Your time has started" : "Press start to begin"}
                            </Text>
                        </View>
                    </View>
                    <Animated.View style={[styles.buttonContainer, { width: buttonWidthAnim }]}>
                        {started ? (
                            <View style={styles.startButton}>
                                <Animated.View style={[
                                    styles.liquidFill,
                                    {
                                        width: liquidProgressAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0%', '100%']
                                        }),
                                        backgroundColor: '#FE8153'
                                    }
                                ]}>
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

                {/* Question Section */}
                <View style={styles.questionSection}>
                    <Text style={styles.questionTitle}>Which sign is this?</Text>
                    <Text style={styles.questionSubtitle}>please identify the sign</Text>
                    
                    <View style={styles.signContainer}>
                        <Image 
                            source={require('../../assets/images/stop-sgn.png')}
                            style={styles.signImage}
                            resizeMode="contain"
                        />
                        {/* Progress dots */}
                        <View style={styles.progressDots}>
                            <View style={[styles.dot, styles.activeDot]} />
                            <View style={styles.dot} />
                        </View>
                    </View>
                </View>

                {/* Options Section */}
                <View style={styles.optionsContainer}>
                    <Pressable style={styles.optionButton}>
                        <Text style={styles.optionText}>Stop</Text>
                    </Pressable>
                    <Pressable style={styles.optionButton}>
                        <Text style={styles.optionText}>Denied entry</Text>
                    </Pressable>
                    <Pressable style={styles.optionButton}>
                        <Text style={styles.optionText}>Start</Text>
                    </Pressable>
                </View>
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
        marginLeft: 12,
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
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 40,
    },
    startButtonText: {
        color: '#fff',
        fontFamily: 'Raleway-Medium',
        fontSize: 14,
        textAlign: 'center',
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
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
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
    optionText: {
        color: '#fff',
        fontFamily: 'Raleway-Medium',
        fontSize: 16,
    },
    timerWarning: {
        color: '#FF6B35',
        fontWeight: 'bold',
    },
    headerBackButton: {
        padding: 8,
        marginLeft: 10,
        borderRadius: 20,
    }
});