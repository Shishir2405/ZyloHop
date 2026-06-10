import React, {useRef} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {SvgProps} from 'react-native-svg';
import CustomText from '../../common/CustomText';
import {Font} from '../../common/Theam';
import {SVG} from '../../common/SvgHelper';

export interface ServiceTileProps {
  icon: React.FC<SvgProps>;
  label: string;
  description?: string;
  onPress: () => void;
  /**
   * Kept for API stability — first color is used as a flat fill,
   * second color is ignored (we no longer render the gradient).
   */
  gradient: [string, string];
  accent: string;
  style?: ViewStyle;
}

/**
 * Dual-action tile used on the dashboard landing.
 * Flat coloured surface with a subtle press-scale animation.
 */
const ServiceTile: React.FC<ServiceTileProps> = ({
  icon: Icon,
  label,
  description,
  onPress,
  gradient,
  accent,
  style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const fillColor = gradient?.[0] ?? '#22272B';

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 7,
      tension: 80,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 70,
    }).start();
  };

  return (
    <Animated.View style={[styles.wrapper, {transform: [{scale}]}, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}>
        <View style={[styles.surface, {backgroundColor: fillColor}]}>
          <View style={styles.iconHalo}>
            <Icon width={44} height={44} />
          </View>
          <View style={styles.textBlock}>
            <CustomText style={styles.label}>{label}</CustomText>
            {description ? (
              <CustomText style={styles.description}>{description}</CustomText>
            ) : null}
          </View>
          <View style={[styles.chevronChip, {backgroundColor: accent}]}>
            <SVG.RightArrow width={14} height={14} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderRadius: 18,
    // Soft, subtle shadow — was much heavier before
    shadowColor: '#1B1F23',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pressable: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  surface: {
    height: 150,
    padding: 16,
    justifyContent: 'space-between',
    borderRadius: 18,
  },
  iconHalo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    marginTop: 8,
  },
  label: {
    color: '#FFFFFF',
    fontFamily: Font.textBolder,
    fontSize: 17,
  },
  description: {
    color: 'rgba(255,255,255,0.82)',
    fontFamily: Font.textNormal,
    fontSize: 12,
    marginTop: 2,
  },
  chevronChip: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ServiceTile;
