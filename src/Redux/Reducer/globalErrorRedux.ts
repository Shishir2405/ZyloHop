import {createSlice, PayloadAction} from '@reduxjs/toolkit';

/**
 * Global error slice — a tiny "last seen" buffer that screens or shared
 * components (e.g. <GlobalErrorBanner />) can read to show a retry surface
 * after a toast has expired.
 *
 * This is NOT a replacement for `errorToast` — it is an opt-in companion.
 * Wire-in pattern:
 *
 *   import {useDispatch} from 'react-redux';
 *   import {setGlobalError} from '../../Redux/Reducer/globalErrorRedux';
 *   ...
 *   errorToast(msg);
 *   dispatch(setGlobalError({message: msg, context: 'Transactions'}));
 *
 * Then a screen-level banner can call `clearGlobalError()` on retry.
 */
export type GlobalErrorPayload = {
  message: string;
  context?: string;
};

export type GlobalErrorEntry = GlobalErrorPayload & {at: number};

export type GlobalErrorState = {
  lastError: GlobalErrorEntry | null;
};

const initialState: GlobalErrorState = {
  lastError: null,
};

const globalErrorSlice = createSlice({
  name: 'globalError',
  initialState,
  reducers: {
    setGlobalError: (state, action: PayloadAction<GlobalErrorPayload>) => {
      state.lastError = {
        message: action.payload.message,
        context: action.payload.context,
        at: Date.now(),
      };
    },
    clearGlobalError: state => {
      state.lastError = null;
    },
    logoutGlobalErrorRedux: () => initialState,
  },
});

export const {setGlobalError, clearGlobalError, logoutGlobalErrorRedux} =
  globalErrorSlice.actions;

export default globalErrorSlice.reducer;
