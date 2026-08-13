import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState, useMemo, useRef, useEffect, memo } from 'react';
import { useTheme, ThemeBackground } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';
import { themedHeaderOptions } from '@/constants/screenHelpers';
import type { AppTheme } from '@/constants/theme';
import AdBanner from '@/components/AdBanner';
import {
    Animated,
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Skeleton } from '@/components/Skeleton';

// Memoized skeleton charge card
const ChargeSkeleton = memo(() => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.vehicleCard}>
      <View style={styles.vehicleHeader}>
        <Skeleton height={60} style={styles.vehicleImage} />
        <View style={styles.vehicleInfo}>
          <Skeleton height={18} style={{ width: '50%', marginBottom: 8 }} borderRadius={4} />
          <Skeleton height={14} style={{ width: '80%' }} borderRadius={4} />
        </View>
        <Ionicons 
          name="chevron-down" 
          size={24} 
          color={theme.isDark ? 'rgba(255,255,255,0.2)' : '#E0E0E0'} 
        />
      </View>
    </View>
  );
});

// Loading skeletons wrapper
const LoadingSkeletons = memo(() => (
  <>
    {Array.from({ length: 4 }, (_, i: number) => (
      <ChargeSkeleton key={`skeleton-${i}`} />
    ))}
  </>
));

const { width } = Dimensions.get('window');

interface VehicleCharge {
  id: string;
  nameEn: string;
  nameNp: string;
  image: any;
  enteringChargeEn: string;
  enteringChargeNp: string;
  exitingChargeEn: string;
  exitingChargeNp: string;
  descriptionEn: string;
  descriptionNp: string;
}

const vehicleCharges: VehicleCharge[] = [
  {
    id: 'car-van',
    nameEn: 'Car/Van',
    nameNp: 'कार / भ्यान',
    image: require('@/assets/images/car.png'),
    enteringChargeEn: 'NPR 65',
    enteringChargeNp: 'रु. ६५',
    exitingChargeEn: 'NPR 60',
    exitingChargeNp: 'रु. ६०',
    descriptionEn: 'Personal vehicles and small vans',
    descriptionNp: 'निजी सवारी साधन तथा साना भ्यानहरू',
  },
  {
    id: 'mini-bus-truck',
    nameEn: 'Mini Bus/Truck',
    nameNp: 'मिनी बस / मिनी ट्रक',
    image: require('@/assets/images/bluecar.png'),
    enteringChargeEn: 'NPR 115',
    enteringChargeNp: 'रु. ११५',
    exitingChargeEn: 'NPR 80',
    exitingChargeNp: 'रु. ८०',
    descriptionEn: 'Small commercial vehicles',
    descriptionNp: 'साना व्यावसायिक तथा मालवाहक सवारी साधनहरू',
  },
  {
    id: 'bus-truck',
    nameEn: 'Bus/Truck',
    nameNp: 'ठूलो बस / ट्रक',
    image: require('@/assets/images/greencar.png'),
    enteringChargeEn: 'NPR 260',
    enteringChargeNp: 'रु. २६०',
    exitingChargeEn: 'NPR 200',
    exitingChargeNp: 'रु. २००',
    descriptionEn: 'Large commercial vehicles',
    descriptionNp: 'ठूला सार्वजनिक तथा व्यापारिक सवारी साधनहरू',
  },
  {
    id: 'heavy-equipment',
    nameEn: 'Heavy Equipment',
    nameNp: 'भारी उपकरण (हेभी इक्विपमेन्ट)',
    image: require('@/assets/images/bike.png'),
    enteringChargeEn: 'NPR 600',
    enteringChargeNp: 'रु. ६००',
    exitingChargeEn: 'NPR 250',
    exitingChargeNp: 'रु. २५०',
    descriptionEn: 'Construction and heavy machinery',
    descriptionNp: 'निर्माण तथा भारी मेसिनरी सवारी साधनहरू',
  }
];

