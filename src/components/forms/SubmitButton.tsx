import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import Button from '../../common/Button';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  btnwidth?: string | number;
};

export const SubmitButton: React.FC<Props> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
  btnwidth,
}) => {
  return (
    <Button
      buttonName={label}
      onPress={onPress}
      loader={loading}
      disabled={disabled || loading}
      style={style as ViewStyle}
      btnwidth={btnwidth}
    />
  );
};

export default SubmitButton;
