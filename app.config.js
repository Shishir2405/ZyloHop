// Build-time Expo manifest. Values are intentionally hard-coded here
// (no process.env) so `eas build` / `expo prebuild` produce a working
// APK / IPA without a .env file. The same literals live in
// src/constants.ts for runtime JS access — keep the two in sync.

const GOOGLE_MAPS_API_KEY = 'AIzaSyB-T2GimiJHK0Ndb9RV02CUgIoR4dMU7q0';

const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51TIyJVGZcv2efVCoa5Wek4JEMyfttmKxNghESUQJbdTPeTD4VARzlNRaCikaIYD3n31MDWkQ8d3xyaF6DhVrhyJ60059jg5S5m';

const SERVER_URL = 'https://zylo-backend-f0rw.onrender.com/api';

module.exports = () => ({
  expo: {
    name: 'ZyloHop',
    slug: 'zylohop',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    scheme: 'zylohop',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      icon: './assets/icon.png',
      supportsTablet: false,
      bundleIdentifier: 'com.zylohop',
      usesAppleSignIn: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'ZyloHop needs your location to show nearby drivers and provide turn-by-turn navigation during your ride.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'ZyloHop uses your location during a ride to keep your driver and emergency contacts informed of your trip status.',
        NSCameraUsageDescription:
          'ZyloHop needs the camera to take a profile photo and capture documents during account verification.',
        NSPhotoLibraryUsageDescription:
          'ZyloHop needs access to your photos to set a profile picture and upload verification documents.',
        NSMicrophoneUsageDescription:
          'ZyloHop uses the microphone for in-ride voice support.',
      },
    },
    android: {
      package: 'com.zylohop',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#F7C846',
      },
      config: {
        googleMaps: {
          apiKey: GOOGLE_MAPS_API_KEY,
        },
      },
      permissions: [
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.READ_MEDIA_IMAGES',
        'android.permission.RECORD_AUDIO',
      ],
    },
    plugins: [
      'expo-location',
      'expo-image-picker',
      'expo-font',
      'expo-secure-store',
      'expo-apple-authentication',
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme:
            'com.googleusercontent.apps.447662433993-54kej1lg23pqvhcc7t17pgj43m0kc0q5',
        },
      ],
      [
        '@stripe/stripe-react-native',
        {
          merchantIdentifier: 'merchant.com.zylohop',
          enableGooglePay: false,
        },
      ],
    ],
    extra: {
      eas: {
        projectId: 'fa5affd2-528d-48d8-81d1-284ed9832b71',
      },
      googleMapsApiKey: GOOGLE_MAPS_API_KEY,
      stripePublishableKey: STRIPE_PUBLISHABLE_KEY,
      serverUrl: SERVER_URL,
    },
  },
});
