import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

export function ShimmerBar({ 
    width, 
    height, 
    style, 
    borderRadius = 6 
}: { 
    width: number | string; 
    height: number | string; 
    style?: any; 
    borderRadius?: number 
}) {
	const shimmerAnim = useRef(new Animated.Value(0)).current;
	const { theme } = useTheme();

	useEffect(() => {
		Animated.loop(
			Animated.timing(shimmerAnim, {
				toValue: 1,
				duration: 1500,
				useNativeDriver: true,
			})
		).start();
	}, [shimmerAnim]);

	const translateX = shimmerAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [-200, 200],
	});

	return (
		<View style={[{
			width,
			height,
			borderRadius,
			backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : "#e5e7eb",
			overflow: "hidden"
		}, style]}>
			<Animated.View style={{ ...StyleSheet.absoluteFillObject, transform: [{ translateX }] }}>
				<LinearGradient
					colors={theme.isDark
						? ["transparent", "rgba(255,255,255,0.15)", "transparent"]
						: ["transparent", "rgba(255,255,255,0.6)", "transparent"]
					}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					style={{ flex: 1 }}
				/>
			</Animated.View>
		</View>
	);
}
