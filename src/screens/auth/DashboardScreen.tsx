import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import {registerDeviceTokenApi} from '../../api/rideBookingApis';
import CommonModal from '../../common/CommonModal';
import CustomText from '../../common/CustomText';
import Footer from '../../common/Footer';
import Heading from '../../common/Heading';
import Input from '../../common/Input';
import {SVG} from '../../common/SvgHelper';
import {Colors, Font} from '../../common/Theam';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '.';
import {errorToast} from '../../components/toasts';
import {storeIsLoading} from '../../Redux/Reducer/loadingRedux';
import {storePopularRestaurants} from '../../Redux/Reducer/restaurantReducer';
import {getAllRestApi} from '../../api/foodFlowApis';
import {RestaurantDetail} from '../../api/types/foodFlowTypes';
import {useDispatch, useSelector} from 'react-redux';
import {UserType} from '../../api/types/userTypes';
import {GOOGLE_MAPS_API_KEY} from '../../config';
import {extractErrorMessage} from '../../utils/helper';
import HeroGreeting from '../../components/landing/HeroGreeting';
import ServiceTile from '../../components/landing/ServiceTile';
import SectionHeader from '../../components/landing/SectionHeader';
import PopularRestaurantCard from '../../components/landing/PopularRestaurantCard';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const GOOGLE_API_KEY = GOOGLE_MAPS_API_KEY;

type PlaceSuggestion = {
  placeId: string;
  description: string;
};

type RecentPlaceProps = {
  place: any;
  onSelect: (place: any) => void;
};
const RecentPlace: React.FC<RecentPlaceProps> = ({place, onSelect}) => (
  <TouchableOpacity onPress={() => onSelect(place)} style={styles.placeRow}>
    <View style={styles.placeIcon}>
      <SVG.MarkerDark />
    </View>
    <View style={styles.placeInfo}>
      <CustomText style={styles.placeName}>{place.name}</CustomText>
      <CustomText style={styles.placeAddress}>{place.address}</CustomText>
    </View>
    <View style={styles.placeDistance}>
      <CustomText style={styles.distanceText}>{place.distance}</CustomText>
    </View>
  </TouchableOpacity>
);

type NavigationProps = StackNavigationProp<AuthStackParamList, 'DashboardScreen'>;

