import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const LEGACY_TOKEN_KEY = 'token';

let tokenCache: string | null = null;
let hydrated = false;

const migrateLegacyToken = async (): Promise<string | null> => {
  try {
    const legacy = await AsyncStorage.getItem(LEGACY_TOKEN_KEY);
    if (!legacy) return null;
    await SecureStore.setItemAsync(TOKEN_KEY, legacy);
    await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
    return legacy;
  } catch {
    return null;
  }
};

export const hydrateAuthToken = async (): Promise<string | null> => {
  if (hydrated) return tokenCache;
  try {
    let value = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!value) value = await migrateLegacyToken();
    tokenCache = value;
  } catch {
    tokenCache = null;
  } finally {
    hydrated = true;
  }
  return tokenCache;
};

export const getAuthToken = (): string | null => tokenCache;

export const setAuthToken = async (token: string): Promise<void> => {
  tokenCache = token;
  hydrated = true;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const clearAuthToken = async (): Promise<void> => {
  tokenCache = null;
  hydrated = true;
  await Promise.allSettled([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    AsyncStorage.removeItem(LEGACY_TOKEN_KEY),
  ]);
};
