import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import AccountAddCardsScreen from '../accountFlow/AccountAddCardsScreen';
import AccountEditProfileScreen from '../accountFlow/AccountEditProfileScreen';
import AccountHomeScreen from '../accountFlow/AccountHomeScreen';
import AccountSaveCardsScreen from '../accountFlow/AccountSaveCardsScreen';
import AccountTransactionScreen from '../accountFlow/AccountTransactionScreen';
import CardAddSuccessScreen from '../accountFlow/CardAddSuccessScreen';
import DeleteAccountScreen from '../accountFlow/DeleteAccountScreen';
import HelpSupportScreen from '../accountFlow/HelpSupportScreen';
import PrivacyPolicyScreen from '../accountFlow/PrivacyPolicyScreen';
import TermsConditionsScreen from '../accountFlow/TermsConditionsScreen';
import RestaurantDetailScreen from '../foodFlow/RestaurantDetailScreen';
import CancelRideScreen from '../riderFlow/CancelRideScreen';
import PaymentSuccessScreen from '../riderFlow/PaymentSuccessScreen';
import RideAssignScreen from '../riderFlow/RideAssignScreen';
import RideCompleteScreen from '../riderFlow/RideCompleteScreen';
import RideSelectScreen from '../riderFlow/RideSelectScreen';
import Dashboard from './DashboardScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import LocationPermissionScreen from './LocationPermissionScreen';
import OtpScreen from './OtpScreen';
import ProfileScreen from './ProfileScreen';
import SetPasswordForgotScreen from './SetPasswordForgotScreen';
import SetPasswordSignUpScreen from './SetPasswordSignUpScreen';
import SignInScreen from './SignInScreen';
import SignUpScreen from './SignUpScreen';
import Splash from './Splash';
import VerificationScreen from './VerificationScreen';
import Welcome from './WelcomeScreen';

import LoyaltyMembershipScreen from '../accountFlow/LoyaltyMembershipScreen';
import BookingScreen from '../Booking/BookingScreen';
import Feedback from '../foodFlow/Feedback';
import MyBag from '../foodFlow/MyBag';
import Payment from '../foodFlow/Payment';
import Paymentsuccess from '../foodFlow/Paymentsuccess';
import ProductDetailsScreen from '../foodFlow/ProductDetailsScreen';
import TrackOrder from '../foodFlow/TrackOrder';

import { IAddress } from '../../api/types/userTypes';
import AddAddress from '../foodFlow/AddAddress';
import Address from '../foodFlow/Address';
import PopularRestaurantScreen from '../foodFlow/PopularRestaurantScreen';
export type ForgotPasswordParam = {
  email: string;
  password?: string;
  isSignUp?: boolean;
  generatedOtp?: string;
};
export type OtpScreenParam = {
  page: string;
};
export type AddAddressParam = {
  initialValue?: IAddress;
};
export type TrackOrderParam = {
  orderId: string;
};
export type RestaurantDetailParam = {
  restaurantId: string;
};