export default function NagdhungaPassScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isNepali } = useLanguage();
  const styles = useMemo(() => createStyles(theme, isNepali), [theme, isNepali]);
  const [expandedCards, setExpandedCards] = useState<string[]>(['car-van']); // Car/Van expanded by default
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const renderVehicleCard = (vehicle: VehicleCharge) => {
    const isExpanded = expandedCards.includes(vehicle.id);
    
    return (
      <TouchableOpacity 
        key={vehicle.id} 
        style={styles.vehicleCard}
        onPress={() => toggleCard(vehicle.id)}
        activeOpacity={0.7}
      >
        <View style={styles.vehicleHeader}>
          <Image source={vehicle.image} style={styles.vehicleImage} />
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>
              {isNepali ? unicodeToAakriti(vehicle.nameNp) : vehicle.nameEn}
            </Text>
            <Text style={styles.vehicleDescription}>
              {isNepali ? unicodeToAakriti(vehicle.descriptionNp) : vehicle.descriptionEn}
            </Text>
          </View>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color={theme.isDark ? '#FFF' : '#666'} 
          />
        </View>
        
        {isExpanded && (
          <View style={styles.chargesContainer}>
            <View style={styles.chargeItem}>
              <View style={styles.chargeHeader}>
                <Ionicons name="arrow-down-circle" size={20} color="#4CAF50" />
                <Text style={styles.chargeLabel}>
                  {isNepali ? unicodeToAakriti('काठमाडौँ प्रवेश (भित्रिँदा)') : 'Entering Kathmandu'}
                </Text>
              </View>
              <Text style={styles.chargeAmount}>
                {isNepali ? unicodeToAakriti(vehicle.enteringChargeNp) : vehicle.enteringChargeEn}
              </Text>
            </View>
            
            <View style={styles.chargeItem}>
              <View style={styles.chargeHeader}>
                <Ionicons name="arrow-up-circle" size={20} color="#FF9800" />
                <Text style={styles.chargeLabel}>
                  {isNepali ? unicodeToAakriti('काठमाडौँबाट बाहिरिँदा') : 'Exiting Kathmandu'}
                </Text>
              </View>
              <Text style={styles.chargeAmount}>
                {isNepali ? unicodeToAakriti(vehicle.exitingChargeNp) : vehicle.exitingChargeEn}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ThemeBackground>
      <Stack.Screen 
        options={{
          title: isNepali ? unicodeToAakriti('नागढुङ्गा टनेल दस्तुर') : 'Nagdhunga Charges',
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
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Government Notice */}
          <View style={styles.noticeContainer}>
            <Image source={require('@/assets/images/government.png')} style={styles.governmentIcon} />
            <View style={styles.noticeText}>
              <Text style={styles.noticeTitle}>
                {isNepali ? unicodeToAakriti('सरकारी तोकिएको दस्तुर दर') : 'Government Set Fees'}
              </Text>
              <Text style={styles.noticeSubtitle}>
                {isNepali
                  ? unicodeToAakriti('काठमाडौँ उपत्यका प्रवेश तथा बाहिरिने नागढुङ्गा टनेल प्रयोग गर्ने सवारी साधनका लागि आधिकारिक दस्तुर')
                  : 'Official charges for vehicles using the Nagdhunga Tunnel to enter and exit Kathmandu'}
              </Text>
            </View>
          </View>

          {isLoading ? (
            <LoadingSkeletons />
          ) : (
            vehicleCharges.map(renderVehicleCard)
          )}
          
          {/* Additional Info */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#2196F3" />
            <Text style={styles.infoText}>
              {isNepali
                ? unicodeToAakriti('द्रष्टव्य: दस्तुर दर परिवर्तन हुन सक्नेछ। कृपया यात्रा गर्नुअघि अद्यावधिक दर पुष्टि गर्नुहोस्।')
                : 'Charges are subject to change. Please verify current rates before travel.'}
            </Text>
          </View>
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
  headerBackButton: {
    padding: 8,
    marginLeft: 10,
    borderRadius: 20,
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? glass.backgroundColor : '#e3f2fd',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? glass.borderColor : 'transparent',
  },
  governmentIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  noticeText: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: isNepali ? 18 : 16,
    fontWeight: isNepali ? 'normal' : '600',
    color: isDark ? '#64B5F6' : '#1976D2',
    marginBottom: 4,
    fontFamily: fontBold,
  },
  noticeSubtitle: {
    fontSize: isNepali ? 15 : 14,
    color: isDark ? '#E0E0E0' : '#424242',
    lineHeight: isNepali ? 22 : 20,
    fontFamily: fontNormal,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  vehicleCard: {
    backgroundColor: isDark ? glass.backgroundColor : '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: isDark ? 0 : 4,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? glass.borderColor : 'transparent',
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  vehicleImage: {
    width: 60,
    height: 60,
    marginRight: 15,
    borderRadius: 8,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: isNepali ? 20 : 18,
    fontWeight: isNepali ? 'normal' : '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: fontBold,
  },
  vehicleDescription: {
    fontSize: isNepali ? 14 : 14,
    color: colors.textSecondary,
    fontFamily: fontNormal,
  },
  chargesContainer: {
    gap: 15,
  },
  chargeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0',
  },
  chargeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chargeLabel: {
    fontSize: isNepali ? 15 : 14,
    color: colors.textSecondary,
    marginLeft: 10,
    fontWeight: isNepali ? 'normal' : '500',
    fontFamily: fontNormal,
  },
  chargeAmount: {
    fontSize: isNepali ? 20 : 18,
    fontWeight: isNepali ? 'normal' : '700',
    color: isDark ? '#64B5F6' : '#1976D2',
    fontFamily: fontBold,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? glass.backgroundColor : '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? glass.borderColor : '#e0e0e0',
  },
  infoText: {
    fontSize: isNepali ? 15 : 14,
    color: colors.textSecondary,
    marginLeft: 12,
    flex: 1,
    lineHeight: isNepali ? 22 : 20,
    fontFamily: fontNormal,
  },
});
}