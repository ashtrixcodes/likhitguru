// shareapp.tsx
import React from 'react';
import {
    Alert,
    Linking,
    Platform,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export const shareApp = async () => {
  console.log('Share button pressed!');
  
  try {
    const shareOptions = {
      message: `🚗 Driving License Test App - Your path to success! 📱

Practice for your Nepal driving license with:
✅ Sign Tests & Traffic Signals  
✅ Eye Tests & Number Patterns
✅ Mock Exams & Real Questions
✅ Traffic Rules & Fines Info

Download now:
📱 Android: https://play.google.com/store/apps/details?id=com.yourapp.drivinglicense
🍎 iOS: https://apps.apple.com/app/driving-license-test/id123456789

Visit: https://www.yourappwebsite.com

#DrivingTest #Nepal #LicenseExam`,
      title: 'Driving License Test App - Practice & Pass!',
      // Add URL only for iOS using conditional spread
      ...(Platform.OS === 'ios' && { url: 'https://www.yourappwebsite.com' }),
    };

    console.log('About to share with options:', shareOptions);
    
    const result = await Share.share(shareOptions);
    
    console.log('Share result:', result);

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        console.log('Shared with activity type:', result.activityType);
      } else {
        console.log('App shared successfully!');
      }
    } else if (result.action === Share.dismissedAction) {
      console.log('Share dialog was dismissed');
    }

    return result;
    
  } catch (error) {
    console.error('Error sharing app:', error);
    
    // Show user-friendly error message
    Alert.alert(
      'Share Error',
      'Unable to share the app. Please try again later.',
      [{ text: 'OK' }]
    );
    
    throw error;
  }
};

// Custom share dialog with specific social media options
export const shareAppWithSocialOptions = () => {
  const shareMessage = `🚗 Driving License Test App - Your path to success! 📱

Practice for your Nepal driving license with:
✅ Sign Tests & Traffic Signals  
✅ Eye Tests & Number Patterns
✅ Mock Exams & Real Questions
✅ Traffic Rules & Fines Info

Download now:
📱 Android: https://play.google.com/store/apps/details?id=com.yourapp.drivinglicense
🍎 iOS: https://apps.apple.com/app/driving-license-test/id123456789

#DrivingTest #Nepal #LicenseExam`;

  const appUrl = 'https://www.yourappwebsite.com';

  Alert.alert(
    'Share App',
    'Choose how you want to share:',
    [
      {
        text: 'WhatsApp',
        onPress: () => shareToWhatsApp(shareMessage),
      },
      {
        text: 'Facebook',
        onPress: () => shareToFacebook(appUrl, shareMessage),
      },
      {
        text: 'Instagram',
        onPress: () => shareToInstagram(shareMessage),
      },
      {
        text: 'More Options',
        onPress: () => shareApp(),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]
  );
};

// WhatsApp sharing
const shareToWhatsApp = async (message: string) => {
  try {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
    
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
    } else {
      // Fallback to web WhatsApp
      const webWhatsappUrl = `https://wa.me/?text=${encodedMessage}`;
      await Linking.openURL(webWhatsappUrl);
    }
  } catch (error) {
    console.error('WhatsApp share error:', error);
    Alert.alert('Error', 'Unable to open WhatsApp. Please make sure it\'s installed.');
  }
};

// Facebook sharing
const shareToFacebook = async (url: string, message: string) => {
  try {
    // Try Facebook app first
    const facebookUrl = `fb://facewebmodal/f?href=${encodeURIComponent(url)}`;
    const canOpen = await Linking.canOpenURL(facebookUrl);
    
    if (canOpen) {
      await Linking.openURL(facebookUrl);
    } else {
      // Fallback to web Facebook
      const webFacebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`;
      await Linking.openURL(webFacebookUrl);
    }
  } catch (error) {
    console.error('Facebook share error:', error);
    Alert.alert('Error', 'Unable to open Facebook. Please try again.');
  }
};

// Instagram sharing (Instagram doesn't support direct text sharing, so we open the app)
const shareToInstagram = async (message: string) => {
  try {
    const instagramUrl = 'instagram://app';
    const canOpen = await Linking.canOpenURL(instagramUrl);
    
    if (canOpen) {
      await Linking.openURL(instagramUrl);
      // Show instruction to user
      setTimeout(() => {
        Alert.alert(
          'Instagram Opened',
          'Instagram has been opened. You can create a story or post and manually add your message.',
          [{ text: 'OK' }]
        );
      }, 1000);
    } else {
      Alert.alert('Instagram Not Found', 'Please install Instagram to share.');
    }
  } catch (error) {
    console.error('Instagram share error:', error);
    Alert.alert('Error', 'Unable to open Instagram.');
  }
};

// Alternative: Share with specific message for WhatsApp
export const shareToWhatsAppDirect = async () => {
  const message = '🚗 Check out this amazing Driving License Test app for Nepal! Perfect for practicing your driving exam. Download it now! 📱';
  await shareToWhatsApp(message);
};

// Enhanced share with better formatting for different platforms
export const shareAppEnhanced = async () => {
  try {
    // For native share dialog, use a shorter message
    const shortMessage = `🚗 Driving License Test App for Nepal!

Practice tests, traffic signs, and mock exams.
Download: https://www.yourappwebsite.com

#DrivingTest #Nepal`;

    const result = await Share.share({
      message: shortMessage,
      title: 'Driving License Test App',
      // Add URL only for iOS using conditional spread
      ...(Platform.OS === 'ios' && { url: 'https://www.yourappwebsite.com' }),
    });

    return result;
  } catch (error) {
    console.error('Share error:', error);
    Alert.alert('Share Error', 'Unable to share the app.');
  }
};

// Alternative simple share function
export const shareAppSimple = async () => {
  try {
    await Share.share({
      message: 'Check out this amazing Driving License Test app! Perfect for practicing your driving exam in Nepal. Download it from your app store!',
    });
  } catch (error) {
    Alert.alert('Share Error', 'Unable to share the app.');
  }
};

// Share with custom message
export const shareAppWithMessage = async (customMessage: string) => {
  try {
    await Share.share({
      message: customMessage,
      title: 'Driving License Test App',
    });
  } catch (error) {
    console.error('Share error:', error);
    Alert.alert('Share Error', 'Unable to share the app.');
  }
};

// Main Share Component (Default Export)
const ShareApp: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Share Our App</Text>
          <Text style={styles.subtitle}>
            Help others discover the Driving License Test App!
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={shareAppWithSocialOptions}
          >
            <Text style={styles.primaryButtonText}>Share with Social Options</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={shareApp}
          >
            <Text style={styles.secondaryButtonText}>Native Share Dialog</Text>
          </TouchableOpacity>

          <View style={styles.socialButtons}>
            <TouchableOpacity 
              style={[styles.socialButton, styles.whatsappButton]} 
              onPress={() => shareToWhatsApp(`🚗 Check out this amazing Driving License Test app for Nepal! Perfect for practicing your driving exam. Download it now! 📱`)}
            >
              <Text style={styles.socialButtonText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, styles.facebookButton]} 
              onPress={() => shareToFacebook('https://www.yourappwebsite.com', 'Check out this Driving License Test app!')}
            >
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, styles.instagramButton]} 
              onPress={() => shareToInstagram('Driving License Test App')}
            >
              <Text style={styles.socialButtonText}>Instagram</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  socialButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  instagramButton: {
    backgroundColor: '#E4405F',
  },
  socialButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ShareApp;