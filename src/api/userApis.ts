import apiIndex from './apiIndex';
import {FailureResponse, SuccessResponse} from './types';

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  userName?: string;
  address?: {
    streetAddress?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    country?: string;
    addressLink?: string;
  };
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Update user profile
export const updateUserApi = async (
  data: UpdateUserPayload,
): Promise<SuccessResponse<any> | FailureResponse> => {
  const response = await apiIndex.request<any>({
    url: `/user/update-user`,
    method: 'PUT',
    data,
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Change password
export const changePasswordApi = async (
  data: ChangePasswordPayload,
): Promise<SuccessResponse<any> | FailureResponse> => {
  const response = await apiIndex.request<any>({
    url: `/account/change-password`,
    method: 'POST',
    data,
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};

// Delete account
export const deleteAccountApi = async (): Promise<
  SuccessResponse<any> | FailureResponse
> => {
  const response = await apiIndex.request<any>({
    url: `/account/delete-account`,
    method: 'POST',
  });
  if (response.remote === 'success') {
    return {remote: 'success', data: response.data};
  }
  return response;
};
