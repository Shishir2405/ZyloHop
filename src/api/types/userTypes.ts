export type GetUserDetailApiResponse = {
  success: boolean;
  message: string;
  data: UserType;
};

export interface IAddress {
  id?: string;
  streetAddress: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  addressTitle?: string;
  addressLink?: string;
}

export type UserType = {
  id?: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  emailVerified?: string;
  phoneVerified?: string;
  address: IAddress;
  profilePicture: {
    id: string;
    publicId: string;
    url: string;
  } | null;
};
