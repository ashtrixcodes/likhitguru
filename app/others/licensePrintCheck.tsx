import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function licensePrintCheckScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen 
        options={{
          title: "License Form",
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#434D57',
          },
          headerTitleStyle: {
            fontSize: 20,
            color: '#FFFFFF',
          },
          headerTintColor: '#FFFFFF',
          headerLeft: () => (
            <Pressable 
              onPress={() => router.replace("/")}
              style={styles.headerBackButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        <WebView
          source={{ uri: 'https://dotm.gov.np/DrivingLicense/SearchLicense' }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  headerBackButton: {
    padding: 8,
    marginLeft: 10,
    borderRadius: 20,
  },
});