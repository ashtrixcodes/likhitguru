import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const DRAWER_WIDTH = 300;

export default function SideView() {
	const router = useRouter();
	const anim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

	useEffect(() => {
		Animated.timing(anim, {
			toValue: 0,
			duration: 220,
			easing: Easing.out(Easing.cubic),
			useNativeDriver: true,
		}).start();
	}, []);

	const close = () => {
		Animated.timing(anim, {
			toValue: -DRAWER_WIDTH,
			duration: 200,
			easing: Easing.in(Easing.cubic),
			useNativeDriver: true,
		}).start(({ finished }) => {
			if (finished) router.back();
		});
	};

	const Item = ({ icon, label, onPress }: { icon: any; label: string; onPress?: () => void }) => (
		<Pressable style={styles.item} onPress={onPress} android_ripple={{ color: '#eee' }}>
			<Ionicons name={icon} size={22} color="#6B7280" />
			<Text style={styles.itemText}>{label}</Text>
		</Pressable>
	);

	return (
		<View style={styles.root}>
			{/* Drawer on the left */}
			<Animated.View style={[styles.drawer, { transform: [{ translateX: anim }] }]}>
				<View style={styles.profileRow}>
					<View style={styles.avatarContainer}>
						<Image source={require('@/assets/images/profile.png')} style={styles.avatar} />
						<View style={styles.userIconOverlay}>
							<Image 
								source={require('@/assets/images/user_icon.png')} 
								style={styles.userIconImage}
								resizeMode="contain"
							/>
						</View>
					</View>
					<View>
						<Text style={styles.name}>Prashant Khanal</Text>
						<Text style={styles.subtitle}>lekhit guru student</Text>
					</View>
				</View>

				<Item icon="home-outline" label="Home" onPress={close} />
				<Item icon="book-outline" label="Topics" onPress={close} />
				<Item icon="chatbubble-ellipses-outline" label="Messages" onPress={close} />
				<Item icon="notifications-outline" label="Notifications" onPress={close} />
				<Item icon="bookmark-outline" label="Bookmarks" onPress={close} />
				<Item icon="person-outline" label="Profile" onPress={close} />

				<View style={styles.footerSpace} />
				<Text style={styles.copy}>© Lekhit Guru 2025</Text>
			</Animated.View>

			{/* Overlay to the right */}
			<Pressable style={styles.overlay} onPress={close} />
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.3)',
		flexDirection: 'row',
	},
	overlay: {
		flex: 1,
	},
	drawer: {
		width: DRAWER_WIDTH,
		backgroundColor: '#fff',
		paddingTop: 40,
		paddingHorizontal: 20,
		shadowColor: '#000',
		shadowOpacity: 0.2,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
		elevation: 10,
	},
	profileRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
		marginBottom: 32,
		paddingVertical: 8,
	},
	avatarContainer: {
		position: 'relative',
	},
	avatar: {
		width: 56,
		height: 56,
		borderRadius: 28,
	},
	userIconOverlay: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		width: 40,
		height: 54,
		alignItems: 'center',
		justifyContent: 'center',
        
	
		
	},
	userIconImage: {
		width: 50,
		height: 50,
	},
	name: {
		fontSize: 18,
		color: '#111827',
		fontWeight: '600',
		lineHeight: 24,
        marginTop: 10,
        marginLeft: 10,
	},
	subtitle: {
		fontSize: 14,
		color: '#6B7280',
		marginTop: 4,
        marginLeft: 10,
		lineHeight: 18,
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 15,
		paddingVertical: 15,
        marginLeft: 15,
	},
	itemText: {
		fontSize: 15,
		color: '#111827',
	},
	footerSpace: {
		flex: 1,
        marginTop: 100,
        height: 100,
        left: 10,
	},
	copy: {
		textAlign: 'center',
		color: '#9CA3AF',
		fontSize: 12,
		paddingVertical: 12,
	},
});