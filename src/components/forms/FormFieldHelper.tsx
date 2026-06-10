import React from 'react';
import {StyleSheet, Text} from 'react-native';

type Props = {
  message?: string;
  tone?: 'info' | 'success';
};

export const FormFieldHelper: React.FC<Props> = ({message, tone = 'info'}) => {
  if (!message || message.trim() === '') {
    return null;
  }
  const color = tone === 'success' ? '#2E7D32' : '#7B8794';
  return (
    <Text allowFontScaling={false} style={[styles.helper, {color}]}>
      {message}
    </Text>
  );
};

const styles = StyleSheet.create({
  helper: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default FormFieldHelper;
