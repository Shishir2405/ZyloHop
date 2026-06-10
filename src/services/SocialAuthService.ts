import { Platform } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

import { socialLoginApi } from '../api/authApis';
import { SignInResponseData } from '../api/types/authTypes';
import {
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from '../config/socialAuth';
import { setAuthToken } from './tokenStorage';

let googleConfigured = false;

const configureGoogle = () => {
  if (googleConfigured) return;
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    offlineAccess: false,
  });
  googleConfigured = true;
};

export type SocialProvider = 'google' | 'apple';

export interface SocialAuthOutcome {
  success: boolean;
  cancelled?: boolean;
  error?: string;
  data?: SignInResponseData;
}

const postSocialLogin = async (
  provider: SocialProvider,
  idToken: string,
): Promise<SocialAuthOutcome> => {
  const response = await socialLoginApi({
    provider,
    idToken,
    devicePlatform: Platform.OS,
  });

  if (response.remote === 'success') {
    const token = response.data?.token;
    if (token) {
      await setAuthToken(token);
    }
    return { success: true, data: response.data };
  }

  const errorMsg =
    response?.errors?.errors?.message ||
    response?.errors?.errors ||
    'Social login failed. Please try again.';

  return {
    success: false,
    error: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
  };
};

export const signInWithGoogle = async (): Promise<SocialAuthOutcome> => {
  try {
    configureGoogle();
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo: any = await GoogleSignin.signIn();
    const idToken: string | undefined =
      userInfo?.idToken || userInfo?.data?.idToken;

    if (!idToken) {
      return {
        success: false,
        error: 'Google did not return an id token.',
      };
    }

    return await postSocialLogin('google', idToken);
  } catch (error: any) {
    if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, cancelled: true };
    }
    if (error?.code === statusCodes.IN_PROGRESS) {
      return { success: false, error: 'Sign-in already in progress.' };
    }
    if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return { success: false, error: 'Google Play Services not available.' };
    }
    return {
      success: false,
      error: error?.message || 'Google sign-in failed.',
    };
  }
};

export const signInWithApple = async (): Promise<SocialAuthOutcome> => {
  if (Platform.OS !== 'ios') {
    return { success: false, error: 'Apple Sign-In is only available on iOS.' };
  }

  try {
    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      return { success: false, error: 'Apple Sign-In is not available on this device.' };
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      return { success: false, error: 'Apple did not return an identity token.' };
    }

    return await postSocialLogin('apple', credential.identityToken);
  } catch (error: any) {
    if (error?.code === 'ERR_REQUEST_CANCELED') {
      return { success: false, cancelled: true };
    }
    return {
      success: false,
      error: error?.message || 'Apple sign-in failed.',
    };
  }
};

export const isAppleSignInSupported = (): boolean => Platform.OS === 'ios';
