import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import LoadingDots from './LoadingDots';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo-transparent.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.dotsContainer}>
        <LoadingDots dotColor="rgba(255, 255, 255, 0.4)" activeDotColor="#FF6B35" size={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#091020', // Sleek dark midnight blue background matching the dark theme
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 40,
  },
  dotsContainer: {
    height: 40,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
