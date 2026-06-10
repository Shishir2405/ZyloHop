import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';

import {RestaurantDetail} from '../../api/types/foodFlowTypes';
import {UserType} from '../../api/types/userTypes';
import CustomText from '../../common/CustomText';
import Filter from '../../common/Filter';
import Footer from '../../common/Footer';
import Heading from '../../common/Heading';
import RestaurantCard from '../../common/RestaurantCard';
import SearchBar from '../../common/SearchBar';
import {SVG} from '../../common/SvgHelper';
import {Font} from '../../common/Theam';
import {useGetRestaurantList} from '../../data-access/queries/restaurant';
import {storeSelectedRestaurant} from '../../Redux/Reducer/restaurantReducer';
import {AuthStackParamList} from '../auth';

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'PopularRestaurantScreen'
>;

const PopularRestaurantScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const dispatch = useDispatch();
  const user: UserType = useSelector((state: any) => state?.Userinfo?.user);

  const [openFilter, setopenFilter] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useGetRestaurantList();

  const restaurants =
    data?.pages
      .flatMap(p => p ?? [])
      .filter((item): item is RestaurantDetail => item !== undefined) ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <CustomText style={styles.headerText}>Deliver to :</CustomText>
          <TouchableOpacity onPress={() => navigation.navigate('MyBag')}>
            <SVG.ShoppingCart />
          </TouchableOpacity>
        </View>
        <View style={styles.addressRow}>
          <CustomText style={styles.addressText}>
            {[user?.address?.city, user?.address?.state, user?.address?.country]
              .filter(Boolean)
              .join(', ') || 'N/A'}
          </CustomText>
          {/* <SVG.DownArrow width={20} color={'#797D82'} /> */}
        </View>

        {/* Search Bar */}
        <SearchBar placeholder="Search" Filter={() => setopenFilter(true)} />

        {/* Popular Restaurants Section */}
        <View style={styles.sectionHeader}>
          <Heading style={styles.sectionTitle}>Popular Restaurants</Heading>
          {/* <TouchableOpacity>
            <CustomText style={styles.viewAllText}>View all</CustomText>
          </TouchableOpacity> */}
        </View>
        {isLoading ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              height: 200,
            }}>
            <ActivityIndicator size="small" color="#EDAE10" />
          </View>
        ) : isError && restaurants.length === 0 ? (
          <View style={styles.stateContainer}>
            <CustomText style={styles.stateTitle}>
              Couldn't load restaurants
            </CustomText>
            <CustomText style={styles.stateSubtitle}>
              Check your connection and try again.
            </CustomText>
            <TouchableOpacity
              onPress={() => refetch()}
              style={styles.retryButton}>
              <CustomText style={styles.retryText}>Retry</CustomText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{height: '75%'}}>
            <FlatList
              data={restaurants}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              style={{}}
              renderItem={({item}: {item: RestaurantDetail}) => (
                <RestaurantCard
                  image={item.displayImage.url}
                  name={item.restaurantName}
                  distance="2km"
                  onPress={() => {
                    console.log('restaurna id ', item.id);

                    dispatch(storeSelectedRestaurant(item));
                    navigation.navigate('RestaurantDetailScreen', {
                      restaurantId: item.id,
                    });
                  }}
                />
              )}
              ListEmptyComponent={
                <View style={styles.stateContainer}>
                  <CustomText style={styles.stateTitle}>
                    No restaurants found
                  </CustomText>
                  <CustomText style={styles.stateSubtitle}>
                    We couldn't find any restaurants for your area yet.
                  </CustomText>
                </View>
              }
              onEndReached={() => hasNextPage && fetchNextPage()}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetchingNextPage ? <ActivityIndicator /> : null
              }
            />
          </View>
        )}
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          // padding: 10,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderColor: '#ccc',
        }}>
        <Footer />
      </View>

      <Filter isVisible={openFilter} closemodal={() => setopenFilter(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    margin: 20,
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
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  stateTitle: {
    fontSize: 16,
    fontFamily: Font.textSemiBolder,
    color: '#1A1A1A',
    marginBottom: 6,
    textAlign: 'center',
  },
  stateSubtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#EDAE10',
  },
  retryText: {
    color: '#fff',
    fontFamily: Font.textSemiBolder,
    fontSize: 14,
  },
});

export default PopularRestaurantScreen;
