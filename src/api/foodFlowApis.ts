// restaurant/get-all-restaurants
import apiIndex from './apiIndex';

import {FailureResponse, SuccessResponse} from './types';
import {
  AllRestaurantApiResponse,
  GetAllCategoriesResponse,
  GetAllProductsResponse,
  GetProductDetailsByIdResponse,
  RestaurantDetailResponse,
} from './types/foodFlowTypes';
import {UserBasketResponse} from './types/orderFlowTypes';

export const getAllRestApi = async (
  pageNumber: string | number,
  pageSize: string | number,
): Promise<SuccessResponse<AllRestaurantApiResponse> | FailureResponse> => {
  const params: any = {};

  if (pageNumber) params.page = pageNumber;
  if (pageSize) params.size = pageSize;
  const response = await apiIndex.request<AllRestaurantApiResponse>({
    url: `/restaurant/get-all-restaurants`,
    method: 'GET',
    params,
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};
export const getRestByIdApi = async (
  restaurantId: string,
): Promise<SuccessResponse<RestaurantDetailResponse> | FailureResponse> => {
  const response = await apiIndex.request<RestaurantDetailResponse>({
    url: `/restaurant/get-restaurant/${restaurantId}`,
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
export const getAllRestCategoryApi = async (
  restaurantId: string,
): Promise<SuccessResponse<GetAllCategoriesResponse> | FailureResponse> => {
  const response = await apiIndex.request<GetAllCategoriesResponse>({
    url: `category/${restaurantId}/get-all-categories`,
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
export const getAllCategoryProductsApi = async (
  categoryId: string,
): Promise<SuccessResponse<GetAllProductsResponse> | FailureResponse> => {
  const response = await apiIndex.request<GetAllProductsResponse>({
    url: `product/${categoryId}/get-all-products`,
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
export const getProductDetailsByIdApi = async (
  productId: string,
): Promise<
  SuccessResponse<GetProductDetailsByIdResponse> | FailureResponse
> => {
  const response = await apiIndex.request<GetProductDetailsByIdResponse>({
    url: `product/get-product/${productId}`,
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
