// Location types
export interface LocationDto {
  address: string;
  latitude: number;
  longitude: number;
}

// Request types
export interface ConfirmRideLocationRequest {
  pickup: LocationDto;
  drop: LocationDto;
}

export interface CancelRideRequestDto {
  rideSessionId: string;
  reasonCode: string;
  comment?: string;
}

export interface VerifyRideOtpDto {
  rideSessionId: string;
  otp: string;
}

export interface ApplyPromoRequestDto {
  rideSessionId: string;
  promoCode: string;
}

export interface ConfirmPaymentRequestDto {
  rideSessionId: string;
  paymentMethod: string;
  stripePaymentIntentId?: string;
}

export interface CreatePaymentIntentRequestDto {
  rideSessionId: string;
}

export interface CreatePaymentIntentResponseDto {
  paymentIntentId: string;
  clientSecret: string;
  publishableKey: string;
}

export interface SubmitRideFeedbackRequestDto {
  rideSessionId: string;
  rating: number;
  comment?: string;
}

// Response types
export interface ConfirmRideLocationResponse {
  rideSessionId: string;
  nextScreen: string;
}

export interface CalculateRideRouteResponse {
  distanceKm: number;
  estimatedTimeMin: number;
  polyline: string;
}

export interface RideOptionDtoResponse {
  vehicleCategoryId: string;
  rideType: string;
  vehicleName: string;
  etaMin: number;
  distanceKm: number;
  fare: number;
}

export interface SelectRideTypeResponse {
  selectedRide: string;
  fare: number;
  status: string;
  nextScreen: string;
}

export interface AvailableVehicleDto {
  vehicleId: string;
  vehicleName: string;
  ownerName: string;
  vehicleCategory: string;
  seatCapacity: number;
  vehicleImageUrl: string;
}

export interface AssignDriverResponseDto {
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleName: string;
  vehicleNumber: string;
  etaMin: number;
  status: string;
}

export interface DriverInfoDto {
  driverId: string;
  driverName: string;
  rating: number;
  vehicleName: string;
  vehicleNumber: string;
}

export interface RideStatusResponseDto {
  rideSessionId: string;
  status: string;
  otp: string;
  driver: DriverInfoDto;
  distanceKm: number;
  driverLocation: LocationDto;
  pickupLocation: LocationDto;
  dropLocation: LocationDto;
  pickupAddress: string;
  dropAddress: string;
  passengerName: string;
  rideType: string;
  polyline: string;
  driverComingEtaMin: number;
  fare: number;
}

export interface ReassignDriverResponseDto {
  status: string;
  message: string;
}

export interface ApplyPromoResponseDto {
  discount: number;
  finalAmount: number;
}

export interface ConfirmPaymentResponseDto {
  paymentStatus: string;
  receiptId: string;
  stripePaymentIntentId?: string;
}

export interface RecentRideDto {
  rideId: string;
  pickupAddress: string;
  dropAddress: string;
  fare: number | null;
  status: string;
  distanceKm: number;
  rideDate: string;
}

export interface OnlineRiderDto {
  driverId: string;
  driverName: string;
  latitude: number;
  longitude: number;
  vehicleCategory: string;
  vehicleName: string;
}

export interface UserTransactionDto {
  paymentId: string;
  rideSessionId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  receiptId: string;
  createdAt: string;
  pickupAddress: string;
  dropAddress: string;
  driverName: string;
  distanceKm: number;
}

export interface MasterContentResponse {
  id: string;
  title: string;
  content: string;
  type: number;
  createdDate: string;
  updatedDate: string | null;
}
