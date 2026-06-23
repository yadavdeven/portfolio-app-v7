import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerContent from '../components/drawer/DrawerContent';
import AppNavigator from './AppNavigator';
import Colors from '../constants/Colors';
import { ROUTES } from './routes';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '75%',
          backgroundColor: Colors.offWhite_100,
        },
      }}
      drawerContent={props => <DrawerContent {...props} />}
    >
      <Drawer.Screen name={ROUTES.APP_STACK} component={AppNavigator} />
    </Drawer.Navigator>
  );
}
