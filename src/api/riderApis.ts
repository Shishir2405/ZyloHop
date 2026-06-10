import apiIndex from './apiIndex';
import {FailureResponse, SuccessResponse} from './types';
import {
  RiderSignInPayload,
  SignInResponseData,
  SignUpResponseData,
} from './types/authTypes';
import {RiderSignUpFormPayload} from './types/riderTypes';

export const riderSignUpApi = async (
  data: RiderSignUpFormPayload,
): Promise<SuccessResponse<any> | FailureResponse> => {
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
  formData.append('profilePicture', data.profilePicture || '');
  formData.append('documents', data.documents || '');

  const response = await apiIndex.request<SignUpResponseData>({
    url: `/rider/register`,
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

export const riderSignInApi = async (
  data: RiderSignInPayload,
): Promise<SuccessResponse<SignInResponseData> | FailureResponse> => {
  const response = await apiIndex.request<SignInResponseData>({
    url: `/rider/login-rider`,
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
