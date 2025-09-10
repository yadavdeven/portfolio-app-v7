import {createNativeStackNavigator} from '@react-navigation/native-stack';
import RegisterScreen from '../screens/register/RegisterScreen';
import LoginScreen from '../screens/login/LoginScreen';
import {ROUTES} from './routes';
import {AuthStackParamList} from '../types/navigation/AuthStackParamList';

export default function AuthNavigator() {
  const Stack = createNativeStackNavigator<AuthStackParamList>();

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
    </Stack.Navigator>
  );
}
