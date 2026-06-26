import DarkModeToggle from '@/components/DarkModeToggle';
import WeatherOverlay from '@/components/WeatherOverlay';
import { useSidebar } from '@/components/SidebarContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	Modal,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { shareApp } from './shareapp'; // Import the share function

import type { AppTheme } from '@/constants/theme';

// ─── UsernameReq Component ───────────────────────────────────────────
function UsernameReq() {
	const { theme } = useTheme();
	const s = useMemo(() => createStyles(theme), [theme]);

	const [userName, setUserName] = React.useState('Lekhit Guru');
	const [showModal, setShowModal] = React.useState(false);
	const [inputName, setInputName] = React.useState('');

	const openModal = () => {
		setInputName(userName);
		setShowModal(true);
	};

	const handleSaveName = async () => {
		const trimmedName = inputName.trim();
		if (trimmedName.length === 0) {
			Alert.alert('Invalid Name', 'Please enter a valid name.');
			return;
		}
		if (trimmedName.length > 20) {
			Alert.alert('Name Too Long', 'Please enter a name with 20 characters or less.');
			return;
		}

		try {
			await AsyncStorage.setItem('userName', trimmedName);
			setUserName(trimmedName);
		} catch (error) {
			console.log('Error saving username:', error);
		}

		setShowModal(false);
		setInputName('');
	};

	// Load username on component mount
	useEffect(() => {
		const loadUserName = async () => {
			try {
				const savedName = await AsyncStorage.getItem('userName');
				if (savedName) {
					setUserName(savedName);
				}
			} catch (error) {
				console.log('Error loading username:', error);
			}
		};

		loadUserName();
	}, []);

	const handleCancel = () => {
		setShowModal(false);
		setInputName('');
	};

	return (
		<>
			<TouchableOpacity
				style={s.userNameContainer}
				onPress={openModal}
				activeOpacity={0.7}
			>
				<Text style={s.userName}>{userName}</Text>
				{userName === 'Lekhit Guru' && (
					<Ionicons name="create-outline" size={14} color="rgba(255, 255, 255, 0.6)" style={s.editIcon} />
				)}
			</TouchableOpacity>

			<Modal
				visible={showModal}
				animationType="fade"
				transparent={true}
				statusBarTranslucent={true}
			>
				<View style={s.modalOverlay}>
					<View style={s.modalContainer}>
						<View style={s.modalHeader}>
							<Text style={s.modalTitle}>What should I call you?</Text>
						</View>

						<View style={s.modalBody}>
							<TextInput
								style={s.textInput}
								value={inputName}
								onChangeText={setInputName}
								placeholder="Enter your name"
								placeholderTextColor={theme.colors.inputPlaceholder}
								autoFocus={true}
								maxLength={20}
								returnKeyType="done"
								onSubmitEditing={handleSaveName}
							/>

							<Text style={s.charCounter}>
								{inputName.length}/20 characters
							</Text>
						</View>

						<View style={s.modalFooter}>
							<Pressable
								style={[s.button, s.cancelButton]}
								onPress={handleCancel}
							>
								<Text style={s.cancelButtonText}>Cancel</Text>
							</Pressable>

							<Pressable
								style={[s.button, s.saveButton]}
								onPress={handleSaveName}
							>
								<Text style={s.saveButtonText}>Save</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</>
	);
}


// ─── HomeHeader ──────────────────────────────────────────────────────
type HomeHeaderProps = {
	onSharePress: () => void;
	onMenuPress: () => void;
};

function HomeHeader({ onSharePress, onMenuPress }: HomeHeaderProps) {
	const { theme } = useTheme();
	const s = useMemo(() => createStyles(theme), [theme]);

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour >= 5 && hour < 12) return 'Good Morning!';
		if (hour >= 12 && hour < 17) return 'Good Afternoon!';
		if (hour >= 17 && hour < 20) return 'Good Evening!';
		return 'Good Night!';
	};

	return (
		<>
			<View style={s.headerTop}>
				<TouchableOpacity style={s.menuButton} onPress={onMenuPress}>
					<View style={[s.menuLine, s.menuLineTop]} />
					<View style={[s.menuLine, s.menuLineMiddle]} />
					<View style={[s.menuLine, s.menuLineBottom]} />
				</TouchableOpacity>

				{/* User Info with greeting and clickable username */}
				<View style={s.userInfo}>
					<Text style={s.greeting}>{getGreeting()}</Text>
					<UsernameReq />
				</View>

				{/* Dark mode toggle + Share button */}
				<View style={s.headerActions}>
					<DarkModeToggle />
					<TouchableOpacity style={s.shareButton} onPress={onSharePress}>
						<Ionicons name="share-social" size={20} color={theme.colors.headerText} />
					</TouchableOpacity>
				</View>
			</View>
		</>
	);
}

