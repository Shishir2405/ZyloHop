import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';

import { MapTheme, MAP_THEMES, getMapStyle } from '../../utils/mapStyles';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Modal from 'react-native-modal';

import CustomText from '../../common/CustomText';
import Footer from '../../common/Footer';
import { SubmitButton } from '../../components/forms/SubmitButton';
import { FormFieldError } from '../../components/forms/FormFieldError';
import { SVG } from '../../common/SvgHelper';
import { Font } from '../../common/Theam';
import { GOOGLE_MAPS_APIKEY } from '../../utils/helper';
import AvailableRidesModal from './Components/AvailableRidesModal';
import RideErrorBoundary from './Components/RideErrorBoundary';
import {
  confirmRideLocationApi,
  calculateRideRouteApi,
  getRecentRidesApi,
  getOnlineRidersApi,
} from '../../api/rideBookingApis';
import { errorToast } from '../../components/toasts';
import { getFriendlyErrorMessage } from '../../utils/errorMessages';
import { useRoute } from '@react-navigation/native';
import { GOOGLE_MAPS_API_KEY as GOOGLE_API_KEY } from '../../config/env';

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

const RideSelectScreen = () => {
  const mapRef = useRef<MapView>(null);
  const route = useRoute<any>();

  // Location state
  const [pickup, setPickup] = useState<LocationData | null>(() => {
    if (route.params?.pickupAddress && route.params?.pickupLat) {
      return {
        address: route.params.pickupAddress,
        latitude: route.params.pickupLat,
        longitude: route.params.pickupLng,
      };
    }
    return null;
  });
  const [drop, setDrop] = useState<LocationData | null>(() => {
    if (route.params?.dropAddress && route.params?.dropLat) {
      return {
        address: route.params.dropAddress,
        latitude: route.params.dropLat,
        longitude: route.params.dropLng,
      };
    }
    return null;
  });
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Map theme state
  const [mapTheme, setMapTheme] = useState<MapTheme>('standard');

  // UI state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [activeInput, setActiveInput] = useState<'pickup' | 'drop'>('pickup');
  const [loading, setLoading] = useState(false);
  const [rideSessionId, setRideSessionId] = useState<string | null>(null);
  const [showRidesModal, setShowRidesModal] = useState(false);
  const [recentRides, setRecentRides] = useState<any[]>([]);
  const [onlineRiders, setOnlineRiders] = useState<any[]>([]);
  // Track whether the user has interacted with each location row so we only
  // show the inline "Please pick a location" hint after a touch, not on first
  // render.
  const [pickupTouched, setPickupTouched] = useState(false);
  const [dropTouched, setDropTouched] = useState(false);

  const fetchOnlineRidersNearby = useCallback(
    async (latitude: number, longitude: number) => {
      try {
        const response = await getOnlineRidersApi(latitude, longitude);
        if (response.remote === 'success') {
          const data = (response.data as any)?.data ?? response.data;
          setOnlineRiders(Array.isArray(data) ? data : []);
        } else {
          setOnlineRiders([]);
        }
      } catch {
        setOnlineRiders([]);
      }
    },
    [],
  );

  // Fetch recent rides for saved places
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await getRecentRidesApi();
        if (response.remote === 'success') {
          const data = (response.data as any)?.data ?? response.data;
          setRecentRides(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      } catch {}
    };
    fetchRecent();
  }, []);

  // Get current location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const loc = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCurrentLocation(loc);
      if (!pickup) {
        setPickup({
          address: 'Current location',
          latitude: loc.latitude,
          longitude: loc.longitude,
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (pickup?.latitude != null && pickup?.longitude != null) {
      fetchOnlineRidersNearby(pickup.latitude, pickup.longitude);
      return;
    }
    if (
      currentLocation?.latitude != null &&
      currentLocation?.longitude != null
    ) {
      fetchOnlineRidersNearby(
        currentLocation.latitude,
        currentLocation.longitude,
      );
    }
  }, [pickup, currentLocation, fetchOnlineRidersNearby]);

  // Fit map to show route when both points set
  useEffect(() => {
    if (pickup && drop && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: pickup.latitude, longitude: pickup.longitude },
          { latitude: drop.latitude, longitude: drop.longitude },
        ],
        {
          edgePadding: { top: 100, right: 60, bottom: 280, left: 60 },
          animated: true,
        },
      );
    }
  }, [pickup, drop]);

  const handleConfirmLocation = async () => {
    if (!pickup || !drop) {
      errorToast('Please select both pickup and drop-off locations');
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    try {
      const response = await confirmRideLocationApi({
        pickup: {
          address: pickup.address,
          latitude: pickup.latitude,
          longitude: pickup.longitude,
        },
        drop: {
          address: drop.address,
          latitude: drop.latitude,
          longitude: drop.longitude,
        },
      });
      if (response.remote === 'success') {
        const data = (response.data as any)?.data ?? response.data;
        const sessionId = data?.rideSessionId;

        // Step 2: Calculate route before fetching ride options
        if (sessionId) {
          const routeResponse = await calculateRideRouteApi(sessionId);
          if (routeResponse.remote !== 'success') {
            errorToast(
              getFriendlyErrorMessage(
                (routeResponse as any)?.errors?.errors,
                'Unable to calculate route. Please try again',
              ),
            );
            return;
          }
        }

        setRideSessionId(sessionId);
        setShowRidesModal(true);
      } else {
        errorToast(
          getFriendlyErrorMessage(
            response?.errors?.errors,
            'Unable to confirm location. Please try again',
          ),
        );
      }
    } catch (e: any) {
      errorToast(getFriendlyErrorMessage(e?.message));
    } finally {
      setLoading(false);
    }
  };

  const openAddressModal = (input: 'pickup' | 'drop') => {
    setActiveInput(input);
    setShowAddressModal(true);
    if (input === 'pickup') {
      setPickupTouched(true);
    } else {
      setDropTouched(true);
    }
  };

  const handleMapPress = useCallback(
    (e: any) => {
      if (!showAddressModal) return;
      const { latitude, longitude } = e.nativeEvent.coordinate;
      const loc: LocationData = {
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        latitude,
        longitude,
      };
      if (activeInput === 'pickup') {
        setPickup(loc);
      } else {
        setDrop(loc);
      }
    },
    [activeInput, showAddressModal],
  );

  const pickupValid = !!(
    pickup &&
    Number.isFinite(pickup.latitude) &&
    Number.isFinite(pickup.longitude)
  );
  const dropValid = !!(
    drop &&
    Number.isFinite(drop.latitude) &&
    Number.isFinite(drop.longitude)
  );
  const bothLocationsSet = pickupValid && dropValid;
  const pickupError =
    pickupTouched && !pickupValid ? 'Please select a pickup location' : undefined;
  const dropError =
    dropTouched && !dropValid ? 'Please select a drop-off location' : undefined;

  const buildQuery = () => {
    const query: any = { key: GOOGLE_API_KEY, language: 'en' };
    if (currentLocation) {
      query.location = `${currentLocation.latitude},${currentLocation.longitude}`;
      query.radius = 50000;
    }
    return query;
  };

  const autocompleteStyles = {
    // `container` must be `flex: 1` inside the modal — when it was `flex: 0`
    // the listView (FlatList) inside the autocomplete collapsed to its
    // intrinsic 0 height, so predictions came back from Google but were
    // never visible. flex:1 lets the FlatList consume the remaining
    // vertical space in `autocompleteContainer`.
    container: { flex: 1, width: '100%' as const },
    textInputContainer: { width: '100%' as const, flex: 0 },
    textInput: {
      height: 50,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 10,
      paddingHorizontal: 15,
      fontSize: 14,
      fontFamily: Font.textSemiBolder,
      color: '#2A2A2A',
      backgroundColor: '#F7F7F7',
    },
    listView: {
      backgroundColor: '#fff',
      borderRadius: 10,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      zIndex: 10,
      flex: 1,
      marginTop: 8,
    },
    row: {
      backgroundColor: '#fff',
      padding: 13,
      flexDirection: 'row' as const,
    },
    separator: { height: 0.5, backgroundColor: '#E0E0E0' },
    description: {
      color: '#2A2A2A',
      fontFamily: Font.textNormal,
      fontSize: 13,
    },
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ── Interactive Map ──────────────────── */}
        <View style={styles.mapContainer}>
          {currentLocation ? (
            <>
              <MapView
                ref={mapRef}
                provider="google"
                style={styles.map}
                customMapStyle={getMapStyle(mapTheme)}
                showsUserLocation
                loadingEnabled
                initialRegion={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.015,
                }}
                onPress={handleMapPress}
              >
                {/* Pickup marker with address label */}
                {pickup && (
                  <Marker
                    coordinate={{
                      latitude: pickup.latitude,
                      longitude: pickup.longitude,
                    }}
                  >
                    <View style={styles.markerWrapper}>
                      <View style={styles.markerLabel}>
                        <CustomText style={styles.markerText} numberOfLines={1}>
                          {pickup.address.length > 22
                            ? pickup.address.substring(0, 22) + '...'
                            : pickup.address}
                        </CustomText>
                        <CustomText style={styles.markerArrow}>
                          {'>'}
                        </CustomText>
                      </View>
                      <View style={styles.markerDotPickup} />
                    </View>
                  </Marker>
                )}

                {/* Drop marker with address label */}
                {drop && (
                  <Marker
                    coordinate={{
                      latitude: drop.latitude,
                      longitude: drop.longitude,
                    }}
                  >
                    <View style={styles.markerWrapper}>
                      <View style={styles.markerLabel}>
                        <CustomText style={styles.markerText} numberOfLines={1}>
                          {drop.address.length > 22
                            ? drop.address.substring(0, 22) + '...'
                            : drop.address}
                        </CustomText>
                        <CustomText style={styles.markerArrow}>
                          {'>'}
                        </CustomText>
                      </View>
                      <View style={styles.markerDotDrop} />
                    </View>
                  </Marker>
                )}

                {/* Route line */}
                {pickup && drop && (
                  <MapViewDirections
                    origin={{
                      latitude: pickup.latitude,
                      longitude: pickup.longitude,
                    }}
                    destination={{
                      latitude: drop.latitude,
                      longitude: drop.longitude,
                    }}
                    apikey={GOOGLE_MAPS_APIKEY}
                    strokeWidth={5}
                    strokeColor="#2A2A2A"
                    onReady={result => {
                      mapRef.current?.fitToCoordinates(result.coordinates, {
                        edgePadding: {
                          top: 100,
                          right: 60,
                          bottom: 280,
                          left: 60,
                        },
                        animated: true,
                      });
                    }}
                  />
                )}

                {/* Online rider markers */}
                {onlineRiders.map(rider => (
                  <Marker
                    key={rider.driverId}
                    coordinate={{
                      latitude: rider.latitude,
                      longitude: rider.longitude,
                    }}
                    title={rider.driverName}
                    description={rider.vehicleName}
                  >
                    <View style={styles.riderMarker}>
                      <CustomText style={styles.riderMarkerIcon}>
                        {'\uD83D\uDE97'}
                      </CustomText>
                    </View>
                  </Marker>
                ))}
              </MapView>

              {/* Map Theme Toggle */}
              <View style={styles.themeToggleRow}>
                {MAP_THEMES.map(theme => (
                  <TouchableOpacity
                    key={theme.key}
                    style={[
                      styles.themeButton,
                      mapTheme === theme.key && styles.themeButtonActive,
                    ]}
                    onPress={() => setMapTheme(theme.key)}
                  >
                    <CustomText
                      style={[
                        styles.themeButtonText,
                        mapTheme === theme.key && styles.themeButtonTextActive,
                      ]}
                    >
                      {theme.label}
                    </CustomText>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.loadingMap}>
              <ActivityIndicator size="large" color="#EDAE10" />
              <CustomText style={styles.loadingText}>
                Fetching your location...
              </CustomText>
            </View>
          )}
        </View>

        {/* ── Bottom Panel ────────────────────── */}
        <View style={styles.bottomPanel}>
          <View style={styles.panelHandle} />

          {/* From row */}
          <TouchableOpacity
            style={styles.locationRow}
            onPress={() => openAddressModal('pickup')}
          >
            <View style={styles.dotPickup} />
            <View style={styles.locationContent}>
              <CustomText style={styles.locationLabel}>From</CustomText>
              <CustomText style={styles.locationValue} numberOfLines={1}>
                {pickup?.address || 'Set pickup location'}
              </CustomText>
            </View>
          </TouchableOpacity>
          <FormFieldError message={pickupError} />

          <View style={styles.rowDivider} />

          {/* To row */}
          <TouchableOpacity
            style={styles.locationRow}
            onPress={() => openAddressModal('drop')}
          >
            <View style={styles.dotDrop} />
            <View style={styles.locationContent}>
              <CustomText style={styles.locationLabel}>To</CustomText>
              <CustomText
                style={[styles.locationValue, !drop && { color: '#B0B0B0' }]}
                numberOfLines={1}
              >
                {drop?.address || 'Where are you going?'}
              </CustomText>
            </View>
          </TouchableOpacity>
          <FormFieldError message={dropError} />

          {/* Confirm Location: SubmitButton handles loading + disabled states.
              When either location is missing the button is disabled rather
              than firing a toast. */}
          <SubmitButton
            label="Confirm Location"
            onPress={() => {
              setPickupTouched(true);
              setDropTouched(true);
              if (!bothLocationsSet) {
                if (!pickupValid) {
                  openAddressModal('pickup');
                } else if (!dropValid) {
                  openAddressModal('drop');
                }
                return;
              }
              handleConfirmLocation();
            }}
            loading={loading}
            disabled={!bothLocationsSet}
            style={styles.confirmBtn}
          />
        </View>
      </View>

      {/* ── Select Address Modal ──────────────── */}
      <Modal
        isVisible={showAddressModal}
        onBackdropPress={() => setShowAddressModal(false)}
        style={styles.addressModal}
        swipeDirection="down"
        onSwipeComplete={() => setShowAddressModal(false)}
      >
        <View style={styles.addressModalContent}>
          <View style={styles.panelHandle} />

          <View style={styles.modalHeader}>
            <CustomText style={styles.modalTitle}>
              {activeInput === 'pickup' ? 'Set pickup' : 'Set drop-off'}
            </CustomText>
            <TouchableOpacity
              onPress={() => setShowAddressModal(false)}
              style={styles.closeBtn}
            >
              <SVG.Cross width={14} height={14} />
            </TouchableOpacity>
          </View>

          {/* Single Google Places Autocomplete - takes full space */}
          <View style={styles.autocompleteContainer}>
            <GooglePlacesAutocomplete
              placeholder={
                activeInput === 'pickup'
                  ? 'Search pickup location'
                  : 'Search drop-off location'
              }
              minLength={2}
              fetchDetails
              onPress={(data, details = null) => {
                if (details?.geometry) {
                  const loc: LocationData = {
                    address: data.description,
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
                  };
                  if (activeInput === 'pickup') {
                    setPickup(loc);
                    // Auto-open drop input if not set yet
                    if (!drop) {
                      setActiveInput('drop');
                      return; // keep modal open for drop
                    }
                  } else {
                    setDrop(loc);
                  }
                  setShowAddressModal(false);
                }
              }}
              query={buildQuery()}
              textInputProps={{ placeholderTextColor: '#999', autoFocus: true }}
              styles={autocompleteStyles}
              debounce={300}
              enablePoweredByContainer={false}
              keyboardShouldPersistTaps="handled"
              renderHeaderComponent={() => (
                <View>
                  {/* Current Location */}
                  <TouchableOpacity
                    style={styles.quickRow}
                    onPress={() => {
                      if (currentLocation) {
                        const loc: LocationData = {
                          address: 'Current location',
                          latitude: currentLocation.latitude,
                          longitude: currentLocation.longitude,
                        };
                        if (activeInput === 'pickup') {
                          setPickup(loc);
                          if (!drop) {
                            setActiveInput('drop');
                            return;
                          }
                        } else {
                          setDrop(loc);
                        }
                        setShowAddressModal(false);
                      }
                    }}
                  >
                    <View style={styles.quickIcon}>
                      <SVG.Currentlocation width={20} height={20} />
                    </View>
                    <View style={styles.quickInfo}>
                      <CustomText style={styles.quickTitle}>
                        Current location
                      </CustomText>
                      <CustomText style={styles.quickSub}>
                        Use your current GPS location
                      </CustomText>
                    </View>
                  </TouchableOpacity>

                  {/* Choose on map */}
                  <TouchableOpacity
                    style={styles.quickRow}
                    onPress={() => setShowAddressModal(false)}
                  >
                    <View style={styles.quickIcon}>
                      <SVG.LocationPointerIcon width={20} height={20} />
                    </View>
                    <View style={styles.quickInfo}>
                      <CustomText style={styles.quickTitle}>
                        Choose on map
                      </CustomText>
                      <CustomText style={styles.quickSub}>
                        Tap a point on the map
                      </CustomText>
                    </View>
                  </TouchableOpacity>

                  {/* Recent places */}
                  {recentRides.length > 0 && (
                    <>
                      <View style={styles.sectionBreak} />
                      <CustomText style={styles.sectionLabel}>
                        Recent places
                      </CustomText>
                      {recentRides.map((ride: any, index: number) => {
                        const address =
                          activeInput === 'pickup'
                            ? ride.pickupAddress
                            : ride.dropAddress;
                        if (!address) return null;
                        return (
                          <TouchableOpacity
                            key={ride.rideId || index}
                            style={styles.quickRow}
                            onPress={() => {
                              if (
                                activeInput === 'pickup' &&
                                ride.pickupAddress
                              ) {
                                setPickup(prev =>
                                  prev
                                    ? { ...prev, address: ride.pickupAddress }
                                    : null,
                                );
                              } else if (ride.dropAddress) {
                                setDrop(prev =>
                                  prev
                                    ? { ...prev, address: ride.dropAddress }
                                    : null,
                                );
                              }
                              setShowAddressModal(false);
                            }}
                          >
                            <View
                              style={[
                                styles.quickIcon,
                                { backgroundColor: '#FFFBE7' },
                              ]}
                            >
                              <SVG.YellowMarker width={18} height={18} />
                            </View>
                            <View style={styles.quickInfo}>
                              <CustomText
                                style={styles.quickTitle}
                                numberOfLines={1}
                              >
                                {address}
                              </CustomText>
                              {(() => {
                                const n = typeof ride.distanceKm === 'number'
                                  ? ride.distanceKm
                                  : Number(ride.distanceKm);
                                if (!Number.isFinite(n)) return null;
                                return (
                                  <CustomText style={styles.quickSub}>
                                    {n.toFixed(1)} km
                                  </CustomText>
                                );
                              })()}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </>
                  )}
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      <Footer isHome />

      {/* Available rides modal */}
      {showRidesModal && rideSessionId && (
        <AvailableRidesModal
          rideSessionId={rideSessionId}
          pickupAddress={pickup?.address || ''}
          dropAddress={drop?.address || ''}
          onClose={() => setShowRidesModal(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  loadingMap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#EDAE10', fontSize: 14 },

  // ── Marker styles ──
  markerWrapper: { alignItems: 'center' },
  markerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  markerText: {
    fontSize: 13,
    fontFamily: Font.textSemiBolder,
    color: '#2A2A2A',
    maxWidth: 150,
  },
  markerArrow: {
    fontSize: 14,
    fontFamily: Font.textBolder,
    color: '#2A2A2A',
  },
  markerDotPickup: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2A2A2A',
    borderWidth: 3,
    borderColor: '#8BA0B5',
    marginTop: 4,
  },
  markerDotDrop: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2A2A2A',
    marginTop: 4,
  },

  // ── Online rider markers ──
  riderMarker: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#EDAE10',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: { elevation: 3 },
    }),
  },
  riderMarkerIcon: {
    fontSize: 18,
  },

  // ── Bottom panel ──
  bottomPanel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: { elevation: 10 },
    }),
  },
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dotPickup: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF4444',
    marginRight: 14,
  },
  dotDrop: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EDAE10',
    marginRight: 14,
  },
  locationContent: { flex: 1 },
  locationLabel: {
    fontSize: 11,
    color: '#999',
    fontFamily: Font.textNormal,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 15,
    color: '#2A2A2A',
    fontFamily: Font.textSemiBolder,
  },
  rowDivider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 26 },
  confirmBtn: { marginTop: 14 },

  // ── Address modal ──
  addressModal: { justifyContent: 'flex-end', margin: 0 },
  addressModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Font.textSemiBolder,
    color: '#2A2A2A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  autocompleteContainer: { flex: 1, marginTop: 4 },
  quickOptions: { flexGrow: 0, marginTop: 8 },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  quickInfo: { flex: 1 },
  quickTitle: {
    fontSize: 15,
    fontFamily: Font.textSemiBolder,
    color: '#2A2A2A',
  },
  quickSub: { fontSize: 12, color: '#999', marginTop: 2 },
  sectionBreak: {
    height: 8,
    backgroundColor: '#F9F9F9',
    marginHorizontal: -20,
    marginVertical: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: Font.textSemiBolder,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  disabledBtn: {
    marginTop: 16,
    backgroundColor: '#F1D382',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center' as const,
    width: '100%' as any,
    alignSelf: 'center' as const,
  },
  disabledBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Font.textBolder,
  },
  themeToggleRow: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 6,
  },
  themeButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  themeButtonActive: {
    backgroundColor: '#EDAE10',
    borderColor: '#EDAE10',
  },
  themeButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  themeButtonTextActive: {
    color: '#fff',
  },
});

// Wrap the screen in the boundary so any render-time throw during the
// booking flow (vehicle list, recent places, fare display, etc.) shows
// the in-app error banner instead of unmounting the entire app.
const RideSelectScreenWithBoundary = (props: any) => (
  <RideErrorBoundary>
    <RideSelectScreen {...props} />
  </RideErrorBoundary>
);

export default RideSelectScreenWithBoundary;
