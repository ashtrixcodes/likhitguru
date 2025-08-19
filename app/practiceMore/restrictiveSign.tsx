import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { restrictiveSign } from './constant';

export default function restrictiveSignScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Restrictive Sign",
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
              onPress={() => router.back()}
              style={styles.headerBackButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {restrictiveSign.map((item) => (
            <View key={item.key} style={styles.card}>
              <View style={styles.cardInner}>
                <Image source={item.src} style={styles.cardImage} resizeMode="contain" />
                <Text style={styles.cardLabel} numberOfLines={2}>{item.label}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F6',
  },
  content: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 14,
  },
  cardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 110,
    marginBottom: 10,
  },
  cardLabel: {
    textAlign: 'center',
    color: '#4B5563',
    fontSize: 14,
  },
  headerBackButton: {
    padding: 8,
    marginLeft: 10,
    borderRadius: 20,
  },
});