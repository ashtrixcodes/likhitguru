import { triggerHapticLight } from '@/context/HapticsContext';
import DarkModeToggle from '@/components/DarkModeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import NepaliDateHeaderBadge from '@/components/NepaliDateHeaderBadge';
import ExamCountdownBanner from '@/components/ExamCountdownBanner';
import { ShimmerBar } from '@/components/Shimmer';
import { useSidebar } from '@/components/SidebarContext';
import WeatherOverlay from '@/components/WeatherOverlay';
import { homeTranslations } from '@/constants/homeTranslations';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import {
	ActivityIndicator,
	Alert,
	Dimensions,
	Image,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';
import { useNotifications } from '@/context/NotificationContext';

// ─── Reusable Dynamic Cards ──────────────────────────────────────────
function CategoryCard({ tag, image, onPress, s, theme, isLoading, imageStyle, viewLabel, isNepali }: any) {
	const handlePress = (e: any) => {
		triggerHapticLight();
		onPress?.(e);
	};

	return (
		<TouchableOpacity onPress={handlePress} style={s.categoryCard} activeOpacity={0.8} disabled={isLoading}>
			{isLoading ? (
				<View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
					<ShimmerBar width={60} height={20} borderRadius={10} style={{ alignSelf: 'flex-start', marginBottom: 20 }} />
					<ShimmerBar width={140} height={140} borderRadius={70} style={{ marginVertical: 5, marginBottom: 15 }} />
					<ShimmerBar width={80} height={20} />
				</View>
			) : (
				<>
					<View style={s.categoryTag}>
						<Text style={s.categoryTagText}>{isNepali ? unicodeToAakriti(tag) : tag}</Text>
					</View>

					<View style={s.categoryImageContainer}>
						<Image source={image} style={[s.categoryImage, imageStyle]} resizeMode="contain" />
					</View>
					<View style={s.viewButton}>
						<View style={s.playIconContainer}>
							<Ionicons name="play" size={16} color={theme.colors.viewButtonText} />
						</View>
						<Text style={s.viewButtonText}>{isNepali ? unicodeToAakriti(viewLabel || 'View') : (viewLabel || 'View')}</Text>
					</View>
				</>
			)}
		</TouchableOpacity>
	);
}

function QuizItemCard({ title, subtitle, icon, iconStyle, onPress, s, isLoading, practiceActionLabel, isNepali }: any) {
	const handlePress = (e: any) => {
		triggerHapticLight();
		onPress?.(e);
	};

	return (
		<TouchableOpacity style={s.quizItem} onPress={handlePress} disabled={isLoading}>
			{isLoading ? (
				<View style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}>
					<ShimmerBar width={50} height={50} borderRadius={25} style={{ marginRight: 15 }} />
					<View style={{ flex: 1 }}>
						<ShimmerBar width={120} height={20} style={{ marginBottom: 8 }} />
						<ShimmerBar width={80} height={15} />
					</View>
					<ShimmerBar width={60} height={15} />
				</View>
			) : (
				<>
					<View style={s.quizIcon}>
						<Image source={icon} style={[s.quizIconImage, iconStyle]} resizeMode="contain" />
					</View>
					<View style={s.quizContent}>
						<View style={s.quizHeader}>
							<Text style={s.quizTitle}>{isNepali ? unicodeToAakriti(title) : title}</Text>
							<Image source={require('@/assets/images/trophy.png')} style={s.trophyIcon} resizeMode="contain" />
						</View>
						<Text style={s.quizSubtitle}>{isNepali ? unicodeToAakriti(subtitle) : subtitle}</Text>
					</View>
					<Text style={s.practiceText}>{isNepali ? unicodeToAakriti(practiceActionLabel || 'Practice →') : (practiceActionLabel || 'Practice →')}</Text>
				</>
			)}
		</TouchableOpacity>
	);
}

