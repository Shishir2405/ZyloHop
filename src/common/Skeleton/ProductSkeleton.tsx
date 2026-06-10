import { StyleSheet, View } from 'react-native';

export const ProductSkeleton = () => {
  return (
    <View style={styles.row}>
      <View style={styles.image} />

      <View style={styles.middle}>
        <View style={[styles.block, styles.title]} />
        <View style={[styles.block, styles.subtitle]} />
      </View>

      <View style={styles.priceWrap}>
        <View style={[styles.block, styles.price]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 10, padding: 10 },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E3E3E3',
  },
  middle: { flex: 3, marginLeft: 10, justifyContent: 'center' },
  priceWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  block: { backgroundColor: '#E3E3E3', borderRadius: 6 },
  title: { width: '70%', height: 15, marginBottom: 8 },
  subtitle: { width: '50%', height: 12 },
  price: { width: 50, height: 15 },
});
