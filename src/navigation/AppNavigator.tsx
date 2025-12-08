import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation/AppStackParamList';
import ScrollAnimationScreen from '../screens/animations/ScrollAnimation/ScrollAnimationScreen';
import CardsRotateScreen from '../screens/animations/CardsRotate/CardsRotateScreen';
import HomeScreen from '../screens/home/HomeScreen';
import { ROUTES } from './routes';
// import FileSaveAndDownloadScreen from '../screens/files-features/FileSaveAndDownload/FileSaveAndDownloadScreen';

export default function AppNavigator() {
  const Stack = createNativeStackNavigator<AppStackParamList>();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
      <Stack.Screen name={ROUTES.CARDS_ROTATE} component={CardsRotateScreen} />
      <Stack.Screen
        name={ROUTES.SCROLL_ANIMATION}
        component={ScrollAnimationScreen}
      />
      {/* <Stack.Screen
        name={ROUTES.File_SAVE_AND_DOWNLOAD}
        component={FileSaveAndDownloadScreen}
      /> */}
    </Stack.Navigator>
  );
}
