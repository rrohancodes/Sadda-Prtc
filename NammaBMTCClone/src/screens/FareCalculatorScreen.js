import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import ApiService from '../services/api';

export default function FareCalculatorScreen({ navigation }) {
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [selectedBusType, setSelectedBusType] = useState('ordinary');
  const [fareResult, setFareResult] = useState(null);

  const busTypes = [
    {
      id: 'ordinary',
      name: 'Ordinary',
      rate: 1.2, // per km
      minFare: 5,
      description: 'Standard BMTC buses',
      icon: 'bus',
    },
    {
      id: 'vajra',
      name: 'Vajra',
      rate: 2.0, // per km
      minFare: 10,
      description: 'AC Volvo buses',
      icon: 'snow',
    },
    {
      id: 'atal_sarige',
      name: 'Atal Sarige',
      rate: 1.5, // per km
      minFare: 7,
      description: 'Semi-luxury buses',
      icon: 'car-sport',
    },
  ];

  // Mock bus stops data with distances
  const busStops = [
    { name: 'Majestic Bus Station', distance: 0 },
    { name: 'City Railway Station', distance: 2.5 },
    { name: 'Vidhana Soudha', distance: 5.2 },
    { name: 'Cubbon Park', distance: 7.8 },
    { name: 'Brigade Road', distance: 10.3 },
    { name: 'Koramangala', distance: 15.7 },
    { name: 'BTM Layout', distance: 18.9 },
    { name: 'Silk Board', distance: 22.4 },
    { name: 'Electronic City', distance: 28.6 },
    { name: 'Whitefield', distance: 25.3 },
    { name: 'Airport', distance: 35.2 },
  ];

  const calculateFare = async () => {
    if (!fromStop.trim() || !toStop.trim()) {
      Alert.alert('Error', 'Please select both source and destination stops.');
      return;
    }

    if (fromStop.toLowerCase() === toStop.toLowerCase()) {
      Alert.alert('Error', 'Source and destination cannot be the same.');
      return;
    }

    try {
      const response = await ApiService.calculateFare(fromStop, toStop, '', selectedBusType);
      
      if (response.success) {
        const data = response.data;
        const selectedType = busTypes.find(type => type.id === selectedBusType);
        
        // Transform API response to match component expectations
        const discounts = [
          {
            type: 'Student',
            fare: data.discounts.student,
            savings: data.calculatedFare - data.discounts.student,
          },
          {
            type: 'Senior Citizen (60+)',
            fare: data.discounts.senior,
            savings: data.calculatedFare - data.discounts.senior,
          },
          {
            type: 'Monthly Pass (22 trips)',
            fare: data.discounts.monthly,
            savings: (data.calculatedFare * 44) - data.discounts.monthly,
          }
        ];

        setFareResult({
          distance: data.distance,
          baseFare: data.calculatedFare,
          busType: selectedType,
          fromStop: fromStop,
          toStop: toStop,
          discounts,
          route: data.route,
          estimatedTime: data.estimatedTime,
          stops: data.stops
        });
      } else {
        Alert.alert('Error', response.message || 'Unable to calculate fare');
      }
    } catch (error) {
      console.error('Error calculating fare:', error);
      Alert.alert('Error', 'Unable to calculate fare. Please check if the stops are connected by a direct route.');
    }
  };

  const renderBusType = (busType) => (
    <TouchableOpacity
      key={busType.id}
      style={[
        styles.busTypeCard,
        selectedBusType === busType.id && styles.busTypeCardSelected
      ]}
      onPress={() => setSelectedBusType(busType.id)}
    >
      <View style={styles.busTypeHeader}>
        <View style={[
          styles.busTypeIcon,
          selectedBusType === busType.id && styles.busTypeIconSelected
        ]}>
          <Ionicons 
            name={busType.icon} 
            size={Layout.iconSize.md} 
            color={selectedBusType === busType.id ? Colors.textLight : Colors.primary} 
          />
        </View>
        <View style={styles.busTypeInfo}>
          <Text style={[
            styles.busTypeName,
            selectedBusType === busType.id && styles.busTypeNameSelected
          ]}>
            {busType.name}
          </Text>
          <Text style={styles.busTypeDescription}>{busType.description}</Text>
        </View>
      </View>
      <View style={styles.busTypeRate}>
        <Text style={styles.rateText}>₹{busType.rate}/km</Text>
        <Text style={styles.minFareText}>Min: ₹{busType.minFare}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDiscount = (discount, index) => (
    <View key={index} style={styles.discountCard}>
      <View style={styles.discountHeader}>
        <Text style={styles.discountType}>{discount.type}</Text>
        <Text style={styles.discountFare}>₹{discount.fare}</Text>
      </View>
      <Text style={styles.discountSavings}>
        Save ₹{discount.savings} {discount.type.includes('Monthly') ? 'per month' : 'per trip'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={Layout.iconSize.md} color={Colors.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fare Calculator</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Input Form */}
        <View style={styles.inputForm}>
          <Text style={styles.sectionTitle}>Calculate Your Fare</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>From Stop</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="radio-button-on" size={20} color={Colors.accent} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter source bus stop"
                value={fromStop}
                onChangeText={setFromStop}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>To Stop</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location" size={20} color={Colors.error} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter destination bus stop"
                value={toStop}
                onChangeText={setToStop}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={calculateFare}>
            <Text style={styles.calculateButtonText}>Calculate Fare</Text>
          </TouchableOpacity>
        </View>

        {/* Bus Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Bus Type</Text>
          <View style={styles.busTypes}>
            {busTypes.map(renderBusType)}
          </View>
        </View>

        {/* Fare Result */}
        {fareResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fare Details</Text>
            
            <View style={styles.fareCard}>
              <View style={styles.fareHeader}>
                <Text style={styles.routeText}>
                  {fareResult.fromStop} → {fareResult.toStop}
                </Text>
                <Text style={styles.distanceText}>
                  {fareResult.distance} km
                </Text>
              </View>
              
              <View style={styles.fareDetails}>
                <View style={styles.fareItem}>
                  <Text style={styles.fareLabel}>Bus Type:</Text>
                  <Text style={styles.fareValue}>{fareResult.busType.name}</Text>
                </View>
                <View style={styles.fareItem}>
                  <Text style={styles.fareLabel}>Base Fare:</Text>
                  <Text style={styles.baseFare}>₹{fareResult.baseFare}</Text>
                </View>
              </View>
            </View>

            {/* Discounts */}
            <Text style={styles.sectionTitle}>Available Discounts</Text>
            <View style={styles.discounts}>
              {fareResult.discounts.map(renderDiscount)}
            </View>
          </View>
        )}

        {/* Popular Routes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Routes</Text>
          <View style={styles.popularRoutes}>
            {[
              { from: 'Majestic', to: 'Electronic City', fare: '₹25' },
              { from: 'Koramangala', to: 'Whitefield', fare: '₹18' },
              { from: 'BTM Layout', to: 'Airport', fare: '₹35' },
              { from: 'Brigade Road', to: 'Silk Board', fare: '₹15' },
            ].map((route, index) => (
              <TouchableOpacity
                key={index}
                style={styles.popularRouteCard}
                onPress={() => {
                  setFromStop(route.from);
                  setToStop(route.to);
                }}
              >
                <Text style={styles.popularRouteText}>
                  {route.from} → {route.to}
                </Text>
                <Text style={styles.popularRouteFare}>{route.fare}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fare Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fare Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="information-circle" size={20} color={Colors.info} />
              <Text style={styles.infoText}>
                Fares are calculated based on distance traveled
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="card" size={20} color={Colors.accent} />
              <Text style={styles.infoText}>
                Use BMTC card for exact change and convenience
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people" size={20} color={Colors.warning} />
              <Text style={styles.infoText}>
                Senior citizens (60+) travel free on ordinary buses
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
  },
  backButton: {
    padding: Layout.spacing.sm,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  placeholder: {
    width: 40,
  },
  inputForm: {
    backgroundColor: Colors.surface,
    margin: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  section: {
    margin: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  inputContainer: {
    marginBottom: Layout.spacing.md,
  },
  inputLabel: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    backgroundColor: Colors.background,
  },
  textInput: {
    flex: 1,
    marginLeft: Layout.spacing.sm,
    fontSize: Layout.fontSize.md,
    color: Colors.text,
  },
  calculateButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.md,
    paddingVertical: Layout.spacing.md,
    alignItems: 'center',
    marginTop: Layout.spacing.sm,
  },
  calculateButtonText: {
    color: Colors.textLight,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  busTypes: {
    gap: Layout.spacing.sm,
  },
  busTypeCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  busTypeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  busTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  busTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.sm,
  },
  busTypeIconSelected: {
    backgroundColor: Colors.primary,
  },
  busTypeInfo: {
    flex: 1,
  },
  busTypeName: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  busTypeNameSelected: {
    color: Colors.primary,
  },
  busTypeDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
  },
  busTypeRate: {
    alignItems: 'flex-end',
  },
  rateText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    color: Colors.accent,
  },
  minFareText: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
  },
  fareCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fareHeader: {
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  routeText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  distanceText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
  },
  fareDetails: {
    gap: Layout.spacing.sm,
  },
  fareItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareLabel: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
  },
  fareValue: {
    fontSize: Layout.fontSize.md,
    fontWeight: '500',
    color: Colors.text,
  },
  baseFare: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  discounts: {
    gap: Layout.spacing.sm,
  },
  discountCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  discountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  discountType: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  discountFare: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  discountSavings: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  popularRoutes: {
    gap: Layout.spacing.sm,
  },
  popularRouteCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularRouteText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
  },
  popularRouteFare: {
    fontSize: Layout.fontSize.md,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    gap: Layout.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: Layout.spacing.sm,
    fontSize: Layout.fontSize.sm,
    color: Colors.text,
    flex: 1,
  },
});
