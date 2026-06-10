import React from 'react';
import {StyleSheet, Text} from 'react-native';

type Props = {message?: string};

export const FormFieldError: React.FC<Props> = ({message}) => {
  if (!message) {
    return null;
  }
  return (
    <Text allowFontScaling={false} style={styles.error}>
      {message}
    </Text>
  );
};

const styles = StyleSheet.create({
  error: {
    color: '#D14343',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default FormFieldError;
