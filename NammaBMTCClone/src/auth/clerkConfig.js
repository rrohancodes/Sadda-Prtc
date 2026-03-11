import * as SecureStore from 'expo-secure-store';

export const tokenCache = {
  async getToken(key) {
    try { return await SecureStore.getItemAsync(key); } catch { return null; }
  },
  async saveToken(key, value) {
    try { await SecureStore.setItemAsync(key, value); } catch {}
  }
};

export const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!CLERK_PUBLISHABLE_KEY) {
  console.warn('Clerk publishable key missing. Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env');
}
