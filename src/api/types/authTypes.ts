import {UserType} from './userTypes';

export interface SignInPayload {
  email?: string;
  phoneNumber?: string;
  password: string;
}
export interface RiderSignInPayload {
  phoneNumber: string;
  password: string;
}
export interface SignInPayload2 {
  country_code: string;
  mobile_number: string;
  password: string;
}

export interface SignInResponseData {
  email: string;
  userName: string;
  token: string;
}
export interface SignUpResponseData {
  message: string;
  success: string;
  data: string;
}

export interface SignUpFormPayload extends UserType {
  profilePicture: any;
  password: string;
}

// userVerificationApi
export interface UserVerificationPayload {
  handle: string;
  otp: string;
}
export interface UserVerificationResponse {
  message: string;
  handle: string;
}
export interface ResendVerificationCodePayload {
  country_code: string;
  mobile_number: string;
}
export interface SetPasswordPayload {
  handle: string;
  password: string;
  confirm_password: string;
}
export interface SetPasswordResponseData {
  message: string;
}

export type ImageType = {
  name: string;
  uri: string;
  path: string;
  type: string;
};
