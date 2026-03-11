import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import * as SecureStore from 'expo-secure-store';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const LANG_LABELS = { en: 'English', kn: 'ಕನ್ನಡ', hi: 'हिंदी', pa: 'ਪੰਜਾਬੀ' };
  const LANGUAGE_OPTIONS = [
    { code: 'en', label: 'English' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  ];
  const setLanguage = async (code) => {
    try {
      await i18n.changeLanguage(code);
      await SecureStore.setItemAsync('app_lang', code);
    } catch (e) {
      console.warn('Language change failed', e);
    }
  };
  const handleLanguagePress = () => {
    // Replaced Alert (Android limit 3 buttons) with modal so all languages appear
    setLanguageModalVisible(true);
  };

  const profileOptions = [
    {
      id: 1,
      title: t('profile.options.trips.title'),
      subtitle: t('profile.options.trips.subtitle'),
      icon: 'time',
      onPress: () => Alert.alert(t('common.comingSoonTitle'), t('common.comingSoonMsg')),
    },
    {
      id: 2,
      title: t('profile.options.saved.title'),
      subtitle: t('profile.options.saved.subtitle'),
      icon: 'bookmark',
      onPress: () => Alert.alert(t('common.comingSoonTitle'), t('common.comingSoonMsg')),
    },
    {
      id: 3,
      title: t('profile.options.payment.title'),
      subtitle: t('profile.options.payment.subtitle'),
      icon: 'card',
      onPress: () => Alert.alert(t('common.comingSoonTitle'), t('common.comingSoonMsg')),
    },
    {
      id: 4,
      title: t('profile.options.notifications.title'),
      subtitle: t('profile.options.notifications.subtitle'),
      icon: 'notifications',
      onPress: () => Alert.alert(t('common.comingSoonTitle'), t('common.comingSoonMsg')),
    },
    {
      id: 5,
      title: t('profile.options.language.title'),
      subtitle: LANG_LABELS[i18n.language] || 'English',
      icon: 'language',
      onPress: handleLanguagePress,
    },
    {
      id: 6,
      title: t('profile.options.help.title'),
      subtitle: t('profile.options.help.subtitle'),
      icon: 'help-circle',
      onPress: () => Alert.alert(t('common.comingSoonTitle'), t('common.comingSoonMsg')),
    },
    {
      id: 7,
      title: t('profile.options.about.title'),
      subtitle: t('profile.options.about.subtitle'),
      icon: 'information-circle',
      onPress: () => Alert.alert(t('profile.options.about.title'), t('profile.about.alertMsg')),
    },
  ];

  const quickStats = [
    {
      label: t('profile.stats.totalTrips'),
      value: '0',
      icon: 'bus',
      color: Colors.primary,
    },
    {
      label: t('profile.stats.distanceTraveled'),
      value: '0 km',
      icon: 'map',
      color: Colors.info,
    },
    {
      label: t('profile.stats.moneySaved'),
      value: '₹0',
      icon: 'wallet',
      color: Colors.accent,
    },
  ];

  const renderProfileOption = (option) => (
    <TouchableOpacity
      key={option.id}
      style={styles.optionCard}
      onPress={option.onPress}
      activeOpacity={0.8}
    >
      <View style={styles.optionIcon}>
        <Ionicons name={option.icon} size={Layout.iconSize.md} color={Colors.primary} />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{option.title}</Text>
        <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={Layout.iconSize.md} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderQuickStat = (stat, index) => (
    <View key={index} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
        <Ionicons name={stat.icon} size={Layout.iconSize.md} color={Colors.textLight} />
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={Colors.textLight} />
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="camera" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user? user.name : t('profile.guest')}</Text>
          <Text style={styles.userEmail}>{user? (user.email || user.phone) : t('profile.signinHint')}</Text>
          {user ? (
            <TouchableOpacity style={styles.signInButton} onPress={logout}>
              <Text style={styles.signInText}>{t('profile.signOut')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate('Auth')}>
              <Text style={styles.signInText}>{t('profile.signIn')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.travelStats')}</Text>
          <View style={styles.statsContainer}>
            {quickStats.map(renderQuickStat)}
          </View>
        </View>

        {/* Profile Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.accountSettings')}</Text>
          <View style={styles.optionsContainer}>
            {profileOptions.map(renderProfileOption)}
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.emergencyCard} activeOpacity={0.8} onPress={() => navigation.navigate('SOS')}>
            <View style={styles.emergencyIcon}>
              <Ionicons name="warning" size={Layout.iconSize.lg} color={Colors.error} />
            </View>
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyTitle}>{t('profile.emergency.title')}</Text>
              <Text style={styles.emergencySubtitle}>{t('profile.emergency.subtitle')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={Layout.iconSize.md} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>{t('profile.about.version')}</Text>
          <Text style={styles.appDescription}>
            {t('profile.about.desc')}
          </Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-twitter" size={Layout.iconSize.md} color={Colors.info} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={Layout.iconSize.md} color={Colors.info} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-instagram" size={Layout.iconSize.md} color={Colors.info} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('profile.languageDialog.title')}</Text>
            <Text style={styles.modalSubtitle}>{t('profile.languageDialog.message')}</Text>
            <View style={styles.langList}>
              {LANGUAGE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.code}
                  style={({ pressed }) => [
                    styles.langButton,
                    pressed && { backgroundColor: Colors.background },
                    i18n.language === opt.code && styles.langButtonActive,
                  ]}
                  onPress={async () => {
                    await setLanguage(opt.code);
                    setLanguageModalVisible(false);
                  }}
                >
                  <Text style={styles.langButtonText}>{opt.label}</Text>
                  {i18n.language === opt.code && (
                    <Ionicons name="checkmark" size={18} color={Colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>{t('profile.languageDialog.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileHeader: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
    marginBottom: Layout.spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Layout.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  userName: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  userEmail: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.md,
  },
  signInButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
  },
  signInText: {
    color: Colors.textLight,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Layout.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
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
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.sm,
  },
  statValue: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  statLabel: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  optionsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  optionSubtitle: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  emergencyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.error,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emergencyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: Layout.spacing.xs,
  },
  emergencySubtitle: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
    marginTop: Layout.spacing.lg,
  },
  appVersion: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  appDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  langList: {
    marginBottom: 8,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  langButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  langButtonText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  modalClose: {
    marginTop: 4,
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  modalCloseText: {
    color: Colors.textLight,
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
  },
});
