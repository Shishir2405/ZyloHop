import React, {useState} from 'react';
import {
  Alert,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import WrapperScreen from '../../common/WrapperScreen';
import CustomText from '../../common/CustomText';
import Button from '../../common/Button';
import Textarea from '../../common/Textarea';
import Header from '../../common/Header';
import {Font} from '../../common/Theam';
import {SVG} from '../../common/SvgHelper';
import PopUp from '../../common/PopUp';
import {useNavigation, useRoute} from '@react-navigation/native';
import {cancelRideApi} from '../../api/rideBookingApis';
import {errorToast} from '../../components/toasts';
import {FormFieldError} from '../../components/forms/FormFieldError';
import {FormFieldHelper} from '../../components/forms/FormFieldHelper';
import {SubmitButton} from '../../components/forms/SubmitButton';
import {useApiFormErrors} from '../../hooks/useApiFormErrors';
import {extractErrorMessage} from '../../utils/helper';
import {
  cancelRideSchema,
  CancelRideValues,
} from '../../utils/validation/commonSchemas';

const REASONS: {id: string; label: string}[] = [
  {id: 'waiting-long', label: 'Waiting for long time'},
  {id: 'unable-contact-driver', label: 'Unable to contact driver'},
  {id: 'driver-denied-destination', label: 'Driver denied to go to destination'},
  {id: 'driver-denied-pickup', label: 'Driver denied to come to pickup'},
  {id: 'wrong-address', label: 'Wrong address shown'},
  {id: 'price-unreasonable', label: 'The price is not reasonable'},
  {id: 'other', label: 'Other'},
];

const CancelRideScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const rideSessionId = route.params?.rideSessionId;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: {errors, isSubmitting},
  } = useForm<CancelRideValues>({
    resolver: zodResolver(cancelRideSchema),
    mode: 'onTouched',
    defaultValues: {
      reasonId: 'waiting-long',
      otherReason: '',
    },
  });
  const applyApiErrors = useApiFormErrors(setError);
  const reasonId = watch('reasonId');

  const executeCancellation = async (data: CancelRideValues) => {
    const selected = REASONS.find(r => r.id === data.reasonId);
    const reasonCode =
      data.reasonId === 'other'
        ? data.otherReason?.trim() || 'Other'
        : selected?.label ?? data.reasonId;
    setLoading(true);
    try {
      const response = await cancelRideApi({
        rideSessionId,
        reasonCode,
        comment: data.otherReason?.trim() || undefined,
      });
      if (response.remote === 'success') {
        setIsModalVisible(true);
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

  const onSubmit = (data: CancelRideValues) => {
    if (!rideSessionId) {
      setIsModalVisible(true);
      return;
    }
    Alert.alert(
      'Cancel Ride',
      'A cancellation fee of $5.00 may apply if the ride was requested more than 2 minutes ago. Do you want to proceed?',
      [
        {text: 'Keep Ride', style: 'cancel'},
        {
          text: 'Cancel Ride',
          style: 'destructive',
          onPress: () => executeCancellation(data),
        },
      ],
    );
  };

  return (
    <WrapperScreen>
      <Header showBack title="Cancel Ride" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <CustomText style={styles.subtitle}>
            Please select the reason of cancellation.
          </CustomText>
        </View>
        <View style={styles.optionsContainer}>
          {REASONS.filter(r => r.id !== 'other').map(reason => (
            <TouchableOpacity
              key={reason.id}
              style={[
                styles.option,
                reasonId === reason.id && styles.optionSelected,
              ]}
              onPress={() => {
                setValue('reasonId', reason.id, {
                  shouldValidate: true,
                  shouldTouch: true,
                });
                setValue('otherReason', '');
              }}>
              {reasonId === reason.id ? (
                <View style={{marginRight: 20}}>
                  <SVG.CheckedIcon />
                </View>
              ) : (
                <View style={styles.checkbox} />
              )}
              <CustomText style={styles.optionText}>{reason.label}</CustomText>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[
              styles.option,
              reasonId === 'other' && styles.optionSelected,
            ]}
            onPress={() => {
              setValue('reasonId', 'other', {
                shouldValidate: true,
                shouldTouch: true,
              });
            }}>
            {reasonId === 'other' ? (
              <View style={{marginRight: 20}}>
                <SVG.CheckedIcon />
              </View>
            ) : (
              <View style={styles.checkbox} />
            )}
            <CustomText style={styles.optionText}>Other</CustomText>
          </TouchableOpacity>
          <FormFieldError message={errors.reasonId?.message} />

          {reasonId === 'other' && (
            <>
              <Controller
                control={control}
                name="otherReason"
                render={({field: {value, onChange, onBlur}}) => (
                  <Textarea
                    label="Tell us more"
                    placeholder="Describe your reason"
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    maxLength={300}
                    rows={5}
                    error={errors.otherReason?.message}
                  />
                )}
              />
              <FormFieldError message={errors.otherReason?.message} />
              <FormFieldHelper message="We use this to improve our service" />
            </>
          )}
        </View>
        <SubmitButton
          label={loading || isSubmitting ? 'Cancelling…' : 'Cancel Ride'}
          loading={loading || isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />
      </ScrollView>
      <PopUp
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}>
        <View style={styles.modalContent}>
          <SVG.SadFace />
          <View style={styles.modalTextContainer}>
            <CustomText style={styles.modalHeading}>
              We're so sad about your cancellation
            </CustomText>
            <CustomText style={styles.modalDescription}>
              We will continue to improve our service & satisfy you on the next
              trip.
            </CustomText>
          </View>
          <Button
            buttonName={'Back Home'}
            onPress={() => {
              (navigation as any).navigate('DashboardScreen');
              setIsModalVisible(false);
            }}
          />
        </View>
      </PopUp>
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  container: {paddingHorizontal: 20, backgroundColor: '#fff'},
  subtitle: {fontSize: 14, color: '#B8B8B8', marginBottom: 20},
  optionsContainer: {marginBottom: 20},
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    height: 64,
  },
  optionSelected: {borderColor: '#FFC107'},
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 20,
  },
  optionText: {
    fontFamily: Font.textSemiBolder,
    fontSize: 15,
    color: '#5A5A5A',
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
  },
  modalHeading: {
    fontFamily: Font.textSemiBolder,
    color: '#2A2A2A',
    fontSize: 22,
    textAlign: 'center',
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

export default CancelRideScreen;
