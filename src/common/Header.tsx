import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Font } from './Theam';
import { SVG } from './SvgHelper';

interface HeaderProps {
  title?: string; // Center text
  leftText?: string;
  rightIcon?: React.ReactNode;
  rightWidget?: React.ReactNode;

  onLeftPress?: () => void;
  onRightPress?: () => void;

  showBack?: boolean;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
}

const Header: React.FC<HeaderProps> = ({
  title,
  leftText,
  rightIcon,
  rightWidget,
  onLeftPress,
  onRightPress,
  showBack,
  containerStyle,
  titleStyle,
}) => {
  const navigation = useNavigation();

  return (
    <View style={[styles.container, containerStyle]}>
      {/* LEFT AREA */}
      <View style={styles.sideContainer}>
        {showBack ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TouchableOpacity
              onPress={onLeftPress || navigation.goBack}
              style={styles.touchArea}
            >
              <SVG.Back />
            </TouchableOpacity>
            <TouchableOpacity onPress={onLeftPress} style={styles.touchArea}>
              <Text style={styles.leftText}>{leftText}</Text>
            </TouchableOpacity>
          </View>
        ) : leftText ? (
          <TouchableOpacity onPress={onLeftPress} style={styles.touchArea}>
            <Text style={styles.leftText}>{leftText}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* CENTER TITLE */}
      <View style={styles.centerContainer}>
        {title ? (
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>

      {/* RIGHT AREA */}
      <View style={styles.sideContainer}>
        {rightIcon ? (
          <TouchableOpacity onPress={onRightPress} style={styles.touchArea}>
            {rightIcon}
          </TouchableOpacity>
        ) : rightWidget ? (
          rightWidget
        ) : null}
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
    paddingHorizontal: 15,
  },

  sideContainer: {
    width: 60, // fixed width so center stays centered
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },

  touchArea: {
    padding: 5,
  },

  title: {
    fontSize: 18,
    fontFamily: Font.textSemiBolder,
    color: 'black',
  },

  leftText: {
    fontSize: 16,
    fontFamily: Font.textNormal,
    color: 'black',
  },
});
