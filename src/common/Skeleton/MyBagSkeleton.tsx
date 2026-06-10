import React from 'react';
import { StyleSheet, View } from 'react-native';

const BasketSkeleton = () => {
  return (
    <View style={styles.container}>
      {[...Array(5)].map((_, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.image} />

          <View style={styles.textCol}>
            <View style={[styles.block, styles.w60]} />
            <View style={[styles.block, styles.w40, styles.mt6]} />
            <View style={[styles.block, styles.w30, styles.mt6]} />
          </View>

          <View style={[styles.block, styles.price]} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#E3E3E3',
  },
  textCol: { flex: 1 },
  block: {
    height: 15,
    borderRadius: 4,
    backgroundColor: '#E3E3E3',
  },
  w60: { width: '60%' },
  w40: { width: '40%' },
  w30: { width: '30%' },
  mt6: { marginTop: 6 },
  price: { width: 50 },
});

export default BasketSkeleton;
