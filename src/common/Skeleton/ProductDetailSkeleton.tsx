import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const ProductDetailsSkeleton = () => {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.headerRow}>
        <View style={styles.circle} />
        <View style={[styles.block, styles.headerTitle]} />
        <View style={[styles.circle, styles.mlAuto]} />
      </View>

      <View style={styles.image} />

      <View style={styles.sizeRow}>
        <View style={styles.sizePill} />
        <View style={styles.sizePill} />
        <View style={styles.sizePill} />
      </View>

      <View style={styles.descWrap}>
        <View style={[styles.block, styles.w90]} />
        <View style={[styles.block, styles.w80]} />
        <View style={[styles.block, styles.w70]} />
      </View>

      <View style={styles.footerWrap}>
        <View style={styles.footerRow}>
          <View style={[styles.block, styles.price]} />
          <View style={styles.counterRow}>
            <View style={styles.circle} />
            <View style={[styles.block, styles.counterText]} />
            <View style={styles.circle} />
          </View>
        </View>
        <View style={[styles.block, styles.cta]} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  block: {
    backgroundColor: '#E3E3E3',
    borderRadius: 8,
    height: 14,
    marginBottom: 6,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E3E3E3',
  },
  headerRow: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  headerTitle: { width: 120, height: 20, marginLeft: 12 },
  mlAuto: { marginLeft: 'auto' },
  image: { width: '100%', height: 250, backgroundColor: '#E3E3E3' },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  sizePill: {
    width: 80,
    height: 35,
    borderRadius: 20,
    marginHorizontal: 8,
    backgroundColor: '#E3E3E3',
  },
  descWrap: { paddingHorizontal: 16 },
  w90: { width: '90%' },
  w80: { width: '80%' },
  w70: { width: '70%' },
  footerWrap: { padding: 16, marginTop: 30 },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: { width: 80, height: 20, marginBottom: 0 },
  counterRow: { flexDirection: 'row', alignItems: 'center' },
  counterText: { width: 20, height: 20, marginHorizontal: 12, marginBottom: 0 },
  cta: {
    width: '100%',
    height: 45,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 0,
  },
});

export default ProductDetailsSkeleton;
