import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '.';
import { storeIsLoading } from '../../Redux/Reducer/loadingRedux';
import { setSignupDraft } from '../../services/signupDraft';
import CommonScrollView from '../../common/CommonScrollView';
import Header from '../../common/Header';
import Heading from '../../common/Heading';
import { SingleLineComponent } from '../../common/HelperComponent';
import Input from '../../common/Input';
import SocialAuthButton from '../../common/SocialAuthButton';
import { SVG } from '../../common/SvgHelper';
import WrapperScreen from '../../common/WrapperScreen';
import { errorToast, successToast } from '../../components/toasts';
import { FormFieldError } from '../../components/forms/FormFieldError';
import { SubmitButton } from '../../components/forms/SubmitButton';
import {
  signUpSchema,
  SignUpValues,
} from '../../utils/validation/authSchemas';
import { extractErrorMessage } from '../../utils/helper';
import AuthService from '../../services/AuthService';
import {
  isAppleSignInSupported,
  signInWithApple,
  signInWithGoogle,
} from '../../services/SocialAuthService';
import PopUp from '../../common/PopUp';
import { Font } from '../../common/Theam';
import { OtpInput } from 'react-native-otp-entry';
import CustomText from '../../common/CustomText';
import Button from '../../common/Button';
import { useSelector } from 'react-redux';

type NavigationProps = StackNavigationProp<AuthStackParamList, 'SignUpScreen'>;

const SignUpScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProps>();
  const isLoading: any = useSelector((state: any) => state.loading.isLoading);
  const [isModalVisible, setisModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      userName: '',
    },
  });

  const handleGoogleSignUp = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      const outcome = await signInWithGoogle();
      if (outcome.success) {
        successToast('Signed in with Google.');
        navigation.reset({ index: 0, routes: [{ name: 'DashboardScreen' }] });
      } else if (!outcome.cancelled) {
        errorToast(outcome.error || 'Google sign-in failed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    if (appleLoading) return;
    setAppleLoading(true);
    try {
      const outcome = await signInWithApple();
      if (outcome.success) {
        successToast('Signed in with Apple.');
        navigation.reset({ index: 0, routes: [{ name: 'DashboardScreen' }] });
      } else if (!outcome.cancelled) {
        errorToast(outcome.error || 'Apple sign-in failed.');
      }
    } finally {
      setAppleLoading(false);
    }
  };

  const handleConfirmOtp = async () => {
    const email = getValues('email');
    const response = await AuthService.confirmEmail(email, otp);
    if (response?.remote === 'success') {
      successToast(response.data.data);
    } else {
      errorToast(extractErrorMessage(response));
    }
  };

  const onSubmit = async (values: SignUpValues) => {
    setSignupDraft({
      firstName: values.firstName,
      lastName: values.lastName,
      userName: values.userName,
      email: values.email,
      phoneNumber: values.phone,
    });

    dispatch(storeIsLoading(true));
    try {
      const response = await AuthService.sendOtpToMail(values.email.trim());
      if (response?.remote === 'success') {
        successToast(response.data.data);
        navigation.navigate('VerificationScreen', {
          email: values.email.trim(),
          isSignUp: true,
        });
      } else {
        errorToast(extractErrorMessage(response));
      }
    } catch {
      errorToast('Something went wrong. Please try again.');
    } finally {
      dispatch(storeIsLoading(false));
    }
  };

  return (
    <WrapperScreen>
      <Header
        showBack
        title="Sign Up"
        onLeftPress={() => navigation.navigate('WelcomeScreen')}
      />
      <CommonScrollView>
        <View style={styles.container}>
          <Heading style={styles.heading}>Sign up</Heading>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="First Name"
                keyboardType="default"
                maxLength={50}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <FormFieldError message={errors.firstName?.message} />
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Last Name"
                keyboardType="default"
                maxLength={50}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <FormFieldError message={errors.lastName?.message} />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Email"
                keyboardType="email-address"
                maxLength={100}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <FormFieldError message={errors.email?.message} />
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Your phone number"
                keyboardType="phone-pad"
                maxLength={16}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <FormFieldError message={errors.phone?.message} />
          <Controller
            control={control}
            name="userName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Username"
                keyboardType="default"
                maxLength={50}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <FormFieldError message={errors.userName?.message} />
          <View style={styles.privacyPolicy}>
            <SVG.PrivacyPolicyText />
          </View>
          <SubmitButton
            label="Continue"
            loading={isSubmitting || isLoading}
            onPress={handleSubmit(onSubmit)}
            style={styles.signUpButton}
          />
          <View style={styles.footer}>
            <SocialAuthButton
              provider="google"
              onPress={handleGoogleSignUp}
              loading={googleLoading}
              disabled={appleLoading}
            />
            {isAppleSignInSupported() && (
              <SocialAuthButton
                provider="apple"
                onPress={handleAppleSignUp}
                loading={appleLoading}
                disabled={googleLoading}
              />
            )}
            <SingleLineComponent
              text1="Already have an account? "
              text2="Sign in"
              text1Click={() => navigation.navigate('SignInScreen')}
            />
          </View>
        </View>
      </CommonScrollView>
      {/* email verify pop up */}
      <PopUp
        isModalVisible={isModalVisible}
        setIsModalVisible={setisModalVisible}
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
              <TouchableOpacity
                onPress={async () => {
                  setisModalVisible(false);
                }}
              >
                <SVG.CrossIcon />
              </TouchableOpacity>
            </View>
            <View style={styles.header}>
              <Heading>Verify via otp for sign up</Heading>
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
            />
            <Button
              buttonName="Verify"
              btnwidth="100%"
              onPress={() => handleConfirmOtp()}
              style={styles.verifyButton}
            />
          </View>
        </View>
      </PopUp>
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    height: '80%',
  },
  heading: {
    marginBottom: 10,
  },
  header: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyPolicy: {
    marginVertical: 10,
  },
  signUpButton: {
    marginVertical: 20,
  },
  footer: {
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
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
});

export default SignUpScreen;
