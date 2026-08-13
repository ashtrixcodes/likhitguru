import AdBanner from '@/components/AdBanner';
import { Skeleton } from '@/components/Skeleton';
import { themedHeaderOptions } from '@/constants/screenHelpers';
import type { AppTheme } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { ThemeBackground, useTheme } from '@/context/ThemeContext';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// Memoized skeleton fine violation card
const ViolationSkeleton = memo(() => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.leftContent}>
          <Skeleton height={40} style={styles.violationIcon} borderRadius={8} />
          <View style={styles.textContent}>
            <Skeleton height={18} style={{ width: '60%', marginBottom: 8 }} borderRadius={4} />
            <Skeleton height={12} style={{ width: '40%' }} borderRadius={4} />
          </View>
        </View>
        <View style={styles.rightContent}>
          <Ionicons name="chevron-down" size={24} color={theme.isDark ? "rgba(255,255,255,0.2)" : "#E0E0E0"} />
        </View>
      </View>
    </View>
  );
});

// Loading skeletons wrapper
const LoadingSkeletons = memo(() => (
  <>
    {Array.from({ length: 6 }, (_, i: number) => (
      <ViolationSkeleton key={`skeleton-${i}`} />
    ))}
  </>
));

interface TrafficViolation {
  id: string;
  typeEn: string;
  typeNp: string;
  icon: any;
  fineAmountEn: string;
  fineAmountNp: string;
  noteEn: string;
  noteNp: string;
}

