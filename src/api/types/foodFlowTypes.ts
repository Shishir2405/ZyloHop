import {IAddress} from './userTypes';

export type DisplayImageType = {
  id: string;
  url: string;
};
export type AllRestaurantApiResponse = {
  success: boolean;
  message: string;
  data: RestaurantDetail[];
};

export type RestaurantDetailResponse = {
  success: boolean;
  message: string;
  data: RestaurantDetail;
};

export type RestaurantDetail = {
  id: string;
  restaurantName: string;
  restaurantOwner: string;
  restaurantPhoneNumber: string;
  restaurantEmail: string;
  restaurantRegistrationNumber: string;
  documents: RestaurantDocument[];
  displayImage: DisplayImageType;
  address: RestaurantAddress;
};

export type RestaurantDocument = {
  id: string;
  publicId: string;
  url: string;
  restaurantId: string;
  uploadedAt: string; // ISO date
};

export type RestaurantAddress = {
  streetAddress: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
};

export type GetAllCategoriesResponse = {
  success: boolean;
  message: string;
  data: Category[];
};

export type Category = {
  id: string;
  categoryName: string;
  categoryDescription: string;
};

export type GetAllProductsResponse = {
  success: boolean;
  message: string;
  data: Product[];
};
export type GetProductDetailsByIdResponse = {
  success: boolean;
  message: string;
  data: Product;
};

export type Product = {
  id: string;
  name: string;
  productDescription: string;
  productPrice: number;
  commission: number;
  photos: DisplayImageType[];
  foodType: 'veg' | 'non-veg';
};
