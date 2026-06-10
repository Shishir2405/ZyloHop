import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomText from '../../common/CustomText';
import Footer from '../../common/Footer';
import { SVG } from '../../common/SvgHelper';
import { Font } from '../../common/Theam';
import WrapperScreen from '../../common/WrapperScreen';
import { AuthStackParamList } from '../auth';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { logoutLoadingRedux } from '../../Redux/Reducer/loadingRedux';
import { logoutRestaurantRedux } from '../../Redux/Reducer/restaurantReducer';
import { logoutUserInfoRedux } from '../../Redux/Reducer/UserinfoReducer';
import { useQueryClient } from '@tanstack/react-query';
import { clearAuthToken } from '../../services/tokenStorage';
import { locationHubService } from '../../services/LocationHubService';
type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'DashboardScreen'
>;
const AccountHomeScreen = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation<NavigationProps>();
  const dispatch = useDispatch();
  const [loggingOut, setLoggingOut] = useState(false);
  const options = [
    { id: 'AccountEditProfileScreen', value: 'Edit Profile' },
    { id: 'AccountTransactionScreen', value: 'Transaction' },
    { id: 'LoyaltyMembershipScreen', value: 'Loyalty Membership' },
    { id: 'TermsConditionsScreen', value: 'Terms & Conditions' },
    { id: 'PrivacyPolicyScreen', value: 'Privacy Policy' },
    { id: 'HelpSupportScreen', value: 'Help & Support' },
    { id: 'DeleteAccountScreen', value: 'Delete Account' },
    { id: 'SignInScreen', value: 'Logout' },
  ];

  // Destructive: clear token/session + reset nav stack. We confirm first so
  // an accidental tap on the last row doesn't blow away the session.
  const performLogout = async () => {
    setLoggingOut(true);
    try {
      await Promise.allSettled([
        clearAuthToken(),
        locationHubService.disconnect(),
      ]);
      dispatch(logoutLoadingRedux());
      dispatch(logoutRestaurantRedux());
      dispatch(logoutUserInfoRedux());
      queryClient.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignInScreen' }],
      });
    } finally {
      setLoggingOut(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Log out?',
      'You will need to sign in again to access your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => {
            void performLogout();
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <WrapperScreen>
      <View
        style={{
          height: 60,
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 20,
        }}
      >
        <CustomText
          style={{
            fontSize: 24,
            fontFamily: Font.textBolder,
            color: '#2A2A2A',
          }}
        >
          Account
        </CustomText>
      </View>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            {options.map((option, index) => {
              const isLogout = option.id === 'SignInScreen';
              const disabled = isLogout && loggingOut;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.option, disabled && { opacity: 0.6 }]}
                  disabled={disabled}
                  onPress={() => {
                    if (isLogout) {
                      confirmLogout();
                    } else {
                      navigation.navigate(option.id as never);
                    }
                  }}
                >
                  <Text style={styles.optionText}>{option.value}</Text>
                  {isLogout && loggingOut ? (
                    <ActivityIndicator size="small" color="#EDAE10" />
                  ) : (
                    <SVG.RightArrow />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
      <Footer isAccount />
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: Font.textSemiBolder,
    marginVertical: 20,
    color: '#000000',
  },
  card: {},
  scrollContent: {
    paddingBottom: 24,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 0.5,
    borderColor: '#FEC400',
    borderRadius: 8,
    marginVertical: 10,
    height: 51,
  },
  optionText: {
    fontSize: 14,
    color: '#000',
  },
  arrow: {
    fontSize: 16,
    color: '#000',
  },
});

export default AccountHomeScreen;
