import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import CustomText from '../../common/CustomText';
import {SVG} from '../../common/SvgHelper';
import {Font} from '../../common/Theam';

interface HeroGreetingProps {
  firstName?: string;
  locationLabel?: string;
  onPressLocation?: () => void;
}

const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const HeroGreeting: React.FC<HeroGreetingProps> = ({
  firstName,
  locationLabel,
  onPressLocation,
}) => {
  const greeting = getTimeGreeting();
  const name = firstName ? firstName.trim() : '';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.textBlock}>
          <CustomText style={styles.greeting}>{greeting}</CustomText>
          <CustomText style={styles.name} numberOfLines={1}>
            {name ? `${name} 👋` : 'Welcome 👋'}
          </CustomText>
        </View>
      </View>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPressLocation}
        style={styles.locationPill}>
        <View style={styles.locationIcon}>
          <SVG.MarkerDark width={14} height={14} />
        </View>
        <View style={{flex: 1}}>
          <CustomText style={styles.locationLabel}>
            Delivering to
          </CustomText>
          <CustomText style={styles.locationValue} numberOfLines={1}>
            {locationLabel || 'Set your location'}
          </CustomText>
        </View>
        <View style={styles.editChip}>
          <SVG.Edit width={12} height={12} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textBlock: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: '#7A8A99',
    fontFamily: Font.textNormal,
  },
  name: {
    fontSize: 22,
    color: '#1B1F23',
    fontFamily: Font.textBolder,
    marginTop: 2,
  },
  locationPill: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F7F9',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  locationIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  locationLabel: {
    fontSize: 10,
    color: '#7A8A99',
    fontFamily: Font.textNormal,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  locationValue: {
    fontSize: 13,
    color: '#1B1F23',
    fontFamily: Font.textSemiBolder,
    marginTop: 1,
  },
  editChip: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default HeroGreeting;
