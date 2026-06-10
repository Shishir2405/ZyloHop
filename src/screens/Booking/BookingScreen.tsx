import { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CustomText from '../../common/CustomText';
import Footer from '../../common/Footer';
import SearchBar from '../../common/SearchBar';
import OrderSkeleton from '../../common/Skeleton/OrderSkeleton';
import { SVG } from '../../common/SvgHelper';
import { Font } from '../../common/Theam';
import WrapperScreen from '../../common/WrapperScreen';
import Textarea from '../../common/Textarea';
import { useGetOrderList } from '../../data-access/queries/order';
import OrderListComponent from './Components/OrderComponent';
import LottieView from 'lottie-react-native';
import { useGetRecentRides } from '../../data-access/queries/ride';
import { submitRideFeedbackApi } from '../../api/rideBookingApis';
import { successToast, errorToast } from '../../components/toasts';
import { FormFieldError } from '../../components/forms/FormFieldError';
import { SubmitButton } from '../../components/forms/SubmitButton';
import {
  bookingRatingSchema,
  BookingRatingValues,
} from '../../utils/validation/accountSchemas';
import { useNavigation } from '@react-navigation/native';
import { Linking } from 'react-native';

// Status sets used to decide which CTA(s) to render on each ride row.
const ACTIVE_STATUSES = new Set([
  'DRIVER_ASSIGNED',
  'DRIVER_ON_THE_WAY',
  'RIDE_STARTED',
  'DRIVER_PENDING_ACCEPTANCE',
]);
const COMPLETED_UNPAID = new Set(['RIDE_COMPLETED']);
const PAID_STATUSES = new Set(['PAID']);

const STAR_COUNT = 5;

const BookingScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState(true);

  const {
    data: orderResponse,
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersErrorObj,
    refetch: refetchOrders,
  } = useGetOrderList();
  const {
    data: ridesResponse,
    isLoading: ridesLoading,
    isError: ridesError,
    error: ridesErrorObj,
    refetch: refetchRides,
  } = useGetRecentRides();

  // Rate driver modal state
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [ratingRide, setRatingRide] = useState<any>(null);

  // RHF for the rating form — rating is bound via the star tap, comment is
  // the (optional) Textarea. Reset between opens via `reset(defaultValues)`.
  const {
    control,
    handleSubmit,
    reset: resetRatingForm,
    setValue: setRatingValue,
    watch: watchRating,
    formState: { errors: ratingErrors, isSubmitting: ratingSubmitting },
  } = useForm<BookingRatingValues>({
    resolver: zodResolver(bookingRatingSchema),
    mode: 'onSubmit',
    defaultValues: { rating: 0 as unknown as 1, comment: '' },
  });

  const selectedRating = watchRating('rating') as unknown as number;

  const PickupIcon = SVG.Currentlocation || SVG.LocationPointerIcon;
  const DropIcon = SVG.Location || SVG.LocationMarker;

  const orderList = (orderResponse as any)?.data ?? [];
  const allRidesList = Array.isArray(
    (ridesResponse as any)?.data ?? ridesResponse,
  )
    ? ((ridesResponse as any)?.data ?? ridesResponse)
    : [];

  // Show every ride the backend sent — active rides need to be visible so
  // the user can tap and recover the pickup OTP or jump to payment after
  // a completion if they killed the app.
  const ridesList = allRidesList;

  const handleOpenRateModal = (ride: any) => {
    setRatingRide(ride);
    resetRatingForm({ rating: 0 as unknown as 1, comment: '' });
    setRateModalVisible(true);
  };

  const handleSubmitRating = async (data: BookingRatingValues) => {
    try {
      const response = await submitRideFeedbackApi({
        rideSessionId: ratingRide?.rideId || ratingRide?.rideSessionId,
        rating: data.rating,
        comment: data.comment ?? '',
      });
      if (response.remote === 'success') {
        successToast('Thanks for your feedback!');
        setRateModalVisible(false);
      } else {
        errorToast('Failed to submit rating. Please try again.');
      }
    } catch (e: any) {
      errorToast(e?.message || 'Failed to submit rating');
    }
  };

  const renderRideItem = ({ item }: { item: any }) => {
    const statusUpper = String(item?.status || '').toUpperCase();
    const isActive = ACTIVE_STATUSES.has(statusUpper);
    const isUnpaid = COMPLETED_UNPAID.has(statusUpper);
    const isPaid = PAID_STATUSES.has(statusUpper);
    const isCancelled = statusUpper.includes('CANCELLED') || statusUpper === 'DRIVER_REJECTED';

    const badgeColors = isPaid
      ? { bg: '#E8F5E9', fg: '#2E7D32', label: 'Paid' }
      : isUnpaid
        ? { bg: '#FFEBEE', fg: '#C62828', label: 'Payment Pending' }
        : isActive
          ? { bg: '#FFF8E1', fg: '#F57F17', label: 'In Progress' }
          : isCancelled
            ? { bg: '#ECEFF1', fg: '#546E7A', label: 'Cancelled' }
            : { bg: '#E3F2FD', fg: '#1565C0', label: item.status || 'Unknown' };

    return (
      <View style={styles.rideCard}>
        <View style={styles.rideHeader}>
          <View style={[styles.statusBadge, { backgroundColor: badgeColors.bg }]}>
            <CustomText style={[styles.statusText, { color: badgeColors.fg }]}>
              {badgeColors.label}
            </CustomText>
          </View>
          <CustomText style={styles.rideDate}>
            {item.rideDate
              ? new Date(item.rideDate).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : ''}
          </CustomText>
        </View>

        <View style={styles.locationRow}>
          {PickupIcon ? <PickupIcon /> : null}
          <CustomText style={styles.address} numberOfLines={1}>
            {item.pickupAddress || 'Pickup'}
          </CustomText>
        </View>
        <View style={styles.locationRow}>
          {DropIcon ? <DropIcon /> : null}
          <CustomText style={styles.address} numberOfLines={1}>
            {item.dropAddress || 'Drop-off'}
          </CustomText>
        </View>

        {isActive && item.otp ? (
          <View style={styles.otpInline}>
            <CustomText style={styles.otpInlineLabel}>Pickup OTP</CustomText>
            <CustomText style={styles.otpInlineValue}>{item.otp}</CustomText>
          </View>
        ) : null}

        {isActive && item.driverName ? (
          <View style={styles.driverInline}>
            <CustomText style={styles.driverName}>
              Driver: {item.driverName}
            </CustomText>
            {item.driverPhone ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${item.driverPhone}`)}>
                <CustomText style={styles.driverPhone}>
                  {item.driverPhone}
                </CustomText>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        <View style={styles.rideFooter}>
          <CustomText style={styles.price}>
            {item.fare != null ? `$${Number(item.fare).toFixed(2)}` : '—'}
          </CustomText>
          <CustomText style={styles.distanceText}>
            {(() => {
              const n = typeof item.distanceKm === 'number'
                ? item.distanceKm
                : Number(item.distanceKm);
              return Number.isFinite(n) ? `${n.toFixed(1)} km` : '—';
            })()}
          </CustomText>
        </View>

        {/* CTA driven by status. Pay Now for completed-unpaid takes the user
            back into the payment flow they may have killed; Rate Driver only
            after payment so we don't ask people to rate before paying. */}
        {isUnpaid ? (
          <TouchableOpacity
            style={[styles.rateBtn, { backgroundColor: '#EDAE10' }]}
            onPress={() =>
              navigation.navigate('RideCompleteScreen', {
                rideSessionId: item.rideId,
              })
            }>
            <CustomText style={styles.rateBtnText}>Pay Now</CustomText>
          </TouchableOpacity>
        ) : isActive ? (
          <TouchableOpacity
            style={[styles.rateBtn, { backgroundColor: '#1565C0' }]}
            onPress={() =>
              navigation.navigate('RideAssignScreen', {
                rideSessionId: item.rideId,
              })
            }>
            <CustomText style={styles.rateBtnText}>Open Ride</CustomText>
          </TouchableOpacity>
        ) : isPaid ? (
          <TouchableOpacity
            style={styles.rateBtn}
            onPress={() => handleOpenRateModal(item)}>
            <CustomText style={styles.rateBtnText}>Rate Driver</CustomText>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <WrapperScreen>
      <View style={styles.headerContainer}>
        <CustomText style={styles.headerTitle}>Bookings/Orders</CustomText>
      </View>
      <View style={styles.container}>
        <SearchBar Filter={() => {}} />
        <View style={styles.buttonview}>
          <TouchableOpacity
            style={activeTab ? styles.activebuttonstyle : styles.commanstyle}
            onPress={() => setActiveTab(true)}
          >
            <CustomText
              style={[
                styles.buttontext,
                { color: activeTab ? '#FFFFFF' : '#5A5A5A' },
              ]}
            >
              Orders
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            style={!activeTab ? styles.activebuttonstyle : styles.commanstyle}
            onPress={() => setActiveTab(false)}
          >
            <CustomText
              style={[
                styles.buttontext,
                { color: !activeTab ? '#FFFFFF' : '#5A5A5A' },
              ]}
            >
              Rides
            </CustomText>
          </TouchableOpacity>
        </View>

        {activeTab ? (
          ordersLoading ? (
            <OrderSkeleton />
          ) : ordersError ? (
            <View style={styles.errorContainer}>
              <CustomText style={styles.errorTitle}>
                Couldn't load orders
              </CustomText>
              <CustomText style={styles.errorMsg}>
                {(ordersErrorObj as any)?.message || 'Please try again.'}
              </CustomText>
              <TouchableOpacity
                style={styles.retryCta}
                onPress={() => refetchOrders()}>
                <CustomText style={styles.retryCtaText}>Retry</CustomText>
              </TouchableOpacity>
            </View>
          ) : (
            <OrderListComponent orders={orderList} />
          )
        ) : ridesLoading ? (
          <OrderSkeleton />
        ) : ridesError ? (
          <View style={styles.errorContainer}>
            <CustomText style={styles.errorTitle}>
              Couldn't load rides
            </CustomText>
            <CustomText style={styles.errorMsg}>
              {(ridesErrorObj as any)?.message || 'Please try again.'}
            </CustomText>
            <TouchableOpacity
              style={styles.retryCta}
              onPress={() => refetchRides()}>
              <CustomText style={styles.retryCtaText}>Retry</CustomText>
            </TouchableOpacity>
          </View>
        ) : ridesList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LottieView
              source={require('../../assets/no_Data_found_lottie.json')}
              autoPlay
              loop
              style={{ width: 260, height: 260, marginBottom: 16 }}
            />
            <CustomText style={styles.emptyText}>
              No completed rides yet
            </CustomText>
          </View>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={ridesList}
            renderItem={renderRideItem}
            keyExtractor={(item: any, index: number) =>
              item.rideId || String(index)
            }
          />
        )}
      </View>
      <Footer isBooking />

      {/* Rate Driver Modal */}
      <Modal
        visible={rateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRateModalVisible(false)}
      >
        <View style={styles.rateModalOverlay}>
          <View style={styles.rateModalSheet}>
            <View style={styles.rateModalHandle} />
            <CustomText style={styles.rateModalTitle}>Rate Your Driver</CustomText>
            {ratingRide?.driverName && (
              <CustomText style={styles.rateModalSubtitle}>
                How was your ride with {ratingRide.driverName}?
              </CustomText>
            )}

            {/* Star rating bound through RHF — taps call `setRatingValue` so
                zod validation kicks in on submit if rating is still 0. */}
            <Controller
              control={control}
              name="rating"
              render={({ field: { value } }) => (
                <View style={styles.starsRow}>
                  {Array.from({ length: STAR_COUNT }, (_, i) => i + 1).map(
                    (star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() =>
                          setRatingValue('rating', star as 1 | 2 | 3 | 4 | 5, {
                            shouldValidate: true,
                          })
                        }
                        style={styles.starButton}
                      >
                        <CustomText
                          style={[
                            styles.starIcon,
                            {
                              color:
                                star <= (value as unknown as number)
                                  ? '#EDAE10'
                                  : '#E0E0E0',
                            },
                          ]}
                        >
                          ★
                        </CustomText>
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              )}
            />
            <CustomText style={styles.ratingLabel}>
              {selectedRating === 0
                ? 'Tap to rate'
                : selectedRating === 1
                  ? 'Poor'
                  : selectedRating === 2
                    ? 'Fair'
                    : selectedRating === 3
                      ? 'Good'
                      : selectedRating === 4
                        ? 'Very Good'
                        : 'Excellent!'}
            </CustomText>
            <FormFieldError message={ratingErrors.rating?.message} />

            {/* Optional comment via the neumorphic Textarea + counter */}
            <Controller
              control={control}
              name="comment"
              render={({ field: { value, onChange, onBlur } }) => (
                <Textarea
                  placeholder="Leave a comment (optional)"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  rows={3}
                  maxLength={500}
                  error={ratingErrors.comment?.message}
                />
              )}
            />
            <FormFieldError message={ratingErrors.comment?.message} />

            <View style={styles.rateModalActions}>
              <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => setRateModalVisible(false)}
              >
                <CustomText style={styles.skipBtnText}>Skip</CustomText>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <SubmitButton
                  label={ratingSubmitting ? 'Submitting...' : 'Submit'}
                  loading={ratingSubmitting}
                  onPress={handleSubmit(handleSubmitRating)}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  headerTitle: { fontSize: 24, fontFamily: Font.textBolder, color: '#2A2A2A' },
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  buttonview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FEC400',
    height: 60,
    borderRadius: 10,
    marginVertical: 20,
  },
  activebuttonstyle: {
    backgroundColor: '#FEC400',
    height: '100%',
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  commanstyle: {
    height: '100%',
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  buttontext: { fontSize: 14, fontFamily: Font.textSemiBolder },
  rideCard: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
    elevation: 1,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontFamily: Font.textSemiBolder },
  rideDate: { fontSize: 12, color: '#999' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
    gap: 8,
  },
  address: {
    color: '#2A2A2A',
    fontSize: 14,
    fontFamily: Font.textNormal,
    flex: 1,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  price: { color: '#158E3E', fontSize: 14, fontFamily: Font.textSemiBolder },
  distanceText: { fontSize: 13, color: '#999' },
  rateBtn: {
    marginTop: 10,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#EDAE10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateBtnText: {
    fontSize: 13,
    fontFamily: Font.textSemiBolder,
    color: '#fff',
  },
  otpInline: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#EDAE10',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  otpInlineLabel: {
    fontSize: 11,
    fontFamily: Font.textSemiBolder,
    color: '#8A6A00',
    letterSpacing: 1.5,
  },
  otpInlineValue: {
    fontSize: 22,
    fontFamily: Font.textBolder,
    color: '#2A2A2A',
    letterSpacing: 6,
  },
  driverInline: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverName: {
    fontSize: 12,
    color: '#5A5A5A',
    fontFamily: Font.textSemiBolder,
  },
  driverPhone: {
    fontSize: 12,
    color: '#1565C0',
    fontFamily: Font.textSemiBolder,
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#999', marginTop: 8 },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontFamily: Font.textSemiBolder,
    color: '#2A2A2A',
    marginBottom: 6,
  },
  errorMsg: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryCta: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#EDAE10',
    borderRadius: 8,
  },
  retryCtaText: {
    color: '#fff',
    fontFamily: Font.textSemiBolder,
    fontSize: 14,
  },

  // Rate Driver Modal
  rateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  rateModalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  rateModalHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#D1D5DB',
    borderRadius: 10,
    marginBottom: 20,
  },
  rateModalTitle: {
    fontSize: 22,
    fontFamily: Font.textBolder,
    color: '#2A2A2A',
    marginBottom: 6,
  },
  rateModalSubtitle: {
    fontSize: 13,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
  },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  starButton: { padding: 4 },
  starIcon: { fontSize: 44 },
  ratingLabel: {
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
    color: '#5A5A5A',
    marginBottom: 16,
  },
  commentInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#2A2A2A',
    textAlignVertical: 'top',
    marginBottom: 20,
    minHeight: 80,
  },
  rateModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  skipBtn: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  skipBtnText: {
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
    color: '#5A5A5A',
  },
  submitRateBtn: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#EDAE10',
  },
  submitRateBtnText: {
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
    color: '#fff',
  },
});

export default BookingScreen;
