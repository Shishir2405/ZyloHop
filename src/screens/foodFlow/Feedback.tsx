import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { Rating } from 'react-native-ratings';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import WrapperScreen from '../../common/WrapperScreen';
import Header from '../../common/Header';
import Heading from '../../common/Heading';
import CustomText from '../../common/CustomText';
import Button from '../../common/Button';
import { SVG } from '../../common/SvgHelper';
import { Font } from '../../common/Theam';
import Textarea from '../../common/Textarea';

import { orderFeedbackApi } from '../../api/orderFoodApis';
import { IFeedback } from '../../api/types/orderFlowTypes';
import { errorToast } from '../../components/toasts';
import { FormFieldError } from '../../components/forms/FormFieldError';
import { FormFieldHelper } from '../../components/forms/FormFieldHelper';
import { SubmitButton } from '../../components/forms/SubmitButton';
import { useApiFormErrors } from '../../hooks/useApiFormErrors';
import { extractErrorMessage } from '../../utils/helper';
import {
  feedbackSchema,
  FeedbackValues,
} from '../../utils/validation/commonSchemas';

type RootStackParamList = {
  Feedback: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Feedback'>;

const Feedback = ({ navigation }: Props) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    mode: 'onTouched',
    defaultValues: {
      rating: 0,
      feedback: '',
    },
  });
  const applyApiErrors = useApiFormErrors(setError);

  const rating = watch('rating');

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const getRatingLabel = (value: number) => {
    if (value >= 4) return 'Excellent';
    if (value >= 2) return 'Average';
    if (value > 0) return 'Poor';
    return 'Tap stars to rate';
  };

  const onSubmit = async (data: FeedbackValues) => {
    const payload: IFeedback = {
      reviewType: 'OrderReview',
      Stars: data.rating,
      label: getRatingLabel(data.rating),
      Description: (data.feedback ?? '').trim(),
    };

    const response = await orderFeedbackApi(
      '24628b48-b6cb-401e-968d-d447c374d9bf',
      payload,
    );

    if (response?.remote === 'success') {
      closeModal();
      reset();
      navigation.goBack();
    } else {
      if ((response as any)?.fieldErrors) {
        applyApiErrors((response as any).fieldErrors);
      }
      const errorMessage = extractErrorMessage(response);
      errorToast(errorMessage);
    }
  };

  return (
    <WrapperScreen>
      <Header showBack />

      <View style={styles.container}>
        <View style={styles.header}>
          <SVG.GreenTick />
          <Heading style={styles.heading}>Your order is delivered</Heading>
          <CustomText style={styles.subheading}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </CustomText>
        </View>

        <SVG.DottedLine style={styles.dottedLine} />
        <CustomText style={styles.feedbackText}>How is your food?</CustomText>
        <CustomText style={styles.feedbackDescription}>
          Your feedback will help us improve your experience.
        </CustomText>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          buttonName="Please Give Feedback"
          btnwidth="100%"
          style={styles.feedbackButton}
          onPress={openModal}
        />
      </View>

      {/* Feedback Modal */}
      <Modal
        isVisible={isModalVisible}
        onBackButtonPress={closeModal}
        onBackdropPress={closeModal}
        style={styles.modalView}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeIcon} onPress={closeModal}>
            <SVG.Cross />
          </TouchableOpacity>

          <View style={styles.modalHeaderBorder}>
            <CustomText style={styles.modalTitle}>Give Feedback</CustomText>
          </View>

          <View style={styles.ratingContainer}>
            <Rating
              type="custom"
              ratingCount={5}
              imageSize={35}
              startingValue={rating}
              tintColor="#fff"
              onFinishRating={(value: number) =>
                setValue('rating', value, {
                  shouldValidate: true,
                  shouldTouch: true,
                })
              }
              ratingBackgroundColor="#E0E0E0"
              style={styles.ratingStyle}
            />
          </View>
          <FormFieldError message={errors.rating?.message} />

          <CustomText style={styles.ratingLabel}>
            {getRatingLabel(rating)}
          </CustomText>

          <CustomText style={styles.ratingSummary}>
            You rated Sergio Ramasis {rating} star{rating > 1 ? 's' : ''}
          </CustomText>

          <Controller
            control={control}
            name="feedback"
            render={({ field: { value, onChange, onBlur } }) => (
              <Textarea
                label="Tell us more (optional)"
                placeholder="Write your feedback..."
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                maxLength={500}
                error={errors.feedback?.message}
              />
            )}
          />
          <FormFieldError message={errors.feedback?.message} />
          <FormFieldHelper message="Tell us what made your day better/worse (optional)" />

          <SubmitButton
            label="Submit Feedback"
            loading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </Modal>
    </WrapperScreen>
  );
};

export default Feedback;

const styles = StyleSheet.create({
  container: {
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontFamily: Font.textSemiBolder,
    color: '#2A2A2A',
    fontSize: 20,
  },
  subheading: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: Font.textSemiBolder,
  },
  dottedLine: {
    width: '100%',
    marginVertical: 20,
  },
  feedbackText: {
    fontFamily: Font.textSemiBolder,
    fontSize: 14,
    textAlign: 'center',
    color: '#5A5A5A',
    marginVertical: 20,
  },
  feedbackDescription: {
    fontFamily: Font.textSemiBolder,
    fontSize: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    marginHorizontal: 15,
  },
  feedbackButton: {
    marginVertical: 20,
  },

  modalView: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    maxHeight: '90%',
  },
  closeIcon: {
    width: '100%',
    height: 30,
    alignItems: 'flex-end',
  },
  modalHeaderBorder: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DDDDDD',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 20,
  },
  modalTitle: {
    color: '#2A2A2A',
    fontSize: 20,
    fontFamily: Font.textSemiBolder,
    textAlign: 'center',
  },

  ratingContainer: {
    alignItems: 'center',
  },
  ratingStyle: {
    paddingVertical: 10,
  },
  ratingLabel: {
    color: '#2A2A2A',
    fontSize: 20,
    fontFamily: Font.textSemiBolder,
    textAlign: 'center',
    marginTop: 15,
  },
  ratingSummary: {
    color: '#B8B8B8',
    fontSize: 12,
    fontFamily: Font.textSemiBolder,
    textAlign: 'center',
  },

});
