import {UserType} from './userTypes';

export interface RiderSignUpFormPayload extends UserType {
  profilePicture: any;
  password: string;
  documents?: any;
  drivingLicense?: any;
  documentExpiryDate?: any;
}
