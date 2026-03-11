import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';

import en from './locales/en.json';
import kn from './locales/kn.json';
import hi from './locales/hi.json';
import pa from './locales/pa.json';

const resources = { en: { translation: en }, kn: { translation: kn }, hi: { translation: hi }, pa: { translation: pa } };
const supported = ['en','kn','hi','pa'];

// Initialize with device or persisted language
let initialLng = (Localization?.getLocales?.()[0]?.languageCode || 'en').toLowerCase();
if (!supported.includes(initialLng)) initialLng = 'en';

// Try sync read via SecureStore is not available; do async change after init
i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: 'en',
  compatibilityJSON: 'v3',
  interpolation: { escapeValue: false },
});

(async () => {
  try {
    const saved = await SecureStore.getItemAsync('app_lang');
    if (saved && supported.includes(saved) && saved !== i18n.language) {
      await i18n.changeLanguage(saved);
    }
  } catch {}
})();

export default i18n;
