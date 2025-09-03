import { useSidebar } from '@/components/SidebarContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
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
	View
} from 'react-native';
import { shareApp } from './shareapp'; // Import the share function

// UsernameReq Component
function UsernameReq() {
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
        style={styles.userNameContainer} 
        onPress={openModal}
        activeOpacity={0.7}
      >
        <Text style={styles.userName}>{userName}</Text>
        {userName === 'Lekhit Guru' && (
          <Ionicons name="create-outline" size={14} color="rgba(255, 255, 255, 0.6)" style={styles.editIcon} />
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>What should I call you?</Text>
            </View>
            
            <View style={styles.modalBody}>
              <TextInput
                style={styles.textInput}
                value={inputName}
                onChangeText={setInputName}
                placeholder="Enter your name"
                placeholderTextColor="#999999"
                autoFocus={true}
                maxLength={20}
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
              
              <Text style={styles.charCounter}>
                {inputName.length}/20 characters
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <Pressable 
                style={[styles.button, styles.cancelButton]} 
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSaveName}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}


// HomeHeader component with props
type HomeHeaderProps = {
	onSharePress: () => void;
	onMenuPress: () => void;
}; 

function HomeHeader({ onSharePress, onMenuPress }: HomeHeaderProps) {
	const router = useRouter();

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good Morning!';
		if (hour < 17) return 'Good Afternoon!';
		if (hour < 22) return 'Good Evening!';
		return 'Good Night!';
	};

	return (
		<>
			<View style={styles.headerTop}>
				<TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
					<View style={[styles.menuLine, styles.menuLineTop]} />
					<View style={[styles.menuLine, styles.menuLineMiddle]} />
					<View style={[styles.menuLine, styles.menuLineBottom]} />
				</TouchableOpacity>

				{/* User Info with greeting and clickable username */}
				<View style={styles.userInfo}>
					<Text style={styles.greeting}>{getGreeting()}</Text>
					<UsernameReq />
				</View>

				<TouchableOpacity style={styles.shareButton} onPress={onSharePress}>
					<Ionicons name="share-social" size={20} color="#ffffff" />
				</TouchableOpacity>

			</View>
		</>
	);
}

