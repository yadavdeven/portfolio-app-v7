import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation/AppStackParamList';
import FileSaveAndDownloadScreen from '../screens/files-features/FileSaveAndDownload/FileSaveAndDownloadScreen';
import WelcomeAlertScreen from '../screens/native-modules/toast-alert/ToastAndAlertNativeModuleScreen';
import FirebaseStorageScreen from '../screens/files-features/FirebaseStorage/FirebaseStorageScreen';
import ScrollAnimationScreen from '../screens/animations/ScrollAnimation/ScrollAnimationScreen';
import CheckboxAnimationScreen from '../screens/animations/Checkbox/CheckboxAnimationScreen';
import SelectDropdowns from '../screens/ui-components/SelectDropdowns/SelectDropdowns';
import DeviceInfoScreen from '../screens/native-modules/device-info/DeviceInfoScreen';
import CardsRotateScreen from '../screens/animations/CardsRotate/CardsRotateScreen';
import TextEditorScreen from '../screens/features/text-editor/TextEditorScreen';
import SSLPinningScreen from '../screens/features/ssl-pinning/SSLPinningScreen';
import BiometricScreen from '../screens/features/biometrics/BiometricScreen';
import HomeScreen from '../screens/home/HomeScreen';
import { ROUTES } from './routes';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
      <Stack.Screen name={ROUTES.CARDS_ROTATE} component={CardsRotateScreen} />
      <Stack.Screen
        name={ROUTES.SCROLL_ANIMATION}
        component={ScrollAnimationScreen}
      />
      <Stack.Screen
        name={ROUTES.FILE_SAVE_AND_DOWNLOAD}
        component={FileSaveAndDownloadScreen}
      />
      <Stack.Screen
        name={ROUTES.WELCOME_ALERT}
        component={WelcomeAlertScreen}
      />
      <Stack.Screen name={ROUTES.BIOMETRICS} component={BiometricScreen} />
      <Stack.Screen name={ROUTES.TEXT_EDITOR} component={TextEditorScreen} />
      <Stack.Screen
        name={ROUTES.CHECKBOX_ANIMATION}
        component={CheckboxAnimationScreen}
      />
      <Stack.Screen
        name={ROUTES.SELECT_DROPDOWNS}
        component={SelectDropdowns}
      />
      <Stack.Screen name={ROUTES.SSL_PINNING} component={SSLPinningScreen} />
      <Stack.Screen name={ROUTES.DEVICE_INFO} component={DeviceInfoScreen} />
      <Stack.Screen
        name={ROUTES.FIREBASE_STORAGE}
        component={FirebaseStorageScreen}
      />
    </Stack.Navigator>
  );
}
