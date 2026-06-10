import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import Button from '../common/Button';
import CustomText from '../common/CustomText';
import { Font } from '../common/Theam';
import { setSessionExpired } from '../Redux/Reducer/sessionExpiryRedux';
import { clearAuthToken } from '../services/tokenStorage';
import { AuthStackParamList } from '../screens/auth';

type NavigationProps = StackNavigationProp<AuthStackParamList, 'SignInScreen'>;

/**
 * Polite "Session expired" modal. Mounted once near the app root; listens
 * to `state.sessionExpiry.expired`. When `true`, presents a non-dismissible
 * modal explaining that the user must sign in again. The single "Sign In"
 * action clears the redux flag, clears any cached token, and navigates to
 * the SignIn screen (resetting the navigation stack so back-press doesn't
 * land the user on a protected screen mid-401).
 *
 * The 401 interceptor in `apiIndex.ts` also calls the existing
 * `onUnauthorized` handler (registered in `App.tsx`) which already does
 * `navigation.reset` to SignIn — but the user is left with no explanation
 * for why they were bounced. This modal fills that gap.
 */
const SessionExpiryHandler: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProps>();
  const expired = useSelector(
    (state: any) => state?.sessionExpiry?.expired === true,
  );

  const handleSignInAgain = async () => {
    dispatch(setSessionExpired(false));
    try {
      await clearAuthToken();
    } catch {
      // Token clear is best-effort — the interceptor already cleared it.
    }
    // Reset the navigation stack so the user can't back-swipe into a
    // protected screen that would just 401 again.
    try {
      navigation.reset?.({ index: 0, routes: [{ name: 'SignInScreen' }] });
    } catch {
      navigation.navigate('SignInScreen' as never);
    }
  };

  if (!expired) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible
      onRequestClose={handleSignInAgain}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <CustomText style={styles.title}>Session expired</CustomText>
          <CustomText style={styles.body}>
            Your session has expired. Please sign in again to continue.
          </CustomText>
          <Button
            buttonName="Sign In"
            btnwidth="100%"
            onPress={handleSignInAgain}
            style={styles.button as any}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  title: {
    fontFamily: Font.textBolder,
    fontSize: 18,
    color: '#2A2A2A',
    marginBottom: 8,
    textAlign: 'center',
  },
  body: {
    fontFamily: Font.textNormal,
    fontSize: 14,
    color: '#5A5A5A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    marginTop: 4,
  },
});

export default SessionExpiryHandler;
