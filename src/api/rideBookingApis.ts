import apiIndex from './apiIndex';
import {FailureResponse, SuccessResponse} from './types';
import {
  ConfirmRideLocationRequest,
  ConfirmRideLocationResponse,
  CalculateRideRouteResponse,
  RideOptionDtoResponse,
  SelectRideTypeResponse,
  AvailableVehicleDto,
  AssignDriverResponseDto,
  RideStatusResponseDto,
  ReassignDriverResponseDto,
  CancelRideRequestDto,
  VerifyRideOtpDto,
  ApplyPromoRequestDto,
  ApplyPromoResponseDto,
  ConfirmPaymentRequestDto,
  ConfirmPaymentResponseDto,
  CreatePaymentIntentRequestDto,
  CreatePaymentIntentResponseDto,
  SubmitRideFeedbackRequestDto,
  RecentRideDto,
  MasterContentResponse,
  OnlineRiderDto,
  UserTransactionDto,
} from './types/rideBookingTypes';

// Step 1: Confirm pickup & drop-off location
export const confirmRideLocationApi = async (
  data: ConfirmRideLocationRequest,
): Promise<SuccessResponse<ConfirmRideLocationResponse> | FailureResponse> => {
  const response = await apiIndex.request<ConfirmRideLocationResponse>({
    url: `/rider/location/confirm`,
    method: 'POST',
    data,
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Step 2: Calculate route
export const calculateRideRouteApi = async (
  rideSessionId: string,
): Promise<SuccessResponse<CalculateRideRouteResponse> | FailureResponse> => {
  const response = await apiIndex.request<CalculateRideRouteResponse>({
    url: `/rider/calculate/route/${rideSessionId}`,
    method: 'GET',
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Step 3: Get ride options (economy, premium, etc.)
export const getRideOptionsApi = async (
  rideSessionId: string,
): Promise<SuccessResponse<RideOptionDtoResponse[]> | FailureResponse> => {
  const response = await apiIndex.request<RideOptionDtoResponse[]>({
    url: `/rider/ride/options/${rideSessionId}`,
    method: 'POST',
    data: {},
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Step 4: Select ride type
export const selectRideTypeApi = async (
  rideSessionId: string,
  rideType: string,
): Promise<SuccessResponse<SelectRideTypeResponse> | FailureResponse> => {
  const response = await apiIndex.request<SelectRideTypeResponse>({
    url: `/rider/ride/select/${rideSessionId}/${encodeURIComponent(rideType)}`,
    method: 'POST',
    data: {},
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Step 5: Get available vehicles by category
export const getAvailableVehiclesApi = async (
  categoryId: string,
): Promise<SuccessResponse<AvailableVehicleDto[]> | FailureResponse> => {
  const response = await apiIndex.request<AvailableVehicleDto[]>({
    url: `/rider/ride/vehicles/${categoryId}`,
    method: 'GET',
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Step 6: Assign driver to ride
export const assignDriverApi = async (
  rideSessionId: string,
  vehicleCategoryId: string,
): Promise<SuccessResponse<AssignDriverResponseDto> | FailureResponse> => {
  const response = await apiIndex.request<AssignDriverResponseDto>({
    url: `/rider/driver/assign/${rideSessionId}/${vehicleCategoryId}`,
    method: 'POST',
    data: {},
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Step 7: Poll driver/ride status
export const getDriverRideStatusApi = async (
  rideSessionId: string,
): Promise<SuccessResponse<RideStatusResponseDto> | FailureResponse> => {
  const response = await apiIndex.request<RideStatusResponseDto>({
    url: `/rider/driver/status/${rideSessionId}`,
    method: 'GET',
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Reassign driver
export const reassignDriverApi = async (
  rideSessionId: string,
): Promise<SuccessResponse<ReassignDriverResponseDto> | FailureResponse> => {
  const response = await apiIndex.request<ReassignDriverResponseDto>({
    url: `/rider/driver/reassign/${rideSessionId}`,
    method: 'POST',
    data: {},
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Cancel ride (by user/passenger)
export const cancelRideApi = async (
  data: CancelRideRequestDto,
): Promise<SuccessResponse<any> | FailureResponse> => {
  const response = await apiIndex.request<any>({
    url: `/rider/ride/cancel`,
    method: 'POST',
    data,
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Verify OTP (for ride start)
export const verifyRideOtpApi = async (
  data: VerifyRideOtpDto,
): Promise<SuccessResponse<any> | FailureResponse> => {
  const response = await apiIndex.request<any>({
    url: `/rider/otp/verify`,
    method: 'POST',
    data,
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Apply promo code
export const applyPromoCodeApi = async (
  data: ApplyPromoRequestDto,
): Promise<SuccessResponse<ApplyPromoResponseDto> | FailureResponse> => {
  const response = await apiIndex.request<ApplyPromoResponseDto>({
    url: `/rider/payment/promoApply`,
    method: 'POST',
    data,
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Create Stripe payment intent
export const createPaymentIntentApi = async (
  data: CreatePaymentIntentRequestDto,
): Promise<SuccessResponse<CreatePaymentIntentResponseDto> | FailureResponse> => {
  const response = await apiIndex.request<CreatePaymentIntentResponseDto>({
    url: `/rider/payment/create-intent`,
    method: 'POST',
    data,
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Confirm payment
export const confirmPaymentApi = async (
  data: ConfirmPaymentRequestDto,
): Promise<SuccessResponse<ConfirmPaymentResponseDto> | FailureResponse> => {
  const response = await apiIndex.request<ConfirmPaymentResponseDto>({
    url: `/rider/payment/pay`,
    method: 'POST',
    data,
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Submit ride feedback
export const submitRideFeedbackApi = async (
  data: SubmitRideFeedbackRequestDto,
): Promise<SuccessResponse<any> | FailureResponse> => {
  const response = await apiIndex.request<any>({
    url: `/rider/ride/feedback`,
    method: 'POST',
    data,
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Get recent rides
export const getRecentRidesApi = async (): Promise<
  SuccessResponse<RecentRideDto[]> | FailureResponse
> => {
  const response = await apiIndex.request<RecentRideDto[]>({
    url: `/rider/recent-rides`,
    method: 'GET',
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Get online riders near location
export const getOnlineRidersApi = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10,
): Promise<SuccessResponse<OnlineRiderDto[]> | FailureResponse> => {
  const response = await apiIndex.request<OnlineRiderDto[]>({
    url: `/rider/online-riders?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`,
    method: 'GET',
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Get user transactions
export const getUserTransactionsApi = async (): Promise<
  SuccessResponse<UserTransactionDto[]> | FailureResponse
> => {
  const response = await apiIndex.request<UserTransactionDto[]>({
    url: `/rider/user/transactions`,
    method: 'GET',
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Loyalty: get summary (tier, points, progress, offers)
export const getLoyaltySummaryApi = async (): Promise<
  SuccessResponse<any> | FailureResponse
> => {
  const response = await apiIndex.request<any>({
    url: `/rider/loyalty/summary`,
    method: 'GET',
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Loyalty: get point history
export const getLoyaltyHistoryApi = async (): Promise<
  SuccessResponse<any[]> | FailureResponse
> => {
  const response = await apiIndex.request<any[]>({
    url: `/rider/loyalty/history`,
    method: 'GET',
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Get master content (Terms & Conditions, Privacy Policy, Help)
// type: 0 = TermAndCondition, 1 = PrivacyPolicy, 2 = HelpAndSupport
export const getMasterContentApi = async (
  type: number,
): Promise<SuccessResponse<MasterContentResponse> | FailureResponse> => {
  const response = await apiIndex.request<MasterContentResponse>({
    url: `/user/master-content/${type}`,
    method: 'GET',
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Register device token for push notifications
export const registerDeviceTokenApi = async (token: string, platform: string) => {
  return apiIndex.request({
    url: '/rider/device-token',
    method: 'POST',
    data: { token, platform },
  });
};
