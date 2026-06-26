import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import type { AppTheme } from '@/constants/theme';

export default function MoreInfoScreen() {
  const router = useRouter();
  const [showFullDisclaimer, setShowFullDisclaimer] = useState(false);
  const { theme } = useTheme();
  const s = useMemo(() => createMoreInfoStyles(theme), [theme]);

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
          title: "More Info",
          headerTitleAlign: 'left',
    
        headerTitleStyle: {
            fontSize: 20,
            color: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()}
              style={s.headerBackButton}
            >
              <Ionicons name="arrow-back" size={20} color="#000000" />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={s.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={s.container}>
          {/* Hero Image with Back Button */}
          <View style={s.imageContainer}>
            <Image 
              source={require('../../assets/images/moreinfo.jpg')} 
              style={s.heroImage}
              resizeMode="contain"
            />
            {/* Back Button Overlay */}
            <Pressable 
              onPress={() => router.back()}
              style={s.backButtonOverlay}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          {/* Title */}
          <Text style={s.title}>Lekhit Guru</Text>

          {/* Description */}
          <View style={s.descriptionContainer}>
            <Text style={s.description}>
              Lekhit Guru offers a modern and interactive approach to preparing for the Lekhit exam 
              through a variety of tools such as quizzes, full exam tests, and eye tests. Designed 
              with user convenience in mind, the app also includes a unique feature that allows users 
              to upload and securely store their driving license for easy access ideal during traffic 
              checks or official verifications.
            </Text>

             {/* Disclaimer */}
             <TouchableOpacity 
              style={s.disclaimerContainer}
              onPress={() => setShowFullDisclaimer(!showFullDisclaimer)}
              activeOpacity={0.7}
            >
              <Text style={s.disclaimerText}>
                Note: This app is a privately developed for educational tool and{' '}
                {showFullDisclaimer ? (
                  <>
                    <Text style={s.boldText}> isn't affiliated with, endorsed by, or representative 
                    of any government authority or official department</Text>. All content is intended 
                    to assist users in learning and preparation only.
                  </>
                ) : (
                  <Text style={s.boldText}>not affiliated with...</Text>
                )}
              </Text>
              <View style={s.expandIcon}>
                <Ionicons 
                  name={showFullDisclaimer ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color={theme.colors.textSecondary} 
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>© lekhitGuru 2025</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function createMoreInfoStyles(theme: AppTheme) {
  const { colors, isDark } = theme;

  return StyleSheet.create({
    scrollContainer: {
      flex: 1,
      backgroundColor: isDark ? colors.background : '#ffffff',
    },
    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 40,
    },
    imageContainer: {
      alignItems: 'center',
      marginBottom: 14,
      marginTop: 70,
    },
    heroImage: {
      width: 400,
      height: 200,
      borderRadius: 12,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#4CAF50',
      textAlign: 'left',
      marginBottom: 24,
    },
    descriptionContainer: {
      marginBottom: 40,
    },
    description: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSecondary,
      textAlign: 'left',
      marginBottom: 20,
    },
    disclaimerContainer: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f8f9fa',
      padding: 16,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: '#ff9800',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    disclaimerText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      textAlign: 'left',
      flex: 1,
      paddingRight: 8,
    },
    expandIcon: {
      marginTop: 2,
    },
    boldText: {
      fontWeight: 'bold',
      color: colors.text,
    },
    footer: {
      alignItems: 'center',
      marginTop: 'auto',
    },
    footerText: {
      fontSize: 14,
      color: colors.textTertiary,
      fontWeight: '500',
    },
    backButtonOverlay: {
      position: 'absolute',
      bottom: 190,
      left: 1,
      borderRadius: 20,
      padding: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    headerBackButton: {
      paddingTop: 100,
      marginLeft: 10,
      marginTop: 10,
      borderRadius: 20,
    },
  });
}