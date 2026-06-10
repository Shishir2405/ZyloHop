import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Font } from './Theam';

interface InputProps extends TextInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  leftButton?: React.ReactNode;
  rightButton?: React.ReactNode;
  rightButtonPress?: () => void;
  borderStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  /**
   * Visual error state. Sets border + tinted shadow. The error TEXT is
   * intentionally NOT rendered here — sibling agents use a separate
   * <FormFieldError /> below the input.
   */
  error?: string;
  /** Explicit floating label override; falls back to `placeholder`. */
  label?: string;
}

const NEUMO_SURFACE = '#F0F2F5';
const NEUMO_LIGHT = '#FFFFFF';
const NEUMO_DARK = '#A3B1C6';
const ERROR_COLOR = '#E74C3C';
const PRIMARY = Colors.default || '#F7C846';

const Input: React.FC<InputProps> = ({
  placeholder = '',
  value,
  onChangeText,
  leftButton,
  rightButton,
  rightButtonPress,
  borderStyle,
  containerStyle,
  error,
  label,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const labelText = label ?? placeholder;
  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedLabel, {
      toValue: isFocused || !!value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, animatedLabel]);

  const hasError = !!error;

  const labelStyle = {
    position: 'absolute' as const,
    left: 12,
    zIndex: 2,
    backgroundColor: NEUMO_SURFACE,
    paddingHorizontal: 4,
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [20, -8],
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: ['#A0A0A0', hasError ? ERROR_COLOR : PRIMARY],
    }),
  };

  // Outer wrapper: light "highlight" shadow from top-left (iOS only).
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

  // Inner wrapper: dark "lifted" shadow from bottom-right (iOS), elevation (Android).
  // On focus, flip the dark shadow to a smaller top-left offset (inset feel).
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
    <View style={[styles.outerWrapper, outerShadowStyle]}>
      <View
        style={[
          styles.innerWrapper,
          innerShadowStyle,
          hasError && styles.innerWrapperError,
          borderStyle,
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

        {leftButton && <View style={styles.leftBtn}>{leftButton}</View>}

        <View style={styles.fieldArea}>
          {!!labelText && (
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <Animated.Text
                allowFontScaling={false}
                style={[styles.label, labelStyle]}
              >
                {labelText}
              </Animated.Text>
            </View>
          )}

          <TextInput
            {...rest}
            value={value}
            onChangeText={onChangeText}
            onFocus={(e) => {
              setIsFocused(true);
              rest.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              rest.onBlur?.(e);
            }}
            style={[styles.textInput, rest.style]}
            placeholder=""
          />
        </View>

        {rightButton && (
          <TouchableOpacity
            style={styles.rightBtn}
            onPress={rightButtonPress}
          >
            {rightButton}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    borderRadius: 14,
    marginVertical: 10,
    width: '100%',
    backgroundColor: NEUMO_SURFACE,
  },
  innerWrapper: {
    minHeight: 62,
    borderRadius: 14,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUMO_SURFACE,
    position: 'relative',
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
  blurBg: {
    borderRadius: 14,
  },
  fieldArea: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontFamily: Font.textNormal,
  },
  textInput: {
    minHeight: 62,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: Font.textNormal,
    color: 'black',
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 8,
    textAlignVertical: 'center',
  },
  leftBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  rightBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
});

export default Input;
