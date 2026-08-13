import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { AppTheme } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme, ThemeBackground } from '@/context/ThemeContext';
import { themedHeaderOptions } from '@/constants/screenHelpers';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';

export default function MoreInfoScreen() {
  const router = useRouter();
  const [showFullDisclaimer, setShowFullDisclaimer] = useState(false);
  const { theme } = useTheme();
  const { isNepali } = useLanguage();
  const s = useMemo(() => createMoreInfoStyles(theme, isNepali), [theme, isNepali]);

  return (
    <ThemeBackground>
      <Stack.Screen
        options={{
          title: isNepali ? unicodeToAakriti('थप जानकारी') : 'More Info',
          ...themedHeaderOptions(theme),
          headerTitleStyle: {
            fontSize: isNepali ? 22 : 20,
            color: '#FFFFFF',
            fontFamily: isNepali ? 'AakritiBold' : undefined,
          },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ padding: 8, marginLeft: 10, borderRadius: 20 }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={s.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={s.container}>
          {/* Hero Image */}
          <View style={s.imageContainer}>
            <Image
              source={require('../../assets/images/moreinfo.jpg')}
              style={s.heroImage}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={s.title}>Likhit Guru</Text>

          {/* Description */}
          <View style={s.descriptionContainer}>
            <Text style={s.description}>
              {isNepali
                ? unicodeToAakriti('लिखित गुरुले सवारी चालक लिखित परीक्षाको तयारीका लागि विभिन्न आधुनिक तथा अन्तरक्रियात्मक साधनहरू जस्तै: विषयगत प्रश्नोत्तरी, पूर्ण नमुना परीक्षा, र दृष्टि परीक्षा (आई टेस्ट) उपलब्ध गराउँछ। प्रयोगकर्ताको सहजतालाई ध्यानमा राखी तयार पारिएको यस एपमा चालक अनुमतिपत्र (लाइसेन्स) सुरक्षित रूपमा भण्डारण गर्ने विशेष सुविधा पनि समावेश छ, जुन ट्राफिक चेकिङ वा आधिकारिक प्रमाणीकरणका बखत उपयोगी हुन्छ।')
                : 'Likhit Guru offers a modern and interactive approach to preparing for the Likhit exam through a variety of tools such as quizzes, full exam tests, and eye tests. Designed with user convenience in mind, the app also includes a unique feature that allows users to upload and securely store their driving license for easy access ideal during traffic checks or official verifications.'}
            </Text>

            {/* Disclaimer */}
            <TouchableOpacity
              style={s.disclaimerContainer}
              onPress={() => setShowFullDisclaimer(!showFullDisclaimer)}
              activeOpacity={0.7}
            >
              <Text style={s.disclaimerText}>
                {isNepali ? (
                  <>
                    {unicodeToAakriti('द्रष्टव्य: यो एप व्यक्तिगत रूपमा विकसित गरिएको एक शैक्षिक सामग्री हो। यो ')}
                    {showFullDisclaimer ? (
                      <>
                        <Text style={s.boldText}>
                          {unicodeToAakriti('कुनै पनि सरकारी निकाय, विभाग वा आधिकारिक संस्थासँग सम्बद्ध, अनुमोदित वा सम्बन्धित छैन')}
                        </Text>
                        {unicodeToAakriti('। सम्पूर्ण सामग्री केवल सिकाइ तथा परीक्षा तयारीको सहायताका लागि तयार पारिएको हो।')}
                      </>
                    ) : (
                      <Text style={s.boldText}>{unicodeToAakriti('सरकारी निकायसँग सम्बद्ध छैन...')}</Text>
                    )}
                  </>
                ) : (
                  <>
                    Note: This app is a privately developed for educational tool and{' '}
                    {showFullDisclaimer ? (
                      <>
                        <Text style={s.boldText}> isn't affiliated with, endorsed by, or representative of any government authority or official department</Text>. All content is intended to assist users in learning and preparation only.
                      </>
                    ) : (
                      <Text style={s.boldText}>not affiliated with...</Text>
                    )}
                  </>
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
            <Text style={s.footerText}>© Likhit Guru 2025</Text>
          </View>
        </View>
      </ScrollView>
    </ThemeBackground>
  );
}

function createMoreInfoStyles(theme: AppTheme, isNepali: boolean = false) {
  const { colors, isDark } = theme;
  const fontNormal = isNepali ? 'Aakriti' : undefined;
  const fontBold = isNepali ? 'AakritiBold' : undefined;

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
      marginTop: 10,
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
      fontSize: isNepali ? 18 : 16,
      lineHeight: isNepali ? 28 : 24,
      color: colors.textSecondary,
      textAlign: 'left',
      marginBottom: 20,
      fontFamily: fontNormal,
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
      fontSize: isNepali ? 16 : 14,
      lineHeight: isNepali ? 24 : 20,
      color: colors.textSecondary,
      textAlign: 'left',
      flex: 1,
      paddingRight: 8,
      fontFamily: fontNormal,
    },
    expandIcon: {
      marginTop: 2,
    },
    boldText: {
      fontWeight: isNepali ? 'normal' : 'bold',
      color: colors.text,
      fontFamily: fontBold,
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