import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import {ROUTES} from './routes';
import {AppStackParamList} from '../types/navigation/AppStackParamList';

export default function AppNavigator() {
  const Stack = createNativeStackNavigator<AppStackParamList>();

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
    </Stack.Navigator>
  );
}