function FeaturedExamCard({ title, subtitle, tag, actionLabel, onPress, s, theme, isLoading, isNepali }: any) {
	const handlePress = (e: any) => {
		triggerHapticLight();
		onPress?.(e);
	};

	return (
		<TouchableOpacity
			style={s.featuredExamCard}
			onPress={handlePress}
			activeOpacity={0.85}
			disabled={isLoading}
		>
			{isLoading ? (
				<View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: 10 }}>
					<ShimmerBar width={50} height={50} borderRadius={25} style={{ marginRight: 15 }} />
					<View style={{ flex: 1 }}>
						<ShimmerBar width={140} height={18} style={{ marginBottom: 8 }} />
						<ShimmerBar width={200} height={14} />
					</View>
				</View>
			) : (
				<View style={s.featuredExamContent}>
					<View style={s.featuredExamIconWrapper}>
						<Image
							source={require('@/assets/images/exam.png')}
							style={s.featuredExamIcon}
							resizeMode="contain"
						/>
					</View>

					<View style={s.featuredExamDetails}>
						<View style={s.featuredExamTagRow}>
							<View style={s.featuredExamTag}>
								<Text style={s.featuredExamTagText}>
									{isNepali ? unicodeToAakriti(tag || 'नमुना परीक्षा') : (tag || 'Model Exam')}
								</Text>
							</View>
						</View>

						<Text style={s.featuredExamTitle}>
							{isNepali ? unicodeToAakriti(title || 'लिखित नमुना परीक्षा') : (title || 'Written Exam Test')}
						</Text>
						<Text style={s.featuredExamSubtitle} numberOfLines={2}>
							{isNepali
								? unicodeToAakriti(subtitle || '५००+ आधिकारिक प्रश्नहरू • वास्तविक परीक्षा ढाँचा')
								: (subtitle || '500+ Official Questions • Real Exam Mode')}
						</Text>
					</View>

					<View style={s.featuredExamActionPill}>
						<Ionicons name="play" size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
						<Text style={s.featuredExamActionText}>
							{isNepali ? unicodeToAakriti(actionLabel || 'सुरु') : (actionLabel || 'Start')}
						</Text>
					</View>
				</View>
			)}
		</TouchableOpacity>
	);
}

