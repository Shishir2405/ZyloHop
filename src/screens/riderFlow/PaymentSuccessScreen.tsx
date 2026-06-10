import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import Button from '../../common/Button';
import CommonModal from '../../common/CommonModal';
import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import Heading from '../../common/Heading';
import Textarea from '../../common/Textarea';
import {SVG} from '../../common/SvgHelper';
import {Colors, Font} from '../../common/Theam';
import WrapperScreen from '../../common/WrapperScreen';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../auth';
import {submitRideFeedbackApi} from '../../api/rideBookingApis';
import {errorToast, successToast} from '../../components/toasts';
import {TouchableOpacity} from 'react-native';
import {SubmitButton} from '../../components/forms/SubmitButton';
import {FormFieldError} from '../../components/forms/FormFieldError';
import {
  rideFeedbackSchema,
  RideFeedbackValues,
} from '../../utils/validation/rideSchemas';

type NavigationProps = StackNavigationProp<AuthStackParamList, 'PaymentSuccessScreen'>;

const STARS = [1, 2, 3, 4, 5];

const PaymentSuccessScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<any>();
  const rideSessionId = route.params?.rideSessionId;
  const [isModalVisible, setIsModalVisible] = useState(false);

  const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const {
    control,
    handleSubmit,
    watch,
    formState: {errors, isSubmitting},
  } = useForm<RideFeedbackValues>({
    resolver: zodResolver(rideFeedbackSchema),
    mode: 'onTouched',
    defaultValues: {rating: 0, comment: ''},
  });
  const rating = watch('rating') ?? 0;

  const onSubmit = async (values: RideFeedbackValues) => {
    if (!rideSessionId) {
      navigation.navigate('DashboardScreen');
      return;
    }
    try {
      const response = await submitRideFeedbackApi({
        rideSessionId,
        rating: values.rating,
        comment: values.comment?.trim() || undefined,
      });
      if (response.remote === 'success') {
        successToast('Thank you for your feedback!');
        navigation.navigate('DashboardScreen');
      } else {
        errorToast('Failed to submit feedback');
        navigation.navigate('DashboardScreen');
      }
    } catch (e: any) {
      errorToast(e?.message || 'Something went wrong');
      navigation.navigate('DashboardScreen');
    }
  };

  return (
    <WrapperScreen>
      <Header showBack />
      <View style={styles.container}>
        <View style={styles.header}>
          <SVG.GreenTick />
          <Heading style={styles.heading}>Payment Success</Heading>
          <CustomText style={styles.subheading}>
            Your payment has been processed successfully
          </CustomText>
        </View>
        <SVG.DottedLine style={styles.dottedLine} />
        <CustomText style={styles.feedbackText}>How was your trip?</CustomText>
        <CustomText style={styles.feedbackDescription}>
          Your feedback will help us improve your experience
        </CustomText>
        <Button buttonName="Give Feedback" btnwidth="100%" onPress={() => setIsModalVisible(true)} style={styles.feedbackButton} />
      </View>

      <CommonModal modalMarginFromTop={'50%'} isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}>
        <Heading style={styles.modalHeading}>Give Feedback</Heading>
        <View style={{borderBottomWidth: 0.5, width: '100%', borderBottomColor: Colors.lightGrey}} />
        <Controller
          control={control}
          name="rating"
          render={({field: {value, onChange}}) => (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginVertical: 20,
                }}
              >
                {STARS.map(s => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => onChange(s)}
                    style={{marginHorizontal: 5}}
                  >
                    <CustomText style={{fontSize: 30}}>
                      {s <= (value || 0) ? '★' : '☆'}
                    </CustomText>
                  </TouchableOpacity>
                ))}
              </View>
              <FormFieldError message={errors.rating?.message} />
            </View>
          )}
        />
        <Heading style={{fontSize: 20, fontFamily: Font.textSemiBolder}}>
          {rating >= 1 && rating <= 5 ? ratingLabels[rating - 1] : 'Tap a star'}
        </Heading>
        <CustomText style={{fontFamily: Font.textSemiBolder, fontSize: 12, lineHeight: 18, marginBottom: 20}}>
          {rating >= 1
            ? `You rated ${rating} star${rating !== 1 ? 's' : ''}`
            : 'Your rating helps the driver and future riders'}
        </CustomText>
        <View style={{marginHorizontal: 10}}>
          <Controller
            control={control}
            name="comment"
            render={({field: {value, onChange, onBlur}}) => (
              <Textarea
                label="Add a comment (optional)"
                placeholder="Write your feedback here…"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                maxLength={500}
                rows={5}
                error={errors.comment?.message}
              />
            )}
          />
          <FormFieldError message={errors.comment?.message} />
        </View>
        <View style={{marginVertical: 20, width: '100%', alignItems: 'center'}}>
          <View style={styles.submitBtnWrap}>
            <SubmitButton
              label={isSubmitting ? 'Submitting…' : 'Submit Feedback'}
              loading={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </View>
      </CommonModal>
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  container: {margin: 20, justifyContent: 'center', alignItems: 'center', height: '80%'},
  header: {width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 20},
  heading: {fontFamily: Font.textSemiBolder, color: '#2A2A2A', fontSize: 20},
  modalHeading: {fontSize: 20, fontFamily: Font.textSemiBolder, marginVertical: 10},
  subheading: {textAlign: 'center', fontSize: 12, fontFamily: Font.textSemiBolder},
  dottedLine: {width: '100%', marginVertical: 20},
  feedbackText: {fontFamily: Font.textSemiBolder, fontSize: 14, lineHeight: 19, textAlign: 'center', color: '#5A5A5A', marginVertical: 20},
  feedbackDescription: {fontFamily: Font.textSemiBolder, fontSize: 12, lineHeight: 16, textAlign: 'center'},
  feedbackButton: {marginVertical: 20},
  submitBtnWrap: {width: '95%'},
});

export default PaymentSuccessScreen;
