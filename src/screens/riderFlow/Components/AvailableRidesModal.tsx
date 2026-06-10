import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Font } from '../../../common/Theam';
import { SVG } from '../../../common/SvgHelper';
import CustomText from '../../../common/CustomText';
import Heading from '../../../common/Heading';
import CommonLine from '../../../common/CommonLine';
import { SubmitButton } from '../../../components/forms/SubmitButton';
import { useNavigation } from '@react-navigation/native';
import {
  getRideOptionsApi,
  selectRideTypeApi,
  getAvailableVehiclesApi,
  assignDriverApi,
} from '../../../api/rideBookingApis';
import { errorToast } from '../../../components/toasts';
import { getFriendlyErrorMessage } from '../../../utils/errorMessages';
import { AvailableVehicleDto } from '../../../api/types/rideBookingTypes';

interface Props {
  rideSessionId: string;
  pickupAddress: string;
  dropAddress: string;
  onClose: () => void;
}

const LocationInfo = ({ icon: Icon, title, address, distance }: any) => (
  <View style={styles.placeRow}>
    <View style={styles.placeIcon}>
      <Icon />
    </View>
    <View style={styles.placeInfo}>
      <CustomText style={styles.placeName}>{title}</CustomText>
      <CustomText style={styles.placeAddress}>{address}</CustomText>
    </View>
    {distance && (
      <View style={styles.placeDistance}>
        <CustomText style={styles.distanceText}>{distance}</CustomText>
      </View>
    )}
  </View>
);

type Step = 'rideOptions' | 'vehicles';

type NormalizedRideOption = {
  vehicleCategoryId: string;
  rideType: string;
  vehicleName?: string;
  etaMin?: number;
  distanceKm?: number;
  fare?: number | string;
  raw: any;
};

