import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  Category,
  Product,
  RestaurantDetail,
} from '../../api/types/foodFlowTypes';

interface Address {
  streetAddress: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
}

export interface RestaurantState {
  restaurantCategories: Category[];
  popularRestaurants?: RestaurantDetail[];
  selectedRestaurant?: RestaurantDetail;
  selectedProduct?: Product;
}

const initialState: RestaurantState = {
  restaurantCategories: [],
};

const infoSlice = createSlice({
  name: 'restaurantRedux',
  initialState,
  reducers: {
    storeRestaurantCategories: (state, action: PayloadAction<Category[]>) => {
      state.restaurantCategories = action.payload;
    },
    storePopularRestaurants: (
      state,
      action: PayloadAction<RestaurantDetail[]>,
    ) => {
      state.popularRestaurants = action.payload;
    },
    storeSelectedRestaurant: (
      state,
      action: PayloadAction<RestaurantDetail>,
    ) => {
      state.selectedRestaurant = action.payload;
    },
    storeSelectedProduct: (state, action: PayloadAction<Product>) => {
      state.selectedProduct = action.payload;
    },
    logoutRestaurantRedux: () => initialState,
  },
});

export const {
  storeRestaurantCategories,
  storeSelectedRestaurant,
  storeSelectedProduct,
  logoutRestaurantRedux,
  storePopularRestaurants,
} = infoSlice.actions;
export default infoSlice.reducer;
