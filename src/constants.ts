// Single source of truth for build-time + runtime configuration.
//
// We deliberately do NOT read from process.env here so that an APK / IPA
// built with `eas build` (or `expo prebuild`) always has these values
// baked in — no .env file required at build time.
//
// `app.config.js` (the Expo manifest) holds the same literal values; if
// you change one, change both. Both files are committed, so drift will
// show up in code review.

export const SERVER_URL = 'https://zylo-backend-f0rw.onrender.com/api';
export const IMAGE_URL = 'https://zylo-backend-f0rw.onrender.com';

export const GOOGLE_MAPS_API_KEY = 'AIzaSyB-T2GimiJHK0Ndb9RV02CUgIoR4dMU7q0';

export const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51TIyJVGZcv2efVCoa5Wek4JEMyfttmKxNghESUQJbdTPeTD4VARzlNRaCikaIYD3n31MDWkQ8d3xyaF6DhVrhyJ60059jg5S5m';

// Google Sign-In OAuth clients (project number 447662433993).
// Android uses the Web client ID via GoogleSignin.configure({ webClientId }).
export const GOOGLE_WEB_CLIENT_ID =
  '447662433993-16jmietkeqrjeei2p2eei5uva7nsjo26.apps.googleusercontent.com';
export const GOOGLE_IOS_CLIENT_ID =
  '447662433993-54kej1lg23pqvhcc7t17pgj43m0kc0q5.apps.googleusercontent.com';
