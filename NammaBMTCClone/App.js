import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/constants/Colors';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import './src/i18n';
import { useTranslation } from 'react-i18next';

function Root() {
  const { loading } = useAuth();
  const { t } = useTranslation();
  if (loading) {
    return (
      <View style={styles.splash}> 
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.splashText}>{t('common.loadingSession')}</Text>
      </View>
    );
  }
  return (
    <NavigationContainer>
      <AppNavigator />
      <StatusBar style="light" backgroundColor={Colors.primary} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash:{ flex:1, backgroundColor:Colors.background, alignItems:'center', justifyContent:'center' },
  splashText:{ marginTop:12, color:Colors.textSecondary }
});
