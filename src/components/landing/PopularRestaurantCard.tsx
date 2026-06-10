import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import CustomText from '../../common/CustomText';
import {Font} from '../../common/Theam';
import {SVG} from '../../common/SvgHelper';
import type {RestaurantDetail} from '../../api/types/foodFlowTypes';

interface PopularRestaurantCardProps {
  restaurant: RestaurantDetail;
  onPress: () => void;
}

const PopularRestaurantCard: React.FC<PopularRestaurantCardProps> = ({
  restaurant,
  onPress,
}) => {
  const imageUri = restaurant?.displayImage?.url;
  const subtitle = [restaurant?.address?.city, restaurant?.address?.state]
    .filter(Boolean)
    .join(', ');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.card}>
      <View style={styles.imageWrap}>
        {imageUri ? (
          <Image source={{uri: imageUri}} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <SVG.FoodIcon width={36} height={36} />
          </View>
        )}
        <View style={styles.ratingChip}>
          <SVG.SingleStar width={10} height={10} />
          <CustomText style={styles.ratingText}>4.6</CustomText>
        </View>
      </View>
      <View style={styles.body}>
        <CustomText style={styles.title} numberOfLines={1}>
          {restaurant?.restaurantName || 'Restaurant'}
        </CustomText>
        {subtitle ? (
          <CustomText style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </CustomText>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginRight: 14,
    overflow: 'hidden',
    shadowColor: '#1B1F23',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrap: {
    height: 110,
    width: '100%',
    backgroundColor: '#F2F4F8',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F4F8',
  },
  ratingChip: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27,31,35,0.78)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratingText: {
    color: '#FFFFFF',
    fontFamily: Font.textSemiBolder,
    fontSize: 11,
    marginLeft: 4,
  },
  body: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: {
    color: '#1B1F23',
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
  },
  subtitle: {
    color: '#7A8A99',
    fontSize: 11,
    marginTop: 2,
    fontFamily: Font.textNormal,
  },
});

export default PopularRestaurantCard;
