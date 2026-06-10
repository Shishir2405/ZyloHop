import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AnimatedDriverMarker from '../../common/AnimatedDriverMarker';
import Button from '../../common/Button';
import CustomText from '../../common/CustomText';
import Footer from '../../common/Footer';
import PopUp from '../../common/PopUp';
import { SVG } from '../../common/SvgHelper';
import { Font } from '../../common/Theam';
import RideAssignModal from './Components/RideAssignModal';
import RideErrorBoundary from './Components/RideErrorBoundary';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../auth';
import { reassignDriverApi } from '../../api/rideBookingApis';
import { errorToast } from '../../components/toasts';
import { SubmitButton } from '../../components/forms/SubmitButton';
import { locationHubService } from '../../services/LocationHubService';

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'RideAssignScreen'
>;

const RideAssignScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<any>();
  const rideSessionId = route.params?.rideSessionId;
  const [modalVisible, setModalVisible] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reassigning, setReassigning] = useState(false);
  const [liveRideStatus, setLiveRideStatus] = useState<any>(null);
  // Inline-banner state: surfaces a "no driver found" message when the
  // SignalR pipeline produces nothing for a while, and a "connection lost"
  // message when the hub drops. These are passive — we never auto-cancel the
  // ride, the user must tap retry or cancel.
  const [noDriverTimeoutHit, setNoDriverTimeoutHit] = useState(false);
  const [hubDisconnected, setHubDisconnected] = useState(false);
  const mapRef = useRef<MapView>(null);

  const pickupCoord = useMemo(() => {
    const p = liveRideStatus?.pickupLocation;
    if (!p) return null;
    const latitude = Number(p.latitude);
    const longitude = Number(p.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return { latitude, longitude };
  }, [liveRideStatus]);

  const driverCoord = useMemo(() => {
    const d = liveRideStatus?.driverLocation;
    if (!d) return null;
    const latitude = Number(d.latitude);
    const longitude = Number(d.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return { latitude, longitude };
  }, [liveRideStatus]);

  // 30-second timeout: if no driver has been assigned by then, surface a
  // retry/cancel banner. We DON'T touch the SignalR subscription itself
  // here — that's owned by RideAssignModal.
  useEffect(() => {
    if (liveRideStatus?.driver?.driverId) {
      setNoDriverTimeoutHit(false);
      return;
    }
    const timer = setTimeout(() => setNoDriverTimeoutHit(true), 30_000);
    return () => clearTimeout(timer);
  }, [liveRideStatus?.driver?.driverId]);

  // Lightweight connection probe (read-only on the hub service — no
  // subscribe/unsubscribe side effects). Used only to render an inline
  // banner; the modal handles the actual reconnect logic. Delayed start so
  // we don't flash a "Connection lost" banner during the initial hub
  // handshake on screen mount.
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;
    const start = setTimeout(() => {
      const check = () =>
        setHubDisconnected(!locationHubService.isConnected());
      check();
      id = setInterval(check, 5000);
    }, 5000);
    return () => {
      clearTimeout(start);
      if (id) clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const coords = [pickupCoord, driverCoord].filter(Boolean) as Array<{
      latitude: number;
      longitude: number;
    }>;
    if (coords.length === 0) return;
    if (coords.length === 1) {
      mapRef.current.animateToRegion({
        latitude: coords[0].latitude,
        longitude: coords[0].longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
      return;
    }
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 90, right: 50, bottom: 220, left: 50 },
      animated: true,
    });
  }, [pickupCoord, driverCoord]);

  const handleReassign = async () => {
    if (!rideSessionId) return;
    setReassigning(true);
    try {
      const response = await reassignDriverApi(rideSessionId);
      if (response.remote === 'success') {
        setIsModalVisible(false);
        setModalVisible(true);
        setNoDriverTimeoutHit(false);
      } else {
        errorToast('Failed to reassign driver');
      }
    } catch (e: any) {
      errorToast(e?.message || 'Something went wrong');
    } finally {
      setReassigning(false);
    }
  };

  const goToCancel = () => {
    (navigation as any).navigate('CancelRideScreen', { rideSessionId });
  };

  const showNoDriverBanner =
    noDriverTimeoutHit && !liveRideStatus?.driver?.driverId;

  return (
    <SafeAreaView style={styles.safeArea}>
      {(showNoDriverBanner || hubDisconnected) && (
        <View style={styles.banner}>
          <CustomText style={styles.bannerText}>
            {showNoDriverBanner
              ? 'No drivers found nearby. Try reassigning or cancel the ride.'
              : 'Connection lost. Trying to reconnect…'}
          </CustomText>
          {showNoDriverBanner && (
            <View style={styles.bannerActions}>
              <View style={styles.bannerButtonWrap}>
                <SubmitButton
                  label={reassigning ? 'Searching…' : 'Retry'}
                  onPress={handleReassign}
                  loading={reassigning}
                />
              </View>
              <TouchableOpacity
                onPress={goToCancel}
                style={styles.bannerCancelBtn}
              >
                <CustomText style={styles.bannerCancelText}>
                  Cancel ride
                </CustomText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider="google"
          style={styles.map}
          initialRegion={{
            // Use whatever pickup/driver coords we have; otherwise fall back
            // to a wide neutral view. Avoid a city-specific default because
            // the product is not region-restricted — the map should re-center
            // on the user's real coords as soon as they're available.
            latitude: pickupCoord?.latitude || driverCoord?.latitude || 0,
            longitude:
              pickupCoord?.longitude || driverCoord?.longitude || 0,
            latitudeDelta:
              pickupCoord || driverCoord ? 0.04 : 60,
            longitudeDelta:
              pickupCoord || driverCoord ? 0.04 : 60,
          }}
          loadingEnabled
        >
          {pickupCoord && (
            <Marker coordinate={pickupCoord} title="Pickup">
              <SVG.RedMarker />
            </Marker>
          )}
          {driverCoord && (
            <AnimatedDriverMarker
              latitude={driverCoord.latitude}
              longitude={driverCoord.longitude}
              title={liveRideStatus?.driver?.driverName || 'Driver'}
            >
              <View style={styles.driverMarkerWrap}>
                <CustomText style={styles.driverMarkerIcon}>
                  {'\uD83D\uDE95'}
                </CustomText>
              </View>
            </AnimatedDriverMarker>
          )}
        </MapView>
      </View>
      <Footer isHome />
      <RideAssignModal
        CancleRide={() => setIsModalVisible(true)}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        rideSessionId={rideSessionId}
        onRideStatusUpdate={setLiveRideStatus}
      />
      <PopUp
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
      >
        <View style={styles.modalContent1}>
          <SVG.SadFace />
          <View style={styles.modalTextContainer}>
            <CustomText style={styles.Oppstet}>Oops!</CustomText>
            <CustomText style={styles.Oppstet}>
              Driver cancelled the ride!
            </CustomText>
            <CustomText style={styles.modalDescription}>
              You can continue with a new driver or cancel the ride.
            </CustomText>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <View style={styles.popupActionWrap}>
              <SubmitButton
                label={reassigning ? 'Finding…' : 'Continue'}
                loading={reassigning}
                onPress={handleReassign}
              />
            </View>
            <Button
              btncolor={'#414141'}
              bgcolor={'#fff'}
              bordercolor={'#EDAE10'}
              btnborder={1}
              btnwidth={'48%'}
              buttonName={'Cancel ride'}
              onPress={() => {
                setIsModalVisible(false);
                setTimeout(
                  () =>
                    (navigation as any).navigate('CancelRideScreen', { rideSessionId }),
                  100,
                );
              }}
            />
          </View>
        </View>
      </PopUp>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Oppstet: {
    fontSize: 20,
    color: '#2A2A2A',
    fontFamily: Font.textBolder,
    textAlign: 'center',
  },
  modalContent1: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDescription: {
    fontSize: 12,
    fontFamily: Font.textBolder,
    color: '#A0A0A0',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 18,
  },
  modalTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  safeArea: { flex: 1 },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  driverMarkerWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDAE10',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  driverMarkerIcon: { fontSize: 18 },
  banner: {
    backgroundColor: '#FFF6E5',
    borderColor: '#EDAE10',
    borderWidth: 1,
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  bannerText: {
    color: '#5A4500',
    fontSize: 13,
    fontFamily: Font.textSemiBolder,
  },
  bannerActions: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    gap: 8,
  },
  bannerButtonWrap: { flexGrow: 1 },
  bannerCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  bannerCancelText: {
    color: '#5A5A5A',
    fontFamily: Font.textSemiBolder,
    fontSize: 13,
  },
  popupActionWrap: { width: '48%' },
});

// Surface render-time crashes in this screen (map, modal, error popups)
// as an inline banner instead of letting them unmount the entire app.
const RideAssignScreenWithBoundary = (props: any) => (
  <RideErrorBoundary>
    <RideAssignScreen {...props} />
  </RideErrorBoundary>
);

export default RideAssignScreenWithBoundary;
