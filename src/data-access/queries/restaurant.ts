import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  getAllCategoryProductsApi,
  getAllRestApi,
  getAllRestCategoryApi,
  getProductDetailsByIdApi,
  getRestByIdApi,
} from '../../api/foodFlowApis';
import { errorToast } from '../../components/toasts';
import { DEFAULT_PAGE_SIZE } from '../../utils/helper';

export const useGetRestaurantList = () => {
  const getUsersPage = async ({ pageParam = 1 }: { pageParam: number }) => {
    try {
      const response = await getAllRestApi(pageParam, DEFAULT_PAGE_SIZE);
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
      return response.data.data;
    } catch (error) {
      if (__DEV__) console.log(error);
      throw error;
    }
  };

  return useInfiniteQuery({
    queryKey: ['KeyRestaurantListKey'],
    queryFn: getUsersPage,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage?.length == DEFAULT_PAGE_SIZE) {
        return (allPages.length ?? 0) + 1;
      } else {
        return undefined;
      }
    },
    initialPageParam: 1,
  });
};

export const useGetRestaurantDetailsById = (restaurantId: string) => {
  return useQuery({
    queryKey: ['keyRestaurantDetails' + restaurantId],
    queryFn: async () => {
      const response = await getRestByIdApi(restaurantId);
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
      return response.data.data;
    },
  });
};
export const useGetRestaurantAllCagtegoryById = (restaurantId: string) => {
  return useQuery({
    queryKey: ['keyRestaurantAllCategory', restaurantId],
    queryFn: async () => {
      const response = await getAllRestCategoryApi(restaurantId);
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
      return response.data.data;
    },
  });
};
export const useGetAllProductByCategoryId = (categoryId: string) => {
  return useQuery({
    queryKey: ['keyAllProductByCategoryId', categoryId],
    queryFn: async () => {
      const response = await getAllCategoryProductsApi(categoryId);
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
      return response.data.data;
    },
  });
};
export const useGetProductDetailsById = (productId: string) => {
  return useQuery({
    queryKey: ['productDetails', productId],
    queryFn: async () => {
      const response = await getProductDetailsByIdApi(productId);
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
      return response.data.data;
    },
  });
};
