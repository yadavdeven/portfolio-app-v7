import React, { useState, useRef } from 'react';
import { StatusBar, Text } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LoginInput, { LoginInputRef } from '../../components/login/LoginInput';
import {
  navigateBack,
  resetNavigation,
} from '../../navigation/navigation-utils';
import SocialSignInIcons from '../../components/login/SocialSignInBtns';
import Container, { ToastRef } from '../../components/common/Container';
import ButtonStandard from '../../components/common/ButtonStandard';
import { setAppLoading } from '../../store/slices/appSlice';
import BottomText from '../../components/login/BottomText';
import { register } from '../../store/slices/authSlice';
import { delay } from '../../utils/helper-functions';
import { useAppDispatch } from '../../store/hooks';
import { ROUTES } from '../../navigation/routes';
import styles from './styles';

export default function RegisterScreen() {
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ✅ refs
  const nameRef = useRef<LoginInputRef>(null);
  const mobileRef = useRef<LoginInputRef>(null);
  const emailRef = useRef<LoginInputRef>(null);
  const passwordRef = useRef<LoginInputRef>(null);
  const confirmPasswordRef = useRef<LoginInputRef>(null);
  const containerRef = useRef<ToastRef>(null);

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
      password !== confirmPassword
    ) {
      return;
    }

    dispatch(setAppLoading(true));
    try {
      const response = await dispatch(
        register({ name, email, mobile, password }),
      ).unwrap();
      if (response.isSuccess) {
        containerRef.current?.showToast('Registration successful');
        await delay(2000);
        resetNavigation([{ name: ROUTES.APP_NAVIGATOR }]);
      } else {
        containerRef.current?.showToast(
          response.message ?? 'Registration failed',
          'error',
        );
      }
    } catch (error) {
      containerRef.current?.showToast(
        (error as Error)?.message ?? 'Something went wrong',
        'error',
      );
    } finally {
      dispatch(setAppLoading(false));
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <Container ref={containerRef} containerStyle={styles.contentContainer}>
        <LoginInput
          ref={nameRef}
          inputLabel="Name"
          value={name}
          onChange={setName}
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
          value={mobile}
          onChange={setMobile}
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
          value={email}
          onChange={setEmail}
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
          value={password}
          onChange={setPassword}
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
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm Password"
          secureTextEntry
          textContentType="oneTimeCode"
          autoComplete="off"
          validateFor="confirmPassword"
          compareWith={password}
          isRequired
          isLastField
          onSubmitEditing={handleRegistration}
        />
        <ButtonStandard btnLabel="Sign Up" onPress={handleRegistration} />
        <Text style={styles.orText}>OR</Text>
        <SocialSignInIcons />
      </Container>
      <BottomText
        link="Login"
        linkText="Already have an account?"
        onLinkPress={navigateBack}
      />
    </KeyboardAwareScrollView>
  );
}
