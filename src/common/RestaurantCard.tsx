import {useRef} from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import CustomText from './CustomText';
import {SVG} from './SvgHelper';
import {Image as FastImage} from 'expo-image';

const RestaurantCard = ({image, name, distance, onPress, disabled}: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.97,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.92,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(opacity, {
        toValue: 1,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}>
      <Animated.View
        style={[styles.cardContainer, {transform: [{scale}], opacity}]}>
        <FastImage source={{uri: image}} style={styles.cardImage} />
        <View style={styles.cardDetails}>
          <CustomText style={styles.cardTitle}>{name}</CustomText>
          <View style={styles.cardFooter}>
            <SVG.Ratings />
            <View style={styles.distanceContainer}>
              <SVG.LocationMinus color={'#A0A0A0'} />
              <CustomText style={styles.distanceText}>
                {`  ${distance} away`}
              </CustomText>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 10,
    borderRadius: 30,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 217,
  },
  cardDetails: {
    paddingVertical: 10,
  },
  cardTitle: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 13,
    color: '#A0A0A0',
  },
});

export default RestaurantCard;
