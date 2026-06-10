import React, {useState, useEffect} from 'react';
import {StyleSheet, View, ActivityIndicator, TouchableOpacity, ScrollView} from 'react-native';
import {StripeProvider, useStripe} from '@stripe/stripe-react-native';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import Button from '../../common/Button';
import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import Heading from '../../common/Heading';
import {SVG} from '../../common/SvgHelper';
import {Font} from '../../common/Theam';
import WrapperScreen from '../../common/WrapperScreen';
import {SubmitButton} from '../../components/forms/SubmitButton';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../auth';
import {confirmPaymentApi, applyPromoCodeApi, getDriverRideStatusApi, createPaymentIntentApi} from '../../api/rideBookingApis';
import {errorToast, successToast} from '../../components/toasts';
import Input from '../../common/Input';
import {FormFieldError} from '../../components/forms/FormFieldError';
import {FormFieldHelper} from '../../components/forms/FormFieldHelper';
import {
  promoCodeSchema,
  PromoCodeValues,
} from '../../utils/validation/commonSchemas';
import {STRIPE_PUBLISHABLE_KEY} from '../../config/env';

type NavigationProps = StackNavigationProp<AuthStackParamList, 'DashboardScreen'>;

const PAYMENT_METHODS = [
  {key: 'Cash', label: 'Cash', icon: 'cash'},
  {key: 'CARD', label: 'Card', icon: 'card'},
];

