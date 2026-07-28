import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable } from "react-native";

import {
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import ImageViewing from "react-native-image-viewing";

import AdBanner from '@/components/AdBanner';
import type { AppTheme } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';

/* -------------------- ShimmerBar -------------------- */
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
    <View style={[{
      width,
      height,
      borderRadius: 6,
      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : "#e5e7eb",
      overflow: "hidden"
    }, style]}>
      <Animated.View style={{ ...StyleSheet.absoluteFillObject, transform: [{ translateX }] }}>
        <LinearGradient
          colors={theme.isDark
            ? ["transparent", "rgba(255,255,255,0.15)", "transparent"]
            : ["transparent", "rgba(255,255,255,0.6)", "transparent"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

/* -------------------- ProfileScreen -------------------- */
export default function ProfileScreen() {
  const router = useRouter();
  const [licensePhoto, setLicensePhoto] = useState<{ uri: string } | null>(null);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const { isNepali } = useLanguage();
  const s = useMemo(() => createStyles(theme, isNepali), [theme, isNepali]);

  const [customAlert, setCustomAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
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

  // Helper to determine icon name, color and bg based on title/message/option
  const getAlertHeaderIcon = () => {
    const titleLower = customAlert.title.toLowerCase();
    const msgLower = customAlert.message.toLowerCase();

    if (titleLower.includes('upload') || titleLower.includes('success')) {
      return {
        name: 'checkmark-circle' as const,
        color: '#10B981', // green
        bg: 'rgba(16, 185, 129, 0.12)',
      };
    }
    if (titleLower.includes('remove') || titleLower.includes('delete') || msgLower.includes('remove') || msgLower.includes('delete')) {
      return {
        name: 'trash' as const,
        color: '#EF4444', // red
        bg: 'rgba(239, 68, 68, 0.12)',
      };
    }
    if (titleLower.includes('select') || titleLower.includes('choose')) {
      return {
        name: 'camera' as const,
        color: theme.colors.accent || '#FF6B35',
        bg: `${theme.colors.accent || '#FF6B35'}1F`,
      };
    }
    return {
      name: 'information-circle' as const,
      color: theme.colors.accent || '#FF6B35',
      bg: `${theme.colors.accent || '#FF6B35'}1F`,
    };
  };

  const getOptionMeta = (text: string, style?: string) => {
    const textLower = text.toLowerCase();
    if (textLower === 'camera' || textLower.includes('क्यामेरा')) {
      return { icon: 'camera-outline' as const, color: theme.colors.text };
    }
    if (textLower === 'gallery' || textLower.includes('ग्यालरी')) {
      return { icon: 'images-outline' as const, color: theme.colors.text };
    }
    if (textLower.includes('change') || textLower.includes('फेर्नुहोस्')) {
      return { icon: 'create-outline' as const, color: theme.colors.text };
    }
    if (textLower.includes('remove') || textLower.includes('delete') || textLower.includes('हटाउनुहोस्') || style === 'destructive') {
      return { icon: 'trash-outline' as const, color: '#EF4444' };
    }
    if (textLower === 'cancel' || textLower === 'no' || textLower.includes('रद्द') || textLower.includes('होइन') || style === 'cancel') {
      return { icon: 'close-outline' as const, color: theme.colors.textSecondary };
    }
    return { icon: 'chevron-forward-outline' as const, color: theme.colors.text };
  };

  const isActionSheet = useMemo(() => {
    const hasImagePickerOptions = customAlert.options.some(opt => {
      const txt = opt.text.toLowerCase();
      return txt === 'camera' || txt === 'gallery' || txt.includes('change') || txt.includes('remove');
    });
    return customAlert.options.length > 2 && hasImagePickerOptions;
  }, [customAlert.options]);

  const showAlert = (
    title: string,
    message: string,
    options: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'destructive' | 'cancel';
    }> = [{ text: 'OK' }]
  ) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      options,
    });
  };

  useEffect(() => {
    (async () => {
      const storedUri = await AsyncStorage.getItem("licensePhotoUri");
      if (storedUri) {
        setLicensePhoto({ uri: storedUri });
      }
      setIsLoading(false);
    })();
  }, []);

  const renderHeader = () => (
    <Stack.Screen
      options={{
        title: isNepali ? unicodeToAakriti('मेरो लाइसेन्स') : 'My License',
        headerTitleAlign: 'left',
        headerStyle: s.headerStyle,
        headerTitleStyle: {
          fontSize: isNepali ? 22 : 20,
          color: theme.colors.text,
          fontFamily: isNepali ? 'AakritiBold' : undefined,
        },
        headerTintColor: theme.colors.text,
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            style={s.headerBackButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
        ),
      }}
    />
  );

  const handleUploadPhoto = async () => {
    showAlert(
      isNepali ? unicodeToAakriti('फोटो छनोट गर्नुहोस्') : 'Select Photo',
      isNepali ? unicodeToAakriti('उपयुक्त विकल्प रोज्नुहोस्') : 'Choose an option',
      [
        { text: isNepali ? unicodeToAakriti('क्यामेरा') : 'Camera', onPress: openCamera },
        { text: isNepali ? unicodeToAakriti('ग्यालरी') : 'Gallery', onPress: openGallery },
        { text: isNepali ? unicodeToAakriti('रद्द गर्नुहोस्') : 'Cancel', style: 'cancel' },
      ]
    );
  };

  const savePhoto = async (asset: any) => {
    try {
      const fileName = asset.uri.split("/").pop();
      const newPath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: asset.uri, to: newPath });
      await AsyncStorage.setItem("licensePhotoUri", newPath);
      setLicensePhoto({ uri: newPath });

      showAlert(
        isNepali ? unicodeToAakriti('अपलोड भयो!') : 'Uploaded!',
        isNepali ? unicodeToAakriti('तपाईंको लाइसेन्सको फोटो सफलतापूर्वक अपलोड भएको छ।') : 'Your License Image has been uploaded successfully.'
      );
    } catch (error) {
      console.error("Error saving photo:", error);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showAlert(
        isNepali ? unicodeToAakriti('अनुमति आवश्यक छ') : 'Permission Required',
        isNepali ? unicodeToAakriti('क्यामेरा प्रयोग गर्न अनुमति आवश्यक छ') : 'Camera access is needed'
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      savePhoto(result.assets[0]);
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showAlert(
        isNepali ? unicodeToAakriti('अनुमति आवश्यक छ') : 'Permission Required',
        isNepali ? unicodeToAakriti('ग्यालरी प्रयोग गर्न अनुमति आवश्यक छ') : 'Photo library access is needed'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      savePhoto(result.assets[0]);
    }
  };

  const handleRemovePhoto = () => {
    showAlert(
      isNepali ? unicodeToAakriti('फोटो हटाउनुहोस्') : 'Remove Photo',
      isNepali ? unicodeToAakriti('के तपाईं निश्चित रूपमा यो फोटो हटाउन चाहनुहुन्छ?') : 'Are you sure you want to remove the photo?',
      [
        {
          text: isNepali ? unicodeToAakriti('होइन') : 'No',
          style: 'cancel',
        },
        {
          text: isNepali ? unicodeToAakriti('हो') : 'Yes',
          style: 'destructive',
          onPress: async () => {
            if (licensePhoto?.uri) {
              try {
                await FileSystem.deleteAsync(licensePhoto.uri, { idempotent: true });
                await AsyncStorage.removeItem("licensePhotoUri");
                setLicensePhoto(null);
              } catch (error) {
                console.error("Error removing photo:", error);
              }
            }
          },
        },
      ]
    );
  };

  return (
    <>
      {renderHeader()}
      <ScrollView style={s.container} contentContainerStyle={{ alignItems: 'center', paddingTop: 90, paddingHorizontal: 40, paddingBottom: 50, flexGrow: 1, justifyContent: 'space-between' }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', width: '100%', flex: 1 }}>
          <Text style={s.licenseText}>{isNepali ? unicodeToAakriti('मेरो सवारी चालक अनुमतिपत्र') : 'My Driving License'}</Text>

          <Image
            source={require('@/assets/images/user.png')}
            style={s.profileImage}
            resizeMode="contain"
          />

          {/* License Card */}
          {!isLoading && !licensePhoto ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleUploadPhoto}
              style={s.licenseCard}
            >
              <SkeletonLicense />
              <View style={s.cameraButton}>
                <Image
                  source={require('@/assets/images/camera.png')}
                  style={s.cameraIcon}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[s.licenseCard, licensePhoto && s.licenseCardWithImage]}>
              {isLoading ? (
                <SkeletonLicense />
              ) : (
                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    onPress={() => setIsImageViewerVisible(true)}
                    activeOpacity={0.9}
                    style={{ flex: 1 }}
                  >
                    <Image
                      source={{ uri: licensePhoto?.uri }}
                      style={s.fullCardImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>

                  {/* ⋮ Three-dot Menu Button */}
                  <TouchableOpacity
                    style={s.menuButton}
                    onPress={() => {
                      showAlert(
                        isNepali ? unicodeToAakriti('लाइसेन्स फोटो विकल्पहरू') : 'License Photo Options',
                        isNepali ? unicodeToAakriti('तपाईं के गर्न चाहनुहुन्छ?') : 'What would you like to do?',
                        [
                          {
                            text: isNepali ? unicodeToAakriti('फोटो हटाउनुहोस्') : 'Remove Photo',
                            style: 'destructive',
                            onPress: handleRemovePhoto,
                          },
                          {
                            text: isNepali ? unicodeToAakriti('फोटो फेर्नुहोस्') : 'Change Photo',
                            onPress: handleUploadPhoto,
                          },
                          {
                            text: isNepali ? unicodeToAakriti('रद्द गर्नुहोस्') : 'Cancel',
                            style: 'cancel',
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={s.menuButtonText}>⋮</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Upload / Info */}
          <Text style={s.uploadText}>
            {licensePhoto 
              ? (isNepali ? unicodeToAakriti('द्रष्टव्य: कानुनी रूपमा अनुमति दिइएको स्थानमा ट्राफिक चेकिङको समयमा तपाईंले यो डिजिटल लाइसेन्स देखाउन सक्नुहुन्छ।') : 'Note: You may present this digital license during traffic stops, where legally permitted.')
              : (isNepali ? unicodeToAakriti('कृपया आफ्नो लाइसेन्सको फोटो अपलोड गर्नुहोस्') : 'Please upload your license photo')}
          </Text>
        </View>
        <AdBanner />
      </ScrollView>

      {/* Fullscreen Image Viewer */}
      {licensePhoto && (
        <ImageViewing
          images={[{ uri: licensePhoto?.uri ?? '' }]}
          imageIndex={0}
          visible={isImageViewerVisible}
          onRequestClose={() => setIsImageViewerVisible(false)}
        />
      )}

      {/* Custom Alert Modal */}
      <Modal
        visible={customAlert.visible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setCustomAlert(prev => ({ ...prev, visible: false }))}
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
            {/* Dynamic Icon Header */}
            {(() => {
              const iconInfo = getAlertHeaderIcon();
              return (
                <View style={[s.alertIconWrapper, { backgroundColor: iconInfo.bg }]}>
                  <Ionicons name={iconInfo.name} size={32} color={iconInfo.color} />
                </View>
              );
            })()}

            <Text style={s.alertTitle}>{customAlert.title}</Text>
            {!!customAlert.message && (
              <Text style={s.alertMessage}>{customAlert.message}</Text>
            )}

            {isActionSheet ? (
              /* Action Sheet Mode: vertical list of option items */
              <View style={s.actionSheetContainer}>
                <View style={s.actionItemsList}>
                  {customAlert.options
                    .filter(opt => opt.style !== 'cancel' && opt.text.toLowerCase() !== 'cancel')
                    .map((opt, index, arr) => {
                      const meta = getOptionMeta(opt.text, opt.style);
                      const isLast = index === arr.length - 1;
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[s.actionItemRow, isLast && { borderBottomWidth: 0 }]}
                          activeOpacity={0.6}
                          onPress={() => {
                            setCustomAlert(prev => ({ ...prev, visible: false }));
                            if (opt.onPress) {
                              setTimeout(() => {
                                opt.onPress?.();
                              }, 100);
                            }
                          }}
                        >
                          <View style={s.actionItemLeft}>
                            <View style={[s.actionItemIconBg, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }]}>
                              <Ionicons name={meta.icon} size={20} color={meta.color} />
                            </View>
                            <Text style={[s.actionItemText, { color: meta.color }]}>{opt.text}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                      );
                    })}
                </View>

                {/* Cancel Button in Action Sheet */}
                {customAlert.options.some(opt => opt.style === 'cancel' || opt.text.toLowerCase() === 'cancel') && (
                  <TouchableOpacity
                    style={s.actionCancelButton}
                    activeOpacity={0.7}
                    onPress={() => {
                      const cancelOpt = customAlert.options.find(opt => opt.style === 'cancel' || opt.text.toLowerCase() === 'cancel');
                      setCustomAlert(prev => ({ ...prev, visible: false }));
                      if (cancelOpt?.onPress) {
                        setTimeout(() => {
                          cancelOpt.onPress?.();
                        }, 100);
                      }
                    }}
                  >
                    <Text style={s.actionCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              /* Confirmation Dialog Mode: Buttons side-by-side or stacked */
              <View style={[
                s.alertButtonsContainer,
                customAlert.options.length === 2 && s.alertButtonsRow
              ]}>
                {customAlert.options.map((opt, index) => {
                  const isDestructive = opt.style === 'destructive';
                  const isCancel = opt.style === 'cancel';

                  let btnStyle: any = s.alertButton;
                  let textStyle: any = s.alertButtonText;

                  if (isDestructive) {
                    btnStyle = [s.alertButton, s.alertButtonDestructive];
                    textStyle = [s.alertButtonText, s.alertButtonTextDestructive];
                  } else if (isCancel) {
                    btnStyle = [s.alertButton, s.alertButtonCancel];
                    textStyle = [s.alertButtonText, s.alertButtonTextCancel];
                  } else {
                    btnStyle = [s.alertButton, s.alertButtonDefault];
                    textStyle = [s.alertButtonText, s.alertButtonTextDefault];
                  }

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        btnStyle,
                        customAlert.options.length === 2 && { flex: 1 }
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setCustomAlert(prev => ({ ...prev, visible: false }));
                        if (opt.onPress) {
                          setTimeout(() => {
                            opt.onPress?.();
                          }, 100);
                        }
                      }}
                    >
                      <Text style={textStyle}>{opt.text}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

/* -------------------- Skeleton License Layout -------------------- */
function SkeletonLicense() {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: "center", marginBottom: 12 }}>
        <ShimmerBar width="70%" height={12} />
      </View>
      <View style={{ alignItems: "center", marginBottom: 12 }}>
        <ShimmerBar width="50%" height={10} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <ShimmerBar width="55%" height={8} style={{ marginBottom: 6 }} />
          <ShimmerBar width="65%" height={8} style={{ marginBottom: 6 }} />
          <ShimmerBar width="45%" height={8} />
        </View>
        <View style={{ width: 80, alignItems: "flex-end", justifyContent: "flex-start" }}>
          <ShimmerBar width={60} height={70} style={{ borderRadius: 10, marginRight: -10 }} />
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <ShimmerBar width={80} height={18} />
        <ShimmerBar width={80} height={18} style={{ marginRight: -10 }} />
      </View>
    </View>
  );
}

/* -------------------- Styles -------------------- */
function createStyles(theme: AppTheme, isNepali: boolean = false) {
  const { colors, isDark, glass } = theme;
  const fontNormal = isNepali ? 'Aakriti' : undefined;
  const fontBold = isNepali ? 'AakritiBold' : undefined;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      alignItems: "center",
      paddingTop: 90,
      paddingHorizontal: 40,
    },
    headerStyle: {
      backgroundColor: isDark ? colors.header : 'black',
    },
    headerBackButton: {
      padding: 8,
      marginLeft: 10,
      borderRadius: 20,
    },
    licenseText: {
      fontSize: isNepali ? 20 : 16,
      color: colors.textSecondary,
      fontFamily: fontBold,
    },
    profileImage: {
      height: "10%",
      width: "10%",
    },
    licenseCard: {
      width: "100%",
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      borderRadius: 20,
      borderWidth: isDark ? glass.borderWidth : 2,
      borderColor: isDark ? glass.borderColor : colors.card,
      padding: 20,
      height: 210,
      marginBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: isDark ? 0 : 4,
      position: "relative",
      overflow: "visible",
    },
    licenseCardWithImage: {
      padding: 0,
    },
    fullCardImage: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 18,
    },
    cameraButton: {
      position: "absolute",
      bottom: -16,
      alignSelf: "center",
      backgroundColor: isDark ? 'rgba(55, 65, 81, 0.9)' : "#374151",
      padding: 14,
      borderRadius: 40,
      width: 48,
      height: 48,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
      elevation: isDark ? 0 : 5,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.5,
    },
    cameraIcon: {
      width: 20,
      height: 20,
      tintColor: "#fff",
    },
    menuButton: {
      position: "absolute",
      top: 12,
      right: 10,
      backgroundColor: "#000",
      borderRadius: 18,
      width: 25,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
      opacity: 0.6,
    },
    menuButtonText: {
      color: "#fff",
      fontSize: 20,
      fontWeight: "bold",
      lineHeight: 30,
      marginTop: 2,
    },
    uploadText: {
      fontSize: isNepali ? 15 : 14,
      color: colors.textTertiary,
      textAlign: "center",
      marginTop: 12,
      lineHeight: isNepali ? 22 : 20,
      fontFamily: fontNormal,
    },
    alertOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    alertContainer: {
      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.98)' : '#FFFFFF',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: isDark ? glass.borderColor : '#E2E8F0',
      padding: 20,
      width: '85%',
      maxWidth: 325,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
    alertIconWrapper: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
    },
    alertTitle: {
      fontSize: isNepali ? 21 : 19,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
      fontFamily: fontBold,
    },
    alertMessage: {
      fontSize: isNepali ? 15 : 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: isNepali ? 22 : 20,
      fontFamily: fontNormal,
    },
    alertButtonsContainer: {
      width: '100%',
      gap: 10,
    },
    alertButtonsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    alertButton: {
      paddingVertical: 13,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    alertButtonDefault: {
      backgroundColor: colors.accent || '#FF6B35',
    },
    alertButtonDestructive: {
      backgroundColor: '#EF4444',
    },
    alertButtonCancel: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
    },
    alertButtonText: {
      fontSize: isNepali ? 17 : 15,
      fontWeight: '600',
      fontFamily: fontBold || fontNormal,
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
    actionSheetContainer: {
      width: '100%',
      marginTop: 4,
    },
    actionItemsList: {
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.45)' : '#F8FAFC',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
      overflow: 'hidden',
      marginBottom: 12,
    },
    actionItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
    },
    actionItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    actionItemIconBg: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionItemText: {
      fontSize: isNepali ? 17 : 15,
      fontWeight: '600',
      fontFamily: fontBold || fontNormal,
    },
    actionCancelButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : '#E2E8F0',
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionCancelButtonText: {
      fontSize: isNepali ? 17 : 15,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#334155',
      fontFamily: fontBold || fontNormal,
    },
  });
}