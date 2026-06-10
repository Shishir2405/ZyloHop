import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import FlashMessage from 'react-native-flash-message';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import configureAppStore from './src/Redux/Store';
import Navigation from './src/Navigation/Navigation';
import ErrorBoundary from './src/common/ErrorBoundary';
import {
  registerUnauthorizedHandler,
  registerSessionExpiredHandler,
} from './src/api/apiIndex';
import { installProductionConsoleGuard } from './src/utils/logger';
import { logNavigationState } from './src/utils/debug';
import SessionExpiryHandler from './src/components/SessionExpiryHandler';
import { setSessionExpired } from './src/Redux/Reducer/sessionExpiryRedux';

SplashScreen.preventAutoHideAsync().catch(() => {});
installProductionConsoleGuard();

const { store, persistor } = configureAppStore();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

const navigationRef = createNavigationContainerRef<any>();

const App = () => {
  const [fontsLoaded, fontError] = Font.useFonts({
    'Kenia-Regular': require('./src/assets/fonts/Kenia-Regular.ttf'),
    'Poppins-Bold': require('./src/assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('./src/assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Regular': require('./src/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Light': require('./src/assets/fonts/Poppins-Light.ttf'),
    'Poppins-ExtraLight': require('./src/assets/fonts/Poppins-ExtraLight.ttf'),
  });

  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      queryClient.clear();
      if (navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: 'SignInScreen' }] });
      }
    });
    registerSessionExpiredHandler(() => {
      // Surface the "Session expired" modal exactly once per 401 burst.
      // The reducer is a simple boolean, so duplicate dispatches are
      // idempotent.
      store.dispatch(setSessionExpired(true));
    });
  }, []);

  if (!ready) return null;

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer
              ref={navigationRef}
              onStateChange={logNavigationState}
            >
              <Navigation />
              <SessionExpiryHandler />
              <FlashMessage
                position="top"
                floating
                // Android: use the real status-bar height so the toast top
                // edge doesn't get hidden behind the OS bar. Was previously
                // 0 — text appeared clipped on most Android devices.
                statusBarHeight={
                  Platform.OS === 'ios'
                    ? 44
                    : (StatusBar.currentHeight ?? 24) + 4
                }
              />
            </NavigationContainer>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
