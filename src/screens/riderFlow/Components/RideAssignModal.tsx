import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Font } from '../../../common/Theam';
import { SVG } from '../../../common/SvgHelper';
import CustomText from '../../../common/CustomText';
import CommonLine from '../../../common/CommonLine';
import { SubmitButton } from '../../../components/forms/SubmitButton';
import { useNavigation } from '@react-navigation/native';
import RiderCard from './RiderCard';
import RideErrorBoundary from './RideErrorBoundary';
import { getDriverRideStatusApi } from '../../../api/rideBookingApis';
import { locationHubService } from '../../../services/LocationHubService';

interface Props {
  modalVisible: boolean;
  setModalVisible: (v: boolean) => void;
  CancleRide: () => void;
  rideSessionId?: string;
  onRideStatusUpdate?: (status: any) => void;
}

const RideAssignModal = ({
  modalVisible,
  setModalVisible,
  CancleRide,
  rideSessionId,
  onRideStatusUpdate,
}: Props) => {
  const navigation = useNavigation();
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [rideStatus, setRideStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Ref to hold the active driverId so we can subscribe/unsubscribe
  const subscribedDriverId = useRef<string | null>(null);

  // -------------------------------------------------------------------------
  // Status fetch (initial load + recovery after DriverRejected/RideStarted)
  // -------------------------------------------------------------------------
  const fetchStatus = useCallback(async () => {
    if (!rideSessionId) return;
    try {
      const response = await getDriverRideStatusApi(rideSessionId);
      if (response.remote === 'success') {
        const data = (response.data as any)?.data ?? response.data;
        setRideStatus(data);
        setDriverInfo(data?.driver);
        onRideStatusUpdate?.(data);
        setLoading(false);

        // Once we have a driverId, subscribe to their live location
        const driverId = data?.driver?.driverId;
        if (
          driverId &&
          driverId !== subscribedDriverId.current &&
          locationHubService.isConnected()
        ) {
          if (subscribedDriverId.current) {
            locationHubService.unsubscribeFromDriverLocation(
              subscribedDriverId.current,
            );
          }
          subscribedDriverId.current = driverId;
          locationHubService.subscribeToDriverLocation(driverId);
        }
      }
    } catch {
      setLoading(false);
    }
  }, [rideSessionId, onRideStatusUpdate]);

  // -------------------------------------------------------------------------
  // SignalR setup & teardown — status transitions are pushed, not polled.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!rideSessionId || !modalVisible) return;

    // Connect to hub (no-op if already connected)
    locationHubService.connect();

    // Single REST fetch to populate initial UI. Subsequent updates arrive via
    // SignalR events — no polling needed.
    fetchStatus();

    // --- RideAccepted: driver confirmed the ride ---
    locationHubService.onRideAccepted(data => {
      if (data.rideSessionId !== rideSessionId) return;
      // Pull full status once so we have OTP, driver info, etc.
      fetchStatus();
    });

    // --- RideStarted: driver verified OTP ---
    locationHubService.onRideStarted(startedRideId => {
      if (startedRideId !== rideSessionId) return;
      setRideStatus((prev: any) => ({ ...(prev ?? {}), status: 'RIDE_STARTED' }));
    });

    // --- RideCompleted: driver ended the ride ---
    locationHubService.onRideCompleted(payload => {
      if (payload?.rideSessionId !== rideSessionId) return;
      setRideStatus((prev: any) => ({
        ...(prev ?? {}),
        status: 'RIDE_COMPLETED',
        fare: payload.fare ?? prev?.fare,
      }));
      // Auto-route to the payment screen. Previously the modal just sat
      // there waiting for the user to tap "Proceed to Payment" — if the
      // modal closed or the app backgrounded at the wrong moment they got
      // stuck with no way to pay.
      setTimeout(() => {
        setModalVisible(false);
        (navigation as any).navigate('RideCompleteScreen', { rideSessionId });
      }, 400);
    });

    // --- RideCancelled: either party cancelled ---
    locationHubService.onRideCancelled(cancelledRideId => {
      if (cancelledRideId !== rideSessionId) return;
      setRideStatus((prev: any) => ({ ...prev, status: 'DRIVER_CANCELLED' }));
      // Bubble up to parent to show reassign/cancel popup
      CancleRide();
    });

    // --- DriverRejected: driver declined, backend will reassign ---
    locationHubService.onDriverRejected(rejectedRideId => {
      if (rejectedRideId !== rideSessionId) return;
      // Reset to searching state; when a new driver accepts the RideAccepted
      // event will re-populate the UI.
      setLoading(true);
      setDriverInfo(null);
    });

    // --- ReceiveDriverLocation: live map updates ---
    locationHubService.onDriverLocationUpdate(update => {
      setRideStatus((prev: any) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          driverLocation: {
            latitude: update.latitude,
            longitude: update.longitude,
          },
        };
        onRideStatusUpdate?.(next);
        return next;
      });
    });

    return () => {
      locationHubService.offRideAccepted();
      locationHubService.offRideStarted();
      locationHubService.offRideCompleted();
      locationHubService.offRideCancelled();
      locationHubService.offDriverRejected();
      locationHubService.offDriverLocationUpdate();

      if (subscribedDriverId.current) {
        locationHubService.unsubscribeFromDriverLocation(
          subscribedDriverId.current,
        );
        subscribedDriverId.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rideSessionId, modalVisible, onRideStatusUpdate]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  // Fare can arrive as number, numeric string, or null. Coerce, then bail
  // out to a placeholder so the modal never throws on render.
  const fareDisplay = (() => {
    const raw = rideStatus?.fare;
    if (raw == null) return '...';
    const n = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(n) ? `$${n.toFixed(2)}` : '...';
  })();
  const isRideFinished =
    rideStatus?.status === 'RIDE_COMPLETED' || rideStatus?.status === 'PAID';

  const handleCallDriver = async () => {
    const phone =
      driverInfo?.phoneNumber || driverInfo?.mobile || driverInfo?.phone;
    if (!phone) {
      return;
    }
    const url = `tel:${phone}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  const handlePrimaryCta = () => {
    if (isRideFinished) {
      setModalVisible(false);
      setTimeout(
        () =>
          (navigation as any).navigate('RideCompleteScreen', { rideSessionId }),
        100,
      );
      return;
    }
    CancleRide();
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.dragIndicator} />
          <RideErrorBoundary>
          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#EDAE10" />
              <CustomText style={[styles.modalHeading, { marginTop: 10 }]}>
                Finding your driver...
              </CustomText>
            </View>
          ) : (
            <>
              <CustomText style={styles.modalHeading}>
                {rideStatus?.status === 'DRIVER_ASSIGNED' ||
                rideStatus?.status === 'DRIVER_ON_THE_WAY'
                  ? `Driver is coming in ${rideStatus?.driverComingEtaMin || '...'} min`
                  : rideStatus?.status === 'RIDE_STARTED'
                    ? 'Your ride has started'
                    : rideStatus?.status === 'RIDE_COMPLETED'
                      ? 'Your ride is complete!'
                      : 'Driver assigned'}
              </CustomText>
              {(() => {
                // Backend can return the OTP as either a string or a number;
                // calling .split on a number throws and unmounts the entire
                // app. Always coerce, and bail out cleanly if it's still empty.
                const rawOtp = rideStatus?.otp;
                const otpDigits =
                  rawOtp != null ? String(rawOtp).split('') : [];
                const showOtp =
                  otpDigits.length > 0 &&
                  rideStatus?.status !== 'RIDE_STARTED' &&
                  rideStatus?.status !== 'RIDE_COMPLETED' &&
                  rideStatus?.status !== 'PAID';
                if (!showOtp) return null;
                return (
                  <View style={styles.otpBox}>
                    <CustomText style={styles.otpLabel}>
                      Share this OTP with your driver
                    </CustomText>
                    <View style={styles.otpDigitsRow}>
                      {otpDigits.map((digit, idx) => (
                        <View key={idx} style={styles.otpDigitBox}>
                          <CustomText style={styles.otpDigitText}>
                            {digit}
                          </CustomText>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })()}
              <CommonLine />
              <View style={{ marginHorizontal: 20 }}>
                <RiderCard
                  driverName={driverInfo?.driverName}
                  distance={`${rideStatus?.driverComingEtaMin || '...'} min away`}
                  rating={driverInfo?.rating}
                  vehicleName={driverInfo?.vehicleName}
                  vehicleNumber={driverInfo?.vehicleNumber}
                  driverImageUrl={
                    driverInfo?.profileImageUrl || driverInfo?.driverImageUrl
                  }
                  vehicleImageUrl={driverInfo?.vehicleImageUrl}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 10,
                  }}
                >
                  <CustomText
                    style={{
                      fontSize: 16,
                      color: '#5A5A5A',
                      fontFamily: Font.textSemiBolder,
                    }}
                  >
                    Estimated Fare
                  </CustomText>
                  <CustomText
                    style={{
                      fontSize: 20,
                      fontFamily: Font.textSemiBolder,
                      color: '#2A2A2A',
                    }}
                  >
                    {fareDisplay}
                  </CustomText>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 15,
                  }}
                >
                  <TouchableOpacity
                    onPress={handleCallDriver}
                    disabled={
                      !(
                        driverInfo?.phoneNumber ||
                        driverInfo?.mobile ||
                        driverInfo?.phone
                      )
                    }
                  >
                    <SVG.CallIcon />
                  </TouchableOpacity>
                  <SubmitButton
                    label={
                      isRideFinished ? 'Proceed to Payment' : 'Cancel Ride'
                    }
                    onPress={handlePrimaryCta}
                    style={styles.selectButton}
                  />
                </View>
              </View>
            </>
          )}
          </RideErrorBoundary>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  dragIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#A0A0A0',
    alignSelf: 'center',
    borderRadius: 100,
    marginVertical: 10,
  },
  modalHeading: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
    color: '#5A5A5A',
    fontFamily: Font.textSemiBolder,
  },
  otpBox: {
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    marginHorizontal: 20,
  },
  otpLabel: {
    fontSize: 12,
    fontFamily: Font.textSemiBolder,
    color: '#8A7A3A',
    marginBottom: 8,
    textAlign: 'center',
  },
  otpDigitsRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  otpDigitBox: {
    width: 48,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#EDAE10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpDigitText: { fontSize: 24, fontFamily: Font.textBolder, color: '#FFFFFF' },
  selectButton: { marginBottom: 20 },
});

export default RideAssignModal;
