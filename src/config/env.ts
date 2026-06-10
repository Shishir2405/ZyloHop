// Re-export from the canonical src/constants.ts. We used to read these via
// expo-constants → app.json/expo.extra, which forced builds to depend on
// runtime values being correctly populated by Expo. Reading the literal
// constants directly means an APK / IPA built with `eas build` always has
// the right values without a .env file.

export {
  SERVER_URL,
  IMAGE_URL,
  GOOGLE_MAPS_API_KEY,
  STRIPE_PUBLISHABLE_KEY,
} from '../constants';
