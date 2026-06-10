import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Font} from '../common/Theam';
import {
  clearGlobalError,
  GlobalErrorState,
} from '../Redux/Reducer/globalErrorRedux';

type Props = {
  /** Optional: only show banner when state.globalError.lastError.context matches. */
  context?: string;
  /** Optional callback the consumer fires on Retry (e.g. re-trigger fetch). */
  onRetry?: () => void;
  /** Optional override label for the retry CTA. */
  retryLabel?: string;
};

/**
 * Thin retry banner that reads from the `globalError` Redux slice.
 *
 * Two usage patterns:
 *
 * 1. Local opt-in (recommended for now):
 *    <GlobalErrorBanner context="Transactions" onRetry={refetch} />
 *
 * 2. App-root: drop it once in App.tsx beneath the main navigator so it
 *    appears anywhere the slice has a non-null `lastError`. NOTE: Agent C
 *    may be modifying App.tsx — if you are mounting this at root, add this
 *    line manually rather than touching App.tsx here:
 *
 *      <GlobalErrorBanner />
 */
const GlobalErrorBanner: React.FC<Props> = ({context, onRetry, retryLabel}) => {
  const dispatch = useDispatch();
  const lastError = useSelector(
    (state: {globalError: GlobalErrorState}) => state.globalError?.lastError,
  );

  if (!lastError) {
    return null;
  }

  if (context && lastError.context !== context) {
    return null;
  }

  const handleRetry = () => {
    dispatch(clearGlobalError());
    onRetry?.();
  };

  const handleDismiss = () => {
    dispatch(clearGlobalError());
  };

  return (
    <View style={styles.banner}>
      <View style={styles.textCol}>
        <Text allowFontScaling={false} style={styles.title}>
          Something went wrong
        </Text>
        <Text
          allowFontScaling={false}
          numberOfLines={2}
          style={styles.message}>
          {lastError.message}
        </Text>
      </View>
      <View style={styles.actions}>
        {onRetry ? (
          <TouchableOpacity onPress={handleRetry} style={styles.retryBtn}>
            <Text allowFontScaling={false} style={styles.retryText}>
              {retryLabel ?? 'Retry'}
            </Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={handleDismiss} style={styles.dismissBtn}>
          <Text allowFontScaling={false} style={styles.dismissText}>
            Dismiss
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FDECEC',
    borderLeftWidth: 4,
    borderLeftColor: '#D14343',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  textCol: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    color: '#9C1F1F',
    fontFamily: Font.textSemiBolder,
    fontSize: 13,
    marginBottom: 2,
  },
  message: {
    color: '#7A1F1F',
    fontFamily: Font.textNormal,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'column',
    gap: 4,
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#D14343',
    borderRadius: 6,
    alignItems: 'center',
  },
  retryText: {
    color: '#fff',
    fontFamily: Font.textSemiBolder,
    fontSize: 12,
  },
  dismissBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  dismissText: {
    color: '#9C1F1F',
    fontFamily: Font.textSemiBolder,
    fontSize: 12,
  },
});

export default GlobalErrorBanner;
