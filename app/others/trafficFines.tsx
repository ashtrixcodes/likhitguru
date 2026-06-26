import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useRef, useState, useMemo } from 'react';
import { Animated, Easing, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import type { AppTheme } from '@/constants/theme';

interface TrafficViolation {
  id: string;
  type: string;
  icon: any;
  fineAmount: string;
  note: string;
}

const TrafficViolationCard = ({ violation }: { violation: TrafficViolation }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;

  const toggleExpansion = () => {
    if (!isExpanded) {
      // Expanding
      setIsExpanded(true);
      
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 350,
          delay: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(animatedRotation, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Collapsing
      Animated.parallel([
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 10,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 100,
          delay: 100,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(animatedRotation, {
          toValue: 0,
          duration: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsExpanded(false);
      });
    }
  };

  return (
    <Pressable style={styles.card} onPress={toggleExpansion}>
      <View style={styles.cardHeader}>
        <View style={styles.leftContent}>
          <Image 
            source={violation.icon}
            style={styles.violationIcon}
            resizeMode="contain"
          />
          <View style={styles.textContent}>
            <Text style={styles.violationType}>{violation.type}</Text>
            {!isExpanded && (
              <Text style={styles.tapHintText}>Tap to see fine amount</Text>
            )}
            {isExpanded && (
              <Text style={styles.fineAmount}>
                fine amount: <Text style={styles.fineAmountValue}>{violation.fineAmount}</Text>
              </Text>
            )}
          </View>
        </View>
        <View style={styles.rightContent}>
          <Animated.View
            style={{
              transform: [{
                rotate: animatedRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                })
              }]
            }}
          >
            <Ionicons 
              name="chevron-down"
              size={24} 
              color={theme.isDark ? "#FFF" : "#666"} 
            />
          </Animated.View>
        </View>
      </View>
      
      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.dotSeparator}>
            {Array.from({ length: 65 }).map((_, index) => (
              <View key={index} style={styles.dot} />
            ))}
          </View>
          <Text style={styles.noteText}>{violation.note}</Text>
        </View>
      )}
    </Pressable>
  );
};

export default function TrafficFinesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const trafficViolations: TrafficViolation[] = [
    {
      id: '1',
      type: 'Overspeeding',
      icon: require('../../assets/images/trafficFines/fast.png'),
      fineAmount: 'Rs.500-1500',
      note: 'Note: Mandatory awareness class for repeat offenses'
    },
    {
      id: '2',
      type: 'Drunk & Drive (Ma Pa Se)',
      icon: require('../../assets/images/trafficFines/drunk.png'),
      fineAmount: 'Rs.1000',
      note: 'Note: Jail time, license suspension, mandatory awareness class'
    },
    {
      id: '3',
      type: 'Driving without a license',
      icon: require('../../assets/images/trafficFines/driveNoLicense.png'),
      fineAmount: 'Rs.1000',
      note: 'Note: Document seizure, mandatory awareness class (first offense)'
    },
    {
      id: '4',
      type: 'No Helmet',
      icon: require('../../assets/images/trafficFines/no-helmet.png'),
      fineAmount: 'Rs.500',
      note: 'Note: Document seizure'
    },
    {
      id: '5',
      type: 'No Seatbelt',
      icon: require('../../assets/images/trafficFines/seatbelt.png'),
      fineAmount: 'Rs.500',
      note: 'Note: Document seizure'
    },
    {
      id: '6',
      type: 'Wrong Side Driving',
      icon: require('../../assets/images/trafficFines/wrongSide.png'),
      fineAmount: 'Rs.500-1500',
      note: 'Note: Mandatory awareness class for repeat offenses'
    },
    {
      id: '7',
      type: 'Red Light Violation',
      icon: require('../../assets/images/trafficFines/redLightViolation.png'),
      fineAmount: 'Rs.500-1500',
      note: 'Note: Mandatory awareness class for repeat offenses'
    },
    {
      id: '8',
      type: 'Using Mobile while Driving',
      icon: require('../../assets/images/trafficFines/usingPhoneDriving.png'),
      fineAmount: 'Rs.1000',
      note: 'Note: Document seizure'
    },
    {
      id: '9',
      type: 'Triple Riding on Bike',
      icon: require('../../assets/images/trafficFines/tripleRide.png'),
      fineAmount: 'Rs.500',
      note: 'Note: License suspension for repeat offenses'
    },
    {
      id: '10',
      type: 'Parking in No-Parking Zone',
      icon: require('../../assets/images/trafficFines/parkingOnNoParking.png'),
      fineAmount: 'Rs.500',
      note: 'Note: Possible towing charges'
    },
    {
      id: '11',
      type: 'Overloading-Passenger/Cargo',
      icon: require('../../assets/images/trafficFines/overload.png'),
      fineAmount: 'Rs.500-3000+',
      note: 'Note: Varies by vehicle type and severity, higher for commercial/cargo vehicles'
    },
  ];

  const renderHeader = () => (
    <Stack.Screen 
      options={{
        title: "Traffic Fines Info",
        headerTitleAlign: 'left',
        headerStyle: {
          backgroundColor: theme.isDark ? theme.colors.card : '#ffffff',
        },
        headerTitleStyle: {
          fontSize: 20,
          color: theme.isDark ? '#FFF' : '#000000',
        },
        headerTintColor: theme.isDark ? '#FFF' : '#000000',
        headerLeft: () => (
          <Pressable 
            onPress={() => router.back()}
            style={styles.headerBackButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.isDark ? "#FFF" : "#000000"} />
          </Pressable>
        ),
      }}
    />
  );

  return (
    <>
      {renderHeader()}
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {trafficViolations.map((violation) => (
            <TrafficViolationCard 
              key={violation.id} 
              violation={violation} 
            />
          ))}
        </ScrollView>
      </View>
    </>
  );
}

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
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20, // Add bottom padding for better scrolling experience
  },
  headerStyle: {
    backgroundColor: isDark ? colors.card : 'white',
  },
  headerTitleStyle: {
    fontSize: 20,
    color: colors.text,
    padding: 10,
  },
  headerBackButton: {
    padding: 10,
    borderRadius: 20,
  },
  card: {
    backgroundColor: isDark ? glass.backgroundColor : '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? glass.borderColor : 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  violationIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  violationType: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  fineAmount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  fineAmountValue: {
    fontWeight: '700',
    color: isDark ? '#4CAF50' : '#2E7D32', // Green highlighting for fine amount
  },
  tapHintText: {
    fontSize: 12,
    color: isDark ? '#B0B0B0' : '#999',
    marginTop: 2,
    fontStyle: 'italic',
  },
  rightContent: {
    padding: 4,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 4,
    alignItems: 'center',
  },
  dotSeparator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1.5,
    backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#C0C0C0',
    marginHorizontal: 1.5,
  },
  noteText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginLeft: 10,
  },
});
}