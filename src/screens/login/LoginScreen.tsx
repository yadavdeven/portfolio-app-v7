import React, { useState } from 'react';
import { StatusBar, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ForgotPasswordText from '../../components/login/ForgotPasswordText';
import SocialSignInIcons from '../../components/login/SocialSignInBtns';
import ButtonStandard from '../../components/common/ButtonStandard';
import LoginHeader from '../../components/login/LoginHeader';
import LoginInput from '../../components/login/LoginInput';
import { navigate } from '../../navigation/navigation-utils';
import BottomText from '../../components/login/BottomText';
import { dynamicHeight } from '../../utils/layout';
import { ROUTES } from '../../navigation/routes';
import Colors from '../../constants/Colors';
import styles from './styles';
import { useAppDispatch } from '../../store/hooks';
import { login } from '../../store/slices/authSlice';
import Container from '../../components/common/Container';
import { setAppLoading } from '../../store/slices/appSlice';

export default function LoginScreen() {
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Implement login logic here
    if (!email || !password) {
      return;
    }
    dispatch(setAppLoading(true));
    try {
      const response = await dispatch(login({ email, password })).unwrap();
      if (response.isSuccess) {
        console.log('Login successful:', response);
        // Navigate to the main app screen or perform other actions
      } else {
        console.log('Login failed:', response);
      }
    } catch (error) {
      console.log('Login error:', error);
    } finally {
      dispatch(setAppLoading(false));
    }
  };

  return (
    <Container>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.contentContainer}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
      >
        <LoginHeader />
        <View style={styles.inputsContainer}>
          <Text style={styles.loginText}>Please login to continue...</Text>
          <LoginInput
            inputLabel="Email"
            placeholder="Enter Email"
            value={email}
            onChange={setEmail}
            secureTextEntry={false}
          />
          <LoginInput
            inputLabel="Password"
            placeholder="Enter Password"
            value={password}
            onChange={setPassword}
            secureTextEntry
          />
        </View>
        <ForgotPasswordText onForgotPasswordPress={() => {}} />
        <ButtonStandard
          btnLabel="Login"
          marginTop={dynamicHeight(32)}
          onPress={handleLogin}
        />
        <Text style={styles.orText}>OR</Text>
        <SocialSignInIcons />
      </KeyboardAwareScrollView>
      <BottomText
        link="Register"
        linkText="Don't have an account?"
        onLinkPress={() => navigate(ROUTES.REGISTER)}
      />
    </Container>
  );
}
