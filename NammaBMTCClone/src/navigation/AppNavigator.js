import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import LiveTrackingScreen from '../screens/LiveTrackingScreen';
import FareCalculatorScreen from '../screens/FareCalculatorScreen';
import SOSScreen from '../screens/SOSScreen';
import AuthScreen from '../screens/auth/AuthScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
      <Stack.Screen name="FareCalculator" component={FareCalculatorScreen} />
      <Stack.Screen name="SOS" component={SOSScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}
