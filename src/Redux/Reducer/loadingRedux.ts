import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type LoadingType = {
  isLoading: boolean;
};

const initialState: LoadingType = {
  isLoading: false,
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    storeIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    logoutLoadingRedux: () => initialState,
  },
});

export const {storeIsLoading, logoutLoadingRedux} = loadingSlice.actions;

export default loadingSlice.reducer;
