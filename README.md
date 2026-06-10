# ZyloHop - Passenger Mobile App

## Overview

ZyloHop is the **customer-facing mobile application** for the Zylo platform. It allows passengers to book rides and order food from restaurants.

| Property | Value |
|----------|-------|
| App Name | ZyloHop |
| Package (Android) | `com.zylohop.app` |
| Framework | React Native 0.81.5 |
| Build System | Expo 54 (EAS Build) |
| Language | TypeScript |
| Platforms | iOS + Android |
| EAS Project ID | `0547a3f5-13ff-4c15-ba6d-b55099faf1f9` |

---

## Features

### Ride Hailing

| Feature | Description |
|---------|-------------|
| Location Selection | Pick up and drop-off with Google Places autocomplete |
| Route Calculation | Distance and fare estimation |
| Ride Type Selection | Bike, Economy, Premium, SUV, etc. |
| Real-Time Driver Tracking | Live driver location via SignalR WebSocket |
| OTP Verification | Verify ride start with OTP |
| Payment | Stripe payment integration |
| Promo Codes | Apply discount codes |
| Ride History | View past rides |
| Feedback & Ratings | Rate drivers after ride |
| Loyalty Program | Earn points, view tier and history |
| Ride Cancellation | Cancel before or during ride |

### Food Delivery

| Feature | Description |
|---------|-------------|
| Restaurant Browsing | Search and filter restaurants |
| Menu Exploration | Categories and product details |
| Shopping Cart | Add items, modify quantities |
| Address Management | Save and select delivery addresses |
| Order Placement | Checkout with special instructions |
| Order Tracking | Real-time order status |
| Ratings & Reviews | Review restaurants and orders |

### Account Management

| Feature | Description |
|---------|-------------|
| Profile Management | Edit personal information |
| Transaction History | View all rides and orders |
| Payment Methods | Manage saved cards (Stripe) |
| Loyalty Membership | Points balance and tier info |
| Support | Help and contact |
| Privacy & Terms | Legal documents (from CMS) |
| Account Deletion | Self-service delete |

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React Native | 0.81.5 |
| Platform | Expo | 54.0.0 |
| Language | TypeScript | 5.3.3 |
| State Management | Redux Toolkit | 2.11.0 |
| State Persistence | Redux Persist | 6.0.0 |
| Server State | React Query (@tanstack/react-query) | 5.90.11 |
| HTTP Client | Axios | 1.13.2 |
| Real-Time | @microsoft/signalr | 10.0.0 |
| Navigation | React Navigation | 7.1.22 |
| Maps | react-native-maps | 1.20.1 |
| Directions | react-native-maps-directions | 1.9.0 |
| Places Autocomplete | react-native-google-places-autocomplete | 2.6.1 |
| Payments | @stripe/stripe-react-native | 0.50.3 |
| Location | expo-location | 19.0.8 |
| Notifications | expo-notifications | 55.0.18 |
| Image Picker | expo-image-picker | 17.0.10 |
| Animations | lottie-react-native | 7.3.1 |
| OTP Input | react-native-otp-entry | 1.8.5 |
| Ratings | react-native-ratings | 8.1.0 |
| Storage | @react-native-async-storage/async-storage | 2.2.0 |
| SVG | react-native-svg + react-native-svg-transformer | 15.12.1 |
| HTML Rendering | react-native-render-html | 6.3.4 |

---

## Folder Structure

