import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';

import FoodNavigator from './foodFlow';
import RiderNavigator from './riderFlow';

export default function TabNavigator() {
  // const UserRole = useSelector(state => state.userDetails.role);
  const UserRole = 'Rider';
  const TabStack = createNativeStackNavigator();
  return (
    <TabStack.Navigator
      screenOptions={{headerShown: false, gestureEnabled: false}}>
      {UserRole == 'Food' ? (
        <TabStack.Screen name="FoodNavigator" component={FoodNavigator} />
      ) : (
        <TabStack.Screen name="RiderNavigator" component={RiderNavigator} />
      )}
    </TabStack.Navigator>
  );
}
