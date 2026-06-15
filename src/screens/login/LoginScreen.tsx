import React, { useState, useRef, useEffect } from 'react';
import { Keyboard, Text, View } from 'react-native';
import {
  biometricLoginStart,
  biometricLoginVerify,
  googleAuth,
  login,
} from '../../store/slices/authSlice';
import { delay, getBiometricCredentials } from '../../utils/helper-functions';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import LoginInput, { LoginInputRef } from '../../components/login/LoginInput';
import { navigate, resetNavigation } from '../../navigation/navigation-utils';
import ForgotPasswordText from '../../components/login/ForgotPasswordText';
import SocialSignInIcons from '../../components/login/SocialSignInBtns';
import BlankScreenModal from '../../components/common/BlankScreenModal';
import ButtonStandard from '../../components/common/ButtonStandard';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginHeader from '../../components/login/LoginHeader';
import ReactNativeBiometrics from 'react-native-biometrics';
import { saveAuthCredentials } from '../../api/authStorage';
import BottomText from '../../components/login/BottomText';
import { moderateScale } from 'react-native-size-matters';
import { useToast } from '../../providers/ToastProvider';
import { useAppDispatch } from '../../store/hooks';
import { ROUTES } from '../../navigation/routes';
import styles from './styles';

const rnBiometrics = new ReactNativeBiometrics();

export default function LoginScreen() {
  const dispatch = useAppDispatch();

  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [biometricsLoading, setBiometricsLoading] = useState(false);
  const [email, setEmail] = useState('markchapman@gmail.com');
  const [password, setPassword] = useState('Password@123');

  // refs
  const emailRef = useRef<LoginInputRef>(null);
  const passwordRef = useRef<LoginInputRef>(null);

  useEffect(() => {
    const tryBiometricLogin = async () => {
      try {
        const stored = await getBiometricCredentials();

        // No biometric set up — bail before showing any overlay so the screen
        // doesn't flash a backdrop on every mount.
        if (!stored?.credentialId) return;

        // From here we're actually authenticating, so show the overlay.
        setBiometricsLoading(true);

        const startRes = await dispatch(
          biometricLoginStart({ email: stored.email }),
        ).unwrap();

        const { challenge } = startRes.responseData;

        const { signature } = await rnBiometrics.createSignature({
          promptMessage: 'Login with biometrics',
          payload: challenge,
        });

        // ❗ user cancelled
        if (!signature) return;

        const finishRes = await dispatch(
          biometricLoginVerify({
            email: stored.email,
            signature,
            credentialId: stored.credentialId,
          }),
        ).unwrap();

        const { id, token, refreshToken, guid } = finishRes.responseData;

        await saveAuthCredentials(id, token, refreshToken, guid, stored.email);

        resetNavigation([{ name: ROUTES.APP_NAVIGATOR }]);
      } catch (err) {
        console.log('Biometric login skipped or failed', err);
      } finally {
        setBiometricsLoading(false);
      }
    };

    tryBiometricLogin();
  }, [dispatch]);

  const handleLogin = async () => {
    Keyboard.dismiss();
    // trigger validation manually
    const emailValid = emailRef.current?.validate();
    const passwordValid = passwordRef.current?.validate();

    if (!emailValid || !passwordValid) return;

    setIsLoading(true);
    // Defer the toast until the loading modal has dismissed so they don't overlap.
    let pendingToast: { text: string; type?: 'error' } | null = null;
    let loggedIn = false;
    try {
      const response = await dispatch(
        login({ email, password, authProvider: 'email' }),
      ).unwrap();
      if (response.isSuccess) {
        loggedIn = true;
      } else {
        pendingToast = {
          text: response?.message ?? 'Login failed',
          type: 'error',
        };
      }
    } catch (error: any) {
      pendingToast = {
        text: error?.message ?? 'Something went wrong',
        type: 'error',
      };
    } finally {
      setIsLoading(false); // modal goes off
      // wait out the modal's dismiss animation before showing the toast
      await delay(320);
      if (pendingToast) showToast(pendingToast.text, pendingToast.type);
    }

    if (loggedIn) {
      // reset navigation so user cannot go back to login
      resetNavigation([{ name: ROUTES.APP_NAVIGATOR }]);
    }
  };

  const handleFirebaseTokenIdVerification = async (idToken: string) => {
    setIsLoading(true);
    // Defer the toast: decide what to show, then surface it only after the loading
    // modal has dismissed, so they never overlap on screen.
    let pendingToast: { text: string; type?: 'error' } | null = null;
    let authenticated = false;
    try {
      // STAGE 9 — send the Firebase ID token to OUR backend. It verifies the token
      // with Firebase Admin, finds/creates the user, and returns our own access +
      // refresh tokens (persisted to the keychain inside the thunk).
      const response = await dispatch(googleAuth({ idToken })).unwrap();
      if (response.isSuccess) {
        authenticated = true;
        pendingToast = { text: 'Google sign-in successful' };
      } else {
        pendingToast = {
          text: response.message ?? 'Google sign-in failed',
          type: 'error',
        };
      }
    } catch (error) {
      pendingToast = {
        text: (error as Error)?.message ?? 'Google sign-in verification failed',
        type: 'error',
      };
    } finally {
      setIsLoading(false); // modal goes off
      // wait out the modal's dismiss animation before showing the toast
      await delay(320);
      if (pendingToast) showToast(pendingToast.text, pendingToast.type);
    }

    if (authenticated) {
      // STAGE 10 — session established; reset nav so the user can't go back to login.
      resetNavigation([{ name: ROUTES.APP_NAVIGATOR }]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        bottomOffset={moderateScale(132)}
        contentContainerStyle={styles.contentContainer}
      >
        <BlankScreenModal showModal={isLoading || biometricsLoading} />
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
          isLoading={isLoading}
        />
        <Text style={styles.orText}>OR</Text>
        <SocialSignInIcons
          verifyFirebaseIdToken={handleFirebaseTokenIdVerification}
        />
      </KeyboardAwareScrollView>
      <BottomText
        link="Register"
        linkText="Don't have an account?"
        onLinkPress={() => navigate(ROUTES.REGISTER)}
      />
    </SafeAreaView>
  );
}
