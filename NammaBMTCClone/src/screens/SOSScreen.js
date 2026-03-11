import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
  ActivityIndicator,
  ScrollView, // added
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { useTranslation } from 'react-i18next';

export default function SOSScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const { t } = useTranslation();

  const emergencyContacts = [
    {
      id: 1,
      name: t('sos.contacts.police'),
      number: '100',
      icon: 'shield',
      color: Colors.info,
      description: t('sos.contactsDesc.police'),
    },
    {
      id: 2,
      name: t('sos.contacts.fire'),
      number: '101',
      icon: 'flame',
      color: Colors.error,
      description: t('sos.contactsDesc.fire'),
    },
    {
      id: 3,
      name: t('sos.contacts.ambulance'),
      number: '108',
      icon: 'medical',
      color: Colors.accent,
      description: t('sos.contactsDesc.ambulance'),
    },
    {
      id: 4,
      name: t('sos.contacts.women'),
      number: '1091',
      icon: 'woman',
      color: Colors.warning,
      description: t('sos.contactsDesc.women'),
    },
    {
      id: 5,
      name: t('sos.contacts.bmtc'),
      number: '080-22961111',
      icon: 'bus',
      color: Colors.primary,
      description: t('sos.contactsDesc.bmtc'),
    },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      triggerEmergency();
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('sos.locationPermissionTitle'),
          t('sos.locationPermissionMsg'),
          [{ text: 'OK' }]
        );
        setLocationLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);
      setLocationLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationLoading(false);
    }
  };

  const startEmergencyCountdown = () => {
    Alert.alert(
      t('sos.emergencyAlertTitle'),
      t('sos.emergencyAlertMsg'),
      [
        {
          text: t('sos.cancel'),
          style: 'cancel',
        },
        {
          text: t('sos.startEmergency'),
          style: 'destructive',
          onPress: () => {
            setCountdown(10);
            setIsEmergencyActive(true);
          },
        },
      ]
    );
  };

  const cancelEmergency = () => {
    setCountdown(null);
    setIsEmergencyActive(false);
    Alert.alert(t('sos.cancelledTitle'), t('sos.cancelledMsg'));
  };

  const triggerEmergency = () => {
    setCountdown(null);
    setIsEmergencyActive(false);
    
    Alert.alert(
      t('sos.sentTitle'),
      t('sos.sentMsg'),
      [
        {
          text: t('sos.callPolice'),
          onPress: () => makeCall('100'),
        },
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  };

  const makeCall = (number) => {
    const phoneNumber = `tel:${number}`;
    Linking.canOpenURL(phoneNumber)
      .then((supported) => {
        if (!supported) {
          Alert.alert(t('common.errorTitle'), t('sos.callNotSupported'));
        } else {
          return Linking.openURL(phoneNumber);
        }
      })
      .catch((err) => console.error('Error making call:', err));
  };

  const shareLocation = () => {
    if (!location) {
      Alert.alert(t('sos.locationNA'), t('sos.waitLocation'));
      return;
    }

    const locationText = `Emergency! My location: https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
    
    Alert.alert(
      t('sos.locationSharedTitle'),
      t('sos.locationSharedMsg') + '\n\n' + locationText,
      [{ text: 'OK' }]
    );
  };

  const renderEmergencyContact = (contact) => (
    <TouchableOpacity
      key={contact.id}
      style={styles.contactCard}
      onPress={() => makeCall(contact.number)}
      activeOpacity={0.8}
    >
      <View style={[styles.contactIcon, { backgroundColor: contact.color }]}>
        <Ionicons name={contact.icon} size={Layout.iconSize.lg} color={Colors.textLight} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactDescription}>{contact.description}</Text>
        <Text style={styles.contactNumber}>{contact.number}</Text>
      </View>
      <Ionicons name="call" size={Layout.iconSize.md} color={contact.color} />
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>{t('profile.emergency.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Replaced non-scrollable content wrapper with ScrollView */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency Button */}
        <View style={styles.emergencySection}>
          {isEmergencyActive && countdown > 0 ? (
            <View style={styles.countdownContainer}>
              <View style={styles.countdownCircle}>
                <Text style={styles.countdownText}>{countdown}</Text>
              </View>
              <Text style={styles.countdownLabel}>{t('sos.emergencyIn')} {countdown} {t('sos.seconds')}</Text>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelEmergency}>
                <Text style={styles.cancelButtonText}>{t('sos.cancelEmergency')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emergencyButtonContainer}>
              <TouchableOpacity
                style={styles.emergencyButton}
                onPress={startEmergencyCountdown}
                activeOpacity={0.8}
              >
                <Ionicons name="warning" size={60} color={Colors.textLight} />
                <Text style={styles.emergencyButtonText}>{t('sos.emergency')}</Text>
                <Text style={styles.emergencyButtonSubtext}>{t('sos.tapToActivate')}</Text>
              </TouchableOpacity>
              <Text style={styles.emergencyInfo}>
                {t('sos.pressToSend')}
              </Text>
            </View>
          )}
        </View>

        {/* Location Status */}
        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={Layout.iconSize.md} color={Colors.primary} />
            <Text style={styles.locationTitle}>{t('sos.yourLocation')}</Text>
          </View>
          
          {locationLoading ? (
            <View style={styles.locationLoading}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.locationLoadingText}>{t('sos.gettingLocation')}</Text>
            </View>
          ) : location ? (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                Lat: {location.coords.latitude.toFixed(6)}
              </Text>
              <Text style={styles.locationText}>
                Lng: {location.coords.longitude.toFixed(6)}
              </Text>
              <Text style={styles.locationAccuracy}>
                {t('sos.accuracy')} ±{Math.round(location.coords.accuracy)}m
              </Text>
              <TouchableOpacity style={styles.shareLocationButton} onPress={shareLocation}>
                <Ionicons name="share" size={16} color={Colors.primary} />
                <Text style={styles.shareLocationText}>{t('sos.shareLocation')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.locationError}>
              {t('sos.locationNotAvailable')}
            </Text>
          )}
        </View>

        {/* Emergency Contacts */}
        <View style={styles.contactsSection}>
          <Text style={styles.sectionTitle}>{t('sos.emergencyContacts')}</Text>
          <View style={styles.contactsList}>
            {emergencyContacts.map(renderEmergencyContact)}
          </View>
        </View>

        {/* Safety Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>{t('sos.safetyTips')}</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
              <Text style={styles.tipText}>{t('sos.tips.stayCalm')}</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
              <Text style={styles.tipText}>{t('sos.tips.sharePlans')}</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
              <Text style={styles.tipText}>{t('sos.tips.keepCharged')}</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
              <Text style={styles.tipText}>{t('sos.tips.trustInstincts')}</Text>
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
    backgroundColor: Colors.error,
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
  scroll: { flex: 1 },
  scrollContent: { padding: Layout.spacing.md, paddingBottom: Layout.spacing.xl * 2 },
  emergencySection: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  emergencyButtonContainer: {
    alignItems: 'center',
  },
  emergencyButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  emergencyButtonText: {
    color: Colors.textLight,
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    marginTop: Layout.spacing.sm,
  },
  emergencyButtonSubtext: {
    color: Colors.textLight,
    fontSize: Layout.fontSize.sm,
    opacity: 0.8,
    marginTop: Layout.spacing.xs,
  },
  emergencyInfo: {
    textAlign: 'center',
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    maxWidth: 280,
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
  },
  countdownText: {
    color: Colors.textLight,
    fontSize: 48,
    fontWeight: 'bold',
  },
  countdownLabel: {
    fontSize: Layout.fontSize.lg,
    color: Colors.error,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.md,
  },
  cancelButton: {
    backgroundColor: Colors.textSecondary,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  cancelButtonText: {
    color: Colors.textLight,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  locationSection: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  locationTitle: {
    marginLeft: Layout.spacing.sm,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationLoadingText: {
    marginLeft: Layout.spacing.sm,
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  locationInfo: {
    gap: Layout.spacing.xs,
  },
  locationText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text,
    fontFamily: 'monospace',
  },
  locationAccuracy: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
  },
  shareLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
  },
  shareLocationText: {
    marginLeft: Layout.spacing.xs,
    fontSize: Layout.fontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  locationError: {
    fontSize: Layout.fontSize.sm,
    color: Colors.error,
  },
  contactsSection: {
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  contactsList: {
    gap: Layout.spacing.sm,
  },
  contactCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  contactDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  contactNumber: {
    fontSize: Layout.fontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  tipsSection: {
    marginBottom: Layout.spacing.md,
  },
  tipsList: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    gap: Layout.spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    marginLeft: Layout.spacing.sm,
    fontSize: Layout.fontSize.sm,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
});
