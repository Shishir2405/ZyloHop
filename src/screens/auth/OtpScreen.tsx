import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import { AuthStackParamList, OtpScreenParam } from '.';
import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import Heading from '../../common/Heading';
import { SingleLineComponent } from '../../common/HelperComponent';
import { Font } from '../../common/Theam';
import WrapperScreen from '../../common/WrapperScreen';
import { FormFieldError } from '../../components/forms/FormFieldError';
import { SubmitButton } from '../../components/forms/SubmitButton';
import {
  verifyOtpSchema,
  VerifyOtpValues,
} from '../../utils/validation/authSchemas';

type MessageRequestDetailsRouteParam = RouteProp<
  AuthStackParamList,
  'OtpScreen'
>;
type NavigationProps = StackNavigationProp<AuthStackParamList, 'OtpScreen'>;

const OtpScreen: React.FC<OtpScreenParam> = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<MessageRequestDetailsRouteParam>();
  const pagename = route.params?.page;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    mode: 'onSubmit',
    defaultValues: { otp: '' },
  });

  const onSubmit = (_values: VerifyOtpValues) => {
    navigation.navigate(
      pagename == 'signin' ? 'DashboardScreen' : 'SetPasswordSignUpScreen',
    );
  };

  return (
    <WrapperScreen>
      <Header showBack />
      <View style={styles.container}>
        <View style={styles.header}>
          <Heading>
            {pagename == 'signin'
              ? 'Verify via otp for signin'
              : ' Phone or Email verification'}
          </Heading>
          <CustomText>Enter your OTP code</CustomText>
        </View>
        <View style={styles.otpContainer}>
          <Controller
            control={control}
            name="otp"
            render={({ field: { onChange } }) => (
              <OtpInput
                numberOfDigits={6}
                placeholder="•"
                onTextChange={(code: string) => onChange(code)}
                theme={{
                  pinCodeContainerStyle: styles.otpInputContainer,
                  pinCodeTextStyle: styles.otpInputText,
                  focusedPinCodeContainerStyle: styles.otpInputFocused,
                  filledPinCodeContainerStyle: styles.filledinput,
                  placeholderTextStyle: styles.otpPlaceholderText,
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
        <SingleLineComponent
          style={styles.resendContainer}
          text1="Didn’t receive code? "
          text2="Resend again"
        />
        <SubmitButton
          label="Verify"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid}
          style={styles.verifyButton}
        />
      </View>
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  filledinput: {
    backgroundColor: '#FFFDE7',
    borderColor: '#F6CD56',
    borderWidth: 1,
  },
  container: {
    margin: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    height: '80%',
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
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D6D9DE',
    backgroundColor: '#FFFFFF',
  },
  otpInputFocused: {
    borderColor: '#EDAE10',
    borderWidth: 2,
  },
  otpInputText: {
    fontFamily: Font.textBolder,
    fontSize: 22,
    color: '#101010',
  },
  otpPlaceholderText: {
    fontFamily: Font.textNormal,
    fontSize: 22,
    color: '#9CA3AF',
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
});

export default OtpScreen;
