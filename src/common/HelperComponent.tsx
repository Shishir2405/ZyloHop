import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import Heading from './Heading';
import { Font } from './Theam';

/**
 * Props for SingleLineComponent
 */
interface SingleLineComponentProps {
  text1: string;
  text2?: string;
  style?: ViewStyle;
  leftIcon?: React.ReactNode;
  text1Click?: () => void;
}

export function SingleLineComponent({
  text1,
  text2,
  style,
  leftIcon,
  text1Click,
}: SingleLineComponentProps) {
  return (
    <View style={[{ flexDirection: 'row' }, style]}>
      {leftIcon && leftIcon}

      <Heading
        style={{ fontFamily: Font.textNormal, fontSize: 16, color: '#5A5A5A' }}
      >
        {text1}
      </Heading>

      {text2 && (
        <TouchableOpacity onPress={text1Click}>
          <Heading
            style={{
              fontFamily: Font.textNormal,
              color: '#EDAE10',
              fontSize: 16,
            }}
          >
            {text2}
          </Heading>
        </TouchableOpacity>
      )}
    </View>
  );
}
