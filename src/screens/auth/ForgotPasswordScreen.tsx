import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '.';
import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import Heading from '../../common/Heading';
import Input from '../../common/Input';
import { SVG } from '../../common/SvgHelper';
import WrapperScreen from '../../common/WrapperScreen';
import { errorToast, successToast } from '../../components/toasts';
import { FormFieldError } from '../../components/forms/FormFieldError';
import { SubmitButton } from '../../components/forms/SubmitButton';
import {
  forgotPasswordSchema,
  ForgotPasswordValues,
} from '../../utils/validation/authSchemas';
import { useForgotPasswordSendOtpApi } from '../../data-access/mutations/auth';
import { extractErrorMessage } from '../../utils/helper';

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'ForgotPasswordScreen'
>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const { mutate: sendOtp, isPending } = useForgotPasswordSendOtpApi();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  const onSubmit = (values: ForgotPasswordValues) => {
    const email = values.email.trim();
    sendOtp(email, {
      onSuccess: async response => {
        if (response?.remote === 'success') {
          successToast('OTP sent to your email');
          navigation.navigate('VerificationScreen', { email });
        } else {
          errorToast(extractErrorMessage(response));
        }
      },
      onError: () => {
        errorToast('Something went wrong. Please try again.');
      },
    });
  };

  return (
    <WrapperScreen>
      <Header showBack={true} />

      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Heading>Forgot Password</Heading>
          <CustomText style={styles.subtitle}>
            Enter your registered email address
          </CustomText>
          <CustomText style={styles.subtitle}>
            to receive a verification OTP
          </CustomText>
        </View>

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
              leftButton={<SVG.Msgbox />}
            />
          )}
        />
        <FormFieldError message={errors.email?.message} />
      </View>

      <SubmitButton
        label="Send OTP"
        loading={isSubmitting || isPending}
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
      />
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    height: '70%',
  },
  headerContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  subtitle: {
    color: '#A0A0A0',
    marginTop: 5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: '#FAFAFA',
    marginBottom: 20,
  },
  selectedCard: {
    borderColor: '#EDAE10',
    backgroundColor: '#FFFDE7',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  methodTitle: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 5,
  },
  methodValue: {
    color: '#2A2A2A',
    fontSize: 16,
    fontFamily: 'Font.textSemiBolder',
  },
  button: {
    marginVertical: 20,
  },
});

export default ForgotPasswordScreen;
