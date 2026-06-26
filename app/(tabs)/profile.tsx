import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable } from "react-native";

import {
  Alert,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageViewing from "react-native-image-viewing";

import { useTheme } from '@/context/ThemeContext';
import type { AppTheme } from '@/constants/theme';

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
  const s = useMemo(() => createStyles(theme), [theme]);

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
        title: "My License",
        headerTitleAlign: 'left',
        headerStyle: s.headerStyle,
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
    Alert.alert("Select Photo", "Choose an option", [
      { text: "Camera", onPress: openCamera },
      { text: "Gallery", onPress: openGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const savePhoto = async (asset: any) => {
    try {
      const fileName = asset.uri.split("/").pop();
      const newPath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: asset.uri, to: newPath });
      await AsyncStorage.setItem("licensePhotoUri", newPath);
      setLicensePhoto({ uri: newPath });

      Alert.alert("Uploaded!", "Your License Image has been uploaded successfully.");
    } catch (error) {
      console.error("Error saving photo:", error);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is needed");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      Alert.alert("Permission Required", "Photo library access is needed");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      savePhoto(result.assets[0]);
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove the photo?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
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
      ],
      { cancelable: true }
    );
  };

  return (
    <>
      {renderHeader()}
      <View style={s.container}>
        <View style={s.content}>
          <Text style={s.licenseText}>My Driving License</Text>

          <Image
            source={require('@/assets/images/user.png')}
            style={s.profileImage}
            resizeMode="contain"
          />

          {/* License Card */}
          <View style={[s.licenseCard, licensePhoto && s.licenseCardWithImage]}>
            {isLoading ? (
              <SkeletonLicense />
            ) : licensePhoto ? (
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  onPress={() => setIsImageViewerVisible(true)}
                  activeOpacity={0.9}
                  style={{ flex: 1 }}
                >
                  <Image
                    source={{ uri: licensePhoto.uri }}
                    style={s.fullCardImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>

                {/* ⋮ Three-dot Menu Button */}
                <TouchableOpacity
                  style={s.menuButton}
                  onPress={() => {
                    Alert.alert(
                      "License Photo",
                      "What would you like to do?",
                      [
                        {
                          text: "Change Image",
                          onPress: handleUploadPhoto,
                        },
                        {
                          text: "Remove Photo",
                          onPress: handleRemovePhoto,
                          style: "destructive",
                        },
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                      ],
                      { cancelable: true }
                    );
                  }}
                >
                  <Text style={s.menuButtonText}>⋮</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <SkeletonLicense />
            )}

            {/* Show camera button only if no photo uploaded */}
            {!licensePhoto && (
              <TouchableOpacity
                style={s.cameraButton}
                onPress={handleUploadPhoto}
              >
                <Image
                  source={require('@/assets/images/camera.png')}
                  style={s.cameraIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Upload / Info */}
          <Text style={s.uploadText}>
            {licensePhoto ? "Note: You may present this digital license during traffic stops, where legally permitted." : "Please upload your license photo"}
          </Text>
        </View>

        {/* Fullscreen Image Viewer */}
        {licensePhoto && (
          <ImageViewing
            images={[{ uri: licensePhoto.uri }]}
            imageIndex={0}
            visible={isImageViewerVisible}
            onRequestClose={() => setIsImageViewerVisible(false)}
          />
        )}
      </View>
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
function createStyles(theme: AppTheme) {
  const { colors, isDark, glass } = theme;

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
      fontSize: 16,
      color: colors.textSecondary,
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
      elevation: 4,
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
      elevation: 5,
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
      fontSize: 14,
      color: colors.textTertiary,
      textAlign: "center",
      marginTop: 12,
    },
  });
}