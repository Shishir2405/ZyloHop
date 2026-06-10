import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IAddress, UserType} from '../../api/types/userTypes';

export interface UserStateType {
  user?: UserType;
  userAddressList?: IAddress[];
  selectedAddress?: IAddress;
  basketId?: string;
}

const initialState: UserStateType = {};

const restaurantSlice = createSlice({
  name: 'userRedux',
  initialState,
  reducers: {
    storeUserDetails: (state, action: PayloadAction<UserType>) => {
      state.user = {...action.payload};
    },
    storeUserAddressList: (state, action: PayloadAction<IAddress[]>) => {
      state.userAddressList = action.payload;
    },
    storeSelectedAddress: (state, action: PayloadAction<IAddress>) => {
      state.selectedAddress = action.payload;
    },
    storeBasketId: (state, action: PayloadAction<string>) => {
      state.basketId = action.payload;
    },
    logoutUserInfoRedux: () => initialState,
  },
});

export const {
  storeUserDetails,
  storeUserAddressList,
  storeSelectedAddress,
  storeBasketId,
  logoutUserInfoRedux,
} = restaurantSlice.actions;
export default restaurantSlice.reducer;
