import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import CustomText from '../../common/CustomText';
import {Font} from '../../common/Theam';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel,
  onAction,
}) => (
  <View style={styles.row}>
    <CustomText style={styles.title}>{title}</CustomText>
    {actionLabel && onAction ? (
      <TouchableOpacity onPress={onAction}>
        <CustomText style={styles.action}>{actionLabel}</CustomText>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    color: '#1B1F23',
    fontFamily: Font.textBolder,
  },
  action: {
    fontSize: 13,
    color: '#EDAE10',
    fontFamily: Font.textSemiBolder,
  },
});

export default SectionHeader;