// ─── HomeScreen ──────────────────────────────────────────────────────
export default function HomeScreen() {
	const scrollViewRef = useRef<ScrollView>(null);
	const [currentCategoryIndex, setCurrentCategoryIndex] = React.useState(1);
	const [refreshing, setRefreshing] = React.useState(false);
	const { setSidebarVisible } = useSidebar();
	const router = useRouter();
	const didTriggerLightPullRef = useRef(false);
	const { theme } = useTheme();
	const s = useMemo(() => createStyles(theme), [theme]);

	useEffect(() => {
		setTimeout(() => {
			scrollViewRef.current?.scrollTo({ x: 215, animated: false });
			setCurrentCategoryIndex(1);
		}, 300);
	}, []);

	const handleScroll = (event: any) => {
		const contentOffset = event.nativeEvent.contentOffset.x;

		let newIndex;
		if (contentOffset < 100) {
			newIndex = 0;
		} else if (contentOffset < 320) {
			newIndex = 1;
		} else {
			newIndex = 2;
		}

		setCurrentCategoryIndex(newIndex);
	};

	const onRefresh = () => {
		setRefreshing(true);
		setTimeout(() => {
			setRefreshing(false);
			didTriggerLightPullRef.current = false;
		}, 800);
	};

	const handleShareApp = async () => {
		await shareApp();
	};

	const handleMenuPress = () => {
		setSidebarVisible(true);
	};

	return (
		<View style={s.container}>
			<ScrollView
				ref={scrollViewRef}
				style={s.scrollView}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.refreshIndicator} />}
			>
				<View style={s.header}>
					<WeatherOverlay />
					<View style={s.headerContent}>
						<HomeHeader onSharePress={handleShareApp} onMenuPress={handleMenuPress} />
					</View>
				</View>
				{refreshing && (
					<View style={s.refreshContainer}>
						<ActivityIndicator size="small" color={theme.colors.refreshIndicator} />
					</View>
				)}

				{/* Choose Category Section */}
				<View style={s.examSection}>
					<Text style={s.examSectionTitle}>Lekhit Exam</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={s.categoryScroll}
						contentContainerStyle={s.categoryScrollContent}
						snapToInterval={215}
						decelerationRate="fast"
						snapToAlignment="start"
						pagingEnabled={false}
						onScroll={handleScroll}
						scrollEventThrottle={16}
						contentOffset={{ x: 215, y: 0 }}
					>
						<TouchableOpacity
							onPress={() => router.push('/chooseCategory/fourWheeler')}
							style={s.categoryCard}
						>
							<View style={s.categoryTag}>
								<Text style={s.categoryTagText}>Car</Text>
							</View>
							<View style={s.categoryImageContainer}>
								<Image
									source={require('@/assets/images/car.png')}
									style={[s.categoryImage, s.categoryImageCar]}
									resizeMode="contain"
								/>
							</View>
							<View style={s.viewButton}>
								<View style={s.playIconContainer}>
									<Ionicons name="play" size={16} color={theme.colors.viewButtonText} />
								</View>
								<Text style={s.viewButtonText}>View</Text>
							</View>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => router.push('/chooseCategory/twoWheeler')}
							style={s.categoryCard}
						>
							<View style={s.categoryTag}>
								<Text style={s.categoryTagText}>Bike</Text>
							</View>
							<View style={s.categoryImageContainer}>
								<Image
									source={require('@/assets/images/bike.png')}
									style={s.categoryImage}
									resizeMode="contain"
								/>
							</View>
							<View style={s.viewButton}>
								<View style={s.playIconContainer}>
									<Ionicons name="play" size={16} color={theme.colors.viewButtonText} />
								</View>
								<Text style={s.viewButtonText}>View</Text>
							</View>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => router.push('/chooseCategory/others')}
							style={s.categoryCard}
						>
							<View style={s.categoryTag}>
								<Text style={s.categoryTagText}>Others</Text>
							</View>
							<View style={s.categoryImageContainer}>
								<Image
									source={require('@/assets/images/others.png')}
									style={[s.categoryImage, s.categoryImageOthers]}
									resizeMode="contain"
								/>
							</View>
							<View style={s.viewButton}>
								<View style={s.playIconContainer}>
									<Ionicons name="play" size={16} color={theme.colors.viewButtonText} />
								</View>
								<Text style={s.viewButtonText}>View</Text>
							</View>
						</TouchableOpacity>
					</ScrollView>

					<View style={s.pagination}>
						<View style={[
							s.paginationDot,
							currentCategoryIndex === 0 && s.paginationDotActive
						]} />
						<View style={[
							s.paginationDot,
							currentCategoryIndex === 1 && s.paginationDotActive
						]} />
						<View style={[
							s.paginationDot,
							currentCategoryIndex === 2 && s.paginationDotActive
						]} />
					</View>
				</View>

				{/* Quiz Section */}
				<View style={s.section}>
					<Text style={s.sectionTitle}>Quiz</Text>
					<View style={s.quizList}>
						<TouchableOpacity
							style={s.quizItem}
							onPress={() => router.push('/quiz/signTest')}
						>
							<View style={s.quizIcon}>
								<Image
									source={require('@/assets/images/testing.png')}
									style={s.quizIconImage}
									resizeMode="contain"
								/>
							</View>
							<View style={s.quizContent}>
								<View style={s.quizHeader}>
									<Text style={s.quizTitle}>Sign Test</Text>
									<Image
										source={require('@/assets/images/trophy.png')}
										style={s.trophyIcon}
										resizeMode="contain"
									/>
								</View>
								<Text style={s.quizSubtitle}>Traffic Signals</Text>
							</View>
							<Text style={s.practiceText}>Practice →</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={s.quizItem}
							onPress={() => router.push('/quiz/eyeTest')}
						>
							<View style={s.quizIcon}>
								<Image
									source={require('@/assets/images/number-block.png')}
									style={s.quizIconImage}
									resizeMode="contain"
								/>
							</View>
							<View style={s.quizContent}>
								<View style={s.quizHeader}>
									<Text style={s.quizTitle}>Eye Test</Text>
									<Image
										source={require('@/assets/images/trophy.png')}
										style={s.trophyIcon}
										resizeMode="contain"
									/>
								</View>
								<Text style={s.quizSubtitle}>Numbers Pattern</Text>
							</View>
							<Text style={s.practiceText}>Practice →</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Practice More Section */}
				<View style={s.section}>
					<Text style={s.sectionTitle}>Practice More</Text>
					<View style={s.practiceGrid}>
						<TouchableOpacity
							style={s.practiceCard}
							onPress={() => router.push('/practiceMore/informativeSign')}
						>
							<View style={s.practiceIcon}>
								<Image
									source={require('@/assets/images/stop-sgn.png')}
									style={s.practiceIconImage}
									resizeMode="contain"
								/>
							</View>
							<Text style={s.practiceCardText}>Informative</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={s.practiceCard}
							onPress={() => router.push('/practiceMore/restrictiveSign')}
						>
							<View style={s.practiceIcon}>
								<Image
									source={require('@/assets/images/restriction.png')}
									style={s.practiceIconImage}
									resizeMode="contain"
								/>
							</View>
							<Text style={s.practiceCardText}>Restrictive</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={s.practiceCard}
							onPress={() => router.push('/practiceMore/numberSign')}
						>
							<View style={s.practiceIcon}>
								<Image
									source={require('@/assets/images/numbers.png')}
									style={s.practiceIconImage}
									resizeMode="contain"
								/>
							</View>
							<Text style={s.practiceCardText}>Numbers</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={s.practiceCard}
							onPress={() => router.push('/practiceMore/examTest')}
						>
							<View style={s.practiceIcon}>
								<Image
									source={require('@/assets/images/exam.png')}
									style={s.practiceIconImage}
									resizeMode="contain"
								/>
							</View>
							<Text style={s.practiceCardText}>Exam Test</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Others Section */}
				<View style={s.section}>
					<Text style={s.sectionTitle}>Others</Text>
					<View style={s.practiceGrid}>
						<TouchableOpacity
							style={s.practiceCard}
							onPress={() => router.push('/others/licenseForm')}
						>
							<View style={s.practiceIcon}>
								<Image
									source={require('@/assets/images/government.png')}
									style={s.practiceIconImage}
									resizeMode="contain"
								/>
							</View>
							<Text style={s.practiceCardText}>Online license form</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={s.practiceCard}
							onPress={() => router.push('/others/licensePrintCheck')}
						>
							<View style={s.practiceIcon}>
								<Image
									source={require('@/assets/images/printer.png')}
									style={s.practiceIconImage}
									resizeMode="contain"
								/>
							</View>
							<Text style={s.practiceCardText}>License Print Check</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={s.practiceCard}
							onPress={() => router.push('/others/trafficFines')}
						>
							<View style={s.practiceIcon}>
								<Image
									source={require('@/assets/images/fine.png')}
									style={s.practiceIconImage}
									resizeMode="contain"
								/>
							</View>
							<Text style={s.practiceCardText}>Traffic Fines    Info</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={s.practiceCard}
							onPress={() => router.push('/others/nagdhungaPass')}
						>
							<View style={s.practiceIcon}>
								<Image
									source={require('@/assets/images/tunnel.png')}
									style={s.practiceIconImage}
									resizeMode="contain"
								/>
							</View>
							<Text style={s.practiceCardText}>Nagdhunga Charges</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={s.practiceCard}
							onPress={() => router.push('/others/moreInfo')}
						>
							<View style={s.practiceIcon}>
								<Image
									source={require('@/assets/images/question.png')}
									style={s.practiceIconImage}
									resizeMode="contain"
								/>
							</View>
							<Text style={s.practiceCardText}>More Info</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Bottom Spacing */}
				<View style={s.bottomSpacing} />
			</ScrollView>
		</View>
	);
}

