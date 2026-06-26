import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import type { AppTheme } from '@/constants/theme';

export default function FooterNav() {
	const router = useRouter();
	const { theme } = useTheme();
	const s = useMemo(() => createStyles(theme), [theme]);

	return (
		<View style={s.footer}>
			<TouchableOpacity style={s.tab} onPress={() => router.replace('/(tabs)')}>
				<Ionicons name="home-outline" size={15} color={theme.colors.footerText} />
				<Text style={s.label}>Home</Text>
			</TouchableOpacity>
			<TouchableOpacity style={s.tab} onPress={() => router.replace('/(tabs)/dailyQuiz')}>
				<Ionicons name="sparkles-outline" size={15} color={theme.colors.footerText} />
				<Text style={s.label}>Daily Quiz</Text>
			</TouchableOpacity>
			<TouchableOpacity style={s.tab} onPress={() => router.replace('/(tabs)/profile')}>
				<Ionicons name="person-outline" size={15} color={theme.colors.footerText} />
				<Text style={s.label}>Profile</Text>
			</TouchableOpacity>
		</View>
	);
}

function createStyles(theme: AppTheme) {
	const { colors, isDark } = theme;

	return StyleSheet.create({
		footer: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			height: 60,
			backgroundColor: colors.footerBackground,
			shadowOffset: { width: 0, height: -2 },
			shadowOpacity: 0.08,
			shadowRadius: 2,
			elevation: 8,
			paddingHorizontal: 0,
			width: '100%',
			position: 'absolute',
			left: 0,
			bottom: 0,
			zIndex: 100,
			...(isDark && {
				borderTopWidth: 1,
				borderTopColor: colors.border,
			}),
		},
		tab: {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center',
			paddingVertical: 5,
		},
		label: {
			color: colors.footerText,
			fontSize: 12,
			marginTop: 2,
			fontWeight: '400',
			letterSpacing: 0.1,
		},
	});
}
