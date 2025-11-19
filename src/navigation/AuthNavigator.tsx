import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from '../screens/register/RegisterScreen';
import LoginScreen from '../screens/login/LoginScreen';
import { ROUTES } from './routes';
import { AuthStackParamList } from '../types/navigation/AuthStackParamList';
import { FONTS } from '../utils/typography';
import Colors from '../constants/Colors';
import { moderateScale } from 'react-native-size-matters';

export default function AuthNavigator() {
  const Stack = createNativeStackNavigator<AuthStackParamList>();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={ROUTES.LOGIN}
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.REGISTER}
        component={RegisterScreen}
        options={{
          title: 'Sign Up',
          headerTintColor: Colors.primary,
          headerTitleAlign: 'center',
          headerBackTitle: '',
          headerBackButtonDisplayMode: 'minimal',
          headerTitleStyle: {
            fontSize: moderateScale(18),
            fontFamily: FONTS.lato_bold,
          },
        }}
      />
    </Stack.Navigator>
  );
}
