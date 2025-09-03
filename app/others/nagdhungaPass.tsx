import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface VehicleCharge {
  id: string;
  name: string;
  image: any;
  enteringCharge: number;
  exitingCharge: number;
  description: string;
}

const vehicleCharges: VehicleCharge[] = [
  {
    id: 'car-van',
    name: 'Car/Van',
    image: require('@/assets/images/car.png'),
    enteringCharge: 65,
    exitingCharge: 60,
    description: 'Personal vehicles and small vans'
  },
  {
    id: 'mini-bus-truck',
    name: 'Mini Bus/Truck',
    image: require('@/assets/images/bluecar.png'),
    enteringCharge: 115,
    exitingCharge: 80,
    description: 'Small commercial vehicles'
  },
  {
    id: 'bus-truck',
    name: 'Bus/Truck',
    image: require('@/assets/images/greencar.png'),
    enteringCharge: 260,
    exitingCharge: 200,
    description: 'Large commercial vehicles'
  },
  {
    id: 'heavy-equipment',
    name: 'Heavy Equipment',
    image: require('@/assets/images/bike.png'),
    enteringCharge: 600,
    exitingCharge: 250,
    description: 'Construction and heavy machinery'
  }
];

export default function nagdhungaPassScreen() {
  const router = useRouter();
  const [expandedCards, setExpandedCards] = useState<string[]>(['car-van']); // Car/Van expanded by default

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const renderVehicleCard = (vehicle: VehicleCharge) => {
    const isExpanded = expandedCards.includes(vehicle.id);
    
    return (
      <TouchableOpacity 
        key={vehicle.id} 
        style={styles.vehicleCard}
        onPress={() => toggleCard(vehicle.id)}
        activeOpacity={0.7}
      >
        <View style={styles.vehicleHeader}>
          <Image source={vehicle.image} style={styles.vehicleImage} />
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>{vehicle.name}</Text>
            <Text style={styles.vehicleDescription}>{vehicle.description}</Text>
          </View>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#666" 
          />
        </View>
        
        {isExpanded && (
          <View style={styles.chargesContainer}>
            <View style={styles.chargeItem}>
              <View style={styles.chargeHeader}>
                <Ionicons name="arrow-down-circle" size={20} color="#4CAF50" />
                <Text style={styles.chargeLabel}>Entering Kathmandu</Text>
              </View>
              <Text style={styles.chargeAmount}>NPR {vehicle.enteringCharge}</Text>
            </View>
            
            <View style={styles.chargeItem}>
              <View style={styles.chargeHeader}>
                <Ionicons name="arrow-up-circle" size={20} color="#FF9800" />
                <Text style={styles.chargeLabel}>Exiting Kathmandu</Text>
              </View>
              <Text style={styles.chargeAmount}>NPR {vehicle.exitingCharge}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Nagdhunga Charges",
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#ffffff',
          },
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
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        {/* Vehicle Charges */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Government Notice */}
          <View style={styles.noticeContainer}>
            <Image source={require('@/assets/images/government.png')} style={styles.governmentIcon} />
            <View style={styles.noticeText}>
              <Text style={styles.noticeTitle}>Government Set Fees</Text>
              <Text style={styles.noticeSubtitle}>
                Official charges for vehicles using the Nagdhunga Tunnel to enter and exit Kathmandu
              </Text>
            </View>
          </View>

          {vehicleCharges.map(renderVehicleCard)}
          
          {/* Additional Info */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#2196F3" />
            <Text style={styles.infoText}>
              Charges are subject to change. Please verify current rates before travel.
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerBackButton: {
    padding: 8,
    marginLeft: 10,
    borderRadius: 20,
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  governmentIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  noticeText: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  noticeSubtitle: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  vehicleCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  vehicleImage: {
    width: 60,
    height: 60,
    marginRight: 15,
    borderRadius: 8,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  vehicleDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  chargesContainer: {
    gap: 15,
  },
  chargeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chargeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chargeLabel: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    fontWeight: '500',
  },
  chargeAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});