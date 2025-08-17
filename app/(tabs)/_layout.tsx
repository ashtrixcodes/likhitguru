import FooterNav from '@/components/FooterNav';
import { Tabs } from 'expo-router';
import { View } from 'react-native';


export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: 'none'  // This hides the default tab bar
          }
        }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="dailyQuiz" />
        <Tabs.Screen name="profile" />
      </Tabs>
      <FooterNav />
    </View>
  );
}