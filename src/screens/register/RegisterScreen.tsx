import React, { useState, useRef } from 'react';
import { Text, View } from 'react-native';
import {
  navigateBack,
  resetNavigation,
} from '../../navigation/navigation-utils';
import LoginInput, { LoginInputRef } from '../../components/login/LoginInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import SocialSignInIcons from '../../components/login/SocialSignInBtns';
import BlankScreenModal from '../../components/common/BlankScreenModal';
import ButtonStandard from '../../components/common/ButtonStandard';
import { googleAuth, register } from '../../store/slices/authSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SUCCESS_MESSAGES } from '../../constants/messages';
import BottomText from '../../components/login/BottomText';
import { moderateScale } from 'react-native-size-matters';
import { useToast } from '../../providers/ToastProvider';
import { delay } from '../../utils/helper-functions';
import { useAppDispatch } from '../../store/hooks';
import { ROUTES } from '../../navigation/routes';
import styles from './styles';

export default function RegisterScreen() {
  const dispatch = useAppDispatch();

  //  refs
  const nameRef = useRef<LoginInputRef>(null);
  const mobileRef = useRef<LoginInputRef>(null);
  const emailRef = useRef<LoginInputRef>(null);
  const passwordRef = useRef<LoginInputRef>(null);
  const confirmPasswordRef = useRef<LoginInputRef>(null);

  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  // form state
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (field: keyof typeof form) => (value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleRegistration = async () => {
    // trigger validation manually
    const nameValid = nameRef.current?.validate();
    const mobileValid = mobileRef.current?.validate();
    const emailValid = emailRef.current?.validate();
    const passwordValid = passwordRef.current?.validate();
    const confirmPasswordValid = confirmPasswordRef.current?.validate();

    if (
      !nameValid ||
      !mobileValid ||
      !emailValid ||
      !passwordValid ||
      !confirmPasswordValid ||
      form.password !== form.confirmPassword
    ) {
      return;
    }
    setIsLoading(true);
    // Defer the toast: collect what to show, then surface it only after the
    // loading modal has gone off, so they never overlap on screen.
    let pendingToast: { text: string; type?: 'error' } | null = null;
    let registered = false;
    try {
      const response = await dispatch(
        register({
          name: form.name,
          email: form.email,
          mobile: form.mobile,
          password: form.password,
        }),
      ).unwrap();
      console.log('register response', response);
      if (response.isSuccess) {
        registered = true;
        pendingToast = { text: SUCCESS_MESSAGES.REGISTRATION_SUCCESS };
      } else {
        pendingToast = {
          text: response.message ?? 'Registration failed',
          type: 'error',
        };
      }
    } catch (error) {
      pendingToast = {
        text: (error as Error)?.message ?? 'Something went wrong',
        type: 'error',
      };
    } finally {
      setIsLoading(false); // modal goes off
      // wait out the modal's dismiss animation before showing the toast
      await delay(320);
      if (pendingToast) showToast(pendingToast.text, pendingToast.type);
    }

    if (registered) {
      delay(2000); // let the user read the toast before navigating away
      resetNavigation([{ name: ROUTES.APP_NAVIGATOR }]);
    }
  };

  // Google sign-up. SocialSignInIcons runs the Firebase sign-in and hands us a
  // Firebase ID token; we forward it to our backend (POST /auth/google), which
  // verifies the token and creates-or-logs-in the user, returning our own JWT +
  // credentials. Mirrors handleRegistration's loading + deferred-toast pattern.
  const handleGoogleAuth = async (idToken: string) => {
    console.log('[GoogleAuth] 9 ▶ dispatching googleAuth thunk to backend');
    setIsLoading(true);
    let pendingToast: { text: string; type?: 'error' } | null = null;
    let authenticated = false;
    try {
      const response = await dispatch(googleAuth({ idToken })).unwrap();
      console.log('[GoogleAuth] 10 ✔ backend response:', response);
      if (response.isSuccess) {
        authenticated = true;
        pendingToast = { text: SUCCESS_MESSAGES.REGISTRATION_SUCCESS };
      } else {
        pendingToast = {
          text: response.message ?? 'Google sign-in failed',
          type: 'error',
        };
      }
    } catch (error) {
      console.log('[GoogleAuth] ✖ googleAuth thunk error:', error);
      pendingToast = {
        text: (error as Error)?.message ?? 'Google sign-in failed',
        type: 'error',
      };
    } finally {
      setIsLoading(false); // modal goes off
      // wait out the modal's dismiss animation before showing the toast
      await delay(320);
      if (pendingToast) showToast(pendingToast.text, pendingToast.type);
    }

    if (authenticated) {
      delay(2000); // let the user read the toast before navigating away
      resetNavigation([{ name: ROUTES.APP_NAVIGATOR }]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <BlankScreenModal showModal={isLoading} />
      <KeyboardAwareScrollView bottomOffset={moderateScale(32)}>
        <View style={styles.contentContainer}>
          <LoginInput
            ref={nameRef}
            inputLabel="Name"
            value={form.name}
            onChange={handleChange('name')}
            placeholder="Enter Full Name"
            textContentType="name"
            autoComplete="name"
            validateFor="required"
            isRequired
            onSubmitEditing={() => mobileRef.current?.focus()}
            marginBottom={10}
          />
          <LoginInput
            ref={mobileRef}
            inputLabel="Mobile No."
            value={form.mobile}
            onChange={handleChange('mobile')}
            placeholder="Enter Mobile No."
            marginBottom={10}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            validateFor="mobile"
            isRequired
            onSubmitEditing={() => emailRef.current?.focus()}
          />
          <LoginInput
            ref={emailRef}
            inputLabel="Email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="Enter Email"
            marginBottom={10}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            validateFor="email"
            isRequired
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <LoginInput
            ref={passwordRef}
            marginBottom={10}
            inputLabel="Password"
            value={form.password}
            onChange={handleChange('password')}
            placeholder="Enter Password"
            secureTextEntry
            textContentType="oneTimeCode"
            autoComplete="off"
            validateFor="password"
            isRequired
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />
          <LoginInput
            ref={confirmPasswordRef}
            inputLabel="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            placeholder="Confirm Password"
            secureTextEntry
            textContentType="oneTimeCode"
            autoComplete="off"
            validateFor="confirmPassword"
            compareWith={form.password}
            isRequired
            isLastField
            onSubmitEditing={handleRegistration}
          />
          <ButtonStandard
            btnLabel="Sign Up"
            onPress={handleRegistration}
            isLoading={isLoading}
            marginTop={moderateScale(8)}
          />
          <Text style={styles.orText}>OR</Text>
          <SocialSignInIcons verifyFirebaseIdToken={handleGoogleAuth} />
        </View>
      </KeyboardAwareScrollView>
      <BottomText
        link="Login"
        linkText="Already have an account?"
        onLinkPress={navigateBack}
      />
    </SafeAreaView>
  );
}
