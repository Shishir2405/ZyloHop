import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import { Font } from '../../common/Theam';
import WrapperScreen from '../../common/WrapperScreen';
import { SubmitButton } from '../../components/forms/SubmitButton';
import { errorToast, successToast } from '../../components/toasts';
import {
  createSetupIntentApi,
  isNotImplementedError,
} from '../../api/paymentMethodApis';
import { extractErrorMessage } from '../../utils/helper';
import { STRIPE_PUBLISHABLE_KEY } from '../../config/env';
import { AuthStackParamList } from '../auth';

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'AccountAddCardsScreen'
>;

const AccountAddCardsScreenContent: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [loadingIntent, setLoadingIntent] = useState(true);
  const [sheetReady, setSheetReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // When the backend stub returns NOT_IMPLEMENTED we swap the form for a
  // friendly placeholder rather than spamming an error toast.
  const [notImplemented, setNotImplemented] = useState(false);

  useEffect(() => {
    const setup = async () => {
      setLoadingIntent(true);
      const response = await createSetupIntentApi();

      if (response.remote !== 'success') {
        if (isNotImplementedError(response)) {
          setNotImplemented(true);
        } else {
          errorToast(extractErrorMessage(response));
        }
        setLoadingIntent(false);
        return;
      }

      const bundle =
        (response.data as any)?.data ?? (response.data as any);

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Zylo',
        setupIntentClientSecret: bundle.clientSecret,
        customerId: bundle.customerId,
        customerEphemeralKeySecret: bundle.ephemeralKey,
        // Hint the sheet that we are saving a payment method for later use
        // rather than completing a charge.
        allowsDelayedPaymentMethods: false,
      });

      if (initError) {
        errorToast(initError.message || 'Could not initialize payment sheet');
        setLoadingIntent(false);
        return;
      }

      setSheetReady(true);
      setLoadingIntent(false);
    };

    setup();
    // We intentionally only run this on mount — re-running would re-init
    // the Stripe sheet and break in-flight presentation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveCard = async () => {
    if (!sheetReady) return;
    setSubmitting(true);
    try {
      const { error } = await presentPaymentSheet();
      if (error) {
        if (error.code !== 'Canceled') {
          errorToast(error.message || 'Could not save card');
        }
        return;
      }
      successToast('Card saved');
      navigation.replace('CardAddSuccessScreen');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <WrapperScreen>
      <Header showBack />
      <View style={styles.container}>
        <CustomText style={styles.title}>Add a new card</CustomText>

        {notImplemented ? (
          <View style={styles.placeholderCard}>
            <CustomText style={styles.placeholderTitle}>
              Saving cards coming soon
            </CustomText>
            <CustomText style={styles.placeholderBody}>
              We're still putting the finishing touches on saved payment
              methods. You'll be able to add cards here soon.
            </CustomText>
          </View>
        ) : loadingIntent ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#EDAE10" />
            <CustomText style={styles.subtle}>
              Preparing secure card form…
            </CustomText>
          </View>
        ) : (
          <View style={styles.body}>
            <CustomText style={styles.subtle}>
              Tap "Save card" to enter your card details in our secure form
              powered by Stripe. We never store your full card number on our
              servers.
            </CustomText>
          </View>
        )}
      </View>

      {!notImplemented ? (
        <View style={styles.footer}>
          <SubmitButton
            label="Save card"
            loading={submitting}
            disabled={!sheetReady || submitting}
            onPress={handleSaveCard}
          />
        </View>
      ) : null}
    </WrapperScreen>
  );
};

const AccountAddCardsScreen: React.FC = () => (
  <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
    <AccountAddCardsScreenContent />
  </StripeProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
  },
  title: {
    fontSize: 20,
    color: '#414141',
    marginBottom: 15,
    fontFamily: Font.textBolder,
  },
  subtle: {
    fontSize: 13,
    color: '#5A5A5A',
    fontFamily: Font.textNormal,
    lineHeight: 18,
    marginTop: 8,
  },
  body: {
    paddingVertical: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  placeholderCard: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFBE7',
    borderWidth: 1,
    borderColor: '#F2D88B',
  },
  placeholderTitle: {
    fontSize: 16,
    color: '#2A2A2A',
    fontFamily: Font.textBolder,
    marginBottom: 6,
  },
  placeholderBody: {
    fontSize: 13,
    color: '#5A5A5A',
    fontFamily: Font.textNormal,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
});

export default AccountAddCardsScreen;
