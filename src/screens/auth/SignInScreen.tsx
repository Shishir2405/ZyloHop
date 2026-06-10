import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '.';
import { storeUserDetails } from '../../Redux/Reducer/UserinfoReducer';
import { storeIsLoading } from '../../Redux/Reducer/loadingRedux';
import { SignInPayload } from '../../api/types/authTypes';
import AuthService from '../../services/AuthService';
import UserService from '../../services/UserService';
import CommonScrollView from '../../common/CommonScrollView';
import CustomText from '../../common/CustomText';
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
  signInSchema,
  SignInValues,
} from '../../utils/validation/authSchemas';
import {
  isAppleSignInSupported,
  signInWithApple,
  signInWithGoogle,
} from '../../services/SocialAuthService';
import { extractErrorMessage } from '../../utils/helper';

type NavigationProps = StackNavigationProp<AuthStackParamList, 'SignInScreen'>;

const SignInScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const dispatch = useDispatch();
  const isLoading: any = useSelector((state: any) => state.loading.isLoading);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onTouched',
    defaultValues: { identifier: '', password: '' },
  });

  const handleGetUserDetails = async () => {
    const response = await UserService.getUserProfile();
    if (response?.remote === 'success') {
      dispatch(storeUserDetails(response?.data.data));
      navigation.reset({
        index: 0,
        routes: [{ name: 'DashboardScreen' }],
      });
    } else {
      errorToast(extractErrorMessage(response));
    }
  };

  const onSubmit = async (values: SignInValues) => {
    try {
      const { identifier, password } = values;
      const payload: SignInPayload = identifier.includes('@')
        ? { email: identifier, password }
        : { phoneNumber: identifier, password };

      dispatch(storeIsLoading(true));

      const response = await AuthService.login(payload);

      if (response?.remote === 'success') {
        successToast('Login successful.');
        await handleGetUserDetails();
      } else {
        errorToast(extractErrorMessage(response));
      }
    } catch {
      errorToast('Something went wrong while signing in. Please try again.');
    } finally {
      dispatch(storeIsLoading(false));
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      const outcome = await signInWithGoogle();
      if (outcome.success) {
        successToast('Signed in with Google.');
        await handleGetUserDetails();
      } else if (!outcome.cancelled) {
        errorToast(outcome.error || 'Google sign-in failed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (appleLoading) return;
    setAppleLoading(true);
    try {
      const outcome = await signInWithApple();
      if (outcome.success) {
        successToast('Signed in with Apple.');
        await handleGetUserDetails();
      } else if (!outcome.cancelled) {
        errorToast(outcome.error || 'Apple sign-in failed.');
      }
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <WrapperScreen>
      <Header
        showBack
        title="Sign In"
        onLeftPress={() => navigation.navigate('WelcomeScreen')}
      />
      <CommonScrollView>
        <View style={styles.container}>
          <Heading style={styles.heading}>Sign in</Heading>
          <Controller
            control={control}
            name="identifier"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Email or Phone Number"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <FormFieldError message={errors.identifier?.message} />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Password"
                maxLength={20}
                secureTextEntry={!showPassword}
                rightButton={
                  <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                    {showPassword ? <SVG.ShowEye /> : <SVG.HideEye />}
                  </TouchableOpacity>
                }
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <FormFieldError message={errors.password?.message} />
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPasswordScreen')}
          >
            <CustomText style={styles.forgotPasswordText}>
              Forget password?
            </CustomText>
          </TouchableOpacity>
          <SubmitButton
            label="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting || isLoading}
            style={styles.signInButton}
          />
          <View style={styles.extraOptions}>
            <SocialAuthButton
              provider="google"
              onPress={handleGoogleSignIn}
              loading={googleLoading}
              disabled={appleLoading}
            />
            {isAppleSignInSupported() && (
              <SocialAuthButton
                provider="apple"
                onPress={handleAppleSignIn}
                loading={appleLoading}
                disabled={googleLoading}
              />
            )}
            <SingleLineComponent
              text1="Already have an account? "
              text2="Sign Up"
              text1Click={() => navigation.navigate('SignUpScreen')}
            />
          </View>
        </View>
      </CommonScrollView>
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
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#F44336',
    fontFamily: 'Font.textSemiBolder',
  },
  signInButton: {
    marginVertical: 20,
  },
  extraOptions: {
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
  },
});

export default SignInScreen;