```
ZyloHop/
├── src/
│   ├── api/                           # API layer
│   │   ├── apiIndex.ts               # Axios instance & interceptors
│   │   ├── authApis.ts               # Authentication endpoints
│   │   ├── rideBookingApis.ts        # Ride-hailing API calls
│   │   ├── foodFlowApis.ts           # Food delivery API calls
│   │   ├── orderFoodApis.ts          # Order management API calls
│   │   ├── userApis.ts               # User management
│   │   ├── riderApis.ts              # Rider operations
│   │   └── types/                    # TypeScript type definitions
│   │
│   ├── screens/
│   │   ├── auth/                     # Authentication flow
│   │   │   ├── Splash.tsx
│   │   │   ├── WelcomeScreen.jsx
│   │   │   ├── SignUpScreen.tsx
│   │   │   ├── SignInScreen.tsx
│   │   │   ├── VerificationScreen.tsx
│   │   │   ├── OtpScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   ├── SetPasswordForgotScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── LocationPermissionScreen.tsx
│   │   │
│   │   ├── riderFlow/                # Ride booking screens
│   │   │   ├── RideSelectScreen.tsx  # Choose pickup/dropoff
│   │   │   ├── RideAssignScreen.tsx  # Driver assignment
│   │   │   ├── RideCompleteScreen.tsx # Trip completion + feedback
│   │   │   ├── PaymentSuccessScreen.tsx
│   │   │   └── CancelRideScreen.tsx
│   │   │
│   │   ├── foodFlow/                 # Food delivery screens
│   │   │   ├── PopularRestaurantScreen.tsx
│   │   │   ├── RestaurantDetailScreen.tsx
│   │   │   ├── ProductDetailsScreen.tsx
│   │   │   ├── MyBag.tsx             # Cart management
│   │   │   ├── Address.tsx           # Delivery address
│   │   │   ├── Payment.tsx
│   │   │   ├── TrackOrder.tsx
│   │   │   └── Feedback.tsx
│   │   │
│   │   ├── accountFlow/              # Account management
│   │   │   ├── AccountHome.tsx
│   │   │   ├── EditProfile.tsx
│   │   │   ├── TransactionHistory.tsx
│   │   │   ├── PaymentMethods.tsx
│   │   │   ├── AddCard.tsx
│   │   │   ├── LoyaltyMembership.tsx
│   │   │   ├── Support.tsx
│   │   │   ├── PrivacyTerms.tsx
│   │   │   └── AccountDeletion.tsx
│   │   │
│   │   └── Booking/                  # Booking screens
│   │
│   ├── services/
│   │   ├── LocationHubService.ts     # SignalR WebSocket service
│   │   ├── AuthService.ts            # Auth utilities
│   │   └── UserService.ts            # User service utilities
│   │
│   ├── Redux/
│   │   ├── Store/index.js            # Redux store config
│   │   └── Reducer/
│   │       ├── UserinfoReducer.ts    # User state
│   │       ├── restaurantReducer.ts  # Restaurant/food state
│   │       └── loadingRedux.ts       # Loading states
│   │
│   ├── Navigation/
│   │   └── Navigation.tsx            # Navigation stack config
│   │
│   ├── components/                   # Reusable components
│   │   ├── map/                      # Map components
│   │   ├── trackOrderComponents/     # Order tracking UI
│   │   └── toasts/                   # Toast helpers
│   │
│   ├── common/                       # Shared UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Header.tsx
│   │   ├── CustomText.tsx
│   │   ├── Footer.tsx
│   │   ├── Theam.ts                  # Theme/styling
│   │   └── Skeleton/                 # Loading skeletons
│   │
│   ├── utils/
│   │   ├── helper.ts                 # Utility functions
│   │   ├── errorMessages.ts          # Error handling
│   │   ├── userFriendlyMessage.ts    # User-facing messages
│   │   └── mapStyles.ts              # Google Maps styling
│   │
│   ├── assets/fonts/                 # Custom fonts (Kenia, Poppins)
│   ├── types/                        # Global type definitions
│   └── config.js                     # Backend URL & API keys
│
├── android/                          # Android native project
├── ios/                              # iOS native project
├── app.json                          # Expo configuration
├── eas.json                          # EAS build profiles
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript config
├── babel.config.js                   # Babel config
├── metro.config.js                   # Metro bundler (SVG + Lottie support)
├── react-native.config.js           # RN CLI config (custom fonts)
├── Gemfile                           # Ruby deps for CocoaPods
├── .eslintrc.js                      # ESLint rules
└── .prettierrc.js                    # Prettier config
```

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Runtime |
| npm | 9+ | Package manager |
| Expo CLI | Latest | `npm install -g expo-cli` |
| EAS CLI | Latest | `npm install -g eas-cli` |
| Xcode | 15+ | iOS builds (macOS only) |
| Android Studio | Latest | Android builds |
| CocoaPods | Latest | iOS dependency manager |
| Ruby | 2.7+ | Required for CocoaPods |

---

## Setup & Installation

### 1. Install Dependencies

```bash
cd ZyloHop
npm install
```

### 2. iOS Setup (macOS only)

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

### 3. Configure Backend URL

Edit `src/config.js`:

```javascript
const PROD_URL = 'https://your-backend-url';
export const SERVER_URL = `${PROD_URL}/api`;
export const IMAGE_URL = PROD_URL;
export const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
```

### 4. Start Development Server

