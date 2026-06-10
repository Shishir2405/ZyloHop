import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import React, { ReactNode } from 'react';
import { Font } from './Theam';

interface CustomTextProps extends TextProps {
  style?:StyleProp<TextStyle>;
  children: ReactNode;
}

const CustomText: React.FC<CustomTextProps> = ({
  style,
  children,
  ...restProps
}:CustomTextProps) => {
  return (
    <Text
      allowFontScaling={false}
      style={[
        { fontFamily: Font.textNormal, fontSize: 16, color: '#A0A0A0' },
        style,
      ]}
      {...restProps} // Spread other TextProps like onPress, ellipsizeMode, numberOfLines
    >
      {children}
    </Text>
  );
};

export default CustomText;
