import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StackNavigationProp} from '@react-navigation/stack';
import {SVG} from '../../common/SvgHelper';
import CustomText from '../../common/CustomText';
import {Font} from '../../common/Theam';
import type {AuthStackParamList} from '.';

type WelcomeProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'WelcomeScreen'>;
};

interface NeoButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

const NeoButton: React.FC<NeoButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isPrimary = variant === 'primary';

  return (
    <Animated.View style={{transform: [{scale}], width: '100%'}}>
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.97,
            useNativeDriver: true,
            friction: 7,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 6,
          }).start()
        }
        style={[styles.neoButton, isPrimary ? styles.primaryBtn : styles.secondaryBtn]}>
        <CustomText
          style={[
            styles.btnLabel,
            isPrimary ? styles.primaryLabel : styles.secondaryLabel,
          ]}>
          {label}
        </CustomText>
      </Pressable>
    </Animated.View>
  );
};

const Welcome: React.FC<WelcomeProps> = ({navigation}) => {
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 360,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [fadeIn]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Animated.View style={[styles.hero, {opacity: fadeIn}]}>
          <View style={styles.logoWrap}>
            <SVG.Logo />
          </View>
          <View style={styles.welcomeTextWrap}>
            <SVG.WelcomeText />
          </View>
          <CustomText style={styles.tagline}>
            Rides and meals — all in one place.
          </CustomText>
        </Animated.View>

        <Animated.View style={[styles.actions, {opacity: fadeIn}]}>
          <NeoButton
            label="Create an account"
            onPress={() => navigation.navigate('LocationPermissionScreen')}
          />
          <View style={styles.spacer} />
          <NeoButton
            label="Sign In"
            variant="secondary"
            onPress={() => navigation.navigate('SignInScreen')}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.terms}
            onPress={() => navigation.navigate('TermsConditionsScreen')}>
            <CustomText style={styles.termsText}>
              By continuing you agree to our{' '}
              <CustomText style={styles.termsLink}>Terms</CustomText> &{' '}
              <CustomText style={styles.termsLink}>Privacy Policy</CustomText>
            </CustomText>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safe: {
    flex: 1,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoWrap: {
    marginBottom: 8,
  },
  welcomeTextWrap: {
    marginTop: 20,
  },
  tagline: {
    fontSize: 14,
    color: '#5A6470',
    fontFamily: Font.textNormal,
    textAlign: 'center',
    marginTop: 18,
    maxWidth: 260,
  },
  actions: {
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  spacer: {
    height: 14,
  },
  neoButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: '#EDAE10',
    // Soft, subtle lift
    shadowColor: '#B6850A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  secondaryBtn: {
    backgroundColor: '#F6F7F9',
    borderWidth: 1,
    borderColor: 'rgba(237,174,16,0.35)',
  },
  btnLabel: {
    fontSize: 16,
    fontFamily: Font.textBolder,
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
  secondaryLabel: {
    color: '#EDAE10',
  },
  terms: {
    marginTop: 18,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  termsText: {
    fontSize: 11,
    color: '#7A8A99',
    fontFamily: Font.textNormal,
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLink: {
    color: '#EDAE10',
    fontFamily: Font.textSemiBolder,
  },
});

export default Welcome;