```bash
npx expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on physical device

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Start | `npm start` | Start Expo development server |
| iOS | `npm run ios` | Build and run on iOS simulator (`expo run:ios`) |
| Android | `npm run android` | Build and run on Android emulator (`expo run:android`) |
| Lint | `npm run lint` | Run ESLint code quality checks |

---

## Configuration Details

### app.json

| Setting | Value |
|---------|-------|
| Name | ZyloHop |
| Slug | zylohop |
| Version | 1.0.0 |
| Orientation | Portrait |
| UI Style | Light |
| Android Package | com.zylohop.app |
| Splash Background | #F7C846 (Yellow) |
| New Architecture | Disabled |

### Android Permissions

| Permission | Purpose |
|------------|---------|
| `ACCESS_FINE_LOCATION` | GPS location for ride booking |
| `ACCESS_COARSE_LOCATION` | Approximate location |
| `READ_MEDIA_IMAGES` | Profile photo upload |
| `READ_EXTERNAL_STORAGE` | File access |
| `RECORD_AUDIO` | Voice features |

### iOS Permissions

| Permission | Description Shown to User |
|------------|--------------------------|
| Location When In Use | "ZyloHop uses your location to find nearby drivers." |
| Location Always | "ZyloHop uses your location to track your ride." |

---

## API Endpoints Used

### Authentication (`/api/account`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/account/user-login` | Sign in |
| POST | `/account/register` | Sign up (with file upload) |
| POST | `/users/verification` | Email/phone verification |
| POST | `/users/resend-code` | Resend OTP |
| POST | `/users/set-password` | Set password after signup |
| GET | `/user/get-user` | Fetch user details |
| POST | `/account/send-otp-to-email` | Send OTP |
| PATCH | `/account/confirm-email` | Confirm email |
| POST | `/account/forgot-password` | Initiate password reset |
| POST | `/account/verify-otp` | Verify OTP |
| POST | `/account/reset-password` | Complete password reset |

### Ride Booking (`/api/rider`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/rider/location/confirm` | Confirm pickup/dropoff |
| GET | `/rider/calculate/route/{rideSessionId}` | Calculate route |
| POST | `/rider/ride/options/{rideSessionId}` | Get available rides |
| POST | `/rider/ride/select/{rideSessionId}/{rideType}` | Select ride |
| GET | `/rider/ride/vehicles/{categoryId}` | Get vehicles |
| POST | `/rider/driver/assign/{rideSessionId}/{vehicleCategoryId}` | Request driver |
| GET | `/rider/driver/status/{rideSessionId}` | Poll driver status |
| POST | `/rider/driver/reassign/{rideSessionId}` | Reassign driver |
| POST | `/rider/ride/cancel` | Cancel ride |
| POST | `/rider/otp/verify` | Verify ride OTP |
| POST | `/rider/payment/promoApply` | Apply promo |
| POST | `/rider/payment/create-intent` | Create payment intent |
| POST | `/rider/payment/pay` | Confirm payment |
| POST | `/rider/ride/feedback` | Submit feedback |
| GET | `/rider/recent-rides` | Ride history |
| GET | `/rider/loyalty/summary` | Loyalty points |
| GET | `/rider/loyalty/history` | Points history |
| POST | `/rider/device-token` | Register push token |

### Food Delivery

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/restaurant/get-all-restaurants` | List restaurants |
| GET | `/restaurant/get-restaurant/{id}` | Restaurant details |
| GET | `/category/{restaurantId}/get-all-categories` | Menu categories |
| GET | `/product/{categoryId}/get-all-products` | Products |
| GET | `/product/get-product/{id}` | Product details |
| POST | `/basket/add-update-basket` | Add/update cart |
| GET | `/basket/get-user-basket` | Get cart |
| DELETE | `/basket/remove-basket-item/{id}` | Remove from cart |
| POST | `/order/{basketId}/place-order` | Place order |
| GET | `/order/get-user-orders` | Order history |
| GET | `/order/get-order-details/{id}` | Order details |

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/user/add-user-delivery-address` | Save address |
| GET | `/user/get-all-user-delivery-addresses` | Get addresses |
| DELETE | `/user/delete-user-delivery-address/{id}` | Delete address |
| POST | `/review/{orderId}/add-order-review` | Submit review |

---

## SignalR Real-Time Events

**Hub URL**: `{SERVER_URL}/hubs/location`

