import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import {
  persistReducer,
  persistStore,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import reducer from '../Reducer';

const stripUserSecrets = createTransform(
  (inboundState) => {
    if (inboundState && typeof inboundState === 'object' && 'user' in inboundState) {
      const { user, ...rest } = inboundState;
      if (user && typeof user === 'object') {
        const { password, ...safeUser } = user;
        return { ...rest, user: safeUser };
      }
    }
    return inboundState;
  },
  (outboundState) => outboundState,
  { whitelist: ['Userinfo'] },
);

const persistConfig = {
  timeout: 2000,
  key: 'appStateVer_54',
  storage: AsyncStorage,
  blacklist: ['loading', 'sessionExpiry'],
  transforms: [stripUserSecrets],
};

const persistedReducer = persistReducer(persistConfig, reducer);

export default function configureAppStore(preloadedState) {
  const store = configureStore({
    reducer: persistedReducer,
    preloadedState,
    middleware: (getDefault) =>
      getDefault({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
    devTools: __DEV__,
  });
  const persistor = persistStore(store);
  return { store, persistor };
}
