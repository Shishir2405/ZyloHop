import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Font } from './Theam';

interface TextareaProps extends TextInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  /** Number of visible text lines used to compute minHeight. Default: 4. */
  rows?: number;
  /** When provided, renders a `current/max` counter in the bottom-right. */
  maxLength?: number;
  /** Visual error state; the error text itself is rendered by FormFieldError. */
  error?: string;
  /** Static label rendered above the textarea. */
  label?: string;
  containerStyle?: ViewStyle;
}

const NEUMO_SURFACE = '#F0F2F5';
const NEUMO_LIGHT = '#FFFFFF';
const NEUMO_DARK = '#A3B1C6';
const ERROR_COLOR = '#E74C3C';
const PRIMARY = Colors.default || '#F7C846';

const LINE_HEIGHT = 22;
const VERTICAL_PADDING = 12 * 2; // paddingTop + paddingBottom
const MAX_HEIGHT = 200;

const Textarea: React.FC<TextareaProps> = ({
  value,
  onChangeText,
  placeholder = '',
  rows = 4,
  maxLength,
  error,
  label,
  containerStyle,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!error;
  const length = value?.length ?? 0;
  const counterNearLimit =
    typeof maxLength === 'number' && maxLength - length <= 10;

  const minHeight = Math.max(80, rows * LINE_HEIGHT + VERTICAL_PADDING);

  const outerShadowStyle: ViewStyle = Platform.select<ViewStyle>({
    ios: hasError
      ? {
          shadowColor: 'rgba(231,76,60,0.25)',
          shadowOffset: { width: -4, height: -4 },
          shadowOpacity: 1,
          shadowRadius: 6,
        }
      : {
          shadowColor: NEUMO_LIGHT,
          shadowOffset: { width: -4, height: -4 },
          shadowOpacity: 0.7,
          shadowRadius: 6,
        },
    default: {},
  }) as ViewStyle;

  const innerShadowStyle: ViewStyle = Platform.select<ViewStyle>({
    ios: {
      shadowColor: hasError ? ERROR_COLOR : NEUMO_DARK,
      shadowOffset: isFocused
        ? { width: -2, height: -2 }
        : { width: 4, height: 4 },
      shadowOpacity: isFocused ? 0.5 : 0.35,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }) as ViewStyle;

  return (
    <View style={styles.wrapper}>
      {!!label && (
        <Text allowFontScaling={false} style={styles.label}>
          {label}
        </Text>
      )}

      <View style={[styles.outerWrapper, outerShadowStyle]}>
        <View
          style={[
            styles.innerWrapper,
            innerShadowStyle,
            hasError && styles.innerWrapperError,
            isFocused && !hasError && styles.innerWrapperFocused,
            { minHeight },
            containerStyle,
          ]}
        >
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={20}
              tint="light"
              style={[StyleSheet.absoluteFillObject, styles.blurBg]}
            />
          )}

          <TextInput
            {...rest}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#8C92A0"
            multiline
            textAlignVertical="top"
            maxLength={maxLength}
            onFocus={(e) => {
              setIsFocused(true);
              rest.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              rest.onBlur?.(e);
            }}
            style={[
              styles.textInput,
              {
                minHeight: minHeight - VERTICAL_PADDING,
                maxHeight: MAX_HEIGHT - VERTICAL_PADDING,
              },
              rest.style,
            ]}
          />

          {typeof maxLength === 'number' && (
            <Text
              allowFontScaling={false}
              style={[
                styles.counter,
                counterNearLimit && styles.counterDanger,
              ]}
            >
              {length}/{maxLength}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 10,
    width: '100%',
  },
  label: {
    fontFamily: Font.textNormal,
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    marginLeft: 4,
  },
  outerWrapper: {
    borderRadius: 14,
    width: '100%',
    backgroundColor: NEUMO_SURFACE,
  },
  innerWrapper: {
    borderRadius: 14,
    width: '100%',
    backgroundColor: NEUMO_SURFACE,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 26, // room for counter
    overflow: 'hidden',
    position: 'relative',
    maxHeight: MAX_HEIGHT,
    ...Platform.select({
      android: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
      },
      default: {},
    }),
  },
  innerWrapperError: {
    borderWidth: 1,
    borderColor: ERROR_COLOR,
  },
  innerWrapperFocused: {
    borderWidth: 1,
    borderColor: PRIMARY,
  },
  blurBg: {
    borderRadius: 14,
  },
  textInput: {
    fontSize: 15,
    fontFamily: Font.textNormal,
    color: '#1A1D24',
    padding: 0,
    lineHeight: LINE_HEIGHT,
  },
  counter: {
    position: 'absolute',
    right: 12,
    bottom: 8,
    fontSize: 12,
    fontFamily: Font.textNormal,
    color: '#6B7280',
  },
  counterDanger: {
    color: ERROR_COLOR,
  },
});

export default Textarea;
