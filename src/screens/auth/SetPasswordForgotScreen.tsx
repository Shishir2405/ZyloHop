import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AuthStackParamList, ForgotPasswordParam } from '.';
import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import Heading from '../../common/Heading';
import Input from '../../common/Input';
import PopUp from '../../common/PopUp';
import { SVG } from '../../common/SvgHelper';
import { Font } from '../../common/Theam';
import WrapperScreen from '../../common/WrapperScreen';
import { FormFieldError } from '../../components/forms/FormFieldError';
import { PasswordStrengthMeter } from '../../components/forms/PasswordStrengthMeter';
import { SubmitButton } from '../../components/forms/SubmitButton';
import { errorToast } from '../../components/toasts';
import { useResetPasswordApi } from '../../data-access/mutations/auth';
import { extractErrorMessage } from '../../utils/helper';
import {
  setPasswordSchema,
  SetPasswordValues,
} from '../../utils/validation/authSchemas';

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'SetPasswordForgotScreen'
>;
type ForgotPasswordRouteParam = RouteProp<
  AuthStackParamList,
  'SetPasswordForgotScreen'
>;

const SetPasswordForgotScreen: React.FC<ForgotPasswordParam> = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<ForgotPasswordRouteParam>();
  const email = route.params?.email;
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { mutate: resetPassword, isPending } = useResetPasswordApi();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
    mode: 'onTouched',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const passwordValue = watch('password');

  const onSubmit = (values: SetPasswordValues) => {
    if (!email || email.trim() === '') {
      errorToast('Email is required.');
      return;
    }
    resetPassword(
      {
        email,
        newPassword: values.password,
        confirmPassword: values.confirmPassword,
      },
      {
        onSuccess: async response => {
          if (response?.remote === 'success') {
            setIsModalVisible(true);
            setTimeout(() => {
              setIsModalVisible(false);
              navigation.navigate('SignInScreen');
            }, 3000);
          } else {
            errorToast(extractErrorMessage(response));
          }
        },
        onError: () => {
          errorToast('Something went wrong. Please try again.');
        },
      },
    );
  };

  return (
    <WrapperScreen>
      <Header showBack />
      <View style={styles.container}>
        <View style={styles.header}>
          <Heading>Set New password</Heading>
          <CustomText>Set your new password</CustomText>
        </View>

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Enter Your Password"
              secureTextEntry={!showNew}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              rightButton={
                <TouchableOpacity onPress={() => setShowNew(v => !v)}>
                  {showNew ? <SVG.ShowEye /> : <SVG.HideEye />}
                </TouchableOpacity>
              }
            />
          )}
        />
        <FormFieldError message={errors.password?.message} />
        <PasswordStrengthMeter password={passwordValue} />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Confirm Password"
              secureTextEntry={!showConfirm}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              rightButton={
                <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <SVG.ShowEye /> : <SVG.HideEye />}
                </TouchableOpacity>
              }
            />
          )}
        />
        <FormFieldError message={errors.confirmPassword?.message} />

        <CustomText style={styles.passwordHint}>
          Atleast 1 number or a special character
        </CustomText>

        <SubmitButton
          label="Reset Password"
          loading={isSubmitting || isPending}
          onPress={handleSubmit(onSubmit)}
          style={styles.registerButton}
        />

        <PopUp
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
        >
          <View style={styles.modalContent}>
            <SVG.GreenTick />
            <View style={styles.modalTextContainer}>
              <CustomText style={styles.modalHeading}>
                Congratulations
              </CustomText>
              <CustomText style={styles.modalDescription}>
                Your account is ready to use. You will be {'\n'}
                redirected to the Home Page in a few {'\n'}
                seconds.
              </CustomText>
            </View>
          </View>
        </PopUp>
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
  header: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  passwordHint: {
    fontSize: 12,
    marginVertical: 10,
  },
  registerButton: {
    marginVertical: 20,
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 30,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    textAlign: 'center',
  },
  modalHeading: {
    fontFamily: Font.textSemiBolder,
    color: '#2A2A2A',
    fontSize: 22,
  },
  modalDescription: {
    fontSize: 12,
    fontFamily: Font.textBolder,
    color: '#A0A0A0',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 18,
  },
});

export default SetPasswordForgotScreen;
