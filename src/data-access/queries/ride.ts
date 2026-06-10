import {useQuery} from '@tanstack/react-query';
import {
  getRecentRidesApi,
  getDriverRideStatusApi,
  getRideOptionsApi,
  getAvailableVehiclesApi,
  calculateRideRouteApi,
  getMasterContentApi,
} from '../../api/rideBookingApis';
import {errorToast} from '../../components/toasts';

export const useGetRecentRides = () => {
  return useQuery({
    queryKey: ['recentRides'],
    queryFn: async () => {
      const response = await getRecentRidesApi();
      if (response.remote === 'failure') {
        const errorMsg =
          response?.errors?.errors?.message ||
          response?.errors?.errors ||
          'Failed to fetch recent rides';
        errorToast(
          typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
        );
        throw new Error(errorMsg);
      }
      return response.data;
    },
  });
};

export const useGetDriverRideStatus = (rideSessionId: string) => {
  return useQuery({
    queryKey: ['driverRideStatus', rideSessionId],
    queryFn: async () => {
      const response = await getDriverRideStatusApi(rideSessionId);
      if (response.remote === 'failure') {
        throw new Error(
          response?.errors?.errors?.message ||
            response?.errors?.errors ||
            'Failed to fetch ride status',
        );
      }
      return response.data;
    },
    enabled: !!rideSessionId,
    refetchInterval: 5000,
  });
};

export const useGetRideOptions = (rideSessionId: string) => {
  return useQuery({
    queryKey: ['rideOptions', rideSessionId],
    queryFn: async () => {
      const response = await getRideOptionsApi(rideSessionId);
      if (response.remote === 'failure') {
        throw new Error(
          response?.errors?.errors?.message ||
            response?.errors?.errors ||
            'Failed to fetch ride options',
        );
      }
      return response.data;
    },
    enabled: !!rideSessionId,
  });
};

export const useGetAvailableVehicles = (categoryId: string) => {
  return useQuery({
    queryKey: ['availableVehicles', categoryId],
    queryFn: async () => {
      const response = await getAvailableVehiclesApi(categoryId);
      if (response.remote === 'failure') {
        throw new Error(
          response?.errors?.errors?.message ||
            response?.errors?.errors ||
            'Failed to fetch available vehicles',
        );
      }
      return response.data;
    },
    enabled: !!categoryId,
  });
};

export const useCalculateRideRoute = (rideSessionId: string) => {
  return useQuery({
    queryKey: ['rideRoute', rideSessionId],
    queryFn: async () => {
      const response = await calculateRideRouteApi(rideSessionId);
      if (response.remote === 'failure') {
        throw new Error(
          response?.errors?.errors?.message ||
            response?.errors?.errors ||
            'Failed to calculate route',
        );
      }
      return response.data;
    },
    enabled: !!rideSessionId,
  });
};

// type: 0 = Terms & Conditions, 1 = Privacy Policy, 2 = Help & Support
export const useGetMasterContent = (type: number) => {
  return useQuery({
    queryKey: ['masterContent', type],
    queryFn: async () => {
      const response = await getMasterContentApi(type);
      if (response.remote === 'failure') {
        throw new Error(
          response?.errors?.errors?.message ||
            response?.errors?.errors ||
            'Failed to fetch content',
        );
      }
      return response.data;
    },
  });
};
