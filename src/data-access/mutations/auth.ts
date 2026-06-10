import { useMutation } from '@tanstack/react-query';
import AuthService from '../../services/AuthService';

// forgot password api
export function useForgotPasswordSendOtpApi() {
  return useMutation({
    mutationKey: ['forgotPasswordSendOtp'],
    mutationFn: async (email: string) => {
      const response = await AuthService.forgotPasswordSendOtp(email);
      return response;
    },
  });
}
export function useForgotPasswordVerifyOtpApi() {
  return useMutation({
    mutationKey: ['forgotPasswordVerifyOtp'],
    mutationFn: async (data: { email: string; otp: string }) => {
      const response = await AuthService.forgotPasswordVerifyOtp(
        data.email,
        data.otp,
      );
      return response;
    },
  });
}
export function useResetPasswordApi() {
  return useMutation({
    mutationKey: ['resetPasswordApi'],
    mutationFn: async (data: {
      email: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      const response = await AuthService.resetPassword(
        data.email,
        data.newPassword,
        data.confirmPassword,
      );
      return response;
    },
  });
}
