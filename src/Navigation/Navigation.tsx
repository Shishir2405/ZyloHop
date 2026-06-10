import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {StatusBar, View} from 'react-native';

import AuthNavigator from '../screens/auth';
import {SafeAreaView} from 'react-native-safe-area-context';

type StackParamList = {
  AuthNavigator: undefined;
};

const Stack = createNativeStackNavigator<StackParamList>();

export default function Navigation(): React.ReactElement {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator
        screenOptions={{headerShown: false, gestureEnabled: false}}>
        <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
      </Stack.Navigator>
    </SafeAreaView>
  );
}
