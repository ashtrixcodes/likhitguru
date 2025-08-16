import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function FooterNav() {
	const router = useRouter();

				return (
					<View style={styles.footer}>
						<TouchableOpacity style={styles.tab} onPress={() => router.replace('/(tabs)')}>
							<Ionicons name="home-outline" size={15} color="#fff" />
							<Text style={styles.label}>Home</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.tab} onPress={() => router.replace('/(tabs)/dailyQuiz')}>
							<Ionicons name="sparkles-outline" size={15} color="#fff" />
							<Text style={styles.label}>Daily Quiz</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.tab} onPress={() => router.replace('/(tabs)/profile')}>
							<Ionicons name="person-outline" size={15} color="#fff" />
							<Text style={styles.label}>Profile</Text>
						</TouchableOpacity>
					</View>
				);
}

const styles = StyleSheet.create({
				footer: {
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					height: 60,
					backgroundColor: '#49515a',
					
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
				},
				tab: {
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
					paddingVertical: 5,

				},
				label: {
					color: '#fff',
					fontSize: 12,
					marginTop: 2,
					fontWeight: '400',
					letterSpacing: 0.1,
				},
});