// Define type for navigation stack
export type AuthStackParamList = {
  SplashScreen: undefined;
  DashboardScreen: { page: string } | undefined;
  WelcomeScreen: undefined;
  LocationPermissionScreen: undefined;
  SignUpScreen: undefined;
  SetPasswordSignUpScreen: undefined;
  SetPasswordForgotScreen: ForgotPasswordParam;
  SignInScreen: undefined;
  VerificationScreen: ForgotPasswordParam;
  ProfileScreen: undefined;
  OtpScreen: OtpScreenParam;
  ForgotPasswordScreen: undefined;
  PopularRestaurantScreen: undefined;
  RestaurantDetailScreen: RestaurantDetailParam;
  PaymentSuccessScreen: { rideSessionId?: string } | undefined;
  CancelRideScreen: { rideSessionId?: string } | undefined;
  RideSelectScreen: {
    pickupAddress?: string;
    pickupLat?: number;
    pickupLng?: number;
    dropAddress?: string;
    dropLat?: number;
    dropLng?: number;
  } | undefined;
  RideAssignScreen: {rideSessionId?: string; selectedRide?: any} | undefined;
  RideCompleteScreen: {rideSessionId?: string} | undefined;
  AccountHomeScreen: undefined;
  AccountEditProfileScreen: undefined;
  AccountTransactionScreen: undefined;
  AccountSaveCardsScreen: undefined;
  AccountAddCardsScreen: undefined;
  PrivacyPolicyScreen: undefined;
  TermsConditionsScreen: undefined;
  DeleteAccountScreen: undefined;
  HelpSupportScreen: undefined;
  CardAddSuccessScreen: undefined;
  ProductDetailsScreen: undefined;
  MyBag: undefined;
  Address: undefined;
  AddAddress: AddAddressParam;
  Payment: { specialInstruction?: string } | undefined;
  Paymentsuccess: { orderId?: string } | undefined;
  TrackOrder: TrackOrderParam;
  Feedback: undefined;
  LoyaltyMembershipScreen: undefined;
  BookingScreen: undefined;
};

// Define AuthStack
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator initialRouteName="SplashScreen">
      <AuthStack.Screen
        name="SplashScreen"
        component={Splash}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="DashboardScreen"
        component={Dashboard}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="WelcomeScreen"
        component={Welcome}
        options={{ headerShown: false }}
      />

      <AuthStack.Screen
        name="LocationPermissionScreen"
        component={LocationPermissionScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="SignUpScreen"
        component={SignUpScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="SetPasswordSignUpScreen"
        component={SetPasswordSignUpScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="SetPasswordForgotScreen"
        component={SetPasswordForgotScreen as any}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="SignInScreen"
        component={SignInScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="VerificationScreen"
        component={VerificationScreen as any}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="OtpScreen"
        component={OtpScreen as any}
        options={{ headerShown: false }}
      />

      <AuthStack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />

      {/* food flow screen */}

      <AuthStack.Screen
        name="PopularRestaurantScreen"
        component={PopularRestaurantScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="RestaurantDetailScreen"
        component={RestaurantDetailScreen as any}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="PaymentSuccessScreen"
        component={PaymentSuccessScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="CancelRideScreen"
        component={CancelRideScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="RideSelectScreen"
        component={RideSelectScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="RideAssignScreen"
        component={RideAssignScreen}
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <AuthStack.Screen
        name="RideCompleteScreen"
        component={RideCompleteScreen}
        options={{ headerShown: false }}
      />

      {/* account screen */}
      <AuthStack.Screen
        name="AccountHomeScreen"
        component={AccountHomeScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="AccountEditProfileScreen"
        component={AccountEditProfileScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="AccountTransactionScreen"
        component={AccountTransactionScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="AccountSaveCardsScreen"
        component={AccountSaveCardsScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="AccountAddCardsScreen"
        component={AccountAddCardsScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="PrivacyPolicyScreen"
        component={PrivacyPolicyScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="TermsConditionsScreen"
        component={TermsConditionsScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="DeleteAccountScreen"
        component={DeleteAccountScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="HelpSupportScreen"
        component={HelpSupportScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="CardAddSuccessScreen"
        component={CardAddSuccessScreen}
        options={{ headerShown: false }}
      />

      <AuthStack.Screen
        name="ProductDetailsScreen"
        component={ProductDetailsScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="MyBag"
        component={MyBag}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="Address"
        component={Address}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="AddAddress"
        component={AddAddress}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="Payment"
        component={Payment}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="Paymentsuccess"
        component={Paymentsuccess}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="TrackOrder"
        component={TrackOrder as any}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="Feedback"
        component={Feedback}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="LoyaltyMembershipScreen"
        component={LoyaltyMembershipScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="BookingScreen"
        component={BookingScreen}
        options={{ headerShown: false }}
      />
    </AuthStack.Navigator>
  );
};

const styles = StyleSheet.create({});

export default AuthNavigator;
