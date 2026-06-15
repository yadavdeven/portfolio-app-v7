import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation/RootStackParamList';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from '../screens/splash/SplashScreen';
import { navigationRef } from './navigation-utils';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { ROUTES } from './routes';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={ROUTES.SPLASH} component={SplashScreen} />
        <Stack.Screen name={ROUTES.APP_NAVIGATOR} component={AppNavigator} />
        <Stack.Screen name={ROUTES.AUTH_NAVIGATOR} component={AuthNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
