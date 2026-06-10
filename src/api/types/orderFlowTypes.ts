import {IAddress} from './userTypes';

export type BasketItem = {
  basketItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
};

export type BasketData = {
  id: string;
  basketItems: BasketItem[];
  buyerId: string;
  buyerName: string;
};

export type BasketApiResponse = {
  success: boolean;
  message: string;
  data: BasketData;
};

export type AddToBasketPayload = {
  productId: string;
  quantity: number;
};

export type PlaceOrderPayload = {
  shippingAddress: {
    streetAddress: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
    addressLink: string;
  };
};

export type UserBasketResponse = {
  success: boolean;
  message: string;
  data: BasketData;
};

export interface IShippingItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}
export interface OrderListResponseData {
  message: string;
  success: string;
  data: IOrder[];
}

export interface IOrder {
  id: string;
  orderedById: string;
  orderedBy: string;
  orderPlacedDateAndTime: string; // ISO date string
  shippingAddress: IAddress;
  shippingItems: IShippingItem[];
  subTotal: number;
  flatTax: number | null;
  percentageTax: number | null;
  total: number;
  orderStatus: IOrderStatus; // extend as needed
  paymentStatus: 'NotPaid' | 'Paid' | string;
  paymentType: string | null;
  deliveredTime: string | null;
  orderRead: boolean;
  specialInstruction?: string;
}
export type IOrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Declined'
  | 'Cancelled';

export type IDeliveryStatus =
  | 'Pending'
  | 'Assigned'
  | 'AtRestaurant'
  | 'PickedUp'
  | 'Delivered'
  | 'Cancelled';

export interface IOrderDelivery {
  id: string;
  orderId: string;
  orderNumber: string | null;
  partnerId: string | null;
  partnerName: string | null;
  partnerPhone: string | null;
  status: IDeliveryStatus;
  // Pickup OTP is null on the customer side; delivery OTP is null until pickup is verified.
  pickupOtp: string | null;
  deliveryOtp: string | null;
  assignedAt: string;
  acceptedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  currentLatitude: number | null;
  currentLongitude: number | null;
  locationUpdatedAt: string | null;
  customerName: string | null;
  customerPhone: string | null;
  restaurantName: string | null;
  restaurantAddress: string | null;
  customerAddress: string | null;
  customerAddressLink: string | null;
}

export interface IOrderPaymentIntent {
  basketId: string;
  subTotal: number;
  taxAmount: number;
  deliveryFee: number;
  total: number;
  currency: string;
  paymentIntentId: string;
  clientSecret: string;
  publishableKey: string;
}

export interface IFeedback {
  reviewType: string;
  label: string;
  Description: string;
  Stars: number;
}
