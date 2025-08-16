import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import FooterNav from '@/components/FooterNav';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

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
        <Tabs.Screen name="Daily Quiz" />
        <Tabs.Screen name="profile" />
      </Tabs>
      <FooterNav />
    </View>
  );
}
