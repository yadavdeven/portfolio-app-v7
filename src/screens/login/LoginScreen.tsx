import React, { useState, useRef } from 'react';
import { StatusBar, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LoginInput, { LoginInputRef } from '../../components/login/LoginInput';
import { navigate, resetNavigation } from '../../navigation/navigation-utils';
import ForgotPasswordText from '../../components/login/ForgotPasswordText';
import SocialSignInIcons from '../../components/login/SocialSignInBtns';
import Container, { ToastRef } from '../../components/common/Container';
import ButtonStandard from '../../components/common/ButtonStandard';
import { googleAuth, login } from '../../store/slices/authSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginHeader from '../../components/login/LoginHeader';
import { setAppLoading } from '../../store/slices/appSlice';
import BottomText from '../../components/login/BottomText';
import { moderateScale } from 'react-native-size-matters';
import { useToast } from '../../providers/ToastProvider';
import { delay } from '../../utils/helperFunctions';
import { useAppDispatch } from '../../store/hooks';
import { ROUTES } from '../../navigation/routes';
import Colors from '../../constants/Colors';
import styles from './styles';

export default function LoginScreen() {
  const dispatch = useAppDispatch();

  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('markchapman@gmail.com');
  const [password, setPassword] = useState('Password@123');

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
    setIsLoading(true);
    try {
      delay(2000);
      const response = await dispatch(
        login({ email, password, authProvider: 'email' }),
      ).unwrap();
      if (response.isSuccess) {
        // reset navigation so user cannot go back to login
        resetNavigation([{ name: ROUTES.APP_NAVIGATOR }]);
      } else showToast(response.message ?? 'Login failed', 'error');
    } catch (error) {
      console.log('login error', error);
      showToast((error as Error)?.message ?? 'Something went wrong', 'error');
    } finally {
      dispatch(setAppLoading(false));
      setIsLoading(false);
    }
  };

  const handleFirebaseTokenIdVerification = async (idToken: string) => {
    dispatch(setAppLoading(true));
    try {
      const response = await dispatch(googleAuth({ idToken })).unwrap();
      if (response.isSuccess) {
        showToast('Google sign-in successful', 'success');
        delay(1200);
        // reset navigation so user cannot go back to login
        resetNavigation([{ name: ROUTES.APP_NAVIGATOR }]);
      } else {
        showToast(response.message ?? 'Google sign-in failed', 'error');
      }
    } catch (error) {
      console.log('Google token verification error: ', error);
      showToast(
        (error as Error)?.message ?? 'Google sign-in verification failed',
        'error',
      );
    } finally {
      dispatch(setAppLoading(false));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.bg_800} barStyle="dark-content" />
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
              // secureTextEntry
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
            isLoading={isLoading}
          />
          <Text style={styles.orText}>OR</Text>
          <SocialSignInIcons
            verifyFirebaseIdToken={handleFirebaseTokenIdVerification}
          />
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
