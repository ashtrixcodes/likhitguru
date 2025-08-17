import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
	const scrollViewRef = useRef<ScrollView>(null);
	const [currentCategoryIndex, setCurrentCategoryIndex] = React.useState(1); // Start with BIKE (index 1)
	const router = useRouter();

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good Morning!';
		if (hour < 17) return 'Good Afternoon!';
		if (hour < 22) return 'Good Evening!';
		return 'Good Night!';
	};

	useEffect(() => {
		// Scroll to BIKE category (second position) when component mounts
		setTimeout(() => {
			scrollViewRef.current?.scrollTo({ x: 230, animated: false });
		}, 100);
	}, []);

	const handleScroll = (event: any) => {
		const contentOffset = event.nativeEvent.contentOffset.x;
		const categoryWidth = 280;
		const newIndex = Math.round(contentOffset / categoryWidth);
		setCurrentCategoryIndex(newIndex);
	};

	return (
	<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
	{/* Header Section */}
	<View style={styles.header}>
		<View style={styles.headerTop}>
			<TouchableOpacity style={styles.menuButton} onPress={() => router.push('/slider/sideview')}>
				<View style={[styles.menuLine, styles.menuLineTop]} />
				<View style={[styles.menuLine, styles.menuLineMiddle]} />
				<View style={[styles.menuLine, styles.menuLineBottom]} />
			</TouchableOpacity>
			<View style={styles.userInfo}>
				<Text style={styles.greeting}>{getGreeting()}</Text>
				<Text style={styles.userName}>Prashant Khanal</Text>
			</View>
		</View>
	
				<View style={styles.searchSection}>
					<Text style={styles.searchTitle}>Search Category</Text>
					<View style={styles.searchBar}>
						<Ionicons name="search" size={20} color="#ffffff85" />
						<Text style={styles.searchPlaceholder}>search here..</Text>
					</View>
				</View>
			</View>
			
			{/* Choose Category Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Choose Category</Text>
				<ScrollView 
					ref={scrollViewRef}
					horizontal 
					showsHorizontalScrollIndicator={false} 
					style={styles.categoryScroll}
					contentContainerStyle={styles.categoryScrollContent}
					snapToInterval={20}
					decelerationRate="fast"
					snapToAlignment="center"
					pagingEnabled={false}
					onScroll={handleScroll}
					scrollEventThrottle={16}
				>

					<View style={styles.categoryCard}>
						<View style={styles.categoryTag}>
							<Text style={styles.categoryTagText}>BIKE</Text>
						</View>
						<View style={styles.categoryImageContainer}>
							<Image 
								source={require('@/assets/images/bike.png')} 
								style={styles.categoryImage}
								resizeMode="contain"
							/>
						</View>
						<TouchableOpacity style={styles.viewButton}>
							<View style={styles.playIconContainer}>
								<Ionicons name="play" size={16} color="#434D57" />
							</View>
							<Text style={styles.viewButtonText}>View</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.categoryCard}>
						<View style={styles.categoryTag}>
							<Text style={styles.categoryTagText}>CAR</Text>
						</View>
						<View style={styles.categoryImageContainer}>
							<Image 
								source={require('@/assets/images/push.png')} 
								style={styles.categoryImage}
								resizeMode="contain"
							/>
						</View>
						<TouchableOpacity style={styles.viewButton}>
							<View style={styles.playIconContainer}>
								<Ionicons name="play" size={16} color="#434D57" />
							</View>
							<Text style={styles.viewButtonText}>View</Text>
						</TouchableOpacity>
					</View>
					
					<View style={styles.categoryCard}>
						<View style={styles.categoryTag}>
							<Text style={styles.categoryTagText}>MOPED</Text>
						</View>
						<View style={styles.categoryImageContainer}>
							<Image 
								source={require('@/assets/images/stopwatch.png')} 
								style={styles.categoryImage}
								resizeMode="contain"
							/>
						</View>
						<TouchableOpacity style={styles.viewButton}>
							<View style={styles.playIconContainer}>
								<Ionicons name="play" size={16} color="#434D57" />
							</View>
							<Text style={styles.viewButtonText}>View</Text>
						</TouchableOpacity>
					</View>
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

					<TouchableOpacity style={styles.quizItem}>
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
					<TouchableOpacity style={styles.practiceCard}>
						<View style={styles.practiceIcon}>
							<Image 
								source={require('@/assets/images/stop-sgn.png')} 
								style={styles.practiceIconImage}
								resizeMode="contain"
							/>
						</View>
						<Text style={styles.practiceCardText}>Informative</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.practiceCard}>
						<View style={styles.practiceIcon}>
							<Image 
								source={require('@/assets/images/restriction.png')} 
								style={styles.practiceIconImage}
								resizeMode="contain"
							/>
						</View>
						<Text style={styles.practiceCardText}>Restrictive</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.practiceCard}>
						<View style={styles.practiceIcon}>
							<Image 
								source={require('@/assets/images/numbers.png')} 
								style={styles.practiceIconImage}
								resizeMode="contain"
							/>
						</View>
						<Text style={styles.practiceCardText}>Numbers</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.practiceCard}>
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
						<Text style={styles.practiceCardText}>Online  license form</Text>
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
						<Text style={styles.practiceCardText}>License    Print Check</Text>
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
						<Text style={styles.practiceCardText}>Traffic     Fines Info</Text>
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
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	header: {
		backgroundColor: '#434D57',
		paddingTop: 50,
		paddingHorizontal: 20,
		paddingBottom: 40,
    	borderTopLeftRadius: 0, 
		borderTopRightRadius: 0,
		borderBottomLeftRadius: 40,
		borderBottomRightRadius: 40,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.4,
		shadowRadius: 10,
		elevation: 3,
		position: 'relative', // For layering
	
	
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
		marginRight: 0, // Adjusted for better spacing
		marginTop: 10
    
},
	greeting: {
		color: '#fff',
		fontSize: 12,
		opacity: 0.4,
		marginTop: 10,
		
},
	userName: {
		color: '#fff',
		fontSize: 20,
		marginBottom: 1,
},
	notificationButton: {
		padding: 8,
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
		paddingHorizontal: 30,
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
		gap: 14,
	},
	practiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    //paddingVertical: 0,
    width: '22%',        // <= this makes 4 cards fit in a single row
    paddingTop: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
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
});
