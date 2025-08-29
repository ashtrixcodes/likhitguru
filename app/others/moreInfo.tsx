import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function moreInfoScreen() {
  const router = useRouter();
  const [showFullDisclaimer, setShowFullDisclaimer] = useState(false);

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
              style={styles.headerBackButton}
            >
              <Ionicons name="arrow-back" size={20} color="#000000" />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Hero Image with Back Button */}
          <View style={styles.imageContainer}>
            <Image 
              source={require('../../assets/images/moreinfo.jpg')} 
              style={styles.heroImage}
              resizeMode="contain"
            />
            {/* Back Button Overlay */}
            <Pressable 
              onPress={() => router.back()}
              style={styles.backButtonOverlay}
            >
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </Pressable>
          </View>

          {/* Title */}
          <Text style={styles.title}>Lekhit Guru</Text>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Lekhit Guru offers a modern and interactive approach to preparing for the Lekhit exam 
              through a variety of tools such as quizzes, full exam tests, and eye tests. Designed 
              with user convenience in mind, the app also includes a unique feature that allows users 
              to upload and securely store their driving license for easy access ideal during traffic 
              checks or official verifications.
            </Text>

             {/* Disclaimer */}
             <TouchableOpacity 
              style={styles.disclaimerContainer}
              onPress={() => setShowFullDisclaimer(!showFullDisclaimer)}
              activeOpacity={0.7}
            >
              <Text style={styles.disclaimerText}>
                Note: This app is a privately developed for educational tool and{' '}
                {showFullDisclaimer ? (
                  <>
                    <Text style={styles.boldText}> isn't affiliated with, endorsed by, or representative 
                    of any government authority or official department</Text>. All content is intended 
                    to assist users in learning and preparation only.
                  </>
                ) : (
                  <Text style={styles.boldText}>not affiliated with...</Text>
                )}
              </Text>
              <View style={styles.expandIcon}>
                <Ionicons 
                  name={showFullDisclaimer ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#666666" 
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© lekhitGuru 2025</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    color: '#666666',
    textAlign: 'left',
    marginBottom: 20,
  },
  disclaimerContainer: {
    backgroundColor: '#f8f9fa',
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
    color: '#555555',
    textAlign: 'left',
    flex: 1,
    paddingRight: 8,
  },
  expandIcon: {
    marginTop: 2,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333333',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  backButtonOverlay: {
    position: 'absolute',
    //top: 20,
    bottom: 190,
    left: 1,
    //backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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