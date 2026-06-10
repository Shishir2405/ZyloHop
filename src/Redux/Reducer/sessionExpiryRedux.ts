import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Tracks whether the user's session has expired (a 401 was just observed
 * by the axios interceptor in `src/api/apiIndex.ts`). The mounted
 * `SessionExpiryHandler` listens for `expired === true` and presents a
 * polite modal that routes to SignIn on dismissal.
 *
 * We intentionally keep this state out of `Userinfo` so it can be reset
 * cheaply without touching auth identity or personal info, and we ensure
 * it is NOT persisted across cold starts (blacklisted in the store).
 */
export type SessionExpiryState = {
  expired: boolean;
};

const initialState: SessionExpiryState = {
  expired: false,
};

const sessionExpirySlice = createSlice({
  name: 'sessionExpiry',
  initialState,
  reducers: {
    setSessionExpired: (state, action: PayloadAction<boolean>) => {
      state.expired = action.payload;
    },
    resetSessionExpiry: () => initialState,
  },
});

export const { setSessionExpired, resetSessionExpiry } =
  sessionExpirySlice.actions;

export default sessionExpirySlice.reducer;
