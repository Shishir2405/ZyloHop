import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import {SVG} from '../../common/SvgHelper';
import {StackNavigationProp} from '@react-navigation/stack';
import {hydrateAuthToken} from '../../services/tokenStorage';

type SplashProps = {
  navigation: StackNavigationProp<any, 'Splash'>;
};

const MIN_SPLASH_MS = 1000;

const Splash: React.FC<SplashProps> = ({navigation}) => {
  // Brief logo fade-in only — no halo pulse, no looping animations.
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [logoOpacity]);

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();

    const decideRoute = async () => {
      const token = await hydrateAuthToken();
      const elapsed = Date.now() - start;
      const wait = Math.max(0, MIN_SPLASH_MS - elapsed);

      setTimeout(() => {
        if (cancelled) return;
        navigation.reset({
          index: 0,
          routes: [{name: token ? 'DashboardScreen' : 'WelcomeScreen'}],
        });
      }, wait);
    };

    decideRoute();

    return () => {
      cancelled = true;
    };
  }, [navigation]);

  return (
    <View style={styles.background}>
      <Animated.View style={{opacity: logoOpacity}}>
        <SVG.SplashLogo height={100} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Splash;
