import React, { useState, useRef } from 'react';
import { StatusBar, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LoginInput, { LoginInputRef } from '../../components/login/LoginInput';
import { navigate, resetNavigation } from '../../navigation/navigation-utils';
import ForgotPasswordText from '../../components/login/ForgotPasswordText';
import SocialSignInIcons from '../../components/login/SocialSignInBtns';
import Container, { ToastRef } from '../../components/common/Container';
import ButtonStandard from '../../components/common/ButtonStandard';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginHeader from '../../components/login/LoginHeader';
import { setAppLoading } from '../../store/slices/appSlice';
import BottomText from '../../components/login/BottomText';
import { moderateScale } from 'react-native-size-matters';
import { login } from '../../store/slices/authSlice';
import { useAppDispatch } from '../../store/hooks';
import { ROUTES } from '../../navigation/routes';
import Colors from '../../constants/Colors';
import styles from './styles';

export default function LoginScreen() {
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ✅ refs
  const emailRef = useRef<LoginInputRef>(null);
  const passwordRef = useRef<LoginInputRef>(null);
  const containerRef = useRef<ToastRef>(null);

  const handleLogin = async () => {
    // trigger validation manually
    const emailValid = emailRef.current?.validate();
    const passwordValid = passwordRef.current?.validate();

    if (!emailValid || !passwordValid) return;

    dispatch(setAppLoading(true));
    try {
      const response = await dispatch(login({ email, password })).unwrap();
      if (response.isSuccess) {
        containerRef.current?.showToast('Login successful', 'success');

        // reset navigation so user cannot go back to login
        resetNavigation([{ name: ROUTES.APP_NAVIGATOR }]);
      } else {
        containerRef.current?.showToast(
          response.message ?? 'Login failed',
          'error',
        );
      }
    } catch (error) {
      console.log('login error', error);

      containerRef.current?.showToast(
        (error as Error)?.message ?? 'Something went wrong',
        'error',
      );
    } finally {
      dispatch(setAppLoading(false));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.bg_800} barStyle="dark-content" />
      {/* <BlankScreenModal showModal={isAppLoading} /> */}
      <KeyboardAwareScrollView
        contentContainerStyle={styles.contentContainer}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
      >
        <Container ref={containerRef} containerStyle={styles.container}>
          <LoginHeader />
          <View style={styles.inputsContainer}>
            <Text style={styles.loginText}>Please login to continue...</Text>

            <LoginInput
              ref={emailRef}
              inputLabel="Email"
              placeholder="Enter Email"
              value={email}
              onChange={setEmail}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              validateFor="email"
              isRequired
              marginBottom={moderateScale(12)}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <LoginInput
              ref={passwordRef}
              inputLabel="Password"
              placeholder="Enter Password"
              value={password}
              onChange={setPassword}
              secureTextEntry
              validateFor="password"
              isRequired
              isLastField
              marginBottom={moderateScale(0)}
              onSubmitEditing={handleLogin}
            />
          </View>
          <ForgotPasswordText onForgotPasswordPress={() => {}} />
          <ButtonStandard
            btnLabel="Login"
            marginTop={moderateScale(36)}
            onPress={handleLogin}
          />
          <Text style={styles.orText}>OR</Text>
          <SocialSignInIcons />
        </Container>
        <View style={styles.bottomTextContainer}>
          <BottomText
            link="Register"
            linkText="Don't have an account?"
            onLinkPress={() => navigate(ROUTES.REGISTER)}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