const RideCompleteScreenContent = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<any>();
  const rideSessionId = route.params?.rideSessionId;
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const [loading, setLoading] = useState(false);
  const [fetchingRide, setFetchingRide] = useState(true);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);

  const {
    control: promoControl,
    handleSubmit: handlePromoSubmit,
    watch: watchPromo,
    formState: {errors: promoErrors},
  } = useForm<PromoCodeValues>({
    resolver: zodResolver(promoCodeSchema),
    mode: 'onTouched',
    defaultValues: {promoCode: ''},
  });
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  // Inline error returned from `applyPromoCodeApi`. Separate from RHF errors
  // (which only know about zod constraints) so we can show a backend
  // rejection like "Promo expired" right under the field.
  const [promoApiError, setPromoApiError] = useState<string | undefined>(
    undefined,
  );
  const promoCodeValue = watchPromo('promoCode');
  const [fare, setFare] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [receiptId, setReceiptId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRideStatus = async () => {
      if (!rideSessionId) {
        setFetchingRide(false);
        return;
      }
      try {
        const response = await getDriverRideStatusApi(rideSessionId);
        if (response.remote === 'success') {
          const data = (response.data as any)?.data ?? response.data;
          setFare(data?.fare ?? 0);
          setDistanceKm(data?.distanceKm ?? 0);
        }
      } catch (e: any) {
        errorToast('Failed to load ride details');
      } finally {
        setFetchingRide(false);
      }
    };
    fetchRideStatus();
  }, [rideSessionId]);

  const baseFare = fare > 0 ? Math.round(fare * 0.6 * 100) / 100 : 0;
  const distanceFare = fare > 0 ? Math.round((fare - baseFare) * 100) / 100 : 0;
  const totalAmount = Math.max(0, fare - discount);

  const handleApplyPromo = async (values: PromoCodeValues) => {
    if (!rideSessionId) return;
    setPromoApiError(undefined);
    setPromoLoading(true);
    try {
      const response = await applyPromoCodeApi({
        rideSessionId,
        promoCode: values.promoCode.trim(),
      });
      if (response.remote === 'success') {
        const data = (response.data as any)?.data ?? response.data;
        setPromoApplied(true);
        setDiscount(data?.discount ?? 0);
        if (data?.finalAmount != null) {
          setFare(data.finalAmount + (data?.discount ?? 0));
        }
        successToast('Promo code applied!');
      } else {
        setPromoApiError('Invalid promo code');
      }
    } catch (e: any) {
      setPromoApiError(e?.message || 'Failed to apply promo');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleCashPayment = async () => {
    setLoading(true);
    try {
      const response = await confirmPaymentApi({rideSessionId, paymentMethod: 'Cash'});
      if (response.remote === 'success') {
        const data = (response.data as any)?.data ?? response.data;
        setReceiptId(data?.receiptId ?? null);
        navigation.navigate('PaymentSuccessScreen', {rideSessionId});
      } else {
        const errMsg = response?.errors?.errors;
        errorToast(typeof errMsg === 'string' ? errMsg : 'Payment failed');
      }
    } catch (e: any) {
      errorToast(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async () => {
    if (!rideSessionId) return;
    setLoading(true);
    try {
      // Step 1: Create payment intent
      const intentResponse = await createPaymentIntentApi({rideSessionId});
      if (intentResponse.remote !== 'success') {
        const errDetail = (intentResponse as any)?.errors?.errors;
        errorToast(typeof errDetail === 'string' ? errDetail : 'Could not initiate card payment');
        setLoading(false);
        return;
      }

      const intentData = (intentResponse.data as any)?.data ?? intentResponse.data;
      const {clientSecret, paymentIntentId} = intentData;

      // Step 2: Init Stripe payment sheet
      const {error: initError} = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Zylo Rides',
      });

      if (initError) {
        errorToast(initError.message || 'Could not initialize payment');
        setLoading(false);
        return;
      }

      // Step 3: Present Stripe payment sheet
      const {error: presentError} = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          errorToast(presentError.message || 'Payment not completed');
        }
        setLoading(false);
        return;
      }

      // Step 4: Confirm on backend
      const confirmResponse = await confirmPaymentApi({
        rideSessionId,
        paymentMethod: 'CARD',
        stripePaymentIntentId: paymentIntentId,
      });

      if (confirmResponse.remote === 'success') {
        const data = (confirmResponse.data as any)?.data ?? confirmResponse.data;
        setReceiptId(data?.receiptId ?? null);
        navigation.navigate('PaymentSuccessScreen', {rideSessionId});
      } else {
        const errMsg = confirmResponse?.errors?.errors;
        errorToast(typeof errMsg === 'string' ? errMsg : 'Payment verification failed');
      }
    } catch (e: any) {
      errorToast(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = () => {
    if (!rideSessionId) {
      errorToast('Ride session not found');
      return;
    }
    if (paymentMethod === 'CARD') {
      handleCardPayment();
    } else {
      handleCashPayment();
    }
  };

  const renderPaymentIcon = (icon: string) => {
    switch (icon) {
      case 'card':
        return <SVG.PaymentCards width={24} height={24} />;
      case 'cash':
      default:
        return <SVG.TransactionUp width={20} height={20} />;
    }
  };

  if (fetchingRide) {
    return (
      <WrapperScreen>
        <Header showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EDAE10" />
          <CustomText style={styles.loadingText}>Loading ride details...</CustomText>
        </View>
      </WrapperScreen>
    );
  }

  return (
    <WrapperScreen>
      <Header showBack />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <CustomText style={styles.subheading}>Your ride is completed - please confirm payment</CustomText>
        <Heading style={styles.heading}>Payment</Heading>

        {/* Fare Amount */}
        <View style={styles.fareContainer}>
          <CustomText style={styles.fareLabel}>Total Fare</CustomText>
          <CustomText style={styles.fareAmount}>${totalAmount.toFixed(2)}</CustomText>
        </View>

        {/* Fare Breakdown */}
        <View style={styles.breakdownContainer}>
          <View style={styles.breakdownRow}>
            <CustomText style={styles.breakdownLabel}>Base Fare</CustomText>
            <CustomText style={styles.breakdownValue}>${baseFare.toFixed(2)}</CustomText>
          </View>
          <View style={styles.breakdownRow}>
            <CustomText style={styles.breakdownLabel}>Distance ({distanceKm.toFixed(1)} km)</CustomText>
            <CustomText style={styles.breakdownValue}>${distanceFare.toFixed(2)}</CustomText>
          </View>
          {discount > 0 && (
            <View style={styles.breakdownRow}>
              <CustomText style={[styles.breakdownLabel, {color: '#4CAF50'}]}>Promo Discount</CustomText>
              <CustomText style={[styles.breakdownValue, {color: '#4CAF50'}]}>-${discount.toFixed(2)}</CustomText>
            </View>
          )}
          <View style={styles.breakdownDivider} />
          <View style={styles.breakdownRow}>
            <CustomText style={styles.totalLabel}>Total</CustomText>
            <CustomText style={styles.totalValue}>${totalAmount.toFixed(2)}</CustomText>
          </View>
        </View>

        {/* Payment Method Selection */}
        <CustomText style={[styles.subheading, {marginTop: 20, marginBottom: 10}]}>Select Payment Method</CustomText>
        <View style={styles.paymentMethodRow}>
          {PAYMENT_METHODS.map(method => (
            <TouchableOpacity
              key={method.key}
              style={[
                styles.paymentCard,
                paymentMethod === method.key && styles.paymentCardSelected,
              ]}
              onPress={() => setPaymentMethod(method.key)}>
              <View style={styles.paymentIconContainer}>
                {renderPaymentIcon(method.icon)}
              </View>
              <CustomText
                style={[
                  styles.paymentLabel,
                  paymentMethod === method.key && styles.paymentLabelSelected,
                ]}>
                {method.label}
              </CustomText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promo Code Section */}
        <View style={styles.promoRow}>
          <View style={{flex: 1, marginRight: 10}}>
            <Controller
              control={promoControl}
              name="promoCode"
              render={({field: {value, onChange, onBlur}}) => (
                <Input
                  containerStyle={{height: 50, borderWidth: 0.5}}
                  placeholder="Promo code"
                  value={value}
                  onChangeText={(t: string) => {
                    setPromoApiError(undefined);
                    onChange(t);
                  }}
                  onBlur={onBlur}
                  editable={!promoApplied}
                  autoCapitalize="characters"
                  error={promoErrors.promoCode?.message || promoApiError}
                />
              )}
            />
          </View>
          <Button
            buttonName={promoLoading ? '...' : promoApplied ? 'Applied' : 'Apply'}
            btnwidth={90}
            onPress={handlePromoSubmit(handleApplyPromo)}
            disabled={
              promoLoading || promoApplied || !promoCodeValue?.trim()
            }
            loader={promoLoading}
          />
        </View>
        <FormFieldError
          message={promoErrors.promoCode?.message || promoApiError}
        />
        <FormFieldHelper message="Letters/numbers, e.g. WELCOME10" />

        {/* Receipt Info */}
        {receiptId && (
          <View style={styles.receiptContainer}>
            <CustomText style={styles.receiptTitle}>Payment Receipt</CustomText>
            <CustomText style={styles.receiptId}>Receipt ID: {receiptId}</CustomText>
            <CustomText style={styles.receiptDetail}>Amount: ${totalAmount.toFixed(2)}</CustomText>
            <CustomText style={styles.receiptDetail}>Method: {paymentMethod}</CustomText>
          </View>
        )}

        <View style={{height: 80}} />
      </ScrollView>

      {/* Confirm Payment Button */}
      <View style={styles.bottomButtonContainer}>
        <SubmitButton
          label={loading ? 'Processing…' : `Pay $${totalAmount.toFixed(2)}`}
          onPress={handleConfirmPayment}
          loading={loading}
          disabled={!paymentMethod}
        />
      </View>
    </WrapperScreen>
  );
};

const RideCompleteScreen = () => (
  <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
    <RideCompleteScreenContent />
  </StripeProvider>
);

const styles = StyleSheet.create({
  container: {flex: 1, margin: 20},
  contentContainer: {paddingBottom: 20},
  heading: {fontFamily: Font.textSemiBolder, color: '#2A2A2A', fontSize: 20},
  subheading: {fontSize: 12, fontFamily: Font.textSemiBolder, color: '#EDAE10'},
  promoRow: {flexDirection: 'row', alignItems: 'center', marginTop: 15},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: 10, color: '#EDAE10', fontSize: 14, fontFamily: Font.textNormal},
  fareContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#FFFBE7',
    borderRadius: 12,
  },
  fareLabel: {fontSize: 14, fontFamily: Font.textNormal, color: '#666', marginBottom: 4},
  fareAmount: {fontSize: 36, fontFamily: Font.textBolder, color: '#2A2A2A'},
  breakdownContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {fontSize: 14, fontFamily: Font.textNormal, color: '#666'},
  breakdownValue: {fontSize: 14, fontFamily: Font.textSemiBolder, color: '#2A2A2A'},
  breakdownDivider: {height: 1, backgroundColor: '#E0E0E0', marginVertical: 8},
  totalLabel: {fontSize: 16, fontFamily: Font.textBolder, color: '#2A2A2A'},
  totalValue: {fontSize: 16, fontFamily: Font.textBolder, color: '#2A2A2A'},
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  paymentCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  paymentCardSelected: {
    borderColor: '#EDAE10',
    backgroundColor: '#FFFBE7',
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  paymentIconText: {
    fontSize: 14,
    fontFamily: Font.textBolder,
    color: '#2A2A2A',
  },
  paymentLabel: {
    fontSize: 11,
    fontFamily: Font.textSemiBolder,
    color: '#666',
  },
  paymentLabelSelected: {
    color: '#2A2A2A',
  },
  receiptContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EDAE10',
    backgroundColor: '#FFFBE7',
  },
  receiptTitle: {fontSize: 16, fontFamily: Font.textBolder, color: '#2A2A2A', marginBottom: 8},
  receiptId: {fontSize: 13, fontFamily: Font.textSemiBolder, color: '#666', marginBottom: 4},
  receiptDetail: {fontSize: 13, fontFamily: Font.textNormal, color: '#666', marginBottom: 2},
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
});

export default RideCompleteScreen;
