import FooterNav from '@/components/FooterNav';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { ThemeBackground } from '@/context/ThemeContext';

export default function TabLayout() {
  return (
    <ThemeBackground>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              display: 'none'  // This hides the default tab bar
            }
          }}>
        </Tabs>
        <FooterNav />
      </View>
    </ThemeBackground>
  );
}