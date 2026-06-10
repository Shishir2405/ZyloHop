import {
  signInApi,
  signUpApi,
  sendOtpToMailApi,
  sendSignupOtpApi,
  confirmEmailApi,
  forgotPasswordSendOtpApi,
  forgotPasswordVerifyOtpApi,
  resetPasswordApi,
} from '../api/authApis';
import {
  SignInPayload,
  SignUpFormPayload,
  SignInResponseData,
  SignUpResponseData,
} from '../api/types/authTypes';
import { SuccessResponse, FailureResponse } from '../api/types';
import { setAuthToken, clearAuthToken } from './tokenStorage';

type ApiResult<T> = SuccessResponse<T> | FailureResponse;

const wrap = async <T>(
  fn: () => Promise<ApiResult<T>>,
  fallback: string,
): Promise<ApiResult<T>> => {
  try {
    return await fn();
  } catch (error: any) {
    return {
      remote: 'failure',
      errors: { errors: error?.message || fallback },
    };
  }
};

class AuthService {
  async login(payload: SignInPayload): Promise<ApiResult<SignInResponseData>> {
    const response = await wrap(
      () => signInApi(payload),
      'Login failed due to an unexpected error.',
    );
    if (response.remote === 'success' && response.data?.token) {
      await setAuthToken(response.data.token);
    }
    return response;
  }

  register(payload: SignUpFormPayload): Promise<ApiResult<SignUpResponseData>> {
    return wrap(() => signUpApi(payload), 'Registration failed.');
  }

  sendOtpToMail(email: string) {
    return wrap(() => sendOtpToMailApi({ email }), 'Failed to send OTP to email.');
  }

  sendSignupOtp(email: string, otp: string) {
    return wrap(
      () =>
        sendSignupOtpApi({
          To: email,
          Subject: 'Zylo Application OTP',
          Body: `Your OTP for signup is: ${otp}`,
        }),
      'Failed to send OTP to email.',
    );
  }

  confirmEmail(email: string, otp: string) {
    return wrap(() => confirmEmailApi({ email, otp }), 'Failed to confirm email.');
  }

  forgotPasswordSendOtp(email: string) {
    return wrap(() => forgotPasswordSendOtpApi({ email }), 'Failed to send OTP.');
  }

  forgotPasswordVerifyOtp(email: string, otp: string) {
    return wrap(
      () => forgotPasswordVerifyOtpApi({ email, otp }),
      'Failed to verify OTP.',
    );
  }

  resetPassword(email: string, newPassword: string, confirmPassword: string) {
    return wrap(
      () => resetPasswordApi({ email, newPassword, confirmPassword }),
      'Failed to reset password.',
    );
  }

  async logout(): Promise<void> {
    await clearAuthToken();
  }
}

export default new AuthService();
