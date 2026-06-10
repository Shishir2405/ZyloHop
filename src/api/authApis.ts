import apiIndex from './apiIndex';
import { FailureResponse, SuccessResponse } from './types';
import {
  ResendVerificationCodePayload,
  SetPasswordPayload,
  SetPasswordResponseData,
  SignInPayload,
  SignInResponseData,
  SignUpFormPayload,
  SignUpResponseData,
  UserVerificationPayload,
  UserVerificationResponse,
} from './types/authTypes';
import { GetUserDetailApiResponse } from './types/userTypes';

export const signInApi = async (
  data: SignInPayload,
): Promise<SuccessResponse<SignInResponseData> | FailureResponse> => {
  const response = await apiIndex.request<SignInResponseData>({
    url: `/account/user-login`,
    method: 'POST',
    data,
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};

export interface SocialLoginPayload {
  provider: 'google' | 'apple';
  idToken: string;
  deviceToken?: string;
  devicePlatform?: string;
}

export const socialLoginApi = async (
  data: SocialLoginPayload,
): Promise<SuccessResponse<SignInResponseData> | FailureResponse> => {
  const response = await apiIndex.request<SignInResponseData>({
    url: `/account/social-login`,
    method: 'POST',
    data,
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};
export const signUpApi = async (
  data: SignUpFormPayload,
): Promise<SuccessResponse<SignUpResponseData> | FailureResponse> => {
  const formData = new FormData();

  formData.append('profilePicture', data.profilePicture);
  formData.append('firstName', data.firstName || '');
  formData.append('lastName', data.lastName || '');
  formData.append('email', data.email || '');
  formData.append('username', data.userName || '');
  formData.append('password', data.password || '');
  formData.append('phoneNumber', data.phoneNumber || '');

  formData.append('address.streetAddress', data.address?.streetAddress || '');
  formData.append('address.city', data.address?.city || '');
  formData.append('address.state', data.address?.state || '');
  formData.append('address.zipcode', data.address?.zipcode || '');
  formData.append('address.country', data.address?.country || '');
  formData.append('address.addressLink', data.address?.addressLink || '');

  const response = await apiIndex.request<SignUpResponseData>({
    url: `/account/register`,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};

export const userVerificationApi = async (
  data: UserVerificationPayload,
): Promise<SuccessResponse<UserVerificationResponse> | FailureResponse> => {
  const response = await apiIndex.request<UserVerificationResponse>({
    url: `/users/verification`,
    method: 'POST',
    data,
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};
export const resendVerificationCodeApi = async (
  data: ResendVerificationCodePayload,
): Promise<SuccessResponse<UserVerificationResponse> | FailureResponse> => {
  const response = await apiIndex.request<UserVerificationResponse>({
    url: `/users/resend-code`,
    method: 'POST',
    data,
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};
export const setPasswordApi = async (
  data: SetPasswordPayload,
): Promise<SuccessResponse<SetPasswordResponseData> | FailureResponse> => {
  const response = await apiIndex.request<SetPasswordResponseData>({
    url: `/users/set-password`,
    method: 'POST',
    data,
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};

export const getUserDetailsApi = async (): Promise<
  SuccessResponse<GetUserDetailApiResponse> | FailureResponse
> => {
  const response = await apiIndex.request<GetUserDetailApiResponse>({
    url: `/user/get-user`,
    method: 'GET',
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};

export const sendSignupOtpApi = async (data: {
  To: string;
  Subject: string;
  Body: string;
}): Promise<SuccessResponse<any> | FailureResponse> => {
  const response = await apiIndex.request<any>({
    url: `/email/send-email`,
    method: 'POST',
    data,
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};

export const sendOtpToMailApi = async (data: {
  email: string;
}): Promise<SuccessResponse<any> | FailureResponse> => {
  const response = await apiIndex.request<any>({
    url: `/account/send-otp-to-email`,
    method: 'POST',
    data,
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};
export const confirmEmailApi = async (data: {
  email: string;
  otp: string;
}): Promise<SuccessResponse<any> | FailureResponse> => {
  const response = await apiIndex.request<any>({
    url: `/account/confirm-email`,
    method: 'PATCH',
    data: JSON.stringify(data),
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};

// forgot password api
export const forgotPasswordSendOtpApi = async (data: {
  email: string;
}): Promise<SuccessResponse<any> | FailureResponse> => {
  const response = await apiIndex.request<any>({
    url: `/account/forgot-password`,
    method: 'POST',
    data,
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};
export const forgotPasswordVerifyOtpApi = async (data: {
  email: string;
  otp: string;
}): Promise<SuccessResponse<any> | FailureResponse> => {
  const response = await apiIndex.request<any>({
    url: `/account/verify-otp`,
    method: 'POST',
    data,
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};
export const resetPasswordApi = async (data: {
  email: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<SuccessResponse<any> | FailureResponse> => {
  const response = await apiIndex.request<any>({
    url: `/account/reset-password`,
    method: 'POST',
    data,
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};
