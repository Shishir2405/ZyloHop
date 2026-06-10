import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import Textarea from '../../common/Textarea';
import { SubmitButton } from '../../components/forms/SubmitButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  storeSelectedAddress,
  storeUserAddressList,
  storeUserDetails,
} from '../../Redux/Reducer/UserinfoReducer';
import { storeIsLoading } from '../../Redux/Reducer/loadingRedux';
import AuthService from '../../services/AuthService';
import UserService from '../../services/UserService';
import {
  deleteAddressApi,
  getAllUserAddress,
} from '../../api/orderFoodApis';
import { IAddress, UserType } from '../../api/types/userTypes';
import AddressCard from '../../common/AddressCard';
import Button from '../../common/Button';
import CustomText from '../../common/CustomText';
import Footer from '../../common/Footer';
import Header from '../../common/Header';
import Heading from '../../common/Heading';
import { SingleLineComponent } from '../../common/HelperComponent';
import PopUp from '../../common/PopUp';
import AddressSkeleton from '../../common/Skeleton/AddressSkeleton';
import { SVG } from '../../common/SvgHelper';
import { Font } from '../../common/Theam';
import { errorToast, infoToast, successToast } from '../../components/toasts';
import { extractErrorMessage } from '../../utils/helper';
import { AuthStackParamList } from '../auth';
import LottieView from 'lottie-react-native';
type NavigationProps = StackNavigationProp<AuthStackParamList, 'Address'>;
const Address = () => {
  const navigation = useNavigation<NavigationProps>();
  const dispatch = useDispatch();
  const isfocused = useIsFocused();
  const user: UserType = useSelector((state: any) => state?.Userinfo?.user);
  const loading: any = useSelector((state: any) => state.loading.isLoading);
  const [specialInstruction, setspecialInstruction] = useState('');

  const { selectedAddress, userAddressList } = useSelector(
    (state: any) => state.Userinfo,
  );

  const [isModalVisible, setisModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const handleGetUserDetails = async () => {
    try {
      const response = await UserService.getUserProfile();
      if (response?.remote === 'success') {
        dispatch(storeUserDetails(response?.data.data));
      } else if (response?.errors?.status === 401) {
        navigation.reset({ index: 0, routes: [{ name: 'SignInScreen' }] });
      }
    } finally {
      dispatch(storeIsLoading(false));
    }
  };

  const handleSendOtpToMail = async () => {
    if (!user?.email) {
      errorToast('No email on file. Please update your profile first.');
      return;
    }
    try {
      setSendingOtp(true);
      const response = await AuthService.sendOtpToMail(user.email);
      if (response?.remote !== 'success') {
        errorToast(extractErrorMessage(response));
      }
    } finally {
      setSendingOtp(false);
      dispatch(storeIsLoading(false));
    }
  };

  // Closing the email-verify modal must blur the OtpInput first. RN 0.81 +
  // react-native-modal@14.0.0-rc.1 + React 19 will hard-crash on Android if
  // the modal animates out while a focused TextInput inside it unmounts.
  const closeOtpModal = () => {
    Keyboard.dismiss();
    setOtp('');
    setisModalVisible(false);
  };

  const handleConfirmOtp = async () => {
    if (otp?.length !== 6) {
      infoToast('Invalid OTP');
      return;
    }
    if (!user?.email) {
      errorToast('No email on file. Please update your profile first.');
      return;
    }
    try {
      setVerifyingOtp(true);
      const response = await AuthService.confirmEmail(user.email, otp);
      if (response?.remote === 'success') {
        await handleGetUserDetails();
        closeOtpModal();
      } else {
        errorToast(extractErrorMessage(response));
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleGetAllUserAddress = async () => {
    try {
      dispatch(storeIsLoading(true));
      const response = await getAllUserAddress();
      if (response.remote === 'success') {
        dispatch(storeUserAddressList(response.data.data));
      } else if (response?.errors?.status === 401) {
        navigation.reset({ index: 0, routes: [{ name: 'SignInScreen' }] });
      }
    } finally {
      dispatch(storeIsLoading(false));
    }
  };

  const handleDeleteAddressApi = async (addressId: string) => {
    if (!addressId) return;
    const response = await deleteAddressApi(addressId);
    if (response.remote === 'success') {
      await handleGetAllUserAddress();
      successToast('Address deleted successfully!');
      return;
    }
    if (response?.errors?.status === 401) {
      navigation.reset({ index: 0, routes: [{ name: 'SignInScreen' }] });
    }
    errorToast(extractErrorMessage(response));
  };

  const proceedToPayment = () => {
    if (!selectedAddress?.id) {
      errorToast('Please select an address to continue.');
      return;
    }
    navigation.navigate('Payment', {
      specialInstruction: specialInstruction?.trim(),
    });
  };

  useEffect(() => {
    if (isfocused) {
      handleGetAllUserAddress();
    }
  }, [isfocused]);
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack title={'Address '} />

      <View style={styles.container}>
        {userAddressList?.length != 0 && userAddressList && (
          <View>
            <Textarea
              label="Special Instructions (optional)"
              value={specialInstruction}
              onChangeText={setspecialInstruction}
              placeholder="Enter your delivery instructions"
              maxLength={300}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>
          {loading ? (
            <AddressSkeleton />
          ) : (
            <FlatList
              data={userAddressList || []}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) =>
                item.id?.toString() ?? `address-${index}`
              }
              renderItem={({ item }: { item: IAddress }) => (
                <AddressCard
                  address={item}
                  onDelete={() => handleDeleteAddressApi(item?.id || '')}
                  isSelected={selectedAddress?.id === item.id}
                  onSelect={() => dispatch(storeSelectedAddress(item))}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <LottieView
                    source={require('../../assets/no_Data_found_lottie.json')}
                    autoPlay
                    loop
                    style={{ width: 260, height: 260, marginBottom: 16 }}
                  />

                  <CustomText style={styles.emptyTitle}>
                    No address found
                  </CustomText>

                  <CustomText style={styles.emptySubtitle}>
                    Please add an address to continue
                  </CustomText>
                </View>
              }
            />
          )}
        </View>
        {(!userAddressList || userAddressList.length === 0) && (
          <CustomText style={styles.ctaInline}>
            Add an address to continue
          </CustomText>
        )}
        {userAddressList &&
          userAddressList.length > 0 &&
          !selectedAddress?.id && (
            <CustomText style={styles.ctaInline}>
              Select a delivery address to continue
            </CustomText>
          )}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button
            buttonName={'Add Address'}
            btnwidth={'48%'}
            bgcolor="grey"
            onPress={() => {
              navigation.navigate('AddAddress', {});
            }}
            style={{ marginVertical: 10 }}
          />

          <Button
            buttonName={'Continue to Pay'}
            btnwidth={'48%'}
            disabled={
              !userAddressList ||
              userAddressList.length === 0 ||
              !selectedAddress?.id
            }
            onPress={() => {
              if (!userAddressList || userAddressList?.length === 0) {
                errorToast('Please add an address to continue');
                return;
              }
              if (!selectedAddress?.id) {
                errorToast('Please select an address to continue.');
                return;
              }

              if (user?.emailVerified) {
                proceedToPayment();
              } else {
                handleSendOtpToMail();
                setisModalVisible(true);
              }
            }}
            style={{ marginVertical: 10 }}
          />
        </View>
      </View>
      <Footer isHome />

      {/* email verify pop up */}
      <PopUp
        isModalVisible={isModalVisible}
        setIsModalVisible={(visible: boolean) => {
          if (!visible) {
            closeOtpModal();
          } else {
            setisModalVisible(true);
          }
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
          }}
        >
          <View style={{}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity onPress={closeOtpModal}>
                <SVG.CrossIcon />
              </TouchableOpacity>
            </View>
            <View style={styles.header}>
              <Heading>Verify via otp for Place order</Heading>
              <CustomText>Enter your OTP code</CustomText>
            </View>
            <View style={styles.otpContainer}>
              <OtpInput
                numberOfDigits={6}
                theme={{
                  pinCodeContainerStyle: styles.otpInputContainer,
                  pinCodeTextStyle: styles.otpInputText,
                  filledPinCodeContainerStyle: styles.filledinput,
                }}
                onTextChange={text => {
                  setOtp(text);
                }}
                textInputProps={{
                  returnKeyType: 'done',
                }}
              />
            </View>
            <SingleLineComponent
              style={styles.resendContainer}
              text1="Didn’t receive code? "
              text2="Resend again"
              text1Click={() => {
                handleSendOtpToMail();
              }}
            />
            <SubmitButton
              label="Verify"
              loading={verifyingOtp || sendingOtp}
              disabled={otp.length !== 6}
              onPress={handleConfirmOtp}
              style={styles.verifyButton}
            />
          </View>
        </View>
      </PopUp>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  username: {
    color: '#101010',
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
  },
  address: {
    color: '#1E1E1E',
    fontSize: 15,
    fontFamily: Font.textSemiBolder,
    marginVertical: 10,
  },
  identity: {
    color: '#1E1E1E',
    fontSize: 13,
    fontFamily: Font.textSemiBolder,
  },
  changebutton: {
    color: '#CF8600',
    fontSize: 16,
    fontFamily: Font.textSemiBolder,
    textAlign: 'center',
    marginVertical: 15,
  },
  delivertext: {
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
    marginVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  valuettext: {
    color: '#101010',
    fontSize: 16,
    fontFamily: Font.textBolder,
    marginBottom: 15,
  },
  valuetitle: {
    color: '#101010',
    fontSize: 16,
    fontFamily: Font.textSemiBolder,
  },
  flexrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  container: {
    marginHorizontal: 10,
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpContainer: {
    width: '100%',
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInputContainer: {
    width: 50,
    height: 48,
  },
  otpInputText: {
    fontFamily: Font.textBolder,
    fontSize: 16,
    color: '#414141',
  },
  resendContainer: {
    marginVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  verifyButton: {
    marginVertical: 20,
  },
  filledinput: {
    backgroundColor: '#FFFDE7',
    borderColor: '#F6CD56',
    borderWidth: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  lottie: {
    width: 260,
    height: 260,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
  ctaInline: {
    color: '#CF8600',
    fontSize: 13,
    fontFamily: Font.textSemiBolder,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default Address;
