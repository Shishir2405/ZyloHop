import React from 'react';
import { StyleSheet, View } from 'react-native';

const OrderListSkeleton = () => {
  return (
    <View style={styles.container}>
      {[...Array(4)].map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={[styles.block, styles.w60, styles.h16]} />
          <View style={[styles.block, styles.w80, styles.h14, styles.mt6]} />
          <View style={[styles.block, styles.w50, styles.h14, styles.mt4]} />

          <View style={[styles.block, styles.w90, styles.h14, styles.mt10]} />
          <View style={[styles.block, styles.w85, styles.h14, styles.mt4]} />
          <View style={[styles.block, styles.w60, styles.h14, styles.mt4]} />

          <View style={[styles.block, styles.w80, styles.h14, styles.mt6]} />
          <View style={[styles.block, styles.w80, styles.h14, styles.mt6]} />

          <View style={[styles.row, styles.mt10]}>
            <View style={[styles.block, styles.w30, styles.h16]} />
            <View style={[styles.block, styles.w20, styles.h16]} />
          </View>

          <View style={[styles.block, styles.w25, styles.h14, styles.mt6]} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 4 },
  card: {
    marginBottom: 20,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#F3F3F3',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  block: {
    borderRadius: 4,
    backgroundColor: '#E3E3E3',
  },
  h14: { height: 14 },
  h16: { height: 16 },
  w20: { width: '20%' },
  w25: { width: '25%' },
  w30: { width: '30%' },
  w50: { width: '50%' },
  w60: { width: '60%' },
  w80: { width: '80%' },
  w85: { width: '85%' },
  w90: { width: '90%' },
  mt4: { marginTop: 4 },
  mt6: { marginTop: 6 },
  mt10: { marginTop: 10 },
});

export default OrderListSkeleton;
