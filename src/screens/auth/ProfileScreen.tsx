import React, { useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AuthStackParamList } from '.';
import AuthService from '../../services/AuthService';
import { storeUserDetails } from '../../Redux/Reducer/UserinfoReducer';
import { ImageType, SignUpFormPayload } from '../../api/types/authTypes';
import { UserType } from '../../api/types/userTypes';
import { Colors } from '../../common/Theam';
import { SVG } from '../../common/SvgHelper';
import Header from '../../common/Header';
import Input from '../../common/Input';
import CustomText from '../../common/CustomText';
import WrapperScreen from '../../common/WrapperScreen';
import LocationScreen from '../../common/LocationScreen';
import Button from '../../common/Button';

import { errorToast, successToast } from '../../components/toasts';
import { FormFieldError } from '../../components/forms/FormFieldError';
import { SubmitButton } from '../../components/forms/SubmitButton';
import { extractErrorMessage } from '../../utils/helper';
import { getSignupDraft, clearSignupDraft } from '../../services/signupDraft';
import {
  emailSchema,
  nameSchema,
  phoneSchema,
  profileAddressSchema,
} from '../../utils/validation/authSchemas';

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'DashboardScreen'
>;

const profileFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: profileAddressSchema,
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const dispatch = useDispatch();
  const userState: UserType = useSelector(
    (state: any) => state?.Userinfo?.user,
  );
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<ImageType | null>(null);
  const [openLocationModal, setOpenLocationModal] = useState(false);

  // For first-time signup, the form should hydrate from the in-memory
  // signupDraft (which SignUpScreen + SetPasswordSignUpScreen populate),
  // NOT from Redux userState — that slice is empty/stale pre-registration
  // and caused the "phone number gets changed" symptom users reported.
  const draft = getSignupDraft();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: draft.firstName ?? userState?.firstName ?? '',
      lastName: draft.lastName ?? userState?.lastName ?? '',
      email: draft.email ?? userState?.email ?? '',
      phone: draft.phoneNumber ?? userState?.phoneNumber ?? '',
      address: {
        streetAddress: userState?.address?.streetAddress ?? '',
        city: userState?.address?.city ?? '',
        state: userState?.address?.state ?? '',
        zipcode: userState?.address?.zipcode ?? '',
        country: userState?.address?.country ?? '',
        addressLink: userState?.address?.addressLink ?? '',
        addressTitle: userState?.address?.addressTitle ?? '',
      },
    },
  });

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: Platform.OS === 'ios' ? 0.8 : 1,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setImage({
      name: asset.fileName || 'profileImage',
      uri: asset.uri,
      path: asset.uri,
      type: asset.mimeType || 'image/jpeg',
    });
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!image) {
      errorToast('Please add a profile picture');
      return;
    }

    const draft = getSignupDraft();
    const password = draft.password ?? '';
    if (!password.trim()) {
      errorToast('Password is required');
      return;
    }

    const payload: SignUpFormPayload = {
      profilePicture: image,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      userName: `${values.firstName}${values.lastName}${values.phone}`,
      password,
      phoneNumber: values.phone,
      address: {
        streetAddress: values.address.streetAddress,
        city: values.address.city,
        state: values.address.state,
        zipcode: values.address.zipcode,
        country: values.address.country,
        addressLink: values.address.addressLink || '',
        addressTitle: values.address.addressTitle || 'User address',
      },
    };

    // Keep Redux in sync with the validated form values before submitting.
    dispatch(
      storeUserDetails({
        ...userState,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phone,
        address: payload.address,
      }),
    );

    try {
      setLoading(true);
      const response = await AuthService.register(payload);

      if (response?.remote === 'success') {
        clearSignupDraft();
        successToast(response.data.data);
        navigation.navigate('SignInScreen');
      } else {
        errorToast(extractErrorMessage(response));
      }
    } catch {
      errorToast('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WrapperScreen>
      <Header showBack title="Profile" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Picture */}
        <TouchableOpacity
          onPress={handleImagePicker}
          style={styles.profileContainer}
        >
          <View style={styles.profilePicture}>
            <Image
              source={
                image?.path
                  ? { uri: image.path }
                  : require('../../assets/image/other/DefaultImage.jpg')
              }
              style={styles.profilePicture}
            />
            <SVG.CameraIcon style={styles.cameraIcon} />
          </View>
        </TouchableOpacity>

        {/* User Info */}
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="First Name"
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
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        <FormFieldError message={errors.lastName?.message} />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Phone Number"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="phone-pad"
            />
          )}
        />
        <FormFieldError message={errors.phone?.message} />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        <FormFieldError message={errors.email?.message} />

        {/* Address Section */}
        <TouchableOpacity
          onPress={() => setOpenLocationModal(true)}
          style={styles.locationButton}
        >
          <CustomText style={styles.locationText}>
            📍 Tap to fill address using map
          </CustomText>
        </TouchableOpacity>

        <Controller
          control={control}
          name="address.streetAddress"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Street"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        <FormFieldError message={errors.address?.streetAddress?.message} />

        <Controller
          control={control}
          name="address.city"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="City"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        <FormFieldError message={errors.address?.city?.message} />

        <Controller
          control={control}
          name="address.state"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="State"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        <FormFieldError message={errors.address?.state?.message} />

        <Controller
          control={control}
          name="address.country"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Country"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        <FormFieldError message={errors.address?.country?.message} />

        <Controller
          control={control}
          name="address.zipcode"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Zip Code"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="number-pad"
            />
          )}
        />
        <FormFieldError message={errors.address?.zipcode?.message} />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            buttonName="Cancel"
            btnwidth="45%"
            bgcolor="white"
            btncolor="#EDAE10"
            btnborder={1}
            bordercolor="#EDAE10"
            onPress={() => navigation.navigate('SignInScreen')}
          />
          <View style={styles.submitButtonWrap}>
            <SubmitButton
              label="Register"
              loading={isSubmitting || loading}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </View>
      </ScrollView>

      {/* Location Modal */}
      <Modal
        isVisible={openLocationModal}
        animationIn="zoomIn"
        animationOut="zoomOut"
        style={{ marginTop: 0 }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <LocationScreen
            fieldName={'location'}
            setopenLocationModal={setOpenLocationModal}
            setLocationDetails={(details: any) => {
              const current = getValues('address');
              const merged = { ...current, ...details };
              setValue(
                'address',
                {
                  streetAddress: merged?.streetAddress ?? '',
                  city: merged?.city ?? '',
                  state: merged?.state ?? '',
                  zipcode: merged?.zipcode ?? '',
                  country: merged?.country ?? '',
                  addressLink: merged?.addressLink ?? '',
                  addressTitle: merged?.addressTitle ?? '',
                },
                { shouldValidate: true, shouldDirty: true },
              );
              dispatch(
                storeUserDetails({
                  ...userState,
                  address: {
                    ...userState?.address,
                    ...details,
                  },
                }),
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D0D0D0',
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  locationButton: {
    backgroundColor: '#e6f7ff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  locationText: {
    fontSize: 16,
    color: '#007aff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  submitButtonWrap: {
    width: '45%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginTop: 10,
  },
});

export default ProfileScreen;
