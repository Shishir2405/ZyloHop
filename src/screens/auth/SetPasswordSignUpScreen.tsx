import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AuthStackParamList } from '.';
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
import { setSignupDraft } from '../../services/signupDraft';
import {
  setPasswordSchema,
  SetPasswordValues,
} from '../../utils/validation/authSchemas';

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'SetPasswordSignUpScreen'
>;

const SetPasswordSignUpScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);

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
    setSignupDraft({ password: values.password });
    navigation.navigate('ProfileScreen');
  };

  useEffect(() => {
    setIsModalVisible(false);
  }, []);

  return (
    <WrapperScreen>
      <Header showBack />
      <View style={styles.container}>
        <View style={styles.header}>
          <Heading>Set password</Heading>
          <CustomText>Set your password</CustomText>
        </View>

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Enter Your Password"
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
        <PasswordStrengthMeter password={passwordValue} />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Confirm Password"
              secureTextEntry={!showConfPassword}
              rightButton={
                <TouchableOpacity onPress={() => setShowConfPassword(v => !v)}>
                  {showConfPassword ? <SVG.ShowEye /> : <SVG.HideEye />}
                </TouchableOpacity>
              }
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        <FormFieldError message={errors.confirmPassword?.message} />

        <CustomText style={styles.passwordHint}>
          At least 1 number or a special character
        </CustomText>

        <SubmitButton
          label="Continue"
          loading={isSubmitting}
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
                Enable your location
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

export default SetPasswordSignUpScreen;
