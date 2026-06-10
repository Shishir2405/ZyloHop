import React, {useMemo} from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {BlurView} from 'expo-blur';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {SVG} from './SvgHelper';
import {Font} from './Theam';
import CustomText from './CustomText';

// Public API — DO NOT change names of existing props. New props must be optional.
interface FooterProps {
  isServices?: boolean;
  isAccount?: boolean;
  isHome?: boolean;
  isBooking?: boolean;
  isChat?: boolean;
}

type TabKey = 'home' | 'services' | 'booking' | 'account';

interface TabConfig {
  key: TabKey;
  label: string;
  Icon: React.FC<{width?: number; height?: number}>;
  ActiveIcon: React.FC<{width?: number; height?: number}>;
  route: string;
}

const TABS: TabConfig[] = [
  {
    key: 'home',
    label: 'Home',
    Icon: SVG.Home,
    ActiveIcon: SVG.SelectedHome,
    route: 'DashboardScreen',
  },
  {
    key: 'services',
    label: 'Services',
    Icon: SVG.Services,
    ActiveIcon: SVG.SelectedServices,
    route: 'DashboardScreen',
  },
  {
    key: 'booking',
    label: 'Bookings',
    Icon: SVG.Booking,
    ActiveIcon: SVG.SelectedBooking,
    route: 'BookingScreen',
  },
  {
    key: 'account',
    label: 'Account',
    Icon: SVG.Account,
    ActiveIcon: SVG.SelectedAccount,
    route: 'AccountHomeScreen',
  },
];

const ACCENT = '#EDAE10';
const INACTIVE = '#7A8A99';
const ACTIVE_TEXT = '#1B1F23';

const Footer: React.FC<FooterProps> = ({
  isServices,
  isAccount,
  isHome,
  isBooking,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const activeKey: TabKey = useMemo(() => {
    if (isAccount) return 'account';
    if (isBooking) return 'booking';
    if (isServices) return 'services';
    return isHome ? 'home' : 'home';
  }, [isAccount, isBooking, isServices, isHome]);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.outer, {paddingBottom: Math.max(insets.bottom, 10)}]}>
      <View style={styles.shadowWrap}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 25 : 25}
          tint="light"
          style={styles.bar}>
          <View style={styles.glassOverlay} />
          {TABS.map(tab => {
            const isActive = tab.key === activeKey;
            const IconComp = isActive ? tab.ActiveIcon : tab.Icon;
            return (
              <Pressable
                key={tab.key}
                onPress={() => {
                  // Preserve original navigation behavior
                  navigation.navigate(tab.route as never);
                }}
                style={styles.tab}>
                <View
                  style={[
                    styles.iconChip,
                    isActive && styles.iconChipActive,
                  ]}>
                  <IconComp width={20} height={20} />
                </View>
                <CustomText
                  style={[
                    styles.label,
                    {color: isActive ? ACTIVE_TEXT : INACTIVE},
                    isActive && styles.labelActive,
                  ]}>
                  {tab.label}
                </CustomText>
                {isActive ? <View style={styles.activeDot} /> : null}
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  shadowWrap: {
    borderRadius: 24,
    // Softer floating pill drop shadow
    shadowColor: '#1B1F23',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    backgroundColor:
      // On Android BlurView fallback is transparent; provide a near-white base
      Platform.OS === 'ios' ? 'transparent' : 'rgba(255,255,255,0.92)',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 24,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconChip: {
    width: 36,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  iconChipActive: {
    backgroundColor: 'rgba(237,174,16,0.10)',
  },
  label: {
    fontSize: 11,
    fontFamily: Font.textNormal,
  },
  labelActive: {
    fontFamily: Font.textSemiBolder,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
    backgroundColor: ACCENT,
  },
});

export default Footer;
