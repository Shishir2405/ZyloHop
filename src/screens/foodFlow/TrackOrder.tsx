import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import {Colors, Font} from '../../common/Theam';
import {getOrderDeliveryApi} from '../../api/orderFoodApis';
import {
  IDeliveryStatus,
  IOrder,
  IOrderDelivery,
} from '../../api/types/orderFlowTypes';
import {useGetOrderDetailsById} from '../../data-access/queries/order';
import {locationHubService} from '../../services/LocationHubService';
import {formatAddress, formatAmount, GOOGLE_MAPS_APIKEY} from '../../utils/helper';
import {AuthStackParamList, TrackOrderParam} from '../auth';

type LatLng = {latitude: number; longitude: number};

// Coerce a possibly-untyped backend/SignalR value to a finite number, or null.
// Backend serializers occasionally hand decimals/longs back as numeric strings;
// MapViewDirections + Marker crash hard if either coord isn't a real number.
const toFiniteOrNull = (v: unknown): number | null => {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * Forward-geocode a free-text address to a single lat/lng pair.
 * Returns null on any failure so the caller can render the map without
 * the marker rather than blocking.
 */
async function geocode(address: string): Promise<LatLng | null> {
  if (!address || !GOOGLE_MAPS_APIKEY) return null;
  try {
    const url =
      'https://maps.googleapis.com/maps/api/geocode/json?address=' +
      encodeURIComponent(address) +
      '&key=' +
      GOOGLE_MAPS_APIKEY;
    const res = await fetch(url);
    const json = await res.json();
    const first = json?.results?.[0]?.geometry?.location;
    if (first?.lat != null && first?.lng != null) {
      return {latitude: first.lat, longitude: first.lng};
    }
  } catch {
    // swallow — map will simply show without that marker
  }
  return null;
}

type NavigationProps = StackNavigationProp<AuthStackParamList, 'DashboardScreen'>;
type TrackOrderRouteParam = RouteProp<AuthStackParamList, 'TrackOrder'>;

// In display order. Cancelled is rendered separately.
const TIMELINE: {key: IDeliveryStatus; label: string; sub: string}[] = [
  {key: 'Pending', label: 'Order placed', sub: "We're confirming your order"},
  {key: 'Assigned', label: 'Partner on the way', sub: 'Heading to the restaurant'},
  {key: 'PickedUp', label: 'Food picked up', sub: 'On the way to you'},
  {key: 'Delivered', label: 'Delivered', sub: 'Enjoy your meal!'},
];

const stepIndexFor = (status?: IDeliveryStatus | null): number => {
  if (!status) return 0;
  if (status === 'Cancelled') return -1;
  if (status === 'AtRestaurant') return 1;
  const i = TIMELINE.findIndex(s => s.key === status);
  return i >= 0 ? i : 0;
};

const TrackOrder: React.FC<TrackOrderParam> = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<TrackOrderRouteParam>();
  const orderId = route?.params?.orderId;

  const {
    data: orderResponse,
    isError: isOrderError,
    refetch: refetchOrder,
  } = useGetOrderDetailsById(orderId);
  const orderDetails: IOrder | undefined = orderResponse?.data;

  const [delivery, setDelivery] = useState<IOrderDelivery | null>(null);
  const [partnerLat, setPartnerLat] = useState<number | null>(null);
  const [partnerLng, setPartnerLng] = useState<number | null>(null);
  const [restaurantCoord, setRestaurantCoord] = useState<LatLng | null>(null);
  const [customerCoord, setCustomerCoord] = useState<LatLng | null>(null);
  // Device location, used purely as a fallback center for the map when no
  // partner/restaurant/customer coordinate has loaded yet — keeps the user
  // from staring at lat/lng (0,0) ocean view during the geocode delay.
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const mapRef = useRef<MapView | null>(null);

  // Best-effort device location fetch on mount. We intentionally swallow
  // errors and permission denials — this is only a map-centering hint, not
  // a hard dependency for tracking the order.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const {status} = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        const lat = toFiniteOrNull(position.coords.latitude);
        const lng = toFiniteOrNull(position.coords.longitude);
        if (lat != null && lng != null) {
          setCurrentLocation({latitude: lat, longitude: lng});
        }
      } catch {
        // ignore — fallback chain handles the empty case
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Geocode the two endpoints once we have addresses for them. Cached per
  // address string so changing screens and coming back doesn't re-fetch.
  useEffect(() => {
    let cancelled = false;
    const addr = delivery?.restaurantAddress;
    if (!addr) return;
    geocode(addr).then(c => {
      if (!cancelled && c) setRestaurantCoord(c);
    });
    return () => {
      cancelled = true;
    };
  }, [delivery?.restaurantAddress]);

  useEffect(() => {
    let cancelled = false;
    const addr = delivery?.customerAddress;
    if (!addr) return;
    geocode(addr).then(c => {
      if (!cancelled && c) setCustomerCoord(c);
    });
    return () => {
      cancelled = true;
    };
  }, [delivery?.customerAddress]);

  const fetchDelivery = useCallback(async () => {
    if (!orderId || !orderId.trim()) return;
    const res = await getOrderDeliveryApi(orderId);
    if (res.remote === 'success') {
      const data: any = (res.data as any)?.data ?? res.data;
      if (data) {
        setDelivery(data as IOrderDelivery);
        const lat = toFiniteOrNull(data.currentLatitude);
        const lng = toFiniteOrNull(data.currentLongitude);
        if (lat != null && lng != null) {
          setPartnerLat(lat);
          setPartnerLng(lng);
        }
      }
    }
  }, [orderId]);

  // Stop the safety-net poll once the delivery hits a terminal state — there
  // is nothing more to refresh, and the customer may stay on this screen.
  // Also stretches the interval to 60s since SignalR is the primary update
  // channel; this is just a fallback if the websocket drops silently.
  const isTerminal =
    delivery?.status === 'Delivered' || delivery?.status === 'Cancelled';

  useEffect(() => {
    fetchDelivery();
    if (isTerminal) return;
    const t = setInterval(fetchDelivery, 60_000);
    return () => clearInterval(t);
  }, [fetchDelivery, isTerminal]);

  // Subscribe to delivery SignalR events for this order.
  useEffect(() => {
    locationHubService.connect();

    const onAssigned = (data: {orderId: string}) => {
      if (data.orderId === orderId) fetchDelivery();
    };
    const onPickedUp = (data: {orderId: string; deliveryOtp: unknown}) => {
      if (data.orderId === orderId) {
        fetchDelivery();
        // Optimistically reveal delivery OTP without waiting for the GET.
        // Coerce in case the backend serializer hands the OTP back as a number.
        const otp = data.deliveryOtp != null ? String(data.deliveryOtp) : null;
        setDelivery(prev =>
          prev ? {...prev, deliveryOtp: otp, status: 'PickedUp'} : prev,
        );
      }
    };
    const onLocation = (data: {
      orderId: string;
      latitude: unknown;
      longitude: unknown;
    }) => {
      if (data.orderId !== orderId) return;
      const lat = toFiniteOrNull(data.latitude);
      const lng = toFiniteOrNull(data.longitude);
      if (lat == null || lng == null) return;
      setPartnerLat(lat);
      setPartnerLng(lng);
    };
    const onCompleted = (data: {orderId: string}) => {
      if (data.orderId === orderId) fetchDelivery();
    };

    locationHubService.onDeliveryAssigned(onAssigned);
    locationHubService.onDeliveryPickedUp(onPickedUp);
    locationHubService.onDeliveryLocationUpdate(onLocation);
    locationHubService.onDeliveryCompleted(onCompleted);

    return () => {
      locationHubService.offDeliveryAssigned();
      locationHubService.offDeliveryPickedUp();
      locationHubService.offDeliveryLocationUpdate();
      locationHubService.offDeliveryCompleted();
    };
  }, [orderId, fetchDelivery]);

  const stepIndex = stepIndexFor(delivery?.status);
  const isCancelled = delivery?.status === 'Cancelled';
  // Coerce here so the banner is the single source of truth for what gets
  // rendered. Mirrors the ride-side fix in 510056c.
  const deliveryOtpStr =
    delivery?.deliveryOtp != null ? String(delivery.deliveryOtp).trim() : '';
  const showOtpBanner = delivery?.status === 'PickedUp' && deliveryOtpStr.length > 0;

  const initialRegion: Region = useMemo(() => {
    // Priority chain: pick the first known coordinate so the map opens on
    // something meaningful instead of lat/lng (0,0) ocean.
    //   1. Partner GPS (most relevant — that's the moving pin)
    //   2. Restaurant pickup (geocoded from delivery.restaurantAddress)
    //   3. Customer drop (geocoded from delivery.customerAddress)
    //   4. Device current location (best-effort permission on mount)
    //   5. Neutral fallback: NYC, tight zoom — not (0,0), not zoom-out 60.
    const partnerPoint =
      partnerLat != null && partnerLng != null
        ? {latitude: partnerLat, longitude: partnerLng}
        : null;
    const center =
      partnerPoint ??
      restaurantCoord ??
      customerCoord ??
      currentLocation ?? {latitude: 40.7128, longitude: -74.006};
    return {
      latitude: center.latitude,
      longitude: center.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [partnerLat, partnerLng, restaurantCoord, customerCoord, currentLocation]);

  // True while we know none of the relevant coordinates — drives the
  // "Locating restaurant..." overlay on the map.
  const hasAnyCoord =
    (partnerLat != null && partnerLng != null) ||
    restaurantCoord != null ||
    customerCoord != null ||
    currentLocation != null;

  useEffect(() => {
    if (!mapRef.current) return;

    // Fit both endpoints of the active leg in view so the customer can see
    // the partner's progress relative to where the food is going.
    const partnerPoint =
      partnerLat != null && partnerLng != null
        ? {latitude: partnerLat, longitude: partnerLng}
        : null;
    const beforePickup =
      !delivery?.status ||
      delivery.status === 'Pending' ||
      delivery.status === 'Assigned' ||
      delivery.status === 'AtRestaurant';
    const otherEnd = beforePickup ? restaurantCoord : customerCoord;
    const points = [partnerPoint, otherEnd].filter(Boolean) as LatLng[];

    if (points.length === 2) {
      mapRef.current.fitToCoordinates(points, {
        edgePadding: {top: 60, bottom: 60, left: 60, right: 60},
        animated: true,
      });
    } else if (partnerPoint) {
      mapRef.current.animateToRegion(
        {...partnerPoint, latitudeDelta: 0.02, longitudeDelta: 0.02},
        500,
      );
    } else if (restaurantCoord && customerCoord) {
      mapRef.current.fitToCoordinates([restaurantCoord, customerCoord], {
        edgePadding: {top: 60, bottom: 60, left: 60, right: 60},
        animated: true,
      });
    }
  }, [partnerLat, partnerLng, restaurantCoord, customerCoord, delivery?.status]);

  const headerTitle = delivery?.restaurantName ?? 'Track order';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack title={headerTitle} />

      <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 40}}>
        {isOrderError && (
          <View style={styles.errorBanner}>
            <View style={{flex: 1}}>
              <CustomText style={styles.errorBannerTitle}>
                Couldn't load order details
              </CustomText>
              <CustomText style={styles.errorBannerSub}>
                Live tracking is still active. Tap retry to fetch the latest
                order info.
              </CustomText>
            </View>
            <TouchableOpacity
              onPress={() => refetchOrder()}
              style={styles.errorBannerBtn}>
              <CustomText style={styles.errorBannerBtnText}>Retry</CustomText>
            </TouchableOpacity>
          </View>
        )}

        {/* Hero status card */}
        <View style={styles.heroCard}>
          {isCancelled ? (
            <CustomText style={styles.heroTitle}>Delivery cancelled</CustomText>
          ) : (
            <>
              <CustomText style={styles.heroEta}>
                {delivery?.status === 'Delivered' ? 'Delivered' : 'Arriving soon'}
              </CustomText>
              <CustomText style={styles.heroSub}>
                {TIMELINE[Math.max(0, stepIndex)]?.sub}
              </CustomText>
            </>
          )}
        </View>

        {/* OTP banner — appears as soon as the partner picks up the food. */}
        {showOtpBanner && (
          <View style={styles.otpBanner}>
            <View style={{flex: 1}}>
              <CustomText style={styles.otpLabel}>Share this OTP at delivery</CustomText>
              <CustomText style={styles.otpValue}>{deliveryOtpStr}</CustomText>
            </View>
            <CustomText style={styles.otpHint}>
              The partner will ask for this 4-digit code to complete your order.
            </CustomText>
          </View>
        )}

        {/* Map — partner pin + restaurant + customer markers + active-leg route line */}
        <View style={styles.mapWrap}>
          <MapView
            ref={mapRef}
            // Android has the Google Maps key wired up in strings.xml; iOS
            // does NOT call GMSServices.provideAPIKey in AppDelegate, so
            // forcing PROVIDER_GOOGLE there renders a blank gray tile with
            // just the Google logo. Fall back to Apple Maps on iOS.
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={styles.map}
            initialRegion={initialRegion}>
            {restaurantCoord && (
              <Marker
                coordinate={restaurantCoord}
                title={delivery?.restaurantName ?? 'Restaurant'}
                description="Pickup"
                pinColor="#10B981"
              />
            )}
            {customerCoord && (
              <Marker
                coordinate={customerCoord}
                title="Your address"
                description="Drop"
                pinColor="#EF4444"
              />
            )}
            {partnerLat != null && partnerLng != null && (
              <Marker
                coordinate={{latitude: partnerLat, longitude: partnerLng}}
                title={delivery?.partnerName ?? 'Delivery partner'}
                description={delivery?.status}
                pinColor="#EDAE10"
              />
            )}

            {/* Active-leg route line.
                Before pickup: partner → restaurant.
                After pickup: partner → customer.
                Falls back to restaurant → customer if we don't have a
                partner GPS yet. */}
            {(() => {
              const partnerPoint =
                partnerLat != null && partnerLng != null
                  ? {latitude: partnerLat, longitude: partnerLng}
                  : null;

              const beforePickup =
                delivery?.status === 'Pending' ||
                delivery?.status === 'Assigned' ||
                delivery?.status === 'AtRestaurant';

              const origin =
                partnerPoint ??
                (beforePickup ? null : restaurantCoord);
              const destination = beforePickup
                ? restaurantCoord
                : customerCoord;

              if (!origin || !destination) {
                // Show the static restaurant→customer line so the customer
                // sees the food's path even before a partner is assigned.
                if (restaurantCoord && customerCoord) {
                  return (
                    <MapViewDirections
                      origin={restaurantCoord}
                      destination={customerCoord}
                      apikey={GOOGLE_MAPS_APIKEY}
                      strokeWidth={4}
                      strokeColor="#9CA3AF"
                    />
                  );
                }
                return null;
              }
              return (
                <MapViewDirections
                  origin={origin}
                  destination={destination}
                  apikey={GOOGLE_MAPS_APIKEY}
                  strokeWidth={5}
                  strokeColor={beforePickup ? '#10B981' : '#EDAE10'}
                />
              );
            })()}
          </MapView>

          {/* Overlay shown while we have nothing to anchor the map on yet —
              avoids the "blank gray tile" look when the geocode + device
              location requests are still in flight. Disappears as soon as
              any of: partner GPS, restaurant geocode, customer geocode, or
              device location resolves. */}
          {!hasAnyCoord && (
            <View pointerEvents="none" style={styles.mapLoadingOverlay}>
              <View style={styles.mapLoadingCard}>
                <ActivityIndicator color="#EDAE10" />
                <CustomText style={styles.mapLoadingText}>
                  Locating restaurant...
                </CustomText>
              </View>
            </View>
          )}
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          {TIMELINE.map((step, i) => {
            const done = i <= stepIndex;
            const active = i === stepIndex;
            return (
              <View key={step.key} style={styles.timelineRow}>
                <View
                  style={[
                    styles.timelineDot,
                    done && styles.timelineDotDone,
                    active && styles.timelineDotActive,
                  ]}
                />
                {i < TIMELINE.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      done && styles.timelineLineDone,
                    ]}
                  />
                )}
                <View style={styles.timelineText}>
                  <CustomText
                    style={[
                      styles.timelineTitle,
                      done && styles.timelineTitleDone,
                    ]}>
                    {step.label}
                  </CustomText>
                  <CustomText style={styles.timelineSub}>{step.sub}</CustomText>
                </View>
              </View>
            );
          })}
        </View>

        {/* Partner card */}
        {delivery?.partnerName ? (
          <View style={styles.partnerCard}>
            <View style={{flex: 1}}>
              <CustomText style={styles.partnerName}>
                {delivery.partnerName}
              </CustomText>
              <CustomText style={styles.partnerSub}>
                Your delivery partner
              </CustomText>
            </View>
            {delivery.partnerPhone ? (
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => Linking.openURL(`tel:${delivery.partnerPhone}`)}>
                <CustomText style={styles.callButtonText}>Call</CustomText>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <View style={styles.partnerCard}>
            <ActivityIndicator color="#EDAE10" />
            <CustomText style={[styles.partnerSub, {marginLeft: 12}]}>
              Looking for a delivery partner...
            </CustomText>
          </View>
        )}

        {/* Address */}
        <View style={styles.addressCard}>
          <CustomText style={styles.sectionTitle}>Delivery address</CustomText>
          <CustomText style={styles.bodyText}>
            {formatAddress(orderDetails?.shippingAddress)}
          </CustomText>
        </View>

        {/* Order summary */}
        <View style={styles.summaryCard}>
          <CustomText style={styles.sectionTitle}>Order summary</CustomText>
          {orderDetails?.shippingItems?.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <CustomText style={styles.itemQty}>
                {item.quantity}× {item.productName}
              </CustomText>
              <CustomText style={styles.itemPrice}>
                ${formatAmount(item.price * item.quantity)}
              </CustomText>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <CustomText style={styles.billLabel}>Subtotal</CustomText>
            <CustomText style={styles.billValue}>
              ${formatAmount(orderDetails?.subTotal)}
            </CustomText>
          </View>
          <View style={styles.billRow}>
            <CustomText style={styles.billLabel}>Tax</CustomText>
            <CustomText style={styles.billValue}>
              ${formatAmount(orderDetails?.flatTax ?? 0)}
            </CustomText>
          </View>
          <View style={styles.billRow}>
            <CustomText style={styles.totalLabel}>Total</CustomText>
            <CustomText style={styles.totalValue}>
              ${formatAmount(orderDetails?.total)}
            </CustomText>
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Feedback')}>
          <CustomText style={styles.support}>Need help? Contact support</CustomText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F7F7F7'},
  container: {flex: 1},

  heroCard: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  heroEta: {fontSize: 22, fontFamily: Font.textBolder, color: '#1A1A1A'},
  heroSub: {marginTop: 4, fontSize: 13, color: '#6B6B6B'},
  heroTitle: {fontSize: 20, fontFamily: Font.textBolder, color: '#B91C1C'},

  otpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFBE6',
    borderWidth: 1,
    borderColor: '#F2C94C',
  },
  otpLabel: {fontSize: 12, color: '#8B6E00', fontFamily: Font.textSemiBolder},
  otpValue: {
    fontSize: 32,
    color: '#1A1A1A',
    fontFamily: Font.textBolder,
    letterSpacing: 6,
    marginTop: 2,
  },
  otpHint: {fontSize: 11, color: '#8B6E00', flex: 1, marginLeft: 12, lineHeight: 14},

  mapWrap: {
    height: 220,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  map: {flex: 1},
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLoadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  mapLoadingText: {
    marginLeft: 10,
    fontSize: 13,
    color: '#1A1A1A',
    fontFamily: Font.textSemiBolder,
  },

  timeline: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  timelineRow: {flexDirection: 'row', alignItems: 'flex-start'},
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    marginRight: 12,
    marginTop: 4,
  },
  timelineDotDone: {backgroundColor: '#10B981', borderColor: '#10B981'},
  timelineDotActive: {borderColor: '#EDAE10', backgroundColor: '#EDAE10'},
  timelineLine: {
    position: 'absolute',
    left: 6,
    top: 18,
    bottom: -16,
    width: 2,
    backgroundColor: '#E5E7EB',
  },
  timelineLineDone: {backgroundColor: '#10B981'},
  timelineText: {flex: 1, paddingBottom: 16},
  timelineTitle: {fontSize: 14, color: '#9CA3AF', fontFamily: Font.textSemiBolder},
  timelineTitleDone: {color: '#1A1A1A'},
  timelineSub: {fontSize: 12, color: '#9CA3AF', marginTop: 2},

  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
  },
  partnerName: {fontSize: 16, fontFamily: Font.textBolder, color: '#1A1A1A'},
  partnerSub: {fontSize: 12, color: '#6B6B6B', marginTop: 2},
  callButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#EDAE10',
  },
  callButtonText: {color: '#fff', fontFamily: Font.textSemiBolder},

  addressCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
  },
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: Font.textBolder,
    marginBottom: 8,
  },
  bodyText: {fontSize: 13, color: '#4B5563', lineHeight: 18},

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  itemQty: {fontSize: 14, color: '#1A1A1A'},
  itemPrice: {fontSize: 14, color: '#1A1A1A', fontFamily: Font.textSemiBolder},
  divider: {height: 1, backgroundColor: '#F0F0F0', marginVertical: 8},
  billRow: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4},
  billLabel: {fontSize: 13, color: '#6B6B6B'},
  billValue: {fontSize: 13, color: '#1A1A1A'},
  totalLabel: {fontSize: 15, color: '#1A1A1A', fontFamily: Font.textBolder},
  totalValue: {fontSize: 15, color: '#1A1A1A', fontFamily: Font.textBolder},

  support: {
    color: '#6B6B6B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
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

export default TrackOrder;