export default function HomeScreen() {
	const scrollViewRef = useRef<ScrollView>(null);
	const [currentCategoryIndex, setCurrentCategoryIndex] = React.useState(1); // Start with BIKE (index 1)
	const [refreshing, setRefreshing] = React.useState(false);
	const { setSidebarVisible } = useSidebar();
	const router = useRouter();
	const didTriggerLightPullRef = useRef(false);

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
			newIndex = 0; // Car card
		} else if (contentOffset < 320) {
			newIndex = 1; // Bike card (around position 215)
		} else {
			newIndex = 2; // Others card
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

	// Use the imported shareApp function
	const handleShareApp = async () => {
		await shareApp();
	};

	// Handle menu press to toggle sidebar
	const handleMenuPress = () => {
		setSidebarVisible(true);
	};

	return (
		<View style={styles.container}>
			<ScrollView
				ref={scrollViewRef}
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
			>
			<View style={styles.header}> 
				<View style={styles.headerBackground} />
				<View style={styles.headerContent}>
					<HomeHeader onSharePress={handleShareApp} onMenuPress={handleMenuPress} />
				</View>
			</View>
			{refreshing && (
				<View style={styles.refreshContainer}>
					<ActivityIndicator size="small" color="#666" />
				</View>
			)}
			{/* Choose Category Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Lekhit Exam</Text>
				<ScrollView 
					horizontal 
					showsHorizontalScrollIndicator={false} 
					style={styles.categoryScroll}
					contentContainerStyle={styles.categoryScrollContent}
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
					style={styles.categoryCard}
				>
					<View style={styles.categoryTag}>
						<Text style={styles.categoryTagText}>Car</Text>
					</View>

					<View style={styles.categoryImageContainer}>
						<Image
						source={require('@/assets/images/redcar.jpg')}
						style={styles.categoryImage}
						resizeMode="contain"
						/>
					</View>

					<View style={styles.viewButton}>
						<View style={styles.playIconContainer}>
						<Ionicons name="play" size={16} color="#434D57" />
						</View>
						<Text style={styles.viewButtonText}>View</Text>
					</View>
					</TouchableOpacity>

				<TouchableOpacity
					onPress={() => router.push('/chooseCategory/twoWheeler')}
					style={styles.categoryCard}
				>
				<View style={styles.categoryTag}>
					<Text style={styles.categoryTagText}>Bike</Text>
				</View>

				<View style={styles.categoryImageContainer}>
					<Image
					source={require('@/assets/images/bike.png')}
					style={styles.categoryImage}
					resizeMode="contain"
					/>
				</View>

				<View style={styles.viewButton}>
					<View style={styles.playIconContainer}>
					<Ionicons name="play" size={16} color="#434D57" />
					</View>
					<Text style={styles.viewButtonText}>View</Text>
				</View>
				</TouchableOpacity>

					<TouchableOpacity
					onPress={() => router.push('/chooseCategory/others')}
					style={styles.categoryCard}
				>
					<View style={styles.categoryTag}>
						<Text style={styles.categoryTagText}>Others</Text>
					</View>

					<View style={styles.categoryImageContainer}>
						<Image
						source={require('@/assets/images/others.png')}
						style={styles.categoryImage}
						resizeMode="contain"
						/>
					</View>

					<View style={styles.viewButton}>
						<View style={styles.playIconContainer}>
						<Ionicons name="play" size={16} color="#434D57" />
						</View>
						<Text style={styles.viewButtonText}>View</Text>
					</View>
					</TouchableOpacity>
					
				</ScrollView>
				<View style={styles.pagination}>
					<View style={[
						styles.paginationDot, 
						currentCategoryIndex === 0 && styles.paginationDotActive
					]} />
					<View style={[
						styles.paginationDot, 
						currentCategoryIndex === 1 && styles.paginationDotActive
					]} />
					<View style={[
						styles.paginationDot, 
						currentCategoryIndex === 2 && styles.paginationDotActive
					]} />
				</View>
			</View>

			{/* Quiz Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Quiz</Text>
				<View style={styles.quizList}>
					<TouchableOpacity 
						style={styles.quizItem}
						onPress={() => router.push('/quiz/signTest')}
					>
						<View style={styles.quizIcon}>
							<Image 
								source={require('@/assets/images/testing.png')} 
								style={styles.quizIconImage}
								resizeMode="contain"
							/>
						</View>
						<View style={styles.quizContent}>
							<View style={styles.quizHeader}>
								<Text style={styles.quizTitle}>Sign Test</Text>
								<Image 
									source={require('@/assets/images/trophy.png')} 
									style={styles.trophyIcon}
									resizeMode="contain"
								/>
							</View>
							<Text style={styles.quizSubtitle}>Traffic Signals</Text>
						</View>
						<Text style={styles.practiceText}>Practice →</Text>
					</TouchableOpacity>

					<TouchableOpacity 
						style={styles.quizItem}
						onPress={() => router.push('/quiz/eyeTest')}
					>
						<View style={styles.quizIcon}>
							<Image 
								source={require('@/assets/images/number-block.png')} 
								style={styles.quizIconImage}
								resizeMode="contain"
							/>
						</View>
						<View style={styles.quizContent}>
							<View style={styles.quizHeader}>
								<Text style={styles.quizTitle}>Eye Test</Text>
								<Image 
									source={require('@/assets/images/trophy.png')} 
									style={styles.trophyIcon}
									resizeMode="contain"
								/>
							</View>
							<Text style={styles.quizSubtitle}>Numbers Pattern</Text>
						</View>
						<Text style={styles.practiceText}>Practice →</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Practice More Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Practice More</Text>
				<View style={styles.practiceGrid}>
					<TouchableOpacity
						style={styles.practiceCard}
						onPress={() => router.push('/practiceMore/informativeSign')}
					>
						<View style={styles.practiceIcon}>
							<Image 
								source={require('@/assets/images/stop-sgn.png')} 
								style={styles.practiceIconImage}
								resizeMode="contain"
							/>
						</View>
						<Text style={styles.practiceCardText}>Informative</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.practiceCard}
						onPress={() => router.push('/practiceMore/restrictiveSign')}
					>
						<View style={styles.practiceIcon}>
							<Image 
								source={require('@/assets/images/restriction.png')} 
								style={styles.practiceIconImage}
								resizeMode="contain"
							/>
						</View>
						<Text style={styles.practiceCardText}>Restrictive</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.practiceCard}
						onPress={() => router.push('/practiceMore/numberSign')}
					>
						<View style={styles.practiceIcon}>
							<Image 
								source={require('@/assets/images/numbers.png')} 
								style={styles.practiceIconImage}
								resizeMode="contain"
							/>
						</View>
						<Text style={styles.practiceCardText}>Numbers</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.practiceCard}
						onPress={() => router.push('/practiceMore/examTest')}
					>
						<View style={styles.practiceIcon}>
							<Image 
								source={require('@/assets/images/exam.png')} 
								style={styles.practiceIconImage}
								resizeMode="contain"
							/>
						</View>
						<Text style={styles.practiceCardText}>Exam Test</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Others Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Others</Text>
				<View style={styles.practiceGrid}>
					<TouchableOpacity 
						style={styles.practiceCard}
						onPress={() => router.push('/others/licenseForm')}>

						<View style={styles.practiceIcon}>
							<Image 
								source={require('@/assets/images/government.png')} 
								style={styles.practiceIconImage}
								resizeMode="contain"
							/>
						</View>
						<Text style={styles.practiceCardText}>Online license form</Text>
					</TouchableOpacity>

					<TouchableOpacity
							style={styles.practiceCard}
							onPress={() => router.push('/others/licensePrintCheck')}>

						<View style={styles.practiceIcon}>
							<Image 
								source={require('@/assets/images/printer.png')} 
								style={styles.practiceIconImage}
								resizeMode="contain"
							/>
						</View>
						<Text style={styles.practiceCardText}>License Print Check</Text>
					</TouchableOpacity>

					<TouchableOpacity 
							style={styles.practiceCard}
							onPress={() => router.push('/others/trafficFines')}>
						<View style={styles.practiceIcon}>
							<Image 
								source={require('@/assets/images/fine.png')} 
								style={styles.practiceIconImage}
								resizeMode="contain"
							/>
						</View>
						<Text style={styles.practiceCardText}>Traffic Fines    Info</Text>
					</TouchableOpacity>

					<TouchableOpacity 
							style={styles.practiceCard}
							onPress={() => router.push('/others/nagdhungaPass')}>
						<View style={styles.practiceIcon}>
							<Image 
								source={require('@/assets/images/tunnel.png')} 
								style={styles.practiceIconImage}
								resizeMode="contain"
							/>
						</View>
						<Text style={styles.practiceCardText}>Nagdhunga Charges</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.practiceCard}
						onPress={() => router.push('/others/moreInfo')}>
						<View style={styles.practiceIcon}>
							<Image 
								source={require('@/assets/images/question.png')} 
								style={styles.practiceIconImage}
								resizeMode="contain"
							/>
						</View>
						<Text style={styles.practiceCardText}>More Info</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Bottom Spacing */}
			<View style={styles.bottomSpacing} />
		</ScrollView>

	</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	scrollView: {
		flex: 1,
	},
	header: {
		backgroundColor: '#434D57',
		paddingTop: 50,
		paddingHorizontal: 20,
		paddingBottom: 10,
    	borderTopLeftRadius: 0, 
		borderTopRightRadius: 0,
		borderBottomLeftRadius: 40,
		borderBottomRightRadius: 40,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.4,
		shadowRadius: 10,
		elevation: 20,
		position: 'relative', // For layering
		zIndex: 1000,
	},
	headerBackground: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: '#434D57',
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
	},
	menuButton: {
		marginTop: 20,
		padding: 8,
		backgroundColor: 'rgba(180, 180, 180, 0.6)', // Dark semi-transparent background
		borderRadius: 30, // Keep it circular
		width: 50,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		opacity: 0.9, // Slightly more opaque for better visibility
		position: 'relative', // For layering
	},
// Hamburger lines styling
	menuLine: {
		height: 2,
		backgroundColor: '#fff',
		marginVertical: 1.5,
		borderRadius: 2,
	},

	menuLineTop: {
    	width: 12, // Shorter line
	},

	menuLineMiddle: {
    	width: 18, // Longest line
	},

	menuLineBottom: {
    	width: 12, // Shorter line
	},
	userInfo: {
		flex: 1,
		marginLeft: 10,
		marginRight: 10, // Adjusted for better spacing
		marginTop: 10
	},
	greeting: {
		color: '#fff',
		left: 4,
		fontSize: 12,
		opacity: 0.4,
		marginTop: 10,	
	},
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
		color: '#fff',
		fontSize: 16,
		
		marginBottom: 10,
    	marginLeft: 10,
	},
	searchBar: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.23)',
		borderRadius: 25,
		paddingHorizontal: 20,
		paddingVertical: 12,
		position: 'relative',
	},
	searchPlaceholder: {
		color: '#ffffff71',
		marginLeft: 10,
    	marginBottom: 2,
		fontSize: 16,
		opacity: 1,
		position: 'relative',
		zIndex: 1,
	},
	section: {
		paddingHorizontal: 15,
		//paddingVertical: 10,
		marginTop: 20,	
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		//fontFamily: 'SpacaMono-Regular',
		color: '#333',
		marginBottom: 10,
    	marginLeft:15,
	},
	categoryScroll: {
		marginBottom: 5,
	},
	categoryScrollContent: {
		paddingLeft: 15,    // Only left padding
		paddingRight: 15,   // Only right padding
	},
	categoryCard: {
		backgroundColor: '#fff',
		borderRadius: 25,
		padding: 20,
		marginRight: 15, //fills the gap between cards
		width: 250,
		height: 270,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.2,
		shadowRadius: 0,
		elevation: 8,
	},
	categoryTag: {
		backgroundColor: '#434D57',
		paddingHorizontal: 18,
		paddingVertical: 6,
		borderRadius: 20,
		alignSelf: 'flex-start',
		//marginBottom: 0,
	},
	categoryTagText: {
		color: '#fff',
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
	viewButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 10,
		paddingVertical: 15,
		gap: 0, // Adjust this value to change spacing
	},
	playIconContainer: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: -1, // Adjust this value to change spacing
	},
	viewButtonText: {
		color: '#434D57',
		fontSize: 16,
		height: 20,
		//marginBottom: 0,
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
		backgroundColor: '#ddd',
	},
	paginationDotActive: {
		backgroundColor: '#FF6B35',
		width: 20,
		borderRadius: 5,
	},
	quizList: {
		gap: 12,
	},
	quizItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		flexWrap: 'nowrap',
		alignItems: 'center',
		backgroundColor: '#fff',
		padding: 15,
		borderRadius: 15,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	quizIcon: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: '#f0f0f0',
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
		color: '#333',
		marginRight: 8,   // replace gap if needed
	},
	quizSubtitle: {
		fontSize: 12,
		color: '#66666675',
		
	},
	
	practiceText: {
		color: '#434D57',
	},
	practiceGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 5,
	},
	practiceCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 15,
		//paddingVertical: 0,
		width: '23.8%',        // <= this makes 4 cards fit in a single row
		paddingTop: 15,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	practiceIcon: {
		width: 40,
		height: 40,
		borderRadius: 25,
		backgroundColor: '#f0f0f0',
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
		color: '#333',
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
	shareButton: {
		marginTop: 20,
		padding: 8,
		//backgroundColor: 'rgba(180, 180, 180, 0.6)',
		borderRadius: 30,
		width: 50,             // Same as menuButton
		height: 40,            // Same as menuButton
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
		color: 'white',
		fontSize: 20,
		marginBottom: 1,
		marginRight: 6,
	},
	editIcon: {
		opacity: 0.7,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	modalContainer: {
		backgroundColor: '#ffffff',
		borderRadius: 16,
		width: '100%',
		maxWidth: 400,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 10,
		},
		shadowOpacity: 0.25,
		shadowRadius: 10,
		elevation: 10,
	},
	modalHeader: {
		paddingTop: 24,
		paddingHorizontal: 24,
		paddingBottom: 16,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#333333',
		textAlign: 'center',
	},
	modalBody: {
		paddingHorizontal: 24,
		paddingBottom: 16,
	},
	textInput: {
		borderWidth: 1,
		borderColor: '#e0e0e0',
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		color: '#333333',
		backgroundColor: '#f9f9f9',
		textAlign: 'center',
	},
	charCounter: {
		fontSize: 12,
		color: '#999999',
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
		backgroundColor: '#f5f5f5',
		borderWidth: 1,
		borderColor: '#e0e0e0',
	},
	saveButton: {
		backgroundColor: '#4CAF50',
	},
	cancelButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#666666',
	},
	saveButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#ffffff',
	},

});