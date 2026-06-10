import React from 'react';
import { StyleSheet } from 'react-native';
import {
  FlashMessageProps,
  MessageOptions,
  showMessage,
} from 'react-native-flash-message';
import { getUserFriendlyMessage } from '../../utils/userFriendlyMessage';
import GlassToast, { GlassToastType } from './GlassToast';

/**
 * Glassmorphism toast notifications.
 *
 * Public API: `(title, subTitle?, options?)` for each of
 * successToast / errorToast / infoToast / warnToast.
 * `errorToast` routes through `getUserFriendlyMessage`.
 *
 * Visuals render via `renderCustomContent` per-call.
 *
 * Per-type default durations (override via `options.duration`):
 *   - success: 2500ms
 *   - info:    2500ms
 *   - warn:    3000ms
 *   - error:   3500ms
 */

const DURATIONS: Record<GlassToastType, number> = {
  success: 2500,
  info: 2500,
  warn: 3000,
  error: 3500,
};

const styles = StyleSheet.create({
  transparentCard: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0,
    minHeight: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
  },
  hiddenText: {
    height: 0,
    margin: 0,
    padding: 0,
    fontSize: 0,
    lineHeight: 0,
    color: 'transparent',
  },
});

function buildToastOptions(
  type: GlassToastType,
  title: string,
  subTitle: string | undefined,
  overrides: FlashMessageProps = {},
): MessageOptions {
  // Pull `message` out of overrides so it can't collide with our own
  // empty `message: ''` (the visible text lives inside <GlassToast />).
  const { message: _ignoredMessage, ...rest } = overrides;
  return {
    duration: DURATIONS[type],
    floating: true,
    position: 'top',
    hideOnPress: false,
    icon: 'none',
    style: styles.transparentCard,
    titleStyle: styles.hiddenText,
    textStyle: styles.hiddenText,
    renderCustomContent: () => (
      <GlassToast type={type} title={title} subTitle={subTitle} />
    ),
    ...(rest as MessageOptions),
    // The underlying flash still renders a Text node for `message`; we
    // pass an empty string and hide the default title/text via styles.
    // Set this LAST so callers can't accidentally re-show default text.
    message: '',
  };
}

export const successToast = (
  title: string,
  subTitle?: string,
  options: FlashMessageProps = {},
) => {
  showMessage(buildToastOptions('success', title, subTitle, options));
};

export const errorToast = (
  title: string,
  subTitle?: string,
  options: FlashMessageProps = {},
) => {
  const friendlyTitle = getUserFriendlyMessage(title);
  const friendlySubtitle = subTitle
    ? getUserFriendlyMessage(subTitle)
    : undefined;
  showMessage(
    buildToastOptions('error', friendlyTitle, friendlySubtitle, options),
  );
};

export const infoToast = (
  title: string,
  subTitle?: string,
  options: FlashMessageProps = {},
) => {
  showMessage(buildToastOptions('info', title, subTitle, options));
};

export const warnToast = (
  title: string,
  subTitle?: string,
  options: FlashMessageProps = {},
) => {
  showMessage(buildToastOptions('warn', title, subTitle, options));
};
