import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import WrapperScreen from '../../common/WrapperScreen';
import {Font} from '../../common/Theam';
import LocationEnableModal from '../../common/LocationEnableModal';
import CustomText from '../../common/CustomText';
import Heading from '../../common/Heading';
import {SVG} from '../../common/SvgHelper';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '.';
import {useNavigation} from '@react-navigation/native';

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'LocationPermissionScreen'
>;

const LocationPermissionScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const primaryScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 360,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [fadeIn]);

  return (
    <WrapperScreen>
      <View style={styles.root}>
        <Animated.View style={[styles.heroBlock, {opacity: fadeIn}]}>
          <View style={styles.illustrationWrap}>
            <View style={styles.illustrationCircle}>
              <Image
                source={require('../../assets/image/other/Map.png')}
                style={styles.mapImage}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.copyBlock}>
            <Heading style={styles.heading}>
              Enable your{'\n'}location
            </Heading>
            <CustomText style={styles.subcopy}>
              We use your location to find rides and restaurants near you —
              faster pickups, better suggestions.
            </CustomText>
          </View>
        </Animated.View>

        <Animated.View style={[styles.actions, {opacity: fadeIn}]}>
          <Animated.View style={{transform: [{scale: primaryScale}]}}>
            <Pressable
              onPress={() => setIsModalVisible(true)}
              onPressIn={() =>
                Animated.spring(primaryScale, {
                  toValue: 0.97,
                  useNativeDriver: true,
                  friction: 7,
                }).start()
              }
              onPressOut={() =>
                Animated.spring(primaryScale, {
                  toValue: 1,
                  useNativeDriver: true,
                  friction: 6,
                }).start()
              }
              style={styles.primaryBtn}>
              <SVG.LocationPointerIcon width={18} height={18} />
              <CustomText style={styles.primaryLabel}>
                Enable Location
              </CustomText>
            </Pressable>
          </Animated.View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SignUpScreen')}
            style={styles.skipBtn}>
            <CustomText style={styles.skipLabel}>Skip for now</CustomText>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <LocationEnableModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
      />
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroBlock: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  illustrationCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#F6F7F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImage: {
    width: 200,
    height: 200,
  },
  copyBlock: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  heading: {
    fontSize: 26,
    textAlign: 'center',
    color: '#1B1F23',
    lineHeight: 32,
  },
  subcopy: {
    fontSize: 14,
    color: '#5A6470',
    fontFamily: Font.textNormal,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 12,
    maxWidth: 320,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  primaryBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#EDAE10',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#B6850A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontFamily: Font.textBolder,
    fontSize: 16,
    marginLeft: 10,
  },
  skipBtn: {
    marginTop: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipLabel: {
    fontSize: 14,
    color: '#7A8A99',
    fontFamily: Font.textSemiBolder,
  },
});

export default LocationPermissionScreen;
