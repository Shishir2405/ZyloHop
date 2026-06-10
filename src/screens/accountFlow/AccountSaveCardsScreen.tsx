import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import Button from '../../common/Button';
import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import { Font } from '../../common/Theam';
import WrapperScreen from '../../common/WrapperScreen';
import { errorToast, successToast } from '../../components/toasts';
import {
  detachPaymentMethodApi,
  isNotImplementedError,
  listSavedCardsApi,
  SavedCard,
  setDefaultPaymentMethodApi,
} from '../../api/paymentMethodApis';
import { extractErrorMessage } from '../../utils/helper';
import { AuthStackParamList } from '../auth';

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'AccountSaveCardsScreen'
>;

const formatExpiry = (m: number, y: number): string => {
  const month = String(m).padStart(2, '0');
  // Stripe returns full year (e.g. 2026) — show last two digits to match
  // the historical UI ("12/26").
  const year = String(y).slice(-2).padStart(2, '0');
  return `${month}/${year}`;
};

const formatBrand = (brand: string): string => {
  if (!brand) return 'Card';
  return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
};

const AccountSaveCardsScreen = () => {
  const navigation = useNavigation<NavigationProps>();

  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState<string | null>(null);
  // Distinguish "backend not built yet" from a real network/server error —
  // we want a friendly placeholder for the former and a toast for the latter.
  const [notImplemented, setNotImplemented] = useState(false);

  const loadCards = useCallback(async () => {
    setLoading(true);
    const response = await listSavedCardsApi();
    if (response.remote === 'success') {
      const list =
        ((response.data as any)?.data ?? (response.data as any)) || [];
      setCards(Array.isArray(list) ? list : []);
      setNotImplemented(false);
    } else if (isNotImplementedError(response)) {
      setCards([]);
      setNotImplemented(true);
    } else {
      setCards([]);
      setNotImplemented(false);
      errorToast(extractErrorMessage(response));
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [loadCards]),
  );

  const handleRemove = (card: SavedCard) => {
    Alert.alert(
      'Remove card',
      `Remove ${formatBrand(card.brand)} ending in ${card.last4}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setActionPending(card.id);
            const response = await detachPaymentMethodApi(card.id);
            setActionPending(null);
            if (response.remote === 'success') {
              successToast('Card removed');
              loadCards();
            } else if (isNotImplementedError(response)) {
              errorToast('Removing cards is not available yet.');
            } else {
              errorToast(extractErrorMessage(response));
            }
          },
        },
      ],
    );
  };

  const handleSetDefault = async (card: SavedCard) => {
    if (card.isDefault) return;
    setActionPending(card.id);
    const response = await setDefaultPaymentMethodApi(card.id);
    setActionPending(null);
    if (response.remote === 'success') {
      successToast('Default card updated');
      loadCards();
    } else if (isNotImplementedError(response)) {
      errorToast('Changing default card is not available yet.');
    } else {
      errorToast(extractErrorMessage(response));
    }
  };

  const renderCard = ({ item }: { item: SavedCard }) => {
    const busy = actionPending === item.id;
    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <CustomText style={styles.cardBrand}>
              {formatBrand(item.brand)} •••• {item.last4}
            </CustomText>
            <CustomText style={styles.cardExpiry}>
              Expires {formatExpiry(item.expMonth, item.expYear)}
            </CustomText>
          </View>
          {item.isDefault ? (
            <View style={styles.defaultBadge}>
              <CustomText style={styles.defaultBadgeText}>Default</CustomText>
            </View>
          ) : null}
        </View>
        <View style={styles.cardActions}>
          {!item.isDefault ? (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => handleSetDefault(item)}
              disabled={busy}
            >
              <CustomText style={styles.linkText}>Set as default</CustomText>
            </TouchableOpacity>
          ) : (
            <View />
          )}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => handleRemove(item)}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#C0392B" />
            ) : (
              <CustomText style={[styles.linkText, styles.removeText]}>
                Remove
              </CustomText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <WrapperScreen>
      <Header showBack />
      <View style={styles.container}>
        <CustomText style={styles.title}>My Cards</CustomText>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#EDAE10" />
          </View>
        ) : notImplemented ? (
          <View style={styles.placeholderCard}>
            <CustomText style={styles.placeholderTitle}>
              Saved cards coming soon
            </CustomText>
            <CustomText style={styles.placeholderBody}>
              We're still putting the finishing touches on saved payment
              methods. Check back shortly.
            </CustomText>
          </View>
        ) : cards.length === 0 ? (
          <View style={styles.placeholderCard}>
            <CustomText style={styles.placeholderTitle}>
              No saved cards
            </CustomText>
            <CustomText style={styles.placeholderBody}>
              Add a card to speed up future checkouts.
            </CustomText>
          </View>
        ) : (
          <FlatList
            data={cards}
            renderItem={renderCard}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>
      <View style={styles.footer}>
        <Button
          buttonName="+ Add new card"
          btnwidth="100%"
          onPress={() => navigation.navigate('AccountAddCardsScreen')}
        />
      </View>
    </WrapperScreen>
  );
};

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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  cardContainer: {
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FFC107',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBrand: {
    fontSize: 16,
    color: '#2A2A2A',
    fontFamily: Font.textBolder,
  },
  cardExpiry: {
    fontSize: 13,
    color: '#888',
    fontFamily: Font.textSemiBolder,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: '#EDAE10',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  defaultBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontFamily: Font.textBolder,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  linkButton: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  linkText: {
    fontSize: 13,
    color: '#2A6EDB',
    fontFamily: Font.textSemiBolder,
  },
  removeText: {
    color: '#C0392B',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
});

export default AccountSaveCardsScreen;