// ─── Style factory ───────────────────────────────────────────────────
function createStyles(theme: AppTheme) {
	const { colors, glass, isDark } = theme;

	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.background,
		},
		scrollView: {
			flex: 1,
		},
		header: {
			backgroundColor: colors.header,
			paddingTop: 50,
			paddingHorizontal: 20,
			paddingBottom: 10,
			borderTopLeftRadius: 0,
			borderTopRightRadius: 0,
			borderBottomLeftRadius: 40,
			borderBottomRightRadius: 40,
			shadowColor: colors.shadow,
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.4,
			shadowRadius: 10,
			elevation: 20,
			position: 'relative',
			zIndex: 1000,
		},
		headerBackground: {
			...StyleSheet.absoluteFillObject,
			backgroundColor: colors.header,
			borderBottomLeftRadius: 40,
			borderBottomRightRadius: 40,
		},
		headerContent: {
			position: 'relative',
			zIndex: 1,
		},
		headerTop: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			marginBottom: 20,
			gap: 4,
		},
		menuButton: {
			marginTop: 20,
			padding: 8,
			backgroundColor: colors.headerAccent,
			borderRadius: 30,
			width: 50,
			height: 40,
			justifyContent: 'center',
			alignItems: 'center',
			opacity: 0.9,
			position: 'relative',
		},
		menuLine: {
			height: 2,
			backgroundColor: colors.headerText,
			marginVertical: 1.5,
			borderRadius: 2,
		},
		menuLineTop: {
			width: 12,
		},
		menuLineMiddle: {
			width: 18,
		},
		menuLineBottom: {
			width: 12,
		},
		userInfo: {
			flex: 1,
			marginLeft: 10,
			marginRight: 10,
			marginTop: 10,
		},
		greeting: {
			color: colors.headerText,
			left: 4,
			fontSize: 12,
			opacity: 0.8,
			marginTop: 10,
			textShadowColor: 'rgba(0, 0, 0, 0.4)',
			textShadowOffset: { width: 0, height: 1 },
			textShadowRadius: 3,
		},
		headerActions: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 2,
			marginTop: 20,
		},
		shareButton: {
			padding: 8,
			borderRadius: 30,
			width: 40,
			height: 40,
			justifyContent: 'center',
			alignItems: 'center',
			opacity: 0.9,
		},
		// UsernameReq styles
		userNameContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			marginTop: 2,
			paddingVertical: 2,
			paddingHorizontal: 4,
			borderRadius: 8,
		},
		userName: {
			color: colors.headerText,
			fontSize: 20,
			marginBottom: 1,
			marginRight: 6,
			textShadowColor: 'rgba(0, 0, 0, 0.4)',
			textShadowOffset: { width: 0, height: 1 },
			textShadowRadius: 3,
		},
		editIcon: {
			opacity: 0.7,
		},
		modalOverlay: {
			flex: 1,
			backgroundColor: colors.modalOverlay,
			justifyContent: 'center',
			alignItems: 'center',
			paddingHorizontal: 20,
		},
		modalContainer: {
			backgroundColor: colors.modalBackground,
			borderRadius: 16,
			width: '100%',
			maxWidth: 400,
			shadowColor: colors.shadow,
			shadowOffset: { width: 0, height: 10 },
			shadowOpacity: 0.25,
			shadowRadius: 10,
			elevation: 10,
			...(isDark && {
				borderWidth: 1,
				borderColor: colors.border,
			}),
		},
		modalHeader: {
			paddingTop: 24,
			paddingHorizontal: 24,
			paddingBottom: 16,
		},
		modalTitle: {
			fontSize: 20,
			fontWeight: 'bold',
			color: colors.modalText,
			textAlign: 'center',
		},
		modalBody: {
			paddingHorizontal: 24,
			paddingBottom: 16,
		},
		textInput: {
			borderWidth: 1,
			borderColor: colors.inputBorder,
			borderRadius: 12,
			paddingHorizontal: 16,
			paddingVertical: 12,
			fontSize: 16,
			color: colors.inputText,
			backgroundColor: colors.inputBackground,
			textAlign: 'center',
		},
		charCounter: {
			fontSize: 12,
			color: colors.textTertiary,
			textAlign: 'right',
			marginTop: 8,
		},
		modalFooter: {
			flexDirection: 'row',
			paddingHorizontal: 24,
			paddingBottom: 24,
			paddingTop: 8,
			gap: 12,
		},
		button: {
			flex: 1,
			paddingVertical: 12,
			paddingHorizontal: 20,
			borderRadius: 12,
			alignItems: 'center',
			justifyContent: 'center',
		},
		cancelButton: {
			backgroundColor: colors.cancelButtonBg,
			borderWidth: 1,
			borderColor: colors.cancelButtonBorder,
		},
		saveButton: {
			backgroundColor: colors.saveButtonBg,
		},
		cancelButtonText: {
			fontSize: 16,
			fontWeight: '600',
			color: colors.cancelButtonText,
		},
		saveButtonText: {
			fontSize: 16,
			fontWeight: '600',
			color: colors.saveButtonText,
		},
		// Sections
		section: {
			paddingHorizontal: 15,
			marginTop: 20,
		},
		sectionTitle: {
			fontSize: 16,
			fontWeight: 'bold',
			color: colors.text,
			marginBottom: 10,
			marginLeft: 15,
		},
		examSection: {
			marginTop: 20,
		},
		examSectionTitle: {
			fontSize: 16,
			fontWeight: 'bold',
			color: colors.text,
			marginBottom: 10,
			marginLeft: 30,
		},
		categoryScroll: {
			marginBottom: 5,
		},
		categoryScrollContent: {
			paddingLeft: 30,
			paddingRight: 30,
		},
		// Glass card for categories
		categoryCard: {
			backgroundColor: isDark ? glass.backgroundColor : colors.card,
			borderRadius: isDark ? glass.borderRadius : 25,
			borderWidth: isDark ? glass.borderWidth : 0,
			borderColor: isDark ? glass.borderColor : 'transparent',
			padding: 20,
			marginRight: 15,
			width: 250,
			height: 270,
			alignItems: 'center',
			shadowColor: colors.shadow,
			shadowOffset: { width: 0, height: 0 },
			shadowOpacity: isDark ? 0.3 : 0.2,
			shadowRadius: isDark ? 8 : 0,
			elevation: isDark ? 0 : 8,
		},
		categoryTag: {
			backgroundColor: colors.tagBackground,
			paddingHorizontal: 18,
			paddingVertical: 6,
			borderRadius: 20,
			alignSelf: 'flex-start',
		},
		categoryTagText: {
			color: colors.tagText,
			fontSize: 10,
		},
		categoryImageContainer: {
			width: 180,
			height: 150,
			marginBottom: 15,
			justifyContent: 'center',
			alignItems: 'center',
		},
		categoryImage: {
			width: '100%',
			height: '100%',
		},
		categoryImageOthers: {
			width: '100%',
			height: '100%',
			transform: [{ scale: 1.3 }],
		},
		categoryImageCar: {
			width: '100%',
			height: '100%',
			transform: [{ scale: 0.85 }],
		},
		viewButton: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			paddingHorizontal: 10,
			paddingVertical: 15,
			gap: 0,
		},
		playIconContainer: {
			width: 32,
			height: 32,
			alignItems: 'center',
			justifyContent: 'center',
			marginRight: -1,
		},
		viewButtonText: {
			color: colors.viewButtonText,
			fontSize: 16,
			height: 20,
		},
		pagination: {
			flexDirection: 'row',
			justifyContent: 'center',
			gap: 5,
			marginTop: 10,
		},
		paginationDot: {
			width: 5,
			height: 8,
			borderRadius: 5,
			backgroundColor: colors.paginationDot,
		},
		paginationDotActive: {
			backgroundColor: colors.accent,
			width: 20,
			borderRadius: 5,
		},
		// Quiz items — glass
		quizList: {
			gap: 12,
		},
		quizItem: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			flexWrap: 'nowrap',
			alignItems: 'center',
			backgroundColor: isDark ? glass.backgroundColor : colors.card,
			borderWidth: isDark ? glass.borderWidth : 0,
			borderColor: isDark ? glass.borderColor : 'transparent',
			padding: 15,
			borderRadius: isDark ? glass.borderRadius : 15,
			shadowColor: colors.shadow,
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: isDark ? 0.3 : 0.1,
			shadowRadius: isDark ? 8 : 4,
			elevation: isDark ? 0 : 3,
		},
		quizIcon: {
			width: 50,
			height: 50,
			borderRadius: 25,
			backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.surface,
			alignItems: 'center',
			justifyContent: 'center',
			marginRight: 15,
		},
		quizIconImage: {
			width: 25,
			height: 25,
			resizeMode: 'contain',
		},
		quizContent: {
			flex: 1,
		},
		quizHeader: {
			flexDirection: 'row',
			alignItems: 'center',
			marginBottom: 5,
		},
		quizTitle: {
			fontSize: 16,
			color: colors.text,
			marginRight: 8,
		},
		quizSubtitle: {
			fontSize: 12,
			color: colors.quizSubtitle,
		},
		practiceText: {
			color: colors.practiceLink,
		},
		// Practice grid — glass cards
		practiceGrid: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: 5,
		},
		practiceCard: {
			backgroundColor: isDark ? glass.backgroundColor : colors.card,
			borderRadius: isDark ? glass.borderRadius : 15,
			borderWidth: isDark ? glass.borderWidth : 0,
			borderColor: isDark ? glass.borderColor : 'transparent',
			width: '23.8%',
			paddingTop: 15,
			alignItems: 'center',
			shadowColor: colors.shadow,
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: isDark ? 0.3 : 0.1,
			shadowRadius: isDark ? 8 : 4,
			elevation: isDark ? 0 : 3,
		},
		practiceIcon: {
			width: 40,
			height: 40,
			borderRadius: 25,
			backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.surface,
			alignItems: 'center',
			justifyContent: 'center',
			marginBottom: 10,
		},
		practiceIconImage: {
			width: 30,
			height: 30,
		},
		trophyIcon: {
			width: 20,
			height: 20,
		},
		practiceCardText: {
			fontSize: 12,
			color: colors.text,
			textAlign: 'center',
			lineHeight: 16,
			marginBottom: 10,
		},
		bottomSpacing: {
			height: 100,
		},
		refreshContainer: {
			paddingVertical: 8,
			marginTop: 14,
			marginBottom: 6,
			alignItems: 'center',
			justifyContent: 'center',
		},
		// Unused but kept for backward compat
		notificationButton: {
			padding: 8,
			marginTop: 20,
			position: 'relative',
		},
		notificationIcon: {
			width: 24,
			height: 24,
		},
		notificationDot: {
			position: 'absolute',
			top: 8,
			right: 8,
			width: 8,
			height: 8,
			borderRadius: 4,
			backgroundColor: '#4CAF50',
		},
		searchSection: {
			marginTop: 10,
		},
		searchTitle: {
			color: colors.headerText,
			fontSize: 16,
			marginBottom: 10,
			marginLeft: 10,
		},
		searchBar: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: colors.searchBarBg,
			borderRadius: 25,
			paddingHorizontal: 20,
			paddingVertical: 12,
			position: 'relative',
		},
		searchPlaceholder: {
			color: colors.searchPlaceholder,
			marginLeft: 10,
			marginBottom: 2,
			fontSize: 16,
			opacity: 1,
			position: 'relative',
			zIndex: 1,
		},
	});
}