const AvailableRidesModal = ({
  rideSessionId,
  pickupAddress,
  dropAddress,
  onClose,
}: Props) => {
  const navigation = useNavigation();

  // Step state
  const [step, setStep] = useState<Step>('rideOptions');

  // Ride options state
  const [rideOptions, setRideOptions] = useState<NormalizedRideOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<NormalizedRideOption | null>(
    null,
  );
  const [selecting, setSelecting] = useState(false);

  // Vehicle selection state
  const [vehicles, setVehicles] = useState<AvailableVehicleDto[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] =
    useState<AvailableVehicleDto | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchRideOptions();
  }, [rideSessionId]);

  const normalizeRideOption = (ride: any): NormalizedRideOption => {
    const vehicleCategoryId =
      ride?.vehicleCategoryId ||
      ride?.vehicleCategoryID ||
      ride?.categoryId ||
      ride?.rideCategoryId ||
      ride?.vehicleCategory?.id ||
      '';
    const rideType =
      ride?.rideType ||
      ride?.rideName ||
      ride?.vehicleCategory ||
      ride?.vehicleName ||
      ride?.type ||
      '';

    return {
      vehicleCategoryId,
      rideType,
      vehicleName: ride?.vehicleName,
      etaMin: ride?.etaMin ?? ride?.eta ?? ride?.estimatedTimeMin,
      distanceKm: ride?.distanceKm ?? ride?.distance,
      fare: ride?.fare ?? ride?.price ?? ride?.amount,
      raw: ride,
    };
  };

  const fetchRideOptions = async () => {
    setLoading(true);
    try {
      const response = await getRideOptionsApi(rideSessionId);
      console.log('Ride options response:', JSON.stringify(response, null, 2));
      if (response.remote === 'success') {
        const data = (response.data as any)?.data ?? response.data;
        const options = Array.isArray(data)
          ? data
              .map(normalizeRideOption)
              .filter((x: NormalizedRideOption) => !!x.rideType)
          : [];
        setRideOptions(options);
        if (options.length > 0) setSelectedRide(options[0]);
      } else {
        errorToast(
          getFriendlyErrorMessage(
            (response as any)?.errors?.errors,
            'Unable to find rides right now. Please try again',
          ),
        );
      }
    } catch (e: any) {
      errorToast(getFriendlyErrorMessage(e?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRide = async () => {
    if (!selectedRide) return;
    if (!selectedRide.rideType || !selectedRide.vehicleCategoryId) {
      errorToast('This ride option is invalid. Please choose another ride');
      return;
    }
    setSelecting(true);
    try {
      const response = await selectRideTypeApi(
        rideSessionId,
        selectedRide.rideType,
      );
      console.log(
        '[SelectRideType] rideType:',
        selectedRide.rideType,
        'response:',
        JSON.stringify(response),
      );
      if (response.remote === 'success') {
        // After selecting ride type, fetch available vehicles in this category
        await fetchVehicles(selectedRide.vehicleCategoryId);
        setStep('vehicles');
      } else {
        const errMsg = (response as any)?.errors?.errors;
        console.warn('[SelectRideType] error:', errMsg);
        // Some backends return false negatives for select step. Try vehicle lookup by category as fallback.
        await fetchVehicles(selectedRide.vehicleCategoryId);
        setStep('vehicles');
        errorToast(
          getFriendlyErrorMessage(
            errMsg,
            'Please choose a vehicle to continue',
          ),
        );
      }
    } catch (e: any) {
      errorToast(getFriendlyErrorMessage(e?.message));
    } finally {
      setSelecting(false);
    }
  };

  const fetchVehicles = async (categoryId: string) => {
    setVehiclesLoading(true);
    try {
      const response = await getAvailableVehiclesApi(categoryId);
      if (response.remote === 'success') {
        const data = (response.data as any)?.data ?? response.data;
        const vehicleList = Array.isArray(data) ? data : [];
        setVehicles(vehicleList);
        if (vehicleList.length > 0) setSelectedVehicle(vehicleList[0]);
      } else {
        errorToast(
          getFriendlyErrorMessage(
            (response as any)?.errors?.errors,
            'No vehicles are available nearby. Please try again shortly',
          ),
        );
      }
    } catch (e: any) {
      errorToast(
        getFriendlyErrorMessage(
          e?.message,
          'Unable to load vehicles. Please try again',
        ),
      );
    } finally {
      setVehiclesLoading(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedVehicle || !selectedRide?.vehicleCategoryId) return;
    setAssigning(true);
    try {
      const response = await assignDriverApi(
        rideSessionId,
        selectedRide.vehicleCategoryId,
      );
      console.log(
        '[AssignDriver] vehicleCategoryId:',
        selectedRide.vehicleCategoryId,
        'response:',
        JSON.stringify(response),
      );
      if (response.remote === 'success') {
        (navigation as any).navigate('RideAssignScreen', {
          rideSessionId,
          selectedRide,
        });
      } else {
        const errMsg = (response as any)?.errors?.errors;
        console.warn('[AssignDriver] error:', errMsg);
        errorToast(
          getFriendlyErrorMessage(
            errMsg,
            'Unable to assign a driver right now. Please try again',
          ),
        );
      }
    } catch (e: any) {
      errorToast(getFriendlyErrorMessage(e?.message));
    } finally {
      setAssigning(false);
    }
  };

  const getImage = (rideType: string) => {
    const type = (rideType || '').toLowerCase();
    if (type.includes('bike'))
      return require('../../../assets/image/other/Bike.png');
    if (type.includes('deluxe') || type.includes('premium'))
      return require('../../../assets/image/other/Car.png');
    return require('../../../assets/image/other/Car2.png');
  };

  const handleBack = () => {
    if (step === 'vehicles') {
      setStep('rideOptions');
      setVehicles([]);
      setSelectedVehicle(null);
    } else {
      onClose();
    }
  };

  const getHeading = () => {
    if (step === 'vehicles' && selectedRide) {
      return `Available cars in ${selectedRide.rideType?.toLowerCase() || ''} category`;
    }
    return 'Available rides';
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible
      onRequestClose={handleBack}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.dragIndicator} />

          {/* Header with back button on vehicles step */}
          <View style={styles.headerRow}>
            {step === 'vehicles' && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <CustomText style={styles.backArrow}>{'<'}</CustomText>
              </TouchableOpacity>
            )}
            <Heading style={styles.modalHeading}>{getHeading()}</Heading>
          </View>
          <CommonLine />

          {/* Location info - only show on ride options step */}
          {step === 'rideOptions' && (
            <>
              <View style={styles.locationContainer}>
                <LocationInfo
                  icon={SVG.RedMarker}
                  title="Pickup"
                  address={pickupAddress}
                />
                <LocationInfo
                  icon={SVG.YellowMarker}
                  title="Drop-off"
                  address={dropAddress}
                />
              </View>
              <CommonLine />
            </>
          )}

          {/* ── Step 1: Ride Options ── */}
          {step === 'rideOptions' && (
            <>
              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#EDAE10"
                  style={{ marginVertical: 30 }}
                />
              ) : rideOptions.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                  <CustomText style={{ color: '#999', fontSize: 14 }}>
                    No rides available at the moment
                  </CustomText>
                </View>
              ) : (
                <ScrollView contentContainerStyle={styles.ridesList}>
                  {rideOptions.map(
                    (ride: NormalizedRideOption, index: number) => (
                      <TouchableOpacity
                        key={ride.vehicleCategoryId || index}
                        style={[
                          styles.rideOption,
                          selectedRide?.vehicleCategoryId ===
                            ride.vehicleCategoryId && styles.rideSelected,
                        ]}
                        onPress={() => setSelectedRide(ride)}
                      >
                        <Image
                          source={getImage(ride.rideType)}
                          style={styles.rideImage}
                          resizeMode="contain"
                        />
                        <View style={styles.rideDetails}>
                          <CustomText style={styles.rideType}>
                            {ride.rideType || ride.vehicleName}
                          </CustomText>
                          <View style={styles.rideInfo}>
                            <CustomText style={styles.rideTime}>
                              {ride.etaMin ?? '…'} min
                            </CustomText>
                            <SVG.User />
                            <CustomText style={styles.rideCapacity}>
                              {typeof ride.distanceKm === 'number'
                                ? `${ride.distanceKm.toFixed(1)} km`
                                : '-'}
                            </CustomText>
                          </View>
                        </View>
                        <CustomText style={styles.ridePrice}>
                          $
                          {typeof ride.fare === 'number'
                            ? ride.fare.toFixed(2)
                            : (ride.fare ?? '-')}
                        </CustomText>
                      </TouchableOpacity>
                    ),
                  )}
                </ScrollView>
              )}

              <SubmitButton
                label={selecting ? 'Selecting…' : 'Select Ride'}
                onPress={handleSelectRide}
                loading={selecting}
                disabled={!selectedRide}
                style={styles.selectButton}
              />
            </>
          )}

          {/* ── Step 2: Vehicle Selection ── */}
          {step === 'vehicles' && (
            <>
              {vehiclesLoading ? (
                <ActivityIndicator
                  size="large"
                  color="#EDAE10"
                  style={{ marginVertical: 30 }}
                />
              ) : vehicles.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                  <CustomText style={{ color: '#999', fontSize: 14 }}>
                    No vehicles available
                  </CustomText>
                </View>
              ) : (
                <ScrollView contentContainerStyle={styles.ridesList}>
                  {vehicles.map((vehicle, index) => (
                    <TouchableOpacity
                      key={vehicle.vehicleId || index}
                      style={[
                        styles.vehicleCard,
                        selectedVehicle?.vehicleId === vehicle.vehicleId &&
                          styles.rideSelected,
                      ]}
                      onPress={() => setSelectedVehicle(vehicle)}
                    >
                      <Image
                        source={
                          vehicle.vehicleImageUrl
                            ? { uri: vehicle.vehicleImageUrl }
                            : getImage(selectedRide?.rideType || '')
                        }
                        style={styles.vehicleImage}
                        resizeMode="contain"
                      />
                      <View style={styles.vehicleDetails}>
                        <CustomText style={styles.vehicleName}>
                          {vehicle.vehicleName}
                        </CustomText>
                        <View style={styles.vehicleInfoRow}>
                          <CustomText style={styles.vehicleInfoLabel}>
                            Vehicle category:
                          </CustomText>
                          <CustomText style={styles.vehicleInfoValue}>
                            {vehicle.vehicleCategory}
                          </CustomText>
                        </View>
                        <View style={styles.vehicleInfoRow}>
                          <CustomText style={styles.vehicleInfoLabel}>
                            Seat capacity:
                          </CustomText>
                          <CustomText style={styles.vehicleInfoValue}>
                            {vehicle.seatCapacity} Seater
                          </CustomText>
                        </View>
                      </View>
                      <View style={styles.vehicleCapacityBadge}>
                        <SVG.User />
                        <CustomText style={styles.vehicleCapacityText}>
                          {vehicle.seatCapacity}
                        </CustomText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {assigning ? (
                <View style={styles.assigningContainer}>
                  <ActivityIndicator size="small" color="#EDAE10" />
                  <CustomText style={styles.assigningText}>
                    Assigning Driver for your ride
                  </CustomText>
                </View>
              ) : (
                <SubmitButton
                  label="Confirm Vehicle"
                  onPress={handleAssignDriver}
                  disabled={!selectedVehicle}
                  style={styles.selectButton}
                />
              )}
            </>
          )}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  backButton: { position: 'absolute', left: 15, zIndex: 1, padding: 5 },
  backArrow: { fontSize: 22, fontFamily: Font.textBolder, color: '#2A2A2A' },
  modalHeading: {
    fontSize: 20,
    fontFamily: Font.textSemiBolder,
    marginVertical: 10,
    textAlign: 'center',
  },
  locationContainer: { paddingHorizontal: 20, marginVertical: 20 },
  ridesList: { marginVertical: 20, paddingHorizontal: 20 },
  rideOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
  },
  rideSelected: {
    borderColor: '#EDAE10',
    borderWidth: 2,
    backgroundColor: '#FFFBF0',
  },
  rideImage: { flex: 2, width: 50, height: 50, marginRight: 10 },
  rideDetails: { flex: 3, paddingLeft: 10 },
  rideType: { color: '#151513', fontFamily: Font.textSemiBolder, fontSize: 16 },
  rideInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  rideTime: { fontSize: 12, color: '#666', marginRight: 5 },
  rideCapacity: { fontSize: 12, color: '#666', marginLeft: 5 },
  ridePrice: {
    flex: 1,
    color: '#151513',
    fontSize: 16,
    fontFamily: Font.textSemiBolder,
  },
  placeRow: { flexDirection: 'row', marginVertical: 10, width: '100%' },
  placeIcon: { marginRight: 5, width: '5%' },
  placeInfo: { width: '80%' },
  placeName: {
    color: '#5A5A5A',
    fontFamily: Font.textSemiBolder,
    lineHeight: 23,
    marginLeft: 10,
  },
  placeAddress: { fontSize: 12, marginLeft: 10 },
  placeDistance: { width: '15%' },
  distanceText: {
    fontSize: 14,
    color: '#5A5A5A',
    fontFamily: Font.textSemiBolder,
  },
  selectButton: { marginBottom: 20 },

  // Vehicle selection styles
  vehicleCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleImage: { width: 80, height: 60, marginRight: 12 },
  vehicleDetails: { flex: 1 },
  vehicleName: {
    fontSize: 16,
    fontFamily: Font.textSemiBolder,
    color: '#2A2A2A',
    marginBottom: 4,
  },
  vehicleInfoRow: { flexDirection: 'row', marginTop: 2 },
  vehicleInfoLabel: { fontSize: 12, color: '#999', marginRight: 5 },
  vehicleInfoValue: {
    fontSize: 12,
    color: '#5A5A5A',
    fontFamily: Font.textSemiBolder,
  },
  vehicleCapacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  vehicleCapacityText: {
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
    color: '#5A5A5A',
    marginLeft: 3,
  },
  assigningContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  assigningText: {
    fontSize: 16,
    fontFamily: Font.textSemiBolder,
    color: '#EDAE10',
    fontStyle: 'italic',
    marginLeft: 10,
  },
});

export default AvailableRidesModal;
