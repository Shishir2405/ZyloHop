import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View, ActivityIndicator} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import CustomText from '../../common/CustomText';
import {Font} from '../../common/Theam';
import Header from '../../common/Header';
import {SVG} from '../../common/SvgHelper';
import WrapperScreen from '../../common/WrapperScreen';
import Input from '../../common/Input';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../auth';
import {useNavigation} from '@react-navigation/native';
import {UserType} from '../../api/types/userTypes';
import {useSelector, useDispatch} from 'react-redux';
import {Image as FastImage} from 'expo-image';
import {updateUserApi} from '../../api/userApis';
import {getUserDetailsApi} from '../../api/authApis';
import {errorToast, successToast} from '../../components/toasts';
import {FormFieldError} from '../../components/forms/FormFieldError';
import {FormFieldHelper} from '../../components/forms/FormFieldHelper';
import {SubmitButton} from '../../components/forms/SubmitButton';
import {useApiFormErrors} from '../../hooks/useApiFormErrors';
import {storeUserDetails} from '../../Redux/Reducer/UserinfoReducer';
import {extractErrorMessage} from '../../utils/helper';
import {
  editProfileSchema,
  EditProfileValues,
} from '../../utils/validation/accountSchemas';

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'DashboardScreen'
>;

const AccountEditProfileScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const dispatch = useDispatch();
  const user: UserType = useSelector((state: any) => state?.Userinfo?.user);

  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: {errors, isSubmitting},
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      userName: user?.userName || '',
      phoneNumber: user?.phoneNumber || '',
      email: user?.email || '',
      streetAddress: user?.address?.streetAddress || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipcode: user?.address?.zipcode || '',
      country: user?.address?.country || '',
    },
  });
  const applyApiErrors = useApiFormErrors(setError);

  // Re-seed when user changes (e.g. after fetch)
  useEffect(() => {
    if (user) {
      reset({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        userName: user?.userName || '',
        phoneNumber: user?.phoneNumber || '',
        email: user?.email || '',
        streetAddress: user?.address?.streetAddress || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipcode: user?.address?.zipcode || '',
        country: user?.address?.country || '',
      });
    }
  }, [user, reset]);

  const firstName = watch('firstName');
  const lastName = watch('lastName');

  const onSubmit = async (data: EditProfileValues) => {
    setLoading(true);
    try {
      const response = await updateUserApi({
        firstName: data.firstName,
        lastName: data.lastName,
        userName: data.userName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: {
          streetAddress: data.streetAddress,
          city: data.city,
          state: data.state,
          zipcode: data.zipcode,
          country: data.country,
        },
      });
      if (response.remote === 'success') {
        successToast('Profile updated successfully');
        const userRes = await getUserDetailsApi();
        if (userRes.remote === 'success') {
          const userData = (userRes.data as any)?.data ?? userRes.data;
          dispatch(storeUserDetails(userData));
        }
        navigation.goBack();
      } else {
        if ((response as any)?.fieldErrors) {
          applyApiErrors((response as any).fieldErrors);
        }
        errorToast(extractErrorMessage(response));
      }
    } catch (e: any) {
      errorToast(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WrapperScreen>
      <Header showBack title="Edit Profile" />
      <ScrollView style={styles.container}>
        <View style={styles.profilePictureContainer}>
          <View style={styles.profilePicture}>
            <FastImage
              style={styles.profilePicture}
              source={{uri: user?.profilePicture?.url}}
            />
            <SVG.CameraIcon style={styles.cameraIcon} />
          </View>
          <CustomText style={styles.displayName}>
            {firstName} {lastName}
          </CustomText>
        </View>

        <Controller
          control={control}
          name="firstName"
          render={({field: {value, onChange, onBlur}}) => (
            <Input
              placeholder="First Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.firstName?.message}
            />
          )}
        />
        <FormFieldError message={errors.firstName?.message} />

        <Controller
          control={control}
          name="lastName"
          render={({field: {value, onChange, onBlur}}) => (
            <Input
              placeholder="Last Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.lastName?.message}
            />
          )}
        />
        <FormFieldError message={errors.lastName?.message} />

        <Controller
          control={control}
          name="userName"
          render={({field: {value, onChange, onBlur}}) => (
            <Input
              placeholder="User Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.userName?.message}
            />
          )}
        />
        <FormFieldError message={errors.userName?.message} />
        <FormFieldHelper message="3–30 characters, letters/numbers/dot/underscore" />

        <Controller
          control={control}
          name="phoneNumber"
          render={({field: {value, onChange, onBlur}}) => (
            <Input
              placeholder="Your phone number"
              keyboardType="phone-pad"
              maxLength={15}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.phoneNumber?.message}
            />
          )}
        />
        <FormFieldError message={errors.phoneNumber?.message} />
        <FormFieldHelper message="Include country code, e.g. +1 555…" />

        <Controller
          control={control}
          name="email"
          render={({field: {value, onChange, onBlur}}) => (
            <Input
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
            />
          )}
        />
        <FormFieldError message={errors.email?.message} />

        <CustomText style={styles.sectionLabel}>Address</CustomText>

        <Controller
          control={control}
          name="streetAddress"
          render={({field: {value, onChange, onBlur}}) => (
            <Input
              placeholder="Street Address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.streetAddress?.message}
            />
          )}
        />
        <FormFieldError message={errors.streetAddress?.message} />

        <Controller
          control={control}
          name="city"
          render={({field: {value, onChange, onBlur}}) => (
            <Input
              placeholder="City"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.city?.message}
            />
          )}
        />
        <FormFieldError message={errors.city?.message} />

        <Controller
          control={control}
          name="state"
          render={({field: {value, onChange, onBlur}}) => (
            <Input
              placeholder="State"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.state?.message}
            />
          )}
        />
        <FormFieldError message={errors.state?.message} />

        <Controller
          control={control}
          name="zipcode"
          render={({field: {value, onChange, onBlur}}) => (
            <Input
              placeholder="ZIP / Postal code"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.zipcode?.message}
            />
          )}
        />
        <FormFieldError message={errors.zipcode?.message} />
        <FormFieldHelper message="3–12 characters (digits or letters)" />

        <Controller
          control={control}
          name="country"
          render={({field: {value, onChange, onBlur}}) => (
            <Input
              placeholder="Country"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.country?.message}
            />
          )}
        />
        <FormFieldError message={errors.country?.message} />
      </ScrollView>
      <View style={{paddingHorizontal: 20}}>
        <SubmitButton
          label={loading || isSubmitting ? 'Updating...' : 'Update'}
          loading={loading || isSubmitting}
          onPress={handleSubmit(onSubmit)}
          style={styles.deleteButton as any}
        />
        {(loading || isSubmitting) && (
          <ActivityIndicator style={{marginTop: 5}} color="#EDAE10" />
        )}
      </View>
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 20},
  profilePictureContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 121,
    height: 121,
    borderRadius: 60,
    backgroundColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {position: 'absolute', bottom: 0, right: 0},
  displayName: {
    marginTop: 16,
    fontSize: 24,
    fontFamily: Font.textNormal,
    color: '#5A5A5A',
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
    color: '#0A0203',
    marginTop: 16,
    marginBottom: 4,
  },
  deleteButton: {margin: 20},
});

export default AccountEditProfileScreen;
