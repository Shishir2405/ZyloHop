import { Platform } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMAGE_URL, GOOGLE_MAPS_API_KEY } from '../config';
import { FailureResponse } from '../api/types';
import { IAddress } from '../api/types/userTypes';

export const GOOGLE_MAPS_APIKEY = GOOGLE_MAPS_API_KEY;
export const DEFAULT_PAGE_SIZE = 10;

export const isIOS = (): boolean => Platform.OS === 'ios';
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const setLocalStorage = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {}
};

export const removeLocalStorage = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
};

export const getLocalStorage = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
};

export function formatAddress(address?: IAddress | null): string {
  if (!address) return 'Address not available';
  const { streetAddress, city, state, zipcode, country } = address;
  const parts = [
    streetAddress?.trim(),
    city?.trim(),
    state?.trim(),
    zipcode?.trim(),
    country?.trim(),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Address not available';
}

export function getMediaUrl(filePath: string): string {
  return `${IMAGE_URL}${filePath}`;
}

export const addParam = (
  params: URLSearchParams,
  key: string,
  value: string,
): void => {
  if (params.has(key)) {
    params.set(key, value);
  } else {
    params.append(key, value);
  }
};

export const extractErrorMessage = (response: FailureResponse | any): string => {
  const errorFields = response?.errors?.errors || response?.errors;

  if (typeof errorFields === 'string') return errorFields;

  if (errorFields?.message && typeof errorFields.message === 'string') {
    return errorFields.message;
  }

  if (errorFields && typeof errorFields === 'object') {
    for (const key in errorFields) {
      const messages = errorFields[key];
      if (Array.isArray(messages) && messages.length > 0) return messages[0];
    }
  }

  return 'Something went wrong';
};

export const formatAmount = (
  amount: number | string | undefined | null,
): string => {
  if (amount === undefined || amount === null || amount === '') return '0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
};
