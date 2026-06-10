import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {Font} from './Theam';

interface ButtonProps {
  btnwidth?: string | number;
  btnheight?: string | number;
  bgcolor?: string;
  btnborder?: number;
  bordercolor?: string;
  onPress?: () => void;
  buttonName: string;
  buttonName2?: string;
  style?: ViewStyle;
  loader?: boolean;
  btncolor?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  btnwidth = '100%',
  btnheight = 54,
  bgcolor = '#EDAE10',
  btnborder,
  bordercolor,
  onPress,
  buttonName,
  buttonName2,
  style,
  loader = false,
  btncolor = '#fff',
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      disabled={loader || disabled}
      onPress={onPress}
      style={[
        styles.btn_container,
        style,
        {
          width: btnwidth,
          height: btnheight,
          backgroundColor: loader ? '#f1d382ff' : bgcolor,
          borderWidth: btnborder,
          borderColor: bordercolor,
        } as ViewStyle,
      ]}>
      <View style={styles.innerContainer}>
        {loader ? (
          <ActivityIndicator size="small" color="#FFF" animating={loader} />
        ) : (
          <View style={styles.textContainer}>
            <Text
              allowFontScaling={false}
              style={[styles.normal_text, {color: btncolor}]}>
              {buttonName}
            </Text>
            {buttonName2 && (
              <Text
                allowFontScaling={false}
                style={[styles.secondary_text, {color: btncolor}]}>
                {buttonName2}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn_container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 15,
    borderRadius: 8,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  normal_text: {
    fontSize: 16,
    fontFamily: Font.textBolder,
  },
  secondary_text: {
    fontSize: 14,
    fontFamily: Font.textNormal,
  },
});

export default Button;
