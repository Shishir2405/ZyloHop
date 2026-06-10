import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { useDispatch, useSelector } from 'react-redux';

import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import { Font } from '../../common/Theam';
import { SubmitButton } from '../../components/forms/SubmitButton';
import { errorToast, successToast } from '../../components/toasts';
import { extractErrorMessage, formatAmount } from '../../utils/helper';
import {
  createOrderPaymentIntentApi,
  placeOrderApi,
} from '../../api/orderFoodApis';
import { IOrderPaymentIntent } from '../../api/types/orderFlowTypes';
import { storeBasketId } from '../../Redux/Reducer/UserinfoReducer';
import { STRIPE_PUBLISHABLE_KEY } from '../../config/env';
import { AuthStackParamList } from '../auth';

type NavigationProps = StackNavigationProp<AuthStackParamList, 'Payment'>;

const PaymentContent = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const specialInstruction: string | undefined =
    route.params?.specialInstruction;

  const { basketId, selectedAddress } = useSelector(
    (state: any) => state.Userinfo,
  );

  const [loadingIntent, setLoadingIntent] = useState(true);
  const [paying, setPaying] = useState(false);
  const [intent, setIntent] = useState<IOrderPaymentIntent | null>(null);
  const [sheetReady, setSheetReady] = useState(false);
  // Set once the order is placed so the basket-cleared side-effect from
  // dispatch(storeBasketId('')) doesn't re-run this useEffect and surface
  // a spurious "Cart is empty" toast immediately after a successful payment.
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!basketId) {
        if (!orderPlaced) {
          errorToast('Cart is empty');
          navigation.goBack();
        }
        return;
      }
      try {
        const response = await createOrderPaymentIntentApi(basketId);
        if (response.remote !== 'success') {
          errorToast(extractErrorMessage(response));
          navigation.goBack();
          return;
        }
        const data: IOrderPaymentIntent =
          (response.data as any)?.data ?? (response.data as any);
        setIntent(data);

        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: data.clientSecret,
          merchantDisplayName: 'Zylo Food',
        });
        if (initError) {
          errorToast(initError.message || 'Could not initialize payment');
          return;
        }
        setSheetReady(true);
      } finally {
        setLoadingIntent(false);
      }
    };
    init();
  }, [basketId]);

  const handlePayNow = async () => {
    if (!intent || !sheetReady) return;
    if (!selectedAddress?.id) {
      errorToast('No delivery address selected');
      return;
    }

    setPaying(true);
    try {
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code !== 'Canceled') {
          errorToast(presentError.message || 'Payment not completed');
        }
        return;
      }

      const placeResponse = await placeOrderApi(
        basketId,
        selectedAddress,
        intent.paymentIntentId,
        specialInstruction,
      );

      if (placeResponse.remote !== 'success') {
        errorToast(extractErrorMessage(placeResponse));
        return;
      }

      successToast('Payment successful! Order placed.');
      setOrderPlaced(true);
      const orderId =
        (placeResponse as any)?.data?.data?.id ?? (placeResponse as any)?.data?.id;
      // Clear the basket AFTER setting orderPlaced so the basketId
      // useEffect re-runs without showing "Cart is empty".
      dispatch(storeBasketId(''));
      // Land the rider on the order tracking screen (the "all orders"
      // surface) so they immediately see the order they just paid for,
      // not the post-payment splash → empty cart loop.
      navigation.reset({
        index: 0,
        routes: orderId
          ? [{ name: 'TrackOrder', params: { orderId } }]
          : [{ name: 'Paymentsuccess' }],
      });
    } finally {
      setPaying(false);
    }
  };

  if (loadingIntent || !intent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EDAE10" />
          <CustomText style={styles.loadingText}>
            Preparing payment...
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack />
      <ScrollView style={styles.container}>
        <CustomText style={styles.subheading}>Order summary</CustomText>
        <CustomText style={styles.heading}>Pay with card</CustomText>

        <View style={styles.fareContainer}>
          <CustomText style={styles.fareLabel}>Total</CustomText>
          <CustomText style={styles.fareAmount}>
            ${formatAmount(intent.total)}
          </CustomText>
        </View>

        <View style={styles.breakdownContainer}>
          <View style={styles.breakdownRow}>
            <CustomText style={styles.breakdownLabel}>Subtotal</CustomText>
            <CustomText style={styles.breakdownValue}>
              ${formatAmount(intent.subTotal)}
            </CustomText>
          </View>
          <View style={styles.breakdownRow}>
            <CustomText style={styles.breakdownLabel}>Tax</CustomText>
            <CustomText style={styles.breakdownValue}>
              ${formatAmount(intent.taxAmount)}
            </CustomText>
          </View>
          <View style={styles.breakdownRow}>
            <CustomText style={styles.breakdownLabel}>Delivery fee</CustomText>
            <CustomText style={styles.breakdownValue}>
              ${formatAmount(intent.deliveryFee)}
            </CustomText>
          </View>
          <View style={styles.breakdownDivider} />
          <View style={styles.breakdownRow}>
            <CustomText style={styles.totalLabel}>Total</CustomText>
            <CustomText style={styles.totalValue}>
              ${formatAmount(intent.total)}
            </CustomText>
          </View>
        </View>

        <CustomText style={styles.note}>
          Payment is processed securely by Stripe. Online payment only.
        </CustomText>
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <SubmitButton
          label={paying ? 'Processing...' : `Pay $${formatAmount(intent.total)}`}
          loading={paying}
          disabled={!sheetReady}
          onPress={handlePayNow}
        />
      </View>
    </SafeAreaView>
  );
};

const Payment = () => (
  <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
    <PaymentContent />
  </StripeProvider>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, marginHorizontal: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#EDAE10',
    fontSize: 14,
    fontFamily: Font.textNormal,
  },
  heading: {
    color: '#2A2A2A',
    fontSize: 24,
    fontFamily: Font.textSemiBolder,
    marginTop: 4,
  },
  subheading: {
    fontSize: 12,
    fontFamily: Font.textSemiBolder,
    color: '#EDAE10',
    marginTop: 15,
  },
  fareContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#FFFBE7',
    borderRadius: 12,
  },
  fareLabel: {
    fontSize: 14,
    fontFamily: Font.textNormal,
    color: '#666',
    marginBottom: 4,
  },
  fareAmount: {
    fontSize: 36,
    fontFamily: Font.textBolder,
    color: '#2A2A2A',
  },
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
  breakdownLabel: { fontSize: 14, fontFamily: Font.textNormal, color: '#666' },
  breakdownValue: {
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
    color: '#2A2A2A',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  totalLabel: { fontSize: 16, fontFamily: Font.textBolder, color: '#2A2A2A' },
  totalValue: { fontSize: 16, fontFamily: Font.textBolder, color: '#2A2A2A' },
  note: {
    fontSize: 12,
    color: '#888',
    fontFamily: Font.textNormal,
    marginTop: 16,
    textAlign: 'center',
  },
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
});

export default Payment;
