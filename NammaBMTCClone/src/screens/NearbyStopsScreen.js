import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import ApiService from '../services/api';
import { useTranslation } from 'react-i18next';

export default function NearbyStopsScreen() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busStops, setBusStops] = useState([]);
  const { t } = useTranslation();

  const fetchNearbyStops = async (userLocation) => {
    try {
      setLoading(true);
      const response = await ApiService.getNearbyBusStops(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        2000 // 2km radius
      );
      
      if (response.success) {
        if (response.data.length === 0) {
          // No stops found in the area
          setBusStops([]);
          Alert.alert(
            t('nearby.noStopsTitle'), 
            t('nearby.noStopsMsg'),
            [{ text: 'OK' }]
          );
        } else {
          // Transform API data to match component expectations
          const transformedStops = response.data.map(stop => ({
            id: stop._id,
            name: stop.name,
            distance: `${stop.distanceInKm?.toFixed(1) || '0.0'} ${t('nearby.km')}`,
            routes: stop.routeDetails?.map(route => route.routeNumber) || [],
            facilities: stop.facilities || [],
            coordinates: {
              latitude: stop.location.latitude,
              longitude: stop.location.longitude
            },
            stopId: stop.stopId,
            address: stop.address,
            landmark: stop.landmark
          }));
          
          setBusStops(transformedStops);
        }
      } else {
        Alert.alert(t('common.errorTitle'), t('nearby.fetchFail'));
      }
    } catch (error) {
      console.error('Error fetching nearby stops:', error);
      Alert.alert(t('common.errorTitle'), t('nearby.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('common.permissionDenied'),
          t('nearby.permissionMessage'),
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      // Fetch nearby stops from API
      await fetchNearbyStops(currentLocation);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(t('common.errorTitle'), t('nearby.getLocationError'));
      setLoading(false);
    }
  };

  const getFacilityIcon = (facility) => {
    switch (facility) {
      case 'parking':
        return 'car';
      case 'restroom':
        return 'man';
      case 'atm':
        return 'card';
      default:
        return 'information-circle';
    }
  };

  const renderBusStop = ({ item }) => (
    <TouchableOpacity style={styles.busStopCard} activeOpacity={0.8}>
      <View style={styles.busStopHeader}>
        <View style={styles.busStopInfo}>
          <Text style={styles.busStopName}>{item.name}</Text>
          <View style={styles.distanceContainer}>
            <Ionicons name="walk" size={16} color={Colors.textSecondary} />
            <Text style={styles.distance}>{item.distance}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.directionButton}>
          <Ionicons name="navigate" size={Layout.iconSize.md} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.routesContainer}>
        <Text style={styles.routesLabel}>{t('nearby.routes')}:</Text>
        <View style={styles.routesList}>
          {item.routes.map((route, index) => (
            <View key={index} style={styles.routeChip}>
              <Text style={styles.routeText}>{route}</Text>
            </View>
          ))}
        </View>
      </View>

      {item.facilities.length > 0 && (
        <View style={styles.facilitiesContainer}>
          <Text style={styles.facilitiesLabel}>{t('nearby.facilities')}:</Text>
          <View style={styles.facilitiesList}>
            {item.facilities.map((facility, index) => (
              <View key={index} style={styles.facilityItem}>
                <Ionicons 
                  name={getFacilityIcon(facility)} 
                  size={16} 
                  color={Colors.accent} 
                />
                <Text style={styles.facilityText}>
                  {facility.charAt(0).toUpperCase() + facility.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t('nearby.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.locationInfo}>
          <Ionicons name="location" size={Layout.iconSize.md} color={Colors.primary} />
          <Text style={styles.locationText}>
            {location ? t('nearby.currentLocation') : t('nearby.locationNotAvailable')}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={() => {
          if (location) {
            fetchNearbyStops(location);
          } else {
            getCurrentLocation();
          }
        }}>
          <Ionicons name="refresh" size={Layout.iconSize.md} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={busStops}
        renderItem={renderBusStop}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bus" size={60} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>{t('nearby.emptyTitle')}</Text>
            <Text style={styles.emptySubtext}>
              {t('nearby.emptySubtext')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: Layout.spacing.sm,
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  refreshButton: {
    padding: Layout.spacing.sm,
  },
  listContainer: {
    padding: Layout.spacing.md,
  },
  busStopCard: {
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
  busStopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.sm,
  },
  busStopInfo: {
    flex: 1,
  },
  busStopName: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    marginLeft: Layout.spacing.xs,
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  directionButton: {
    padding: Layout.spacing.sm,
  },
  routesContainer: {
    marginBottom: Layout.spacing.sm,
  },
  routesLabel: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  routesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.xs,
  },
  routeChip: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
  },
  routeText: {
    color: Colors.textLight,
    fontSize: Layout.fontSize.xs,
    fontWeight: '600',
  },
  facilitiesContainer: {
    marginTop: Layout.spacing.sm,
  },
  facilitiesLabel: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  facilitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
  },
  facilityText: {
    marginLeft: Layout.spacing.xs,
    fontSize: Layout.fontSize.xs,
    color: Colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xl * 2,
  },
  emptyText: {
    fontSize: Layout.fontSize.lg,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: Layout.spacing.md,
  },
  emptySubtext: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Layout.spacing.xs,
  },
});
