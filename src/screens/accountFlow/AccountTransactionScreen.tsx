import React, {useState, useEffect, useCallback} from 'react';
import {StyleSheet, View, ActivityIndicator, FlatList} from 'react-native';
import {useDispatch} from 'react-redux';
import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import {SVG} from '../../common/SvgHelper';
import {Font} from '../../common/Theam';
import WrapperScreen from '../../common/WrapperScreen';
import {getUserTransactionsApi} from '../../api/rideBookingApis';
import {errorToast} from '../../components/toasts';
import GlobalErrorBanner from '../../components/GlobalErrorBanner';
import {
  setGlobalError,
  clearGlobalError,
} from '../../Redux/Reducer/globalErrorRedux';
import {extractErrorMessage} from '../../utils/helper';

const AccountTransactionScreen = () => {
  const dispatch = useDispatch();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setIsError(false);
    try {
      const response = await getUserTransactionsApi();
      if (response.remote === 'success') {
        const data = (response.data as any)?.data ?? response.data;
        setTransactions(Array.isArray(data) ? data : []);
        dispatch(clearGlobalError());
      } else {
        setIsError(true);
        const msg = extractErrorMessage(response) || 'Failed to load transactions';
        errorToast(msg);
        dispatch(setGlobalError({message: msg, context: 'Transactions'}));
      }
    } catch (e: any) {
      setIsError(true);
      const msg = e?.message || 'Failed to load transactions';
      errorToast(msg);
      dispatch(setGlobalError({message: msg, context: 'Transactions'}));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      return isToday ? `Today at ${formattedTime}` : `${date.toLocaleDateString()} at ${formattedTime}`;
    } catch {
      return dateStr;
    }
  };

  const getPaymentMethodBadgeColor = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'CARD':
        return '#E3F2FD';
      case 'UPI':
        return '#E8F5E9';
      case 'GOOGLE_PAY':
        return '#FFF3E0';
      case 'CASH':
      default:
        return '#F5F5F5';
    }
  };

  const renderTransaction = ({item}: {item: any}) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionIcon}>
        <SVG.TransactionUp />
      </View>
      <View style={styles.transactionContent}>
        <View style={styles.transactionHeader}>
          <CustomText style={styles.transactionDriver} numberOfLines={1}>
            {item.driverName || 'Driver'}
          </CustomText>
          <CustomText style={styles.transactionAmount}>
            -${item.amount?.toFixed(2) ?? '0.00'}
          </CustomText>
        </View>
        <CustomText style={styles.transactionRoute} numberOfLines={1}>
          {item.pickupAddress || 'Pickup'} {'->'} {item.dropAddress || 'Drop'}
        </CustomText>
        <View style={styles.transactionMeta}>
          <CustomText style={styles.transactionDate}>
            {formatDate(item.createdAt)}
          </CustomText>
          <View
            style={[
              styles.paymentBadge,
              {backgroundColor: getPaymentMethodBadgeColor(item.paymentMethod)},
            ]}>
            <CustomText style={styles.paymentBadgeText}>
              {item.paymentMethod || 'Cash'}
            </CustomText>
          </View>
        </View>
        {item.distanceKm != null && (
          <CustomText style={styles.transactionDistance}>
            {item.distanceKm.toFixed(1)} km
          </CustomText>
        )}
        {item.receiptId && (
          <CustomText style={styles.receiptText}>
            Receipt: {item.receiptId}
          </CustomText>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <CustomText style={styles.emptyText}>No transactions yet</CustomText>
      <CustomText style={styles.emptySubText}>
        Your ride payment history will appear here
      </CustomText>
    </View>
  );

  return (
    <WrapperScreen>
      <Header showBack title="Transaction" />
      <View style={styles.container}>
        <View style={{flex: 1, backgroundColor: '#fff', padding: 16}}>
          <CustomText style={styles.title}>Transactions</CustomText>
          {isError && (
            <GlobalErrorBanner
              context="Transactions"
              onRetry={fetchTransactions}
            />
          )}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#EDAE10" />
              <CustomText style={styles.loadingText}>Loading transactions...</CustomText>
            </View>
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={(item, index) => item.paymentId || String(index)}
              renderItem={renderTransaction}
              ListEmptyComponent={renderEmpty}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontFamily: Font.textBolder,
    marginBottom: 16,
    color: '#414141',
  },
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
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FDE8E8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionDriver: {
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
    color: '#121212',
    flex: 1,
    marginRight: 8,
  },
  transactionAmount: {
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
    color: '#121212',
  },
  transactionRoute: {
    fontSize: 12,
    fontFamily: Font.textNormal,
    color: '#666',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: Font.textNormal,
    color: '#999',
  },
  transactionDistance: {
    fontSize: 11,
    fontFamily: Font.textNormal,
    color: '#999',
    marginTop: 2,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentBadgeText: {
    fontSize: 10,
    fontFamily: Font.textSemiBolder,
    color: '#2A2A2A',
  },
  receiptText: {
    fontSize: 10,
    fontFamily: Font.textNormal,
    color: '#EDAE10',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Font.textSemiBolder,
    color: '#2A2A2A',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13,
    fontFamily: Font.textNormal,
    color: '#999',
  },
});

export default AccountTransactionScreen;
