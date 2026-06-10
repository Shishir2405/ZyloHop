import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { storeIsLoading } from '../../Redux/Reducer/loadingRedux';
import { addUserAddress } from '../../api/orderFoodApis';
import { IAddress } from '../../api/types/userTypes';
import Button from '../../common/Button';
import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import Input from '../../common/Input';
import LocationScreen from '../../common/LocationScreen';
import { Colors, Font } from '../../common/Theam';
import { errorToast, successToast } from '../../components/toasts';
import { FormFieldError } from '../../components/forms/FormFieldError';
import { FormFieldHelper } from '../../components/forms/FormFieldHelper';
import { SubmitButton } from '../../components/forms/SubmitButton';
import { useApiFormErrors } from '../../hooks/useApiFormErrors';
import { extractErrorMessage } from '../../utils/helper';
import {
  deliveryAddressSchema,
  DeliveryAddressValues,
} from '../../utils/validation/commonSchemas';
import { AddAddressParam, AuthStackParamList } from '../auth';
type NavigationProps = StackNavigationProp<AuthStackParamList, 'AddAddress'>;
type AddAddressRouteParam = RouteProp<AuthStackParamList, 'AddAddress'>;
const AddAddress: React.FC<AddAddressParam> = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<AddAddressRouteParam>();

  const dispatch = useDispatch();

  const loading: any = useSelector((state: any) => state.loading.isLoading);
  const [openLocationModal, setopenLocationModal] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<boolean>(false);
  const [locationDetails, setLocationDetails] = useState<IAddress>({
    streetAddress: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    addressLink: '',
  });

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DeliveryAddressValues>({
    resolver: zodResolver(deliveryAddressSchema),
    mode: 'onTouched',
    defaultValues: {
      addressTitle: '',
      streetAddress: '',
      country: '',
      state: '',
      city: '',
      zipcode: '',
      addressLink: '',
    },
  });
  const applyApiErrors = useApiFormErrors(setError);

  useEffect(() => {
    if (locationDetails) {
      if (locationDetails.streetAddress)
        setValue('streetAddress', locationDetails.streetAddress, {
          shouldValidate: true,
        });
      if (locationDetails.country)
        setValue('country', locationDetails.country, { shouldValidate: true });
      if (locationDetails.state)
        setValue('state', locationDetails.state, { shouldValidate: true });
      if (locationDetails.city)
        setValue('city', locationDetails.city, { shouldValidate: true });
      if (locationDetails.zipcode)
        setValue('zipcode', locationDetails.zipcode, { shouldValidate: true });
      if (locationDetails.addressLink)
        setValue('addressLink', locationDetails.addressLink);
    }
  }, [locationDetails, setValue]);

  useEffect(() => {
    if (route.params?.initialValue) {
      setEditingAddress(true);
      const v = route.params.initialValue as IAddress;
      reset({
        addressTitle: v.addressTitle ?? '',
        streetAddress: v.streetAddress ?? '',
        country: v.country ?? '',
        state: v.state ?? '',
        city: v.city ?? '',
        zipcode: v.zipcode ?? '',
        addressLink: v.addressLink ?? '',
      });
    }
  }, [route.params?.initialValue, reset]);

  const onSubmit = async (data: DeliveryAddressValues) => {
    try {
      dispatch(storeIsLoading(true));
      const payload: IAddress = {
        addressTitle: data.addressTitle,
        streetAddress: data.streetAddress,
        country: data.country,
        state: data.state,
        city: data.city,
        zipcode: data.zipcode,
        addressLink: data.addressLink || '',
      };
      const response = await addUserAddress(payload);

      if (response.remote === 'success') {
        reset({
          addressTitle: '',
          streetAddress: '',
          country: '',
          state: '',
          city: '',
          zipcode: '',
          addressLink: '',
        });
        navigation.goBack();
        successToast('Address added successfully!');
      } else {
        if ((response as any)?.fieldErrors) {
          applyApiErrors((response as any).fieldErrors);
        }
        if (response?.errors?.status === 401) {
          navigation.reset({ index: 0, routes: [{ name: 'SignInScreen' }] });
        }
        errorToast(extractErrorMessage(response));
      }
    } finally {
      dispatch(storeIsLoading(false));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        showBack
        title={editingAddress ? 'Edit Address' : 'Add Address'}
      />

      <KeyboardAwareScrollView style={styles.container}>
        <View style={styles.modalBackground}>
          <View style={styles.container}>
            <TouchableOpacity
              onPress={() => setopenLocationModal(true)}
              style={{
                backgroundColor: '#e6f7ff',
                padding: 12,
                borderRadius: 8,
                marginVertical: 10,
              }}
            >
              <CustomText style={{ fontSize: 16, color: '#007aff' }}>
                📍 Tap to fill address using map
              </CustomText>
            </TouchableOpacity>

            <Controller
              control={control}
              name="addressTitle"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  placeholder="Home / Work / Other"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.addressTitle?.message}
                />
              )}
            />
            <FormFieldError message={errors.addressTitle?.message} />

            <Controller
              control={control}
              name="streetAddress"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  placeholder="Street address line 1"
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
              render={({ field: { value, onChange, onBlur } }) => (
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
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  placeholder="State / Province"
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
              name="country"
              render={({ field: { value, onChange, onBlur } }) => (
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

            <Controller
              control={control}
              name="zipcode"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  placeholder="ZIP / Postal code"
                  keyboardType="default"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.zipcode?.message}
                />
              )}
            />
            <FormFieldError message={errors.zipcode?.message} />
            <FormFieldHelper message="3–12 letters or digits" />

            <Controller
              control={control}
              name="addressLink"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  placeholder="Google Maps link (optional)"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.addressLink?.message}
                />
              )}
            />
            <FormFieldError message={errors.addressLink?.message} />

            <View style={styles.buttonRow}>
              <Button
                buttonName="Cancel"
                btnwidth={'45%'}
                onPress={() => {
                  navigation.goBack();
                }}
              />
              <SubmitButton
                label="Save"
                loading={isSubmitting || !!loading}
                onPress={handleSubmit(onSubmit)}
                style={{ width: '45%' } as any}
              />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <Modal
        isVisible={openLocationModal}
        animationIn="zoomIn"
        animationOut="zoomOut"
        style={{ marginTop: 0 }}
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: Colors.white,
            borderRadius: 10,
            marginTop: 10,
          }}
        >
          <LocationScreen
            fieldName={'location'}
            setopenLocationModal={setopenLocationModal}
            setLocationDetails={setLocationDetails}
          />
        </SafeAreaView>
      </Modal>
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
    color: '#101010',
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
    marginVertical: 15,
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
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '600',
  },
});

export default AddAddress;
