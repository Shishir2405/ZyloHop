import {useMutation} from '@tanstack/react-query';
import {
  confirmRideLocationApi,
  selectRideTypeApi,
  assignDriverApi,
  reassignDriverApi,
  cancelRideApi,
  verifyRideOtpApi,
  applyPromoCodeApi,
  confirmPaymentApi,
  submitRideFeedbackApi,
} from '../../api/rideBookingApis';
import {
  ConfirmRideLocationRequest,
  CancelRideRequestDto,
  VerifyRideOtpDto,
  ApplyPromoRequestDto,
  ConfirmPaymentRequestDto,
  SubmitRideFeedbackRequestDto,
} from '../../api/types/rideBookingTypes';

export function useConfirmRideLocation() {
  return useMutation({
    mutationKey: ['confirmRideLocation'],
    mutationFn: async (data: ConfirmRideLocationRequest) => {
      return confirmRideLocationApi(data);
    },
  });
}

export function useSelectRideType() {
  return useMutation({
    mutationKey: ['selectRideType'],
    mutationFn: async ({
      rideSessionId,
      rideType,
    }: {
      rideSessionId: string;
      rideType: string;
    }) => {
      return selectRideTypeApi(rideSessionId, rideType);
    },
  });
}

export function useAssignDriver() {
  return useMutation({
    mutationKey: ['assignDriver'],
    mutationFn: async ({
      rideSessionId,
      vehicleCategoryId,
    }: {
      rideSessionId: string;
      vehicleCategoryId: string;
    }) => {
      return assignDriverApi(rideSessionId, vehicleCategoryId);
    },
  });
}

export function useReassignDriver() {
  return useMutation({
    mutationKey: ['reassignDriver'],
    mutationFn: async (rideSessionId: string) => {
      return reassignDriverApi(rideSessionId);
    },
  });
}

export function useCancelRide() {
  return useMutation({
    mutationKey: ['cancelRide'],
    mutationFn: async (data: CancelRideRequestDto) => {
      return cancelRideApi(data);
    },
  });
}

export function useVerifyRideOtp() {
  return useMutation({
    mutationKey: ['verifyRideOtp'],
    mutationFn: async (data: VerifyRideOtpDto) => {
      return verifyRideOtpApi(data);
    },
  });
}

export function useApplyPromoCode() {
  return useMutation({
    mutationKey: ['applyPromoCode'],
    mutationFn: async (data: ApplyPromoRequestDto) => {
      return applyPromoCodeApi(data);
    },
  });
}

export function useConfirmPayment() {
  return useMutation({
    mutationKey: ['confirmPayment'],
    mutationFn: async (data: ConfirmPaymentRequestDto) => {
      return confirmPaymentApi(data);
    },
  });
}

export function useSubmitRideFeedback() {
  return useMutation({
    mutationKey: ['submitRideFeedback'],
    mutationFn: async (data: SubmitRideFeedbackRequestDto) => {
      return submitRideFeedbackApi(data);
    },
  });
}
