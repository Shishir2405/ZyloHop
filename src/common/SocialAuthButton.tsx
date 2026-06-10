import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Font } from './Theam';
import { SVG } from './SvgHelper';

type Provider = 'google' | 'apple';

interface SocialAuthButtonProps {
  provider: Provider;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const LABELS: Record<Provider, string> = {
  google: 'Continue with Google',
  apple: 'Continue with Apple',
};

const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({
  provider,
  onPress,
  loading = false,
  disabled = false,
  style,
}) => {
  const isApple = provider === 'apple';
  const Icon = isApple ? SVG.AppleIcon : SVG.GoogleIcon;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={loading || disabled}
      onPress={onPress}
      style={[
        styles.button,
        isApple ? styles.apple : styles.google,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isApple ? '#FFF' : '#22272B'} />
      ) : (
        <View style={styles.row}>
          <Icon />
          <Text
            allowFontScaling={false}
            style={[styles.label, isApple ? styles.appleLabel : styles.googleLabel]}
          >
            {LABELS[provider]}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  google: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  apple: {
    backgroundColor: '#000000',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontFamily: Font.textSemiBolder,
    marginLeft: 10,
  },
  googleLabel: {
    color: '#22272B',
  },
  appleLabel: {
    color: '#FFFFFF',
  },
});

export default SocialAuthButton;
