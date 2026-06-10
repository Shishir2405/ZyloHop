import React from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { IOrder } from '../../../api/types/orderFlowTypes';
import CustomText from '../../../common/CustomText';
import { Font } from '../../../common/Theam';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../auth';
import LottieView from 'lottie-react-native';

type NavigationProps = StackNavigationProp<AuthStackParamList, 'BookingScreen'>;

const OrderListComponent = ({ orders }: { orders: IOrder[] }) => {
  const navigation = useNavigation<NavigationProps>();
  const renderOrderCard = ({ item }: { item: IOrder }) => {
    return (
      <View style={styles.card}>
        {/* Order Header */}
        <View style={styles.header}>
          <CustomText style={styles.orderId}>
            Order ID: {item.id.slice(0, 15)}...
          </CustomText>
          <CustomText
            style={[
              styles.status,
              item.orderStatus === 'Pending'
                ? styles.pending
                : styles.completed,
            ]}
          >
            {item.orderStatus}
          </CustomText>
        </View>

        {/* Placed By & Date */}
        <CustomText style={styles.subText}>
          Placed by:{' '}
          <CustomText style={styles.boldText}>{item.orderedBy}</CustomText>
        </CustomText>
        <CustomText style={styles.subText}>
          Date: {new Date(item.orderPlacedDateAndTime).toLocaleString()}
        </CustomText>

        {/* Shipping Address */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Shipping Address:</CustomText>
          <CustomText style={styles.subText}>
            {item.shippingAddress.streetAddress}, {item.shippingAddress.city},{' '}
            {item.shippingAddress.state} {item.shippingAddress.zipcode},{' '}
            {item.shippingAddress.country}
          </CustomText>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => {
              navigation.navigate('TrackOrder', { orderId: item.id });
            }}
          >
            <CustomText style={styles.mapButtonText}>View Details</CustomText>
          </TouchableOpacity>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Items:</CustomText>
          {item.shippingItems.map((p, index) => (
            <CustomText key={index} style={styles.subText}>
              • Product: {p.productName} | Qty: {p.quantity} | Price: ${p.price}
            </CustomText>
          ))}
        </View>

        {/* Total & Payment Status */}
        <View style={styles.footer}>
          <CustomText style={styles.total}>Total: ${item.total}</CustomText>
          <CustomText
            style={[
              styles.paymentStatus,
              item.paymentStatus === 'NotPaid' ? styles.notPaid : styles.paid,
            ]}
          >
            {item.paymentStatus}
          </CustomText>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={orders}
      keyExtractor={item => item.id}
      renderItem={renderOrderCard}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <LottieView
            source={require('../../../assets/no_Data_found_lottie.json')}
            autoPlay
            loop
            style={{ width: 260, height: 260, marginBottom: 16 }}
          />
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontFamily: Font.textBolder,
    color: '#333',
    textTransform: 'uppercase',
  },
  status: {
    fontSize: 12,
    fontFamily: Font.textSemiBolder,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  pending: {
    backgroundColor: '#fff3e0',
    color: '#ff9800',
  },
  completed: {
    backgroundColor: '#e8f5e9',
    color: '#4caf50',
  },
  subText: {
    fontSize: 13,
    fontFamily: Font.textNormal,
    color: '#555',
    marginBottom: 2,
  },
  boldText: {
    fontFamily: Font.textSemiBolder,
    color: '#333',
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: Font.textSemiBolder,
    fontSize: 14,
    marginBottom: 3,
    color: '#222',
  },
  mapButton: {
    marginTop: 5,
  },
  mapButtonText: {
    color: '#007bff',
    fontSize: 13,
    fontFamily: Font.textSemiBolder,
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  total: {
    fontFamily: Font.textSemiBolder,
    fontSize: 14,
    color: '#333',
  },
  paymentStatus: {
    fontFamily: Font.textSemiBolder,
    fontSize: 13,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    overflow: 'hidden',
  },
  notPaid: {
    backgroundColor: '#ffebee',
    color: '#e53935',
  },
  paid: {
    backgroundColor: '#e8f5e9',
    color: '#4caf50',
  },
});

export default OrderListComponent;
