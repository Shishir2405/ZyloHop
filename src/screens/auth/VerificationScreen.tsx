import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import { useDispatch } from 'react-redux';
import { AuthStackParamList, ForgotPasswordParam } from '.';
import AuthService from '../../services/AuthService';
import { storeIsLoading } from '../../Redux/Reducer/loadingRedux';
import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import Heading from '../../common/Heading';
import { Font } from '../../common/Theam';
import WrapperScreen from '../../common/WrapperScreen';
import { FormFieldError } from '../../components/forms/FormFieldError';
import { SubmitButton } from '../../components/forms/SubmitButton';
import { errorToast, successToast } from '../../components/toasts';
import {
  useForgotPasswordSendOtpApi,
  useForgotPasswordVerifyOtpApi,
} from '../../data-access/mutations/auth';
import { extractErrorMessage } from '../../utils/helper';
import {
  verifyOtpSchema,
  VerifyOtpValues,
} from '../../utils/validation/authSchemas';

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'VerificationScreen'
>;
type ForgotPasswordRouteParam = RouteProp<
  AuthStackParamList,
  'VerificationScreen'
>;

const RESEND_COOLDOWN_SECONDS = 30;

const VerificationScreen: React.FC<ForgotPasswordParam> = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<ForgotPasswordRouteParam>();
  const email = route.params?.email;
  const isSignUp = route.params?.isSignUp;
  const dispatch = useDispatch();

  const { mutate: verifyOtp, isPending: isVerifyPending } =
    useForgotPasswordVerifyOtpApi();
  const { mutate: sendOtp, isPending: isSendPending } =
    useForgotPasswordSendOtpApi();

  const [resendCountdown, setResendCountdown] = useState<number>(
    RESEND_COOLDOWN_SECONDS,
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setResendCountdown(RESEND_COOLDOWN_SECONDS);
    intervalRef.current = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startCooldown();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    mode: 'onSubmit',
    defaultValues: { otp: '' },
  });

  const onSubmit = async (values: VerifyOtpValues) => {
    const otp = values.otp;
    if (!email?.trim()) {
      errorToast('Email or Phone is required.');
      return;
    }

    if (isSignUp) {
      dispatch(storeIsLoading(true));
      try {
        const response = await AuthService.confirmEmail(email, otp);
        if (response?.remote === 'success') {
          successToast('Email verified successfully');
          // The signup flow collects the password on a dedicated screen
          // BEFORE the profile/address step. Previously this routed straight
          // to ProfileScreen, which then failed at register time with
          // "Password is required" because signupDraft.password was never set.
          navigation.navigate('SetPasswordSignUpScreen');
        } else {
          errorToast(extractErrorMessage(response));
        }
      } catch {
        errorToast('Something went wrong. Please try again.');
      } finally {
        dispatch(storeIsLoading(false));
      }
    } else {
      verifyOtp(
        { email, otp },
        {
          onSuccess: async response => {
            if (response?.remote === 'success') {
              successToast('Otp Verified Successfully');
              navigation.navigate('SetPasswordForgotScreen', { email });
            } else {
              errorToast(extractErrorMessage(response));
            }
          },
          onError: () => {
            errorToast('Something went wrong. Please try again.');
          },
        },
      );
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) {
      return;
    }
    if (!email?.trim()) {
      errorToast('Email or Phone is required.');
      return;
    }

    if (isSignUp) {
      dispatch(storeIsLoading(true));
      try {
        const response = await AuthService.sendOtpToMail(email);
        if (response?.remote === 'success') {
          successToast('Otp Sent Successfully');
          startCooldown();
        } else {
          errorToast(extractErrorMessage(response));
        }
      } catch {
        errorToast('Something went wrong. Please try again.');
      } finally {
        dispatch(storeIsLoading(false));
      }
    } else {
      sendOtp(email, {
        onSuccess: async response => {
          if (response?.remote === 'success') {
            successToast('Otp Sent Successfully');
            startCooldown();
          } else {
            errorToast(extractErrorMessage(response));
          }
        },
        onError: () => {
          errorToast('Something went wrong. Please try again.');
        },
      });
    }
  };

  const isResendDisabled = resendCountdown > 0 || isSendPending;

  return (
    <WrapperScreen>
      <Header showBack={true} />

      {/* Main content */}
      <View style={styles.container}>
        {/* Heading and OTP instruction */}
        <View style={styles.headerContainer}>
          <Heading>
            {isSignUp ? 'Phone Verification' : 'Forgot Password'}
          </Heading>
          <CustomText>Code has been sent to {email}</CustomText>
        </View>

        {/* OTP Input field */}
        <View style={styles.otpInputContainer}>
          <Controller
            control={control}
            name="otp"
            render={({ field: { onChange } }) => (
              <OtpInput
                numberOfDigits={6}
                placeholder="•"
                onTextChange={(code: string) => onChange(code)}
                theme={{
                  pinCodeContainerStyle: {
                    width: 48,
                    height: 56,
                    borderRadius: 12,
                    borderColor: '#D6D9DE',
                    borderWidth: 1,
                    backgroundColor: '#FFFFFF',
                  },
                  focusedPinCodeContainerStyle: {
                    borderColor: '#EDAE10',
                    borderWidth: 2,
                  },
                  pinCodeTextStyle: {
                    fontFamily: Font.textBolder,
                    fontSize: 22,
                    color: '#101010',
                  },
                  placeholderTextStyle: {
                    fontFamily: Font.textNormal,
                    fontSize: 22,
                    color: '#9CA3AF',
                  },
                }}
                textInputProps={{
                  returnKeyType: 'done',
                  keyboardType: 'number-pad',
                }}
              />
            )}
          />
          <FormFieldError message={errors.otp?.message} />
        </View>

        {/* Resend OTP option with cooldown */}
        <View style={styles.resendContainer}>
          <CustomText>Didn’t receive code? </CustomText>
          <Pressable
            disabled={isResendDisabled}
            onPress={handleResendOtp}
            hitSlop={8}
          >
            <CustomText
              style={[
                styles.resendLink,
                isResendDisabled && styles.resendLinkDisabled,
              ]}
            >
              {resendCountdown > 0
                ? `Resend in ${resendCountdown}s`
                : 'Resend again'}
            </CustomText>
          </Pressable>
        </View>

        {/* Verify button */}
        <SubmitButton
          label="Verify"
          loading={isSubmitting || isVerifyPending}
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid}
          style={styles.verifyButton}
        />
      </View>
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
  headerContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInputContainer: {
    width: '100%',
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendContainer: {
    marginVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  resendLink: {
    color: '#EDAE10',
    fontFamily: Font.textSemiBolder,
  },
  resendLinkDisabled: {
    color: '#A0A0A0',
  },
  verifyButton: {
    marginVertical: 20,
  },
});

export default VerificationScreen;
