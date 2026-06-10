import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image as FastImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import CommonTab from '../../common/CommonTab';
import CustomText from '../../common/CustomText';
import Footer from '../../common/Footer';
import Header from '../../common/Header';
import { SVG } from '../../common/SvgHelper';
import { Font } from '../../common/Theam';
import {
  useGetRestaurantAllCagtegoryById,
  useGetRestaurantDetailsById,
} from '../../data-access/queries/restaurant';
import { AuthStackParamList, RestaurantDetailParam } from '../auth';
import { RestaurantDetail } from '../../api/types/foodFlowTypes';
import { useSelector } from 'react-redux';

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'RestaurantDetailScreen'
>;
type RestaurantDetailRouteParam = RouteProp<
  AuthStackParamList,
  'RestaurantDetailScreen'
>;
const RestaurantDetailScreen: React.FC<RestaurantDetailParam> = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RestaurantDetailRouteParam>();
  const selectedRestaurant: RestaurantDetail = useSelector(
    (state: any) => state?.restaurant.selectedRestaurant,
  );
  const restaurantId = route?.params?.restaurantId || selectedRestaurant?.id;

  const {
    data: restaurantDetails,
    refetch: refetchRestaurantDetails,
    isError: isDetailsError,
  } = useGetRestaurantDetailsById(restaurantId);
  const {
    data: restaurantAllCategories,
    refetch: refetchRestaurantAllCategories,
  } = useGetRestaurantAllCagtegoryById(restaurantId);

  useEffect(() => {
    if (restaurantId) {
      refetchRestaurantAllCategories();
      refetchRestaurantDetails();
    }
  }, [restaurantId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header
          showBack
          rightWidget={
            <TouchableOpacity onPress={() => navigation.navigate('MyBag')}>
              <SVG.ShoppingCart />
            </TouchableOpacity>
          }
          title={restaurantDetails?.restaurantName || 'Restaurant Details'}
        />
        <FastImage
          source={{ uri: restaurantDetails?.displayImage.url }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.container}>
          {isDetailsError && (
            <View style={styles.errorBanner}>
              <View style={{flex: 1}}>
                <CustomText style={styles.errorBannerTitle}>
                  Couldn't load restaurant
                </CustomText>
                <CustomText style={styles.errorBannerSub}>
                  Tap retry to fetch the details again.
                </CustomText>
              </View>
              <TouchableOpacity
                onPress={() => refetchRestaurantDetails()}
                style={styles.errorBannerBtn}
              >
                <CustomText style={styles.errorBannerBtnText}>Retry</CustomText>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.cardDetails}>
            <CustomText style={styles.cardTitle}>
              {restaurantDetails?.restaurantName}
            </CustomText>
            <View style={styles.cardFooter}>
              <SVG.Ratings />
            </View>
          </View>
          <CommonTab
            key={'categories' + restaurantId}
            restaurantCategories={restaurantAllCategories || []}
          />
        </View>
      </ScrollView>
      <Footer isHome />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    marginHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontFamily: Font.textSemiBolder,
    fontSize: 20,
    color: 'black',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  addressText: {
    fontSize: 15,
    color: '#797D82',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 17,
    color: 'black',
  },
  viewAllText: {
    fontSize: 13,
    color: '#EDAE10',
  },
  cardContainer: {
    marginVertical: 10,
    borderRadius: 30,
    overflow: 'hidden',
  },
  cardImage: {
    height: 254,
    borderRadius: 0,
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorBannerTitle: {
    fontSize: 13,
    color: '#991B1B',
    fontFamily: Font.textSemiBolder,
  },
  errorBannerSub: {
    fontSize: 11,
    color: '#7F1D1D',
    marginTop: 2,
    lineHeight: 14,
  },
  errorBannerBtn: {
    marginLeft: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#DC2626',
  },
  errorBannerBtnText: {
    color: '#fff',
    fontFamily: Font.textSemiBolder,
    fontSize: 12,
  },
});

export default RestaurantDetailScreen;
