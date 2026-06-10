import apiIndex from './apiIndex';
import {FailureResponse, SuccessResponse} from './types';
import {IAddress} from './types/userTypes';
import {
  AddToBasketPayload,
  BasketApiResponse,
  IFeedback,
  IOrder,
  IOrderDelivery,
  IOrderPaymentIntent,
  OrderListResponseData,
  UserBasketResponse,
} from './types/orderFlowTypes';

export const addUserAddress = async (
  data: IAddress,
): Promise<SuccessResponse<IAddress> | FailureResponse> => {
  const response = await apiIndex.request<IAddress>({
    url: `/user/add-user-delivery-address`,
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

export const getAllUserAddress = async (): Promise<
  SuccessResponse<any> | FailureResponse
> => {
  const response = await apiIndex.request<IAddress[]>({
    url: `/user/get-all-user-delivery-addresses`,
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
export const getOrderList = async (): Promise<
  SuccessResponse<OrderListResponseData> | FailureResponse
> => {
  const response = await apiIndex.request<OrderListResponseData>({
    url: `/order/get-user-orders`,
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

export const deleteAddressApi = async (
  userDeliveryAddressId: string,
): Promise<SuccessResponse<any> | FailureResponse> => {
  const response = await apiIndex.request<any>({
    url: `/user/delete-user-delivery-address/${userDeliveryAddressId}`,
    method: 'DELETE',
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};

export const getOrderDeliveryApi = async (
  orderId: string,
): Promise<SuccessResponse<IOrderDelivery> | FailureResponse> => {
  const response = await apiIndex.request<IOrderDelivery>({
    url: `/order/${orderId}/delivery`,
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

export const orderDetailsApi = async (
  orderId: string,
): Promise<SuccessResponse<any> | FailureResponse> => {
  const response = await apiIndex.request<any>({
    url: `/order/get-order-details/${orderId}`,
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

export const createOrderPaymentIntentApi = async (
  basketId: string,
): Promise<SuccessResponse<IOrderPaymentIntent> | FailureResponse> => {
  const response = await apiIndex.request<IOrderPaymentIntent>({
    url: `/order/${basketId}/create-payment-intent`,
    method: 'POST',
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};

export const placeOrderApi = async (
  basketId: string,
  data: IAddress,
  stripePaymentIntentId: string,
  specialInstruction?: string,
): Promise<SuccessResponse<IAddress> | FailureResponse> => {
  let payload = {
    shippingAddress: {...data, shipToAddressLink: data.addressLink || ''},
    specialInstruction:
      specialInstruction || 'This is some special instruction',
    stripePaymentIntentId,
  };
  const response = await apiIndex.request<IAddress>({
    url: `/order/${basketId}/place-order`,
    method: 'POST',
    data: JSON.stringify(payload),
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};

export const addUpdateBasketApi = async (
  data: AddToBasketPayload,
): Promise<SuccessResponse<BasketApiResponse> | FailureResponse> => {
  const response = await apiIndex.request<BasketApiResponse>({
    url: `/basket/add-update-basket`,
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

export const removeBasketItemApi = async (
  basketItemId: string,
): Promise<SuccessResponse<any> | FailureResponse> => {
  const response = await apiIndex.request<any>({
    url: `/basket/remove-basket-item/${basketItemId}`,
    method: 'DELETE',
  });

  if (response.remote === 'success') {
    return {
      remote: 'success',
      data: response.data,
    };
  }

  return response;
};

export const getUserBasketApi = async (): Promise<
  SuccessResponse<UserBasketResponse> | FailureResponse
> => {
  const response = await apiIndex.request<UserBasketResponse>({
    url: `basket/get-user-basket`,
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

// feedback
export const orderFeedbackApi = async (
  orderId: string,
  data: IFeedback,
): Promise<SuccessResponse<any> | FailureResponse> => {
  const response = await apiIndex.request<IAddress>({
    url: `/review/${orderId}/add-order-review`,
    method: 'POST',
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
