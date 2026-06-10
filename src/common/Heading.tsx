import { StyleSheet, Text, TextStyle, TextProps } from 'react-native';
import React, { ReactNode } from 'react';
import { Font } from './Theam';

interface HeadingProps extends TextProps {
  style?: TextStyle;
  children: ReactNode;
}

const Heading: React.FC<HeadingProps> = ({ style, children, ...rest }) => {
  return (
    <Text
      allowFontScaling={false}
      style={[{ fontSize: 24, fontFamily: Font.textBolder, color: '#2A2A2A' }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Heading;