function PracticeCard({ title, icon, onPress, s, isLoading, isNepali, customCardStyle }: any) {
	const handlePress = (e: any) => {
		triggerHapticLight();
		onPress?.(e);
	};

	return (
		<TouchableOpacity style={[s.practiceCard, customCardStyle]} onPress={handlePress} disabled={isLoading}>
			{isLoading ? (
				<View style={{ width: '100%', alignItems: 'center' }}>
					<ShimmerBar width={40} height={40} borderRadius={20} style={{ marginBottom: 12 }} />
					<ShimmerBar width={50} height={12} style={{ marginBottom: 4 }} />
					<ShimmerBar width={30} height={12} />
				</View>
			) : (
				<>
					<View style={s.practiceIcon}>
						<Image source={icon} style={s.practiceIconImage} resizeMode="contain" />
					</View>
					<Text style={s.practiceCardText}>{isNepali ? unicodeToAakriti(title) : title}</Text>
				</>
			)}
		</TouchableOpacity>
	);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

import type { AppTheme } from '@/constants/theme';

// ─── UsernameReq Component ───────────────────────────────────────────
function UsernameReq() {
	const { theme } = useTheme();
	const { language, isNepali } = useLanguage();
	const t = homeTranslations[language].usernameModal;
	const s = useMemo(() => createStyles(theme, isNepali), [theme, isNepali]);

	const [userName, setUserName] = React.useState('Likhit Guru');
	const [showModal, setShowModal] = React.useState(false);
	const [inputName, setInputName] = React.useState('');

	const openModal = () => {
		setInputName(userName);
		setShowModal(true);
	};

	const handleSaveName = async () => {
		const trimmedName = inputName.trim();
		if (trimmedName.length === 0) {
			Alert.alert(t.invalidTitle, t.invalidMsg);
			return;
		}
		if (trimmedName.length > 20) {
			Alert.alert(t.tooLongTitle, t.tooLongMsg);
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

	const firstName = useMemo(() => {
		if (!userName) return '';
		return userName.trim().split(/\s+/)[0];
	}, [userName]);

	return (
		<>
			<TouchableOpacity
				style={s.userNameContainer}
				onPress={openModal}
				activeOpacity={0.7}
			>
				<Text style={s.userName}>{firstName}</Text>
				{userName === 'Likhit Guru' && (
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
							<Text style={s.modalTitle}>{isNepali ? unicodeToAakriti(t.title) : t.title}</Text>
						</View>

						<View style={s.modalBody}>
							<TextInput
								style={s.textInput}
								value={inputName}
								onChangeText={setInputName}
								placeholder={t.placeholder}
								placeholderTextColor={theme.colors.inputPlaceholder}
								autoFocus={true}
								maxLength={20}
								returnKeyType="done"
								onSubmitEditing={handleSaveName}
							/>

							<Text style={s.charCounter}>
								{t.charCount(inputName.length)}
							</Text>
						</View>

						<View style={s.modalFooter}>
							<Pressable
								style={[s.button, s.cancelButton]}
								onPress={handleCancel}
							>
								<Text style={s.cancelButtonText}>{isNepali ? unicodeToAakriti(t.cancel) : t.cancel}</Text>
							</Pressable>

							<Pressable
								style={[s.button, s.saveButton]}
								onPress={handleSaveName}
							>
								<Text style={s.saveButtonText}>{isNepali ? unicodeToAakriti(t.save) : t.save}</Text>
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
	onMenuPress: () => void;
};

function HomeHeader({ onMenuPress }: HomeHeaderProps) {
	const { theme } = useTheme();
	const { language, isNepali } = useLanguage();
	const { unreadCount } = useNotifications();
	const router = useRouter();
	const tGreetings = homeTranslations[language].greetings;
	const s = useMemo(() => createStyles(theme, isNepali), [theme, isNepali]);

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour >= 5 && hour < 12) return tGreetings.morning;
		if (hour >= 12 && hour < 17) return tGreetings.afternoon;
		if (hour >= 17 && hour < 20) return tGreetings.evening;
		return tGreetings.night;
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
					<Text style={s.greeting}>{isNepali ? unicodeToAakriti(getGreeting()) : getGreeting()}</Text>
					<UsernameReq />
				</View>

				<View style={{ marginTop: 20, alignItems: 'stretch' }}>
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
						<LanguageToggle />
						<DarkModeToggle />
						<TouchableOpacity style={s.notificationButton} onPress={() => router.push('/others/notifications' as any)}>
							<Ionicons name="notifications-outline" size={20} color={theme.colors.headerText} />
							{unreadCount > 0 && (
								<View style={s.notificationBadge}>
									<Text style={s.notificationBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
								</View>
							)}
						</TouchableOpacity>
					</View>
					<View style={{ marginTop: 4 }}>
						<NepaliDateHeaderBadge />
					</View>
				</View>
			</View>
		</>
	);
}

// ─── HomeScreen ──────────────────────────────────────────────────────
export default function HomeScreen() {
	const scrollViewRef = useRef<ScrollView>(null);
	const [currentCategoryIndex, setCurrentCategoryIndex] = React.useState(1);
	const [isLoading, setIsLoading] = React.useState(true);
	const { setSidebarVisible } = useSidebar();
	const router = useRouter();
	const didTriggerLightPullRef = useRef(false);
	const { theme } = useTheme();
	const { language, isNepali } = useLanguage();
	const t = homeTranslations[language];
	const s = useMemo(() => createStyles(theme, isNepali), [theme, isNepali]);

	useEffect(() => {
		// Simulate initial loading time for skeleton
		const loadTimer = setTimeout(() => {
			setIsLoading(false);

			// Initial scroll after loading
			setTimeout(() => {
				const centerOffset = (SCREEN_WIDTH - 250) / 2;
				const initialOffset = 295 - centerOffset;
				scrollViewRef.current?.scrollTo({ x: initialOffset, animated: false });
				setCurrentCategoryIndex(1);
			}, 100);
		}, 1200);

		return () => clearTimeout(loadTimer);
	}, []);

	const handleScroll = (event: any) => {
		const contentOffset = event.nativeEvent.contentOffset.x;
		const centerOffset = (SCREEN_WIDTH - 250) / 2;
		const x1 = 295 - centerOffset;
		const x2 = 560 - centerOffset;

		let newIndex;
		if (contentOffset < x1 / 2) {
			newIndex = 0;
		} else if (contentOffset < (x1 + x2) / 2) {
			newIndex = 1;
		} else {
			newIndex = 2;
		}

		setCurrentCategoryIndex(newIndex);
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
			>
				<View style={s.header}>
					<WeatherOverlay />
					<View style={s.headerContent}>
						<HomeHeader onMenuPress={handleMenuPress} />
					</View>
				</View>

				{/* Driving Exam Countdown Sticky Banner */}
				<ExamCountdownBanner />

				{/* Choose Category Section */}
				<View style={s.examSection}>
					<Text style={s.examSectionTitle}>{isNepali ? unicodeToAakriti(t.sections.lekhitExam) : t.sections.lekhitExam}</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={s.categoryScroll}
						contentContainerStyle={s.categoryScrollContent}
						snapToOffsets={[0, 295 - (SCREEN_WIDTH - 250) / 2, 560 - (SCREEN_WIDTH - 250) / 2]}
						decelerationRate="fast"
						snapToAlignment="center"
						pagingEnabled={false}
						onScroll={handleScroll}
						scrollEventThrottle={16}
						contentOffset={{ x: 295 - (SCREEN_WIDTH - 250) / 2, y: 0 }}
					>
						<CategoryCard
							tag={t.categoryCards.car}
							image={require('@/assets/images/car.png')}
							imageStyle={s.categoryImageCar}
							onPress={() => router.push('/chooseCategory/fourWheeler')}
							s={s} theme={theme} isLoading={isLoading}
							viewLabel={t.categoryCards.view}
							isNepali={isNepali}
						/>
						<CategoryCard
							tag={t.categoryCards.bike}
							image={require('@/assets/images/bike.png')}
							onPress={() => router.push('/chooseCategory/twoWheeler')}
							s={s} theme={theme} isLoading={isLoading}
							viewLabel={t.categoryCards.view}
							isNepali={isNepali}
						/>
						<CategoryCard
							tag={t.categoryCards.others}
							image={require('@/assets/images/others.png')}
							imageStyle={s.categoryImageOthers}
							onPress={() => router.push('/chooseCategory/others')}
							s={s} theme={theme} isLoading={isLoading}
							viewLabel={t.categoryCards.view}
							isNepali={isNepali}
						/>
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

				{/* Featured Mock Exam Section */}
				<View style={s.section}>
					<FeaturedExamCard
						title={t.examTestCard?.title}
						subtitle={t.examTestCard?.subtitle}
						tag={t.examTestCard?.tag}
						actionLabel={t.examTestCard?.action}
						onPress={() => router.push('/practiceMore/examTest')}
						s={s}
						theme={theme}
						isLoading={isLoading}
						isNepali={isNepali}
					/>
				</View>

				{/* Quiz Section */}
				<View style={s.section}>
					<Text style={s.sectionTitle}>{isNepali ? unicodeToAakriti(t.sections.quiz) : t.sections.quiz}</Text>
					<View style={s.quizList}>
						<QuizItemCard
							title={t.quizCards.signTestTitle}
							subtitle={t.quizCards.signTestSubtitle}
							icon={require('@/assets/images/testing.png')}
							onPress={() => router.push('/quiz/signTest')}
							s={s} isLoading={isLoading}
							practiceActionLabel={t.quizCards.practiceAction}
							isNepali={isNepali}
						/>
						<QuizItemCard
							title={t.quizCards.eyeTestTitle}
							subtitle={t.quizCards.eyeTestSubtitle}
							icon={require('@/assets/images/number-block.png')}
							onPress={() => router.push('/quiz/eyeTest')}
							s={s} isLoading={isLoading}
							practiceActionLabel={t.quizCards.practiceAction}
							isNepali={isNepali}
						/>
					</View>
				</View>

				{/* Traffic Signs Practice Section */}
				<View style={s.section}>
					<Text style={s.sectionTitle}>{isNepali ? unicodeToAakriti(t.sections.trafficSigns) : t.sections.trafficSigns}</Text>
					<View style={s.signsGrid}>
						<PracticeCard
							title={t.practiceCards.informative}
							icon={require('@/assets/images/stop-sgn.png')}
							onPress={() => router.push('/practiceMore/informativeSign')}
							s={s} isLoading={isLoading}
							isNepali={isNepali}
							customCardStyle={s.signCard}
						/>
						<PracticeCard
							title={t.practiceCards.restrictive}
							icon={require('@/assets/images/restriction.png')}
							onPress={() => router.push('/practiceMore/restrictiveSign')}
							s={s} isLoading={isLoading}
							isNepali={isNepali}
							customCardStyle={s.signCard}
						/>
						<PracticeCard
							title={t.practiceCards.numbers}
							icon={require('@/assets/images/numbers.png')}
							onPress={() => router.push('/practiceMore/numberSign')}
							s={s} isLoading={isLoading}
							isNepali={isNepali}
							customCardStyle={s.signCard}
						/>
					</View>
				</View>

				{/* Others Section */}
				<View style={s.section}>
					<Text style={s.sectionTitle}>{isNepali ? unicodeToAakriti(t.sections.others) : t.sections.others}</Text>
					<View style={s.practiceGrid}>
						<PracticeCard
							title={t.otherCards.licenseForm}
							icon={require('@/assets/images/government.png')}
							onPress={() => router.push('/others/licenseForm')}
							s={s} isLoading={isLoading}
							isNepali={isNepali}
						/>
						<PracticeCard
							title={t.otherCards.licensePrintCheck}
							icon={require('@/assets/images/printer.png')}
							onPress={() => router.push('/others/licensePrintCheck')}
							s={s} isLoading={isLoading}
							isNepali={isNepali}
						/>
						<PracticeCard
							title={t.otherCards.trafficFines}
							icon={require('@/assets/images/fine.png')}
							onPress={() => router.push('/others/trafficFines')}
							s={s} isLoading={isLoading}
							isNepali={isNepali}
						/>
						<PracticeCard
							title={t.otherCards.nagdhunga}
							icon={require('@/assets/images/tunnel.png')}
							onPress={() => router.push('/others/nagdhungaPass')}
							s={s} isLoading={isLoading}
							isNepali={isNepali}
						/>
						<PracticeCard
							title={t.otherCards.nepaliCalendar}
							icon={require('@/assets/images/testing.png')}
							onPress={() => router.push('/others/nepaliCalendar')}
							s={s} isLoading={isLoading}
							isNepali={isNepali}
						/>
						<PracticeCard
							title={t.otherCards.moreInfo}
							icon={require('@/assets/images/question.png')}
							onPress={() => router.push('/others/moreInfo')}
							s={s} isLoading={isLoading}
							isNepali={isNepali}
						/>
					</View>
				</View>

				{/* Bottom Spacing */}
				<View style={s.bottomSpacing} />
			</ScrollView>
		</View>
	);
}

// ─── Style factory ───────────────────────────────────────────────────
function createStyles(theme: AppTheme, isNepali: boolean = false) {
	const { colors, glass, isDark } = theme;
	const fontNormal = isNepali ? 'Aakriti' : undefined;
	const fontBold = isNepali ? 'AakritiBold' : undefined;

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
			fontSize: isNepali ? 16 : 12,
			opacity: 0.8,
			marginTop: 10,
			textShadowColor: 'rgba(0, 0, 0, 0.4)',
			textShadowOffset: { width: 0, height: 1 },
			textShadowRadius: 3,
			fontFamily: fontNormal,
		},
		headerActions: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 2,
			marginTop: 20,
		},
		notificationButton: {
			padding: 8,
			borderRadius: 30,
			width: 40,
			height: 40,
			justifyContent: 'center',
			alignItems: 'center',
			opacity: 0.9,
			position: 'relative' as const,
		},
		notificationBadge: {
			position: 'absolute' as const,
			top: 4,
			right: 4,
			backgroundColor: '#22C55E',
			borderRadius: 8,
			minWidth: 16,
			height: 16,
			justifyContent: 'center' as const,
			alignItems: 'center' as const,
			paddingHorizontal: 3,
			borderColor: colors.header || '#1A365D',
		},
		notificationBadgeText: {
			color: '#FFFFFF',
			fontSize: 9,
			fontWeight: 'bold' as const,
			lineHeight: 12,
		},
		// UsernameReq styles
		userNameContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			marginTop: -4,
			paddingVertical: 2,
			paddingHorizontal: 4,
			borderRadius: 8,
		},
		userName: {
			color: colors.headerText,
			fontSize: 20,
			fontWeight: 'bold',
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
			fontWeight: isNepali ? 'normal' : 'bold',
			color: colors.modalText,
			textAlign: 'center',
			fontFamily: fontBold,
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
			fontWeight: isNepali ? 'normal' : '600',
			color: colors.cancelButtonText,
			fontFamily: fontNormal,
		},
		saveButtonText: {
			fontSize: 16,
			fontWeight: isNepali ? 'normal' : '600',
			color: colors.saveButtonText,
			fontFamily: fontBold || fontNormal,
		},
		// Sections
		section: {
			paddingHorizontal: 15,
			marginTop: 20,
		},
		sectionTitle: {
			fontSize: isNepali ? 20 : 16,
			fontWeight: isNepali ? 'normal' : 'bold',
			color: colors.text,
			marginBottom: 10,
			marginLeft: 15,
			fontFamily: fontBold,
		},
		examSection: {
			marginTop: 20,
		},
		examSectionTitle: {
			fontSize: isNepali ? 20 : 16,
			fontWeight: isNepali ? 'normal' : 'bold',
			color: colors.text,
			marginBottom: 10,
			marginLeft: 30,
			fontFamily: fontBold,
		},
		categoryScroll: {
			marginBottom: 5,
		},
		categoryScrollContent: {
			paddingLeft: 30,
			paddingRight: 30,
			paddingVertical: 15, // Adds buffer space so Android elevation shadows are not clipped
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
			shadowOffset: { width: 0, height: 4 }, // Added drop offset instead of 0
			shadowOpacity: isDark ? 0.3 : 0.1,    // Softened light mode opacity from 0.2 to 0.1
			shadowRadius: isDark ? 8 : 10,       // Added soft blur radius in light mode instead of 0
			elevation: isDark ? 0 : 5,            // Clean drop shadow on Android instead of overlapping/harsh 8
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
			fontSize: isNepali ? 14 : 10,
			fontWeight: isNepali ? 'normal' : '600',
			fontFamily: fontBold || fontNormal,
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
			fontSize: isNepali ? 20 : 16,
			marginTop: -3,
			fontWeight: isNepali ? 'normal' : '600',
			fontFamily: fontBold || fontNormal,
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
			fontSize: isNepali ? 20 : 16,
			color: colors.text,
			marginRight: 8,
			fontFamily: fontBold,
		},
		quizSubtitle: {
			fontSize: isNepali ? 15 : 12,
			color: colors.quizSubtitle,
			fontFamily: fontNormal,
		},
		practiceText: {
			color: colors.practiceLink,
			fontFamily: fontBold || fontNormal,
			fontSize: isNepali ? 17 : 14,
		},
		// Featured Exam Hero Card
		featuredExamCard: {
			backgroundColor: isDark ? glass.backgroundColor : colors.card,
			borderRadius: isDark ? glass.borderRadius : 20,
			borderWidth: 1,
			borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
			padding: 16,
			shadowColor: colors.shadow,
			shadowOffset: { width: 0, height: 3 },
			shadowOpacity: isDark ? 0.3 : 0.1,
			shadowRadius: isDark ? 8 : 6,
			elevation: isDark ? 0 : 3,
		},
		featuredExamContent: {
			flexDirection: 'row',
			alignItems: 'center',
		},
		featuredExamIconWrapper: {
			width: 52,
			height: 52,
			borderRadius: 26,
			backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
			alignItems: 'center',
			justifyContent: 'center',
			marginRight: 14,
		},
		featuredExamIcon: {
			width: 32,
			height: 32,
		},
		featuredExamDetails: {
			flex: 1,
			marginRight: 10,
		},
		featuredExamTagRow: {
			flexDirection: 'row',
			marginBottom: 4,
		},
		featuredExamTag: {
			backgroundColor: isDark ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255, 107, 53, 0.12)',
			paddingHorizontal: 8,
			paddingVertical: 2,
			borderRadius: 6,
		},
		featuredExamTagText: {
			color: '#FF6B35',
			fontSize: isNepali ? 12 : 10,
			fontWeight: isNepali ? 'normal' : '700',
			fontFamily: fontBold || fontNormal,
		},
		featuredExamTitle: {
			fontSize: isNepali ? 18 : 15,
			color: colors.text,
			fontWeight: isNepali ? 'normal' : '700',
			fontFamily: fontBold,
			marginBottom: 2,
		},
		featuredExamSubtitle: {
			fontSize: isNepali ? 13 : 11,
			color: colors.textSecondary,
			fontFamily: fontNormal,
			lineHeight: isNepali ? 16 : 14,
		},
		featuredExamActionPill: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: '#2563EB',
			paddingHorizontal: 12,
			paddingVertical: 8,
			borderRadius: 16,
			shadowColor: '#2563EB',
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.3,
			shadowRadius: 4,
			elevation: 2,
		},
		featuredExamActionText: {
			color: '#FFFFFF',
			fontSize: isNepali ? 14 : 12,
			fontWeight: isNepali ? 'normal' : '700',
			fontFamily: fontBold || fontNormal,
		},
		// 3-Column Signs Grid
		signsGrid: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			gap: 8,
		},
		signCard: {
			width: '31.5%',
			paddingTop: 14,
			paddingBottom: 10,
			paddingHorizontal: 4,
			borderRadius: isDark ? glass.borderRadius : 16,
		},
		// Practice grid — glass cards (4-column layout)
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
			paddingTop: 12,
			paddingBottom: 8,
			paddingHorizontal: 2,
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
			borderRadius: 20,
			backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.surface,
			alignItems: 'center',
			justifyContent: 'center',
			marginBottom: 8,
		},
		practiceIconImage: {
			width: 28,
			height: 28,
		},
		trophyIcon: {
			width: 20,
			height: 20,
		},
		practiceCardText: {
			fontSize: isNepali ? 16.5 : 12,
			color: colors.text,
			textAlign: 'center',
			lineHeight: isNepali ? 19 : 15,
			marginBottom: 4,
			fontFamily: fontBold || fontNormal,
		},
		bottomSpacing: {
			height: 120,
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