const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const dispatch = useDispatch();
  const popularRestaurants: RestaurantDetail[] = useSelector(
    (state: any) => state?.restaurant?.popularRestaurants,
  );
  const user: UserType | undefined = useSelector(
    (state: any) => state?.Userinfo?.user,
  );
  const selectedAddress = useSelector(
    (state: any) => state?.Userinfo?.selectedAddress,
  );

  const [isModalVisible, setisModalVisible] = useState(false);

  // Location state for autocomplete biasing
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);

  // Pickup & Drop state
  const [pickupText, setPickupText] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupLat, setPickupLat] = useState(0);
  const [pickupLng, setPickupLng] = useState(0);
  const [dropText, setDropText] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [dropLat, setDropLat] = useState(0);
  const [dropLng, setDropLng] = useState(0);

  // Suggestions state
  const [pickupSuggestions, setPickupSuggestions] = useState<PlaceSuggestion[]>(
    [],
  );
  const [dropSuggestions, setDropSuggestions] = useState<PlaceSuggestion[]>([]);
  const [activeField, setActiveField] = useState<'pickup' | 'drop' | null>(
    null,
  );

  // Entry animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 360,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [fadeIn, slideUp]);

  useEffect(() => {
    (async () => {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCurrentLat(position.coords.latitude);
      setCurrentLng(position.coords.longitude);
    })();
  }, []);

  useEffect(() => {
    const registerForPush = async () => {
      try {
        const permission: any = await Notifications.requestPermissionsAsync();
        const granted =
          permission?.granted ?? permission?.status === 'granted';
        if (!granted) return;
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        if (tokenData?.data) {
          await registerDeviceTokenApi(tokenData.data, Platform.OS);
        }
      } catch {}
    };
    registerForPush();
  }, []);

  const fetchSuggestions = async (text: string, field: 'pickup' | 'drop') => {
    if (text.length < 2) {
      if (field === 'pickup') setPickupSuggestions([]);
      else setDropSuggestions([]);
      return;
    }

    try {
      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        text,
      )}&key=${GOOGLE_API_KEY}&language=en`;
      if (currentLat && currentLng) {
        url += `&location=${currentLat},${currentLng}&radius=50000`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'OK' && data.predictions) {
        const suggestions = data.predictions.map((p: any) => ({
          placeId: p.place_id,
          description: p.description,
        }));
        if (field === 'pickup') setPickupSuggestions(suggestions);
        else setDropSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Autocomplete fetch error:', error);
    }
  };

  const navigateToRideSelect = (
    pAddr: string,
    pLat: number,
    pLng: number,
    dAddr: string,
    dLat: number,
    dLng: number,
  ) => {
    setisModalVisible(false);
    setPickupText('');
    setPickupAddress('');
    setPickupLat(0);
    setPickupLng(0);
    setDropText('');
    setDropAddress('');
    setDropLat(0);
    setDropLng(0);
    setPickupSuggestions([]);
    setDropSuggestions([]);
    setActiveField(null);
    navigation.navigate('RideSelectScreen', {
      pickupAddress: pAddr,
      pickupLat: pLat,
      pickupLng: pLng,
      dropAddress: dAddr,
      dropLat: dLat,
      dropLng: dLng,
    });
  };

  const selectSuggestion = async (
    suggestion: PlaceSuggestion,
    field: 'pickup' | 'drop',
  ) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.placeId}&fields=geometry&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result?.geometry?.location) {
        const {lat, lng} = data.result.geometry.location;
        if (field === 'pickup') {
          setPickupText(suggestion.description);
          setPickupAddress(suggestion.description);
          setPickupLat(lat);
          setPickupLng(lng);
          setPickupSuggestions([]);
          if (dropLat !== 0 && dropLng !== 0 && dropAddress) {
            navigateToRideSelect(
              suggestion.description,
              lat,
              lng,
              dropAddress,
              dropLat,
              dropLng,
            );
            return;
          }
        } else {
          setDropText(suggestion.description);
          setDropAddress(suggestion.description);
          setDropLat(lat);
          setDropLng(lng);
          setDropSuggestions([]);
          if (pickupLat !== 0 && pickupLng !== 0 && pickupAddress) {
            navigateToRideSelect(
              pickupAddress,
              pickupLat,
              pickupLng,
              suggestion.description,
              lat,
              lng,
            );
            return;
          }
        }
      }
    } catch (error) {
      console.error('Place details fetch error:', error);
    }
    setActiveField(null);
  };

  const recentPlaces = [
    {
      name: 'Office',
      address: '2972 Westheimer Rd. Santa Ana, Illinois 85486',
      distance: '2.7km',
    },
    {
      name: 'Coffee shop',
      address: '1901 Thornridge Cir. Shiloh, Hawaii 81063',
      distance: '1.1km',
    },
    {
      name: 'Shopping center',
      address: '4140 Parker Rd. Allentown, New Mexico 31134',
      distance: '4.9km',
    },
    {
      name: 'Shopping mall',
      address: '4140 Parker Rd. Allentown, New Mexico 31134',
      distance: '4.0km',
    },
  ];

  const handleGetAllRestaurant = async () => {
    try {
      if (popularRestaurants?.length == 0) {
        dispatch(storeIsLoading(true));
      }
      const response = await getAllRestApi(1, 10);

      if (response?.remote === 'success') {
        dispatch(storePopularRestaurants(response.data.data));
      } else {
        if (response?.errors?.status === 401) {
          navigation.reset({
            index: 0,
            routes: [{name: 'SignInScreen'}],
          });
        }
        errorToast(extractErrorMessage(response));
      }
    } finally {
      dispatch(storeIsLoading(false));
    }
  };

  useEffect(() => {
    handleGetAllRestaurant();
  }, []);

  const locationLabel = useMemo(() => {
    const addr =
      selectedAddress?.streetAddress ||
      user?.address?.streetAddress ||
      user?.address?.city ||
      '';
    return addr || 'Tap to set your delivery location';
  }, [selectedAddress, user]);

  const firstName = user?.firstName;
  const popularList = popularRestaurants || [];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Animated.View
            style={{opacity: fadeIn, transform: [{translateY: slideUp}]}}>
            <HeroGreeting
              firstName={firstName}
              locationLabel={locationLabel}
              onPressLocation={() => navigation.navigate('Address')}
            />

            {/* Dual primary action tiles */}
            <View style={styles.tileRow}>
              <ServiceTile
                icon={SVG.CarIcon}
                label="Book a Ride"
                description="Cabs in minutes"
                gradient={['#22272B', '#3A4148']}
                accent="#EDAE10"
                onPress={() => navigation.navigate('RideSelectScreen')}
                style={{marginRight: 7}}
              />
              <ServiceTile
                icon={SVG.FoodIcon}
                label="Order Food"
                description="Tasty meals nearby"
                gradient={['#F7B733', '#FC4A1A']}
                accent="#FFFFFF"
                onPress={() => navigation.navigate('PopularRestaurantScreen')}
                style={{marginLeft: 7}}
              />
            </View>

            {/* Quick Ride card — secondary direct entry */}
            <View style={styles.quickRideCard}>
              <View style={styles.quickRideHeader}>
                <View style={styles.quickRideIcon}>
                  <SVG.NavigationIcon width={18} height={18} />
                </View>
                <View style={{flex: 1}}>
                  <CustomText style={styles.quickRideTitle}>
                    Quick Ride
                  </CustomText>
                  <CustomText style={styles.quickRideSubtitle}>
                    Where do you want to go?
                  </CustomText>
                </View>
              </View>
              <Pressable
                onPress={() => setisModalVisible(true)}
                style={styles.quickRideField}>
                <View style={styles.pickupDot} />
                <CustomText style={styles.quickRideFieldText}>
                  Pickup location
                </CustomText>
              </Pressable>
              <View style={styles.quickRideDivider} />
              <Pressable
                onPress={() => setisModalVisible(true)}
                style={styles.quickRideField}>
                <View style={styles.dropDot} />
                <CustomText style={styles.quickRideFieldText}>
                  Drop location
                </CustomText>
              </Pressable>
            </View>

            {/* Refund banner — keep existing brand asset */}
            <View style={styles.bannerContainer}>
              <SVG.RefundBanner />
            </View>

            {/* Popular Restaurants horizontal scroll */}
            <SectionHeader
              title="Popular near you"
              actionLabel="See all"
              onAction={() => navigation.navigate('PopularRestaurantScreen')}
            />
            {popularList.length > 0 ? (
              <FlatList
                data={popularList}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
                keyExtractor={(item, idx) => item?.id ?? String(idx)}
                renderItem={({item}) => (
                  <PopularRestaurantCard
                    restaurant={item}
                    onPress={() =>
                      navigation.navigate('RestaurantDetailScreen', {
                        restaurantId: item.id,
                      })
                    }
                  />
                )}
              />
            ) : (
              <View style={styles.emptyState}>
                <CustomText style={styles.emptyStateText}>
                  We&apos;ll surface popular spots near you soon.
                </CustomText>
              </View>
            )}

            <View style={styles.bottomSpacer} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      <Footer isHome />

      {/* Location search modal */}
      <CommonModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setisModalVisible}>
        <Heading style={styles.modalHeading}>Select address</Heading>
        <View style={styles.modalDivider} />
        <View style={styles.modalContent}>
          <Input
            placeholder="From"
            value={pickupText}
            onChangeText={(text: string) => {
              setPickupText(text);
              setPickupLat(0);
              setPickupLng(0);
              setActiveField('pickup');
              fetchSuggestions(text, 'pickup');
            }}
            onFocus={() => setActiveField('pickup')}
            leftButton={<SVG.LocationPointerIcon />}
          />
          {activeField === 'pickup' && pickupSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {pickupSuggestions.map(item => (
                <TouchableOpacity
                  key={item.placeId}
                  style={styles.suggestionRow}
                  onPress={() => selectSuggestion(item, 'pickup')}>
                  <View style={styles.suggestionIcon}>
                    <SVG.MarkerDark />
                  </View>
                  <CustomText style={styles.suggestionText} numberOfLines={2}>
                    {item.description}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <Input
            placeholder="To"
            value={dropText}
            onChangeText={(text: string) => {
              setDropText(text);
              setDropLat(0);
              setDropLng(0);
              setActiveField('drop');
              fetchSuggestions(text, 'drop');
            }}
            onFocus={() => setActiveField('drop')}
            leftButton={<SVG.LocationMarker />}
          />
          {activeField === 'drop' && dropSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {dropSuggestions.map(item => (
                <TouchableOpacity
                  key={item.placeId}
                  style={styles.suggestionRow}
                  onPress={() => selectSuggestion(item, 'drop')}>
                  <View style={styles.suggestionIcon}>
                    <SVG.MarkerDark />
                  </View>
                  <CustomText style={styles.suggestionText} numberOfLines={2}>
                    {item.description}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={styles.recentPlacesContainer}>
            <CustomText style={styles.recentPlacesTitle}>
              Recent places
            </CustomText>
            <FlatList
              data={recentPlaces}
              renderItem={({item}) => (
                <RecentPlace
                  place={item}
                  onSelect={place => {
                    if (pickupLat !== 0 && pickupAddress) {
                      setisModalVisible(false);
                      navigation.navigate('RideSelectScreen', {
                        pickupAddress,
                        pickupLat,
                        pickupLng,
                        dropAddress: place.address,
                        dropLat: 0,
                        dropLng: 0,
                      });
                    } else {
                      setDropText(place.address);
                      setDropAddress(place.address);
                      setActiveField('pickup');
                    }
                  }}
                />
              )}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.flatListContent}
            />
          </View>
        </View>
      </CommonModal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  tileRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 14,
  },
  quickRideCard: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#F6F7F9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  quickRideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickRideIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickRideTitle: {
    color: '#1B1F23',
    fontSize: 15,
    fontFamily: Font.textBolder,
  },
  quickRideSubtitle: {
    color: '#7A8A99',
    fontSize: 12,
    fontFamily: Font.textNormal,
    marginTop: 1,
  },
  quickRideField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EDAE10',
    marginRight: 12,
  },
  dropDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22272B',
    marginRight: 12,
  },
  quickRideFieldText: {
    color: '#5A6470',
    fontSize: 14,
    fontFamily: Font.textNormal,
  },
  quickRideDivider: {
    height: 8,
  },
  bannerContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 22,
    alignItems: 'center',
  },
  horizontalListContent: {
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  emptyState: {
    marginHorizontal: 20,
    padding: 24,
    backgroundColor: '#F2F4F8',
    borderRadius: 18,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: '#7A8A99',
    fontFamily: Font.textNormal,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 30,
  },
  // Modal styles
  modalHeading: {
    fontSize: 20,
    fontFamily: Font.textSemiBolder,
    marginVertical: 10,
  },
  modalDivider: {
    borderBottomWidth: 0.5,
    width: '100%',
    borderBottomColor: Colors.lightGrey,
  },
  modalContent: {
    marginHorizontal: 10,
    paddingHorizontal: 20,
  },
  recentPlacesContainer: {
    flex: 1,
    borderTopWidth: 0.5,
    borderColor: Colors.lightGrey,
  },
  recentPlacesTitle: {
    color: '#5A5A5A',
    fontSize: 16,
    fontFamily: Font.textSemiBolder,
    marginVertical: 10,
  },
  flatListContent: {},
  placeRow: {
    flexDirection: 'row',
    marginVertical: 10,
    width: '100%',
  },
  placeIcon: {
    justifyContent: 'flex-start',
    marginRight: 5,
    width: '5%',
  },
  placeInfo: {
    width: '80%',
  },
  placeName: {
    color: '#5A5A5A',
    fontFamily: Font.textSemiBolder,
    lineHeight: 23,
  },
  placeAddress: {
    fontSize: 12,
  },
  placeDistance: {
    width: '15%',
  },
  distanceText: {
    fontSize: 14,
    color: '#5A5A5A',
    fontFamily: Font.textSemiBolder,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: -5,
    marginBottom: 5,
    maxHeight: 200,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Font.textNormal,
    color: '#2A2A2A',
  },
});

export default DashboardScreen;
