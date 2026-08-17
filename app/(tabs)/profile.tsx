import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Safely import ImageViewing on native; fallback on Web
let ImageViewing: any = null;
if (Platform.OS !== 'web') {
  try {
    ImageViewing = require('react-native-image-viewing').default;
  } catch (e) {
    // fallback
  }
}

import AdBanner from '@/components/AdBanner';
import WeatherOverlay from '@/components/WeatherOverlay';
import DarkModeToggle from '@/components/DarkModeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import NepaliDateHeaderBadge from '@/components/NepaliDateHeaderBadge';
import { ShimmerBox, AvatarShimmer } from '@/components/ProfileShimmer';

import type { AppTheme } from '@/constants/theme';
import { homeTranslations } from '@/constants/homeTranslations';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useHaptics } from '@/context/HapticsContext';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';
import { getDailyQuizProgress, DailyQuizProgress } from '@/utils/dailyQuizStorage';
import { fetchPlayerRank } from '@/utils/leaderboardService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* -------------------- ShimmerBar Component -------------------- */
function ShimmerBar({ width, height, style }: { width: number | string; height: number; style?: any }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const { theme } = useTheme();

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: 6,
          backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={{ ...StyleSheet.absoluteFillObject, transform: [{ translateX }] }}>
        <LinearGradient
          colors={
            theme.isDark
              ? ['transparent', 'rgba(255,255,255,0.15)', 'transparent']
              : ['transparent', 'rgba(255,255,255,0.6)', 'transparent']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

/* -------------------- Main Profile Screen -------------------- */
export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isNepali, fontFamily, fontFamilyBold } = useLanguage();
  const { user, userName, userAvatar, isSyncing, signInWithGoogle, signOut } = useAuth();
  const { triggerImpact, triggerNotification } = useHaptics();
  const s = useMemo(() => createStyles(theme, isNepali), [theme, isNepali]);

  const [licensePhoto, setLicensePhoto] = useState<{ uri: string } | null>(null);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [quizProgress, setQuizProgress] = useState<DailyQuizProgress | null>(null);
  const [globalRank, setGlobalRank] = useState<number | null>(null);

  // Custom Alert Modal State
  const [customAlert, setCustomAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon?: {
      name: keyof typeof Ionicons.glyphMap;
      color: string;
      bg: string;
    };
    options: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'destructive' | 'cancel';
    }>;
  }>({
    visible: false,
    title: '',
    message: '',
    options: [],
  });

  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (customAlert.visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.95);
      opacityAnim.setValue(0);
    }
  }, [customAlert.visible]);

  // Load progress and license data
  const loadProfileData = useCallback(async () => {
    try {
      const [storedUri, progress, rank] = await Promise.all([
        AsyncStorage.getItem('licensePhotoUri'),
        getDailyQuizProgress(),
        fetchPlayerRank(),
      ]);

      if (storedUri) {
        setLicensePhoto({ uri: storedUri });
      }
      setQuizProgress(progress);
      setGlobalRank(rank);
    } catch (e) {
      console.warn('Failed to load profile data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData, user]);

  const showAlert = (
    title: string,
    message: string,
    options: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'destructive' | 'cancel';
    }> = [{ text: 'OK' }],
    icon?: {
      name: keyof typeof Ionicons.glyphMap;
      color: string;
      bg: string;
    }
  ) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      options,
      icon,
    });
  };

  const getAlertHeaderIcon = () => {
    if (customAlert.icon) {
      return customAlert.icon;
    }
    const titleLower = customAlert.title.toLowerCase();
    const msgLower = customAlert.message.toLowerCase();

    if (
      titleLower.includes('google') ||
      titleLower.includes('खाता') ||
      msgLower.includes('@')
    ) {
      return {
        name: 'logo-google' as const,
        color: '#4285F4',
        bg: 'rgba(66, 133, 244, 0.14)',
      };
    }

    if (
      titleLower.includes('sign out') ||
      titleLower.includes('साइन आउट') ||
      titleLower.includes('disconnect') ||
      titleLower.includes('हटाउनुहोस्') ||
      titleLower.includes('remove') ||
      titleLower.includes('delete')
    ) {
      return {
        name: 'log-out-outline' as const,
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.14)',
      };
    }

    if (
      titleLower.includes('upload') ||
      titleLower.includes('success') ||
      titleLower.includes('सफलतापूर्वक') ||
      titleLower.includes('secured')
    ) {
      return {
        name: 'checkmark-circle' as const,
        color: '#10B981',
        bg: 'rgba(16, 185, 129, 0.14)',
      };
    }

    if (
      titleLower.includes('photo') ||
      titleLower.includes('camera') ||
      titleLower.includes('क्यामेरा') ||
      titleLower.includes('ग्यालरी') ||
      titleLower.includes('लाइसेन्स')
    ) {
      return {
        name: 'card-outline' as const,
        color: '#FF6B35',
        bg: 'rgba(255, 107, 53, 0.14)',
      };
    }

    return {
      name: 'information-circle' as const,
      color: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.14)',
    };
  };

  const getOptionMeta = (text: string, style?: string) => {
    const t = text.toLowerCase();
    if (t.includes('camera') || t.includes('क्यामेरा')) {
      return {
        icon: 'camera' as const,
        color: theme.colors.accent || '#FF6B35',
        bg: `${theme.colors.accent || '#FF6B35'}18`,
      };
    }
    if (t.includes('gallery') || t.includes('ग्यालरी')) {
      return {
        icon: 'images' as const,
        color: '#3B82F6',
        bg: 'rgba(59, 130, 246, 0.14)',
      };
    }
    if (style === 'destructive' || t.includes('remove') || t.includes('sign out') || t.includes('साइन आउट')) {
      return {
        icon: 'log-out-outline' as const,
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.14)',
      };
    }
    return {
      icon: 'chevron-forward' as const,
      color: theme.colors.textSecondary,
      bg: 'transparent',
    };
  };

  const isActionSheet = useMemo(() => {
    return customAlert.options.length > 2;
  }, [customAlert.options]);

  const handleUploadPhoto = async () => {
    triggerImpact();
    showAlert(
      isNepali ? unicodeToAakriti('फोटो छनोट गर्नुहोस्') : 'Select License Photo',
      isNepali ? unicodeToAakriti('लाइसेन्सको स्पष्ट फोटो छान्नुहोस्') : 'Choose a clear photo of your driving license',
      [
        { text: isNepali ? unicodeToAakriti('क्यामेराबाट खिच्नुहोस्') : 'Take Photo with Camera', onPress: openCamera },
        { text: isNepali ? unicodeToAakriti('ग्यालरीबाट छान्नुहोस्') : 'Choose from Gallery', onPress: openGallery },
        { text: isNepali ? unicodeToAakriti('रद्द गर्नुहोस्') : 'Cancel', style: 'cancel' },
      ]
    );
  };

  const savePhoto = async (asset: any) => {
    try {
      const fileName = asset.uri.split('/').pop();
      const newPath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: asset.uri, to: newPath });
      await AsyncStorage.setItem('licensePhotoUri', newPath);
      setLicensePhoto({ uri: newPath });
      triggerNotification();

      showAlert(
        isNepali ? unicodeToAakriti('सफलतापूर्वक अपलोड भयो!') : 'License Secured! 🪪',
        isNepali
          ? unicodeToAakriti('तपाईंको डिजिटल लाइसेन्स सुरक्षित रूपमा भण्डारण गरिएको छ।')
          : 'Your driving license has been saved locally for offline roadside verification.'
      );
    } catch (error) {
      console.error('Error saving photo:', error);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert(
        isNepali ? unicodeToAakriti('अनुमति आवश्यक छ') : 'Permission Required',
        isNepali ? unicodeToAakriti('क्यामेरा प्रयोग गर्न अनुमति आवश्यक छ') : 'Camera access is needed to scan your license'
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      savePhoto(result.assets[0]);
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert(
        isNepali ? unicodeToAakriti('अनुमति आवश्यक छ') : 'Permission Required',
        isNepali ? unicodeToAakriti('फोटो ग्यालरी प्रयोग गर्न अनुमति आवश्यक छ') : 'Photo library access is needed'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      savePhoto(result.assets[0]);
    }
  };

  const handleRemovePhoto = () => {
    triggerNotification();
    showAlert(
      isNepali ? unicodeToAakriti('फोटो हटाउनुहोस्?') : 'Remove License Photo?',
      isNepali ? unicodeToAakriti('के तपाईं निश्चित हुनुहुन्छ?') : 'Are you sure you want to remove your digital license copy?',
      [
        {
          text: isNepali ? unicodeToAakriti('रद्द गर्नुहोस्') : 'Cancel',
          style: 'cancel',
        },
        {
          text: isNepali ? unicodeToAakriti('हटाउनुहोस्') : 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (licensePhoto?.uri) {
              try {
                await FileSystem.deleteAsync(licensePhoto.uri, { idempotent: true });
                await AsyncStorage.removeItem('licensePhotoUri');
                setLicensePhoto(null);
              } catch (error) {
                console.error('Error removing photo:', error);
              }
            }
          },
        },
      ]
    );
  };

  const handleAccountOptionsPrompt = () => {
    triggerImpact();
    if (user) {
      showAlert(
        isNepali ? unicodeToAakriti('Google खाता') : 'Google Account',
        user.email ? `${user.email}` : (isNepali ? unicodeToAakriti('खाता जोडिएको छ') : 'Account connected'),
        [
          {
            text: isNepali ? unicodeToAakriti('साइन आउट गर्नुहोस्') : 'Disconnect Account',
            style: 'destructive',
            onPress: async () => {
              await signOut();
              await loadProfileData();
            },
          },
          {
            text: isNepali ? unicodeToAakriti('रद्द गर्नुहोस्') : 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
      showAlert(
        isNepali ? unicodeToAakriti('Google खाता जोड्नुहोस्') : 'Connect Account',
        isNepali
          ? unicodeToAakriti('आफ्नो स्कोर र लिडरबोर्ड प्रोफाइल सिंक गर्न Google खाता जोड्नुहोस्।')
          : 'Sync your quiz progress, XP, and rank across devices with Google Sign-In.',
        [
          {
            text: isNepali ? unicodeToAakriti('Google बाट साइन इन गर्नुहोस्') : 'Connect with Google',
            onPress: async () => {
              try {
                await signInWithGoogle();
              } catch (e) {
                console.warn('Sign in failed:', e);
              }
            },
          },
          {
            text: isNepali ? unicodeToAakriti('रद्द गर्नुहोस्') : 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const totalXP = quizProgress?.totalXP ?? 0;
  const currentStreak = quizProgress?.currentStreak ?? 0;
  const levelTitle = useMemo(() => {
    if (totalXP >= 1000) return isNepali ? unicodeToAakriti('अनुभवी चालक') : 'Pro Rider';
    if (totalXP >= 400) return isNepali ? unicodeToAakriti('सक्रिय शिक्षार्थी') : 'Active Learner';
    return isNepali ? unicodeToAakriti('नयाँ चालक') : 'Novice Driver';
  }, [totalXP, isNepali]);
  const { language } = useLanguage();

  // Compute header greeting dynamically
  const displayGreeting = useMemo(() => {
    return isNepali ? unicodeToAakriti('चालक प्रोफाइल') : 'Driver Profile';
  }, [isNepali]);

  const displayUserName = useMemo(() => {
    if (userName && userName.trim() !== '') {
      return userName.trim();
    }
    return isNepali ? unicodeToAakriti('अतिथि चालक') : 'Guest Driver';
  }, [userName, isNepali]);

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={s.container}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ══════════════════════════════════════════════════════════════
            1. UNIFIED DASHBOARD-MATCHING TOP NAV HEADER (Weather & Sky)
        ══════════════════════════════════════════════════════════════ */}
        <View style={[s.dashboardHeader, { paddingTop: Math.max(insets.top, 20) + 24 }]}>
          <WeatherOverlay />

          <View style={s.dashboardHeaderContent}>
            {/* Top Action Bar (Avatar + Title on Left / Account Icon Button on Right) */}
            <View style={s.headerTopRow}>
              {isSyncing ? (
                <View style={s.headerLeftGroup}>
                  <View style={s.topAvatarWrapper}>
                    <AvatarShimmer size={48} isDark={true} />
                  </View>
                  <View style={s.headerTitleCol}>
                    <ShimmerBox width={90} height={12} borderRadius={6} isDark={true} style={{ marginBottom: 6 }} />
                    <ShimmerBox width={150} height={18} borderRadius={8} isDark={true} />
                  </View>
                </View>
              ) : (
                <View style={s.headerLeftGroup}>
                  <View style={s.topAvatarWrapper}>
                    <LinearGradient
                      colors={user ? ['#60A5FA', '#3B82F6', '#1D4ED8'] : ['#94A3B8', '#64748B']}
                      style={s.topAvatarGlowBorder}
                    >
                      {userAvatar ? (
                        <View style={{ width: '100%', height: '100%', position: 'relative' }}>
                          {avatarLoading && (
                            <AvatarShimmer size={44} isDark={true} style={{ position: 'absolute', top: 0, left: 0 }} />
                          )}
                          <Image
                            source={{ uri: userAvatar }}
                            style={s.topAvatarImage}
                            onLoadStart={() => setAvatarLoading(true)}
                            onLoadEnd={() => setAvatarLoading(false)}
                          />
                        </View>
                      ) : (
                        <View style={s.topAvatarPlaceholder}>
                          <Ionicons name="person" size={24} color="#FFFFFF" />
                        </View>
                      )}
                    </LinearGradient>
                    {user && <View style={s.topActiveBeacon} />}
                  </View>

                  <View style={s.headerTitleCol}>
                    <Text style={s.headerSubGreeting}>
                      {displayGreeting}
                    </Text>
                    <Text
                      style={[
                        s.headerMainTitle,
                        userName && userName.trim() !== '' && { fontFamily: undefined },
                      ]}
                      numberOfLines={1}
                    >
                      {displayUserName}
                    </Text>
                  </View>
                </View>
              )}

              {/* Top Right Connect / Disconnect Action Icon Button */}
              <TouchableOpacity
                style={s.authHeaderIconButton}
                onPress={handleAccountOptionsPrompt}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={user ? 'log-out-outline' : 'logo-google'}
                  size={19}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            {/* User Email & Verified Status Sub-pill */}
            {isSyncing ? (
              <View style={[s.userStatusSubRow, { width: 200 }]}>
                <ShimmerBox width={170} height={12} borderRadius={6} isDark={true} />
              </View>
            ) : (
              <View style={s.userStatusSubRow}>
                <Ionicons
                  name={user ? 'shield-checkmark' : 'person-outline'}
                  size={13}
                  color={user ? '#10B981' : '#94A3B8'}
                />
                <Text
                  style={[
                    s.userStatusSubEmail,
                    !user?.email && isNepali && { fontFamily: fontFamily || 'Aakriti', fontSize: 13 },
                  ]}
                  numberOfLines={1}
                >
                  {user?.email ?? (isNepali ? unicodeToAakriti('अतिथि चालक') : 'Guest Explorer')}
                </Text>
              </View>
            )}

            {/* Integrated Driver Telemetry Bar */}
            <View style={s.telemetryContainer}>
              <View style={s.telemetryItem}>
                <View style={s.telemetryIconRow}>
                  <Ionicons name="flash" size={13} color="#FBBF24" />
                  <Text style={s.telemetryLabel}>{isNepali ? unicodeToAakriti('कुल अंक') : 'Total XP'}</Text>
                </View>
                <Text style={s.telemetryValue}>{totalXP.toLocaleString()}</Text>
                <Text style={s.telemetrySub}>{levelTitle}</Text>
              </View>

              <View style={s.telemetryDivider} />

              <View style={s.telemetryItem}>
                <View style={s.telemetryIconRow}>
                  <Ionicons name="flame" size={13} color="#EF4444" />
                  <Text style={s.telemetryLabel}>{isNepali ? unicodeToAakriti('स्ट्रिक') : 'Streak'}</Text>
                </View>
                <Text style={s.telemetryValue}>
                  {currentStreak}{' '}
                  <Text style={{ fontFamily: isNepali ? fontFamily || 'Aakriti' : undefined, fontSize: isNepali ? 14 : 12, fontWeight: 'normal' }}>
                    {isNepali ? unicodeToAakriti('दिन') : currentStreak === 1 ? 'Day' : 'Days'}
                  </Text>
                </Text>
                <Text style={s.telemetrySub}>
                  {isNepali ? unicodeToAakriti('दैनिक क्विज') : 'Daily Quiz'}
                </Text>
              </View>

              <View style={s.telemetryDivider} />

              <View style={s.telemetryItem}>
                <View style={s.telemetryIconRow}>
                  <Ionicons name="trophy" size={13} color="#4ADE80" />
                  <Text style={s.telemetryLabel}>{isNepali ? unicodeToAakriti('स्थान') : 'Rank'}</Text>
                </View>
                <Text style={s.telemetryValue}>
                  {globalRank ? (
                    `#${globalRank}`
                  ) : isNepali ? (
                    <>
                      <Text style={{ fontFamily: isNepali ? fontFamily || 'Aakriti' : undefined, fontSize: 13, fontWeight: 'normal' }}>
                        {unicodeToAakriti('शीर्ष ')}
                      </Text>
                      10
                    </>
                  ) : (
                    'Top 10'
                  )}
                </Text>
                <Text style={s.telemetrySub}>
                  {isNepali ? unicodeToAakriti('लिडरबोर्ड') : 'Leaderboard'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════════
            2. DIGITAL DRIVING LICENSE VAULT (Realistic Card Presentation)
        ══════════════════════════════════════════════════════════════ */}
        <View style={s.bodyContent}>
          <View style={s.sectionHeader}>
            <View style={s.sectionIconBox}>
              <Ionicons name="card" size={18} color="#FF6B35" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.sectionHeading}>
                {isNepali ? unicodeToAakriti('डिजिटल सवारी चालक अनुमतिपत्र') : 'Official Driving License Vault'}
              </Text>
              <Text style={s.sectionSubheading}>
                {isNepali ? unicodeToAakriti('ट्राफिक चेकजाँचको लागि अफलाइन प्रतिलिपि') : 'Offline encrypted backup for roadside verification'}
              </Text>
            </View>
          </View>

          {/* Interactive License Card Frame */}
          {!isLoading && !licensePhoto ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleUploadPhoto}
              style={s.emptyLicenseCard}
            >
              <View style={s.emptyScannerGlow}>
                <Ionicons name="scan-outline" size={40} color={theme.isDark ? '#60A5FA' : '#2563EB'} />
              </View>
              <Text style={s.emptyLicenseTitle}>
                {isNepali ? unicodeToAakriti('लाइसेन्सको फोटो स्क्यान गर्नुहोस्') : 'Upload Physical Driving License'}
              </Text>
              <Text style={s.emptyLicenseSubtitle}>
                {isNepali
                  ? unicodeToAakriti('क्यामेरा वा ग्यालरीबाट स्पष्ट फोटो राख्नुहोस्')
                  : 'Keep a digital copy handy on your phone for emergency roadside checks'}
              </Text>

              <View style={s.emptyScanButton}>
                <Ionicons name="camera" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={s.emptyScanButtonText}>
                  {isNepali ? unicodeToAakriti('अहिले फोटो थप्नुहोस्') : 'Scan License Now'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={s.filledLicenseContainer}>
              {isLoading ? (
                <View style={s.skeletonWrapper}>
                  <SkeletonLicense />
                </View>
              ) : (
                <View style={s.licenseImageCard}>
                  <TouchableOpacity
                    onPress={() => setIsImageViewerVisible(true)}
                    activeOpacity={0.92}
                    style={s.licenseTouchArea}
                  >
                    <Image source={{ uri: licensePhoto?.uri }} style={s.licenseImagePreview} resizeMode="cover" />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.6)']}
                      style={s.licenseGradientOverlay}
                    >
                      <View style={s.licenseOverlayRow}>
                        <View style={s.licensePill}>
                          <Ionicons name="shield-checkmark" size={12} color="#4ADE80" />
                          <Text style={s.licensePillText}>VERIFIED BACKUP</Text>
                        </View>
                        <View style={s.tapToZoomTag}>
                          <Ionicons name="expand-outline" size={14} color="#FFFFFF" />
                          <Text style={s.tapToZoomText}>Tap to Zoom</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* 3-Dot Quick Options Float Button */}
                  <TouchableOpacity
                    style={s.licenseMenuFloat}
                    onPress={() => {
                      showAlert(
                        isNepali ? unicodeToAakriti('लाइसेन्स व्यवस्थापन') : 'License Options',
                        isNepali ? unicodeToAakriti('विकल्प रोज्नुहोस्') : 'Choose an action',
                        [
                          {
                            text: isNepali ? unicodeToAakriti('फोटो फेर्नुहोस्') : 'Replace Photo',
                            onPress: handleUploadPhoto,
                          },
                          {
                            text: isNepali ? unicodeToAakriti('फोटो हटाउनुहोस्') : 'Remove Photo',
                            style: 'destructive',
                            onPress: handleRemovePhoto,
                          },
                          {
                            text: isNepali ? unicodeToAakriti('रद्द गर्नुहोस्') : 'Cancel',
                            style: 'cancel',
                          },
                        ]
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="ellipsis-vertical" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Legal Disclaimer Pill */}
          <View style={s.legalNoteCard}>
            <Ionicons name="information-circle-outline" size={18} color={theme.isDark ? '#94A3B8' : '#64748B'} />
            <Text style={s.legalNoteText}>
              {isNepali
                ? unicodeToAakriti('कानुनी रूपमा अनुमति दिइएको स्थानमा ट्राफिक चेकिङको समयमा तपाईंले यो डिजिटल लाइसेन्स देखाउन सक्नुहुन्छ।')
                : 'You may present this digital card backup during roadside traffic checks where legally permitted in Nepal.'}
            </Text>
          </View>

          {/* ══════════════════════════════════════════════════════════════
              3. QUICK EXAM READINESS MODULES
          ══════════════════════════════════════════════════════════════ */}
          <View style={[s.sectionHeader, { marginTop: 24 }]}>
            <View style={[s.sectionIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.14)' }]}>
              <Ionicons name="speedometer" size={18} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.sectionHeading}>
                {isNepali ? unicodeToAakriti('तयारी स्थिति र अभ्यास') : 'Exam Readiness Hub'}
              </Text>
              <Text style={s.sectionSubheading}>
                {isNepali ? unicodeToAakriti('सवारी चालक लिखित परीक्षा') : 'DOTM Nepal License Syllabus'}
              </Text>
            </View>
          </View>

          <View style={s.quickHubGrid}>
            <TouchableOpacity
              style={s.quickHubTile}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/dailyQuiz')}
            >
              <View style={[s.quickHubIconCircle, { backgroundColor: 'rgba(234, 67, 53, 0.14)' }]}>
                <Ionicons name="calendar" size={20} color="#EA4335" />
              </View>
              <Text style={s.quickHubTitle}>{isNepali ? unicodeToAakriti('दैनिक क्विज') : 'Daily Quiz'}</Text>
              <Text style={s.quickHubSub}>{isNepali ? unicodeToAakriti('+१०० XP') : 'Earn +100 XP'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.quickHubTile}
              activeOpacity={0.8}
              onPress={() => router.push('/quiz/signTest')}
            >
              <View style={[s.quickHubIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.14)' }]}>
                <Ionicons name="warning" size={20} color="#F59E0B" />
              </View>
              <Text style={s.quickHubTitle}>{isNepali ? unicodeToAakriti('ट्राफिक चिन्ह') : 'Traffic Signs'}</Text>
              <Text style={s.quickHubSub}>{isNepali ? unicodeToAakriti('भिजुअल टेस्ट') : 'Visual Test'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.quickHubTile}
              activeOpacity={0.8}
              onPress={() => router.push('/quiz/eyeTest')}
            >
              <View style={[s.quickHubIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.14)' }]}>
                <Ionicons name="eye" size={20} color="#10B981" />
              </View>
              <Text style={s.quickHubTitle}>{isNepali ? unicodeToAakriti('दृष्टि परीक्षण') : 'Color Vision'}</Text>
              <Text style={s.quickHubSub}>{isNepali ? unicodeToAakriti('इशिहारा प्लेट्स') : 'Ishihara Plates'}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 20 }} />
          <AdBanner />
        </View>
      </ScrollView>

      {/* Fullscreen Image Viewer Modal */}
      {licensePhoto && ImageViewing && (
        <ImageViewing
          images={[{ uri: licensePhoto?.uri ?? '' }]}
          imageIndex={0}
          visible={isImageViewerVisible}
          onRequestClose={() => setIsImageViewerVisible(false)}
        />
      )}

      {/* Custom Universal Alert Modal */}
      <Modal
        visible={customAlert.visible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setCustomAlert((prev) => ({ ...prev, visible: false }))}
      >
        <View style={s.alertOverlay}>
          <Animated.View
            style={[
              s.alertContainer,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {(() => {
              const iconInfo = getAlertHeaderIcon();
              return (
                <View style={[s.alertIconWrapper, { backgroundColor: iconInfo.bg }]}>
                  <Ionicons name={iconInfo.name} size={30} color={iconInfo.color} />
                </View>
              );
            })()}

            <Text style={s.alertTitle}>{customAlert.title}</Text>

            {!!customAlert.message && (
              customAlert.message.includes('@') ? (
                <View style={s.alertEmailBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                  <Text style={s.alertEmailText} numberOfLines={1}>
                    {customAlert.message}
                  </Text>
                </View>
              ) : (
                <Text style={s.alertMessage}>{customAlert.message}</Text>
              )
            )}

            {isActionSheet ? (
              <View style={s.actionSheetContainer}>
                <View style={s.actionItemsList}>
                  {customAlert.options
                    .filter((opt) => opt.style !== 'cancel' && opt.text.toLowerCase() !== 'cancel')
                    .map((opt, index, arr) => {
                      const meta = getOptionMeta(opt.text, opt.style);
                      const isLast = index === arr.length - 1;
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[s.actionItemRow, isLast && { borderBottomWidth: 0 }]}
                          activeOpacity={0.65}
                          onPress={() => {
                            setCustomAlert((prev) => ({ ...prev, visible: false }));
                            if (opt.onPress) {
                              setTimeout(() => opt.onPress?.(), 100);
                            }
                          }}
                        >
                          <View style={s.actionItemLeft}>
                            <View style={[s.actionItemIconBg, { backgroundColor: meta.bg }]}>
                              <Ionicons name={meta.icon} size={18} color={meta.color} />
                            </View>
                            <Text style={[s.actionItemText, { color: meta.color }]}>{opt.text}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                      );
                    })}
                </View>

                {customAlert.options.some((opt) => opt.style === 'cancel' || opt.text.toLowerCase() === 'cancel') && (
                  <TouchableOpacity
                    style={s.actionCancelButton}
                    activeOpacity={0.7}
                    onPress={() => {
                      const cancelOpt = customAlert.options.find(
                        (opt) => opt.style === 'cancel' || opt.text.toLowerCase() === 'cancel'
                      );
                      setCustomAlert((prev) => ({ ...prev, visible: false }));
                      if (cancelOpt?.onPress) {
                        setTimeout(() => cancelOpt.onPress?.(), 100);
                      }
                    }}
                  >
                    <Text style={s.actionCancelButtonText}>
                      {isNepali ? unicodeToAakriti('रद्द गर्नुहोस्') : 'Cancel'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={s.alertButtonsContainer}>
                {customAlert.options.map((opt, index) => {
                  const isDestructive = opt.style === 'destructive';
                  const isCancel = opt.style === 'cancel';
                  const isGoogle = opt.text.toLowerCase().includes('google');

                  let btnStyle: any = s.alertButtonDefault;
                  let textStyle: any = s.alertButtonTextDefault;
                  let iconName: any = null;

                  if (isDestructive) {
                    btnStyle = s.alertButtonDestructive;
                    textStyle = s.alertButtonTextDestructive;
                    iconName = 'log-out-outline';
                  } else if (isCancel) {
                    btnStyle = s.alertButtonCancel;
                    textStyle = s.alertButtonTextCancel;
                  } else if (isGoogle) {
                    btnStyle = s.alertButtonGoogle;
                    textStyle = s.alertButtonTextGoogle;
                    iconName = 'logo-google';
                  }

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[s.alertButton, btnStyle]}
                      activeOpacity={0.75}
                      onPress={() => {
                        setCustomAlert((prev) => ({ ...prev, visible: false }));
                        if (opt.onPress) {
                          setTimeout(() => opt.onPress?.(), 100);
                        }
                      }}
                    >
                      {iconName && (
                        <Ionicons
                          name={iconName}
                          size={17}
                          color={isDestructive ? '#FFFFFF' : '#4285F4'}
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text style={[s.alertButtonText, textStyle]}>{opt.text}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

/* -------------------- Skeleton License Layout -------------------- */
function SkeletonLicense() {
  return (
    <View style={{ flex: 1, padding: 18 }}>
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <ShimmerBar width="65%" height={14} />
      </View>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <ShimmerBar width="45%" height={10} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <ShimmerBar width="35%" height={12} />
        <ShimmerBar width="40%" height={12} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ShimmerBar width="50%" height={12} />
        <ShimmerBar width="25%" height={12} />
      </View>
    </View>
  );
}

/* -------------------- Styles Creation -------------------- */
function createStyles(theme: AppTheme, isNepali: boolean = false) {
  const { colors, isDark, glass } = theme;
  const fontNormal = isNepali ? 'Aakriti' : undefined;
  const fontBold = isNepali ? 'AakritiBold' : undefined;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // ── DASHBOARD UNIFIED HEADER ──
    dashboardHeader: {
      backgroundColor: colors.header,
      paddingHorizontal: 18,
      paddingBottom: 22,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 36,
      borderBottomRightRadius: 36,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 12,
      position: 'relative',
      overflow: 'hidden',
    },
    dashboardHeaderContent: {
      zIndex: 10,
      position: 'relative',
    },
    headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18,
    },
    headerLeftGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    topAvatarWrapper: {
      position: 'relative',
    },
    topAvatarGlowBorder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      padding: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    topAvatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 22,
      backgroundColor: '#1E293B',
    },
    topAvatarPlaceholder: {
      width: '100%',
      height: '100%',
      borderRadius: 22,
      backgroundColor: '#1E293B',
      justifyContent: 'center',
      alignItems: 'center',
    },
    topActiveBeacon: {
      position: 'absolute',
      bottom: -1,
      right: -1,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#22C55E',
      borderWidth: 2,
      borderColor: '#0B1120',
    },
    headerTitleCol: {
      flexDirection: 'column',
      justifyContent: 'center',
    },
    headerSubGreeting: {
      color: colors.headerText,
      fontSize: isNepali ? 15 : 13,
      opacity: 0.8,
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
      fontFamily: fontNormal,
    },
    headerMainTitle: {
      color: colors.headerText || '#FFFFFF',
      fontSize: 20,
      fontWeight: 'bold',
      fontFamily: fontBold,
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    headerRightGroup: {
      alignItems: 'flex-end',
    },
    authHeaderIconButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.16)',
      borderColor: 'rgba(255, 255, 255, 0.28)',
      borderWidth: 1,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    userStatusSubRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.07)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginBottom: 14,
    },
    userStatusSubEmail: {
      fontSize: 12,
      color: '#CBD5E1',
      fontWeight: '500',
    },

    // Embedded Profile Identity Inside Dashboard Header
    profileIdentityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.14)',
      borderWidth: 1,
      borderRadius: 22,
      padding: 14,
      gap: 14,
      marginBottom: 14,
    },
    avatarWrapper: {
      position: 'relative',
    },
    avatarGlowBorder: {
      width: 64,
      height: 64,
      borderRadius: 32,
      padding: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 30,
      backgroundColor: '#1E293B',
    },
    avatarPlaceholder: {
      width: '100%',
      height: '100%',
      borderRadius: 30,
      backgroundColor: '#1E293B',
      justifyContent: 'center',
      alignItems: 'center',
    },
    activeBeacon: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 13,
      height: 13,
      borderRadius: 6.5,
      backgroundColor: '#22C55E',
      borderWidth: 2,
      borderColor: '#0B1120',
    },
    credentialsCol: {
      flex: 1,
    },
    nameBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    driverName: {
      fontSize: 19,
      fontWeight: '800',
      color: '#FFFFFF',
      fontFamily: fontBold,
    },
    driverEmail: {
      fontSize: 12,
      color: '#93C5FD',
    },

    // Telemetry Modules
    telemetryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(0, 0, 0, 0.28)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderRadius: 18,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginBottom: 14,
    },
    telemetryItem: {
      flex: 1,
      alignItems: 'center',
    },
    telemetryIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 2,
    },
    telemetryLabel: {
      fontSize: isNepali ? 11 : 10,
      color: '#94A3B8',
      fontWeight: '700',
      textTransform: isNepali ? 'none' : 'uppercase',
      fontFamily: fontBold,
    },
    telemetryValue: {
      fontSize: 16,
      fontWeight: '900',
      color: '#FFFFFF',
      marginBottom: 1,
    },
    telemetrySub: {
      fontSize: isNepali ? 11 : 10,
      color: '#38BDF8',
      fontWeight: '600',
      fontFamily: fontNormal,
    },
    telemetryDivider: {
      width: 1,
      height: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },

    headerActionRow: {
      width: '100%',
    },
    googleSignInActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 14,
      paddingVertical: 11,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 3,
    },
    googleSignInActionText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#111827',
      fontFamily: fontBold,
    },
    signOutActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(239, 68, 68, 0.18)',
      borderColor: 'rgba(239, 68, 68, 0.35)',
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 9,
      paddingHorizontal: 14,
      gap: 6,
    },
    signOutActionText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FCA5A5',
      fontFamily: fontBold,
    },

    // ── BODY CONTENT BELOW HEADER ──
    bodyContent: {
      paddingHorizontal: 18,
      paddingTop: 20,
    },

    // ── 2. LICENSE VAULT SECTION ──
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 14,
    },
    sectionIconBox: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(255, 107, 53, 0.16)' : 'rgba(255, 107, 53, 0.12)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionHeading: {
      fontSize: isNepali ? 18 : 16,
      fontWeight: '800',
      color: colors.text,
      fontFamily: fontBold,
    },
    sectionSubheading: {
      fontSize: isNepali ? 13 : 12,
      color: colors.textTertiary,
      fontFamily: fontNormal,
    },
    emptyLicenseCard: {
      width: '100%',
      backgroundColor: isDark ? glass.backgroundColor : '#F8FAFC',
      borderRadius: 22,
      borderWidth: 2,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#CBD5E1',
      borderStyle: 'dashed',
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    emptyScannerGlow: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.14)' : 'rgba(37, 99, 235, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    emptyLicenseTitle: {
      fontSize: isNepali ? 17 : 15,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 6,
      fontFamily: fontBold,
    },
    emptyLicenseSubtitle: {
      fontSize: isNepali ? 14 : 12,
      color: colors.textTertiary,
      textAlign: 'center',
      lineHeight: isNepali ? 20 : 18,
      marginBottom: 16,
      paddingHorizontal: 12,
      fontFamily: fontNormal,
    },
    emptyScanButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.accent || '#FF6B35',
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 14,
      shadowColor: colors.accent || '#FF6B35',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    emptyScanButtonText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#FFFFFF',
      fontFamily: fontBold,
    },
    filledLicenseContainer: {
      width: '100%',
      marginBottom: 12,
    },
    skeletonWrapper: {
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      borderRadius: 22,
      height: 200,
    },
    licenseImageCard: {
      width: '100%',
      height: 220,
      borderRadius: 22,
      overflow: 'hidden',
      position: 'relative',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#E2E8F0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.4 : 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    licenseTouchArea: {
      flex: 1,
    },
    licenseImagePreview: {
      width: '100%',
      height: '100%',
    },
    licenseGradientOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 14,
    },
    licenseOverlayRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    licensePill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 5,
    },
    licensePillText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#4ADE80',
      letterSpacing: 0.5,
    },
    tapToZoomTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    tapToZoomText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    licenseMenuFloat: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    legalNoteCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F1F5F9',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
      borderWidth: 1,
      borderRadius: 14,
      padding: 12,
      gap: 10,
    },
    legalNoteText: {
      flex: 1,
      fontSize: isNepali ? 12 : 11,
      color: colors.textSecondary,
      lineHeight: isNepali ? 18 : 16,
      fontFamily: fontNormal,
    },

    // ── 3. EXAM READINESS MODULES ──
    quickHubGrid: {
      flexDirection: 'row',
      gap: 10,
      width: '100%',
    },
    quickHubTile: {
      flex: 1,
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      borderColor: isDark ? glass.borderColor : '#E2E8F0',
      borderWidth: 1,
      borderRadius: 18,
      padding: 14,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    quickHubIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    quickHubTitle: {
      fontSize: isNepali ? 14 : 12,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 2,
      fontFamily: fontBold,
    },
    quickHubSub: {
      fontSize: isNepali ? 11 : 10,
      color: colors.textTertiary,
      fontWeight: '600',
      fontFamily: fontNormal,
    },

    // ── ALERT MODAL STYLES ──
    alertOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    alertContainer: {
      backgroundColor: isDark ? '#161F30' : '#FFFFFF',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
      padding: 24,
      width: '90%',
      maxWidth: 350,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 10,
    },
    alertIconWrapper: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    alertTitle: {
      fontSize: isNepali ? 20 : 19,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
      fontFamily: fontBold,
    },
    alertEmailBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : '#EFF6FF',
      borderColor: isDark ? 'rgba(59, 130, 246, 0.25)' : '#BFDBFE',
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 14,
      marginBottom: 20,
      alignSelf: 'center',
      maxWidth: '100%',
    },
    alertEmailText: {
      fontSize: 13,
      fontWeight: '600',
      color: isDark ? '#93C5FD' : '#1D4ED8',
    },
    alertMessage: {
      fontSize: isNepali ? 14 : 13,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: isNepali ? 20 : 18,
      fontFamily: fontNormal,
    },
    alertButtonsContainer: {
      width: '100%',
      gap: 10,
    },
    alertButton: {
      flexDirection: 'row',
      width: '100%',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    alertButtonDefault: {
      backgroundColor: colors.accent || '#FF6B35',
    },
    alertButtonDestructive: {
      backgroundColor: '#EF4444',
      shadowColor: '#EF4444',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    alertButtonCancel: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
    },
    alertButtonGoogle: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    alertButtonText: {
      fontSize: isNepali ? 16 : 14,
      fontWeight: '700',
      fontFamily: fontBold,
    },
    alertButtonTextDefault: {
      color: '#FFFFFF',
    },
    alertButtonTextDestructive: {
      color: '#FFFFFF',
    },
    alertButtonTextCancel: {
      color: colors.textSecondary,
    },
    alertButtonTextGoogle: {
      color: '#1F2937',
    },
    actionSheetContainer: {
      width: '100%',
    },
    actionItemsList: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 12,
    },
    actionItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E2E8F0',
    },
    actionItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    actionItemIconBg: {
      width: 32,
      height: 32,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionItemText: {
      fontSize: 15,
      fontWeight: '700',
      fontFamily: fontBold,
    },
    actionCancelButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
      paddingVertical: 13,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionCancelButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      fontFamily: fontBold,
    },
  });
}