import { useQuery } from '@tanstack/react-query';
import { errorToast } from '../../components/toasts';
import {
  getOrderDeliveryApi,
  getOrderList,
  orderDetailsApi,
} from '../../api/orderFoodApis';

export const useGetOrderList = () => {
  return useQuery({
    queryKey: ['orderListKey'],
    queryFn: async () => {
      const response = await getOrderList();
      if (response.remote === 'failure') {
        const errorMsg =
          response?.errors?.errors?.message ||
          response?.errors?.errors ||
          'An unexpected error occurred';

        // errorToast(
        //   typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
        // );
        throw new Error(errorMsg);
      }
      return response.data;
    },
  });
};
export const useGetOrderDelivery = (orderId: string, enabled = true) => {
  return useQuery({
    queryKey: ['orderDeliveryKey', orderId],
    enabled: enabled && Boolean(orderId),
    refetchInterval: 5000, // Poll while the screen is open so partner state stays fresh
    queryFn: async () => {
      const response = await getOrderDeliveryApi(orderId);
      if (response.remote === 'failure') {
        // 404 just means the delivery isn't set up yet — treat as null,
        // not an error, so the screen can render the "looking for partner" state.
        return null;
      }
      // The backend returns ResponseHandler<{ data, ... }>.
      const payload: any = response.data;
      return (payload?.data ?? payload) || null;
    },
  });
};

export const useGetOrderDetailsById = (orderId: string) => {
  return useQuery({
    queryKey: ['orderDetailsKey', orderId],
    queryFn: async () => {
      const response = await orderDetailsApi(orderId);
      if (response.remote === 'failure') {
        const errorMsg =
          response?.errors?.errors?.message ||
          response?.errors?.errors ||
          'An unexpected error occurred';

        errorToast(
          typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
        );
        throw new Error(errorMsg);
      }
      return response.data;
    },
  });
};
