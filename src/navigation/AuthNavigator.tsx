import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation/AuthStackParamList';
import RegisterScreen from '../screens/register/RegisterScreen';
import { moderateScale } from 'react-native-size-matters';
import LoginScreen from '../screens/login/LoginScreen';
import { FONTS } from '../utils/typography';
import Colors from '../constants/Colors';
import { ROUTES } from './routes';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
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
