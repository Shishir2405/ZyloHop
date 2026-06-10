import React from 'react';
import { StyleSheet, View } from 'react-native';

const AddressSkeleton = () => {
  return (
    <View style={styles.container}>
      {[...Array(4)].map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={[styles.block, styles.name]} />
          <View style={[styles.block, styles.line80]} />
          <View style={[styles.block, styles.line60]} />
          <View style={[styles.block, styles.line40, styles.mt10]} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  card: {
    marginBottom: 20,
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#F3F3F3',
  },
  block: {
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E3E3E3',
    marginBottom: 6,
  },
  name: { width: 120, height: 16, marginBottom: 10 },
  line80: { width: '80%' },
  line60: { width: '60%' },
  line40: { width: '40%' },
  mt10: { marginTop: 10 },
});

export default AddressSkeleton;
