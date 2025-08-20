import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function fourWheelerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text>This is your profile screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