| Event | Direction | Description |
|-------|-----------|-------------|
| `RegisterAsPassenger` | Client -> Server | Register for real-time updates |
| `SubscribeToDriverLocation` | Client -> Server | Start tracking driver |
| `ReceiveDriverLocation` | Server -> Client | Driver GPS updates (lat, lng) |
| `RideAccepted` | Server -> Client | Driver accepted ride |
| `RideCancelled` | Server -> Client | Ride cancelled |
| `DriverRejected` | Server -> Client | Driver rejected ride |

**Reconnection**: Automatic with exponential backoff (3s to 30s), max 10 attempts, supports WebSocket + Long Polling fallback.

---

## Redux State Structure

```javascript
{
  Userinfo: {
    user: UserType,              // Current user data
    userAddressList: IAddress[], // Saved addresses
    selectedAddress: IAddress,   // Selected delivery address
    basketId: string             // Current basket ID
  },
  loading: LoadingState,         // Global loading state
  restaurant: {
    popularRestaurants: RestaurantDetail[]
  }
}
```

| Setting | Value |
|---------|-------|
| Persistence Key | `appStateVer_54` |
| Storage | AsyncStorage |
| Timeout | 2000ms |

---

## Payment Integration (Stripe)

| Setting | Value |
|---------|-------|
| Package | @stripe/stripe-react-native v0.50.3 |
| Merchant ID | merchant.com.zylohop |
| Google Pay | Disabled |

**Flow**: Create Payment Intent -> Show Stripe Sheet -> Confirm Payment -> Webhook Verification

---

## Custom Fonts

| Font | Variants |
|------|----------|
| Kenia | Regular |
| Poppins | ExtraLight, Light, Regular, SemiBold, Bold |

Loaded in `App.tsx` using `expo-font`.

---

## Building for Production

### EAS Build Commands

```bash
# Login to Expo
eas login

# Build Android APK (testing)
eas build --platform android --profile preview

# Build Android for Production
eas build --platform android --profile production

# Build iOS for Production
eas build --platform ios --profile production

# Submit to App Store / Play Store
eas submit --platform android --latest
eas submit --platform ios --latest
```

### Build Profiles (eas.json)

| Profile | Build Type | Distribution | Use Case |
|---------|-----------|-------------|----------|
| development | Dev Client | Internal | Local development with Expo dev tools |
| preview | APK | Internal | Testing/QA distribution |
| production | APK | Store | App Store / Play Store release |

> **Note**: For Play Store, change `buildType` from `apk` to `aab` (Android App Bundle) in production profile.

---

## Files to Update for Production

| File | What to Change |
|------|---------------|
| `src/config.js` | `PROD_URL` to your production backend URL |
| `src/config.js` | `GOOGLE_MAPS_API_KEY` to production key |
| `app.json` | `version` - increment for each release |
| `app.json` | `extra.eas.projectId` - your EAS project ID |
| `eas.json` | Change `buildType` from `apk` to `aab` for Play Store |

---

## Screen Navigation Flow

```
Splash -> Welcome -> SignUp/SignIn -> OTP Verification -> Profile Setup
                                                              |
                                                              v
                                              Location Permission
                                                              |
                                                              v
                                                    Dashboard (Home)
                                                    /              \
                                                   v                v
                                           Ride Flow          Food Flow
                                              |                    |
                                    Location Select      Restaurant Browse
                                              |                    |
                                    Ride Type Select       Menu / Products
                                              |                    |
                                    Finding Driver          Add to Cart
                                              |                    |
                                    Ride Tracking          Checkout
                                              |                    |
                                    Ride Complete          Track Order
                                              |                    |
                                      Payment              Feedback
                                              |
                                      Feedback
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Metro bundler crash | Delete `node_modules`, run `npm install`, then `npx expo start -c` |
| iOS build fails | Run `cd ios && bundle exec pod install && cd ..` |
| Maps not loading | Verify Google Maps API key in `app.json` and `config.js` |
| SignalR connection fails | Check backend URL, ensure WebSocket is not blocked |
| Location not working | Check device permissions, ensure `expo-location` plugin in `app.json` |
| Stripe not initializing | Verify Stripe publishable key and merchant ID |
| App crashes on startup | Clear AsyncStorage or update Redux persist key |
| OTP not received | Check Resend email service on backend, check spam folder |
| Android build error | Run `cd android && ./gradlew clean && cd ..` |
| Fonts not loading | Verify fonts exist in `src/assets/fonts/`, check `App.tsx` font loading |