const TrafficViolationCard = ({ violation }: { violation: TrafficViolation }) => {
  const { theme } = useTheme();
  const { isNepali } = useLanguage();
  const styles = useMemo(() => createStyles(theme, isNepali), [theme, isNepali]);
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
            <Text style={styles.violationType}>
              {isNepali ? unicodeToAakriti(violation.typeNp) : violation.typeEn}
            </Text>
            {!isExpanded && (
              <Text style={styles.tapHintText}>
                {isNepali ? unicodeToAakriti('जरिवाना रकम हेर्न थिच्नुहोस्') : 'Tap to see fine amount'}
              </Text>
            )}
            {isExpanded && (
              <Text style={styles.fineAmount}>
                {isNepali ? unicodeToAakriti('जरिवाना रकम: ') : 'fine amount: '}
                <Text style={styles.fineAmountValue}>
                  {isNepali ? unicodeToAakriti(violation.fineAmountNp) : violation.fineAmountEn}
                </Text>
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
          <Text style={styles.noteText}>
            {isNepali ? unicodeToAakriti(violation.noteNp) : violation.noteEn}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

export default function TrafficFinesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isNepali } = useLanguage();
  const styles = useMemo(() => createStyles(theme, isNepali), [theme, isNepali]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const trafficViolations: TrafficViolation[] = [
    {
      id: '1',
      typeEn: 'Overspeeding',
      typeNp: 'तीव्र गतिमा सवारी चलाएको',
      icon: require('../../assets/images/trafficFines/fast.png'),
      fineAmountEn: 'Rs.500-1500',
      fineAmountNp: 'रु. ५०० - १५००',
      noteEn: 'Note: Mandatory awareness class for repeat offenses',
      noteNp: 'द्रष्टव्य: दोहोर्याएर नियम उल्लङ्घन गरेमा अनिवार्य सचेतना कक्षा लिनुपर्नेछ।',
    },
    {
      id: '2',
      typeEn: 'Drunk & Drive (Ma Pa Se)',
      typeNp: 'मादक पदार्थ सेवन गरी सवारी चलाएको (मा.प.से.)',
      icon: require('../../assets/images/trafficFines/drunk.png'),
      fineAmountEn: 'Rs.1000',
      fineAmountNp: 'रु. १०००',
      noteEn: 'Note: Jail time, license suspension, mandatory awareness class',
      noteNp: 'द्रष्टव्य: जेल सजाय/कारबाही, लाइसेन्स निलम्बन र अनिवार्य सचेतना कक्षा।',
    },
    {
      id: '3',
      typeEn: 'Driving without a license',
      typeNp: 'चालक अनुमतिपत्र (लाइसेन्स) बिना सवारी चलाएको',
      icon: require('../../assets/images/trafficFines/driveNoLicense.png'),
      fineAmountEn: 'Rs.1000',
      fineAmountNp: 'रु. १०००',
      noteEn: 'Note: Document seizure, mandatory awareness class (first offense)',
      noteNp: 'द्रष्टव्य: सवारी कागजात नियन्त्रण र पहिलोपटक उल्लङ्घन गरेमा अनिवार्य सचेतना कक्षा।',
    },
    {
      id: '4',
      typeEn: 'No Helmet',
      typeNp: 'हेल्मेट नलगाई सवारी चलाएको',
      icon: require('../../assets/images/trafficFines/no-helmet.png'),
      fineAmountEn: 'Rs.500',
      fineAmountNp: 'रु. ५००',
      noteEn: 'Note: Document seizure',
      noteNp: 'द्रष्टव्य: सवारी कागजात नियन्त्रणमा लिइनेछ।',
    },
    {
      id: '5',
      typeEn: 'No Seatbelt',
      typeNp: 'सिटबेल्ट नलगाई सवारी चलाएको',
      icon: require('../../assets/images/trafficFines/seatbelt.png'),
      fineAmountEn: 'Rs.500',
      fineAmountNp: 'रु. ५००',
      noteEn: 'Note: Document seizure',
      noteNp: 'द्रष्टव्य: सवारी कागजात नियन्त्रणमा लिइनेछ।',
    },
    {
      id: '6',
      typeEn: 'Wrong Side Driving',
      typeNp: 'गलत दिशा (रङ साइड) बाट सवारी चलाएको',
      icon: require('../../assets/images/trafficFines/wrongSide.png'),
      fineAmountEn: 'Rs.500-1500',
      fineAmountNp: 'रु. ५०० - १५००',
      noteEn: 'Note: Mandatory awareness class for repeat offenses',
      noteNp: 'द्रष्टव्य: दोहोर्याएर नियम उल्लङ्घन गरेमा अनिवार्य सचेतना कक्षा लिनुपर्नेछ।',
    },
    {
      id: '7',
      typeEn: 'Red Light Violation',
      typeNp: 'रातो बत्ती (ट्राफिक सिग्नल) उल्लङ्घन गरेको',
      icon: require('../../assets/images/trafficFines/redLightViolation.png'),
      fineAmountEn: 'Rs.500-1500',
      fineAmountNp: 'रु. ५०० - १५००',
      noteEn: 'Note: Mandatory awareness class for repeat offenses',
      noteNp: 'द्रष्टव्य: दोहोर्याएर नियम उल्लङ्घन गरेमा अनिवार्य सचेतना कक्षा लिनुपर्नेछ।',
    },
    {
      id: '8',
      typeEn: 'Using Mobile while Driving',
      typeNp: 'सवारी चलाउँदा मोबाइल फोन प्रयोग गरेको',
      icon: require('../../assets/images/trafficFines/usingPhoneDriving.png'),
      fineAmountEn: 'Rs.1000',
      fineAmountNp: 'रु. १०००',
      noteEn: 'Note: Document seizure',
      noteNp: 'द्रष्टव्य: सवारी कागजात नियन्त्रणमा लिइनेछ।',
    },
    {
      id: '9',
      typeEn: 'Triple Riding on Bike',
      typeNp: 'मोटरसाइकल/स्कुटरमा तीन जना चढेको (ट्रिपल राइड)',
      icon: require('../../assets/images/trafficFines/tripleRide.png'),
      fineAmountEn: 'Rs.500',
      fineAmountNp: 'रु. ५००',
      noteEn: 'Note: License suspension for repeat offenses',
      noteNp: 'द्रष्टव्य: दोहोर्याएर नियम उल्लङ्घन गरेमा लाइसेन्स निलम्बन हुन सक्नेछ।',
    },
    {
      id: '10',
      typeEn: 'Parking in No-Parking Zone',
      typeNp: 'नो-पार्किङ क्षेत्रमा सवारी पार्क गरेको',
      icon: require('../../assets/images/trafficFines/parkingOnNoParking.png'),
      fineAmountEn: 'Rs.500',
      fineAmountNp: 'रु. ५००',
      noteEn: 'Note: Possible towing charges',
      noteNp: 'द्रष्टव्य: सवारी साधन क्रेनद्वारा उठाइने वा थप दस्तुर लाग्नेछ।',
    },
    {
      id: '11',
      typeEn: 'Overloading-Passenger/Cargo',
      typeNp: 'क्षमता भन्दा बढी यात्रु वा भार (ओभरलोड) बोकेको',
      icon: require('../../assets/images/trafficFines/overload.png'),
      fineAmountEn: 'Rs.500-3000+',
      fineAmountNp: 'रु. ५०० - ३०००+',
      noteEn: 'Note: Varies by vehicle type and severity, higher for commercial/cargo vehicles',
      noteNp: 'द्रष्टव्य: सवारी साधनको प्रकृति र गम्भीरता अनुसार जरिवाना थप हुनेछ।',
    },
  ];

  const renderHeader = () => (
    <Stack.Screen
      options={{
        title: isNepali ? unicodeToAakriti('सवारी जरिवाना विवरण') : 'Traffic Fines Info',
        ...themedHeaderOptions(theme),
        headerTitleStyle: {
          fontSize: isNepali ? 22 : 20,
          color: '#FFFFFF',
          fontFamily: isNepali ? 'AakritiBold' : undefined,
        },
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            style={styles.headerBackButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
        ),
      }}
    />
  );

  return (
    <ThemeBackground>
      {renderHeader()}
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <LoadingSkeletons />
          ) : (
            trafficViolations.map((violation) => (
              <TrafficViolationCard
                key={violation.id}
                violation={violation}
              />
            ))
          )}
          <AdBanner />
        </ScrollView>
      </View>
    </ThemeBackground>
  );
}

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
    scrollContent: {
      paddingTop: 20,
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    headerStyle: {
      backgroundColor: isDark ? colors.card : 'white',
    },
    headerTitleStyle: {
      fontSize: isNepali ? 22 : 20,
      color: colors.text,
      padding: 10,
      fontFamily: fontBold,
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
      elevation: isDark ? 0 : 3,
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
      fontSize: isNepali ? 19 : 17,
      fontWeight: isNepali ? 'normal' : '600',
      color: colors.text,
      fontFamily: fontBold,
      lineHeight: isNepali ? 24 : 22,
    },
    fineAmount: {
      fontSize: isNepali ? 15 : 13,
      color: colors.textSecondary,
      marginTop: 4,
      fontFamily: fontNormal,
    },
    fineAmountValue: {
      fontWeight: isNepali ? 'normal' : '700',
      color: isDark ? '#4CAF50' : '#2E7D32',
      fontFamily: fontBold,
    },
    tapHintText: {
      fontSize: isNepali ? 13 : 11,
      color: isDark ? '#B0B0B0' : '#888',
      marginTop: 2,
      fontFamily: fontNormal,
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
      fontSize: isNepali ? 15 : 13,
      color: colors.textSecondary,
      lineHeight: isNepali ? 22 : 18,
      fontFamily: fontNormal,
    },
  });
}