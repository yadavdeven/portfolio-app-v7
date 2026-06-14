import React, { useEffect } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from './ToastProvider';
import { applyPinningFromPreference } from '../utils/ssl-pinning';

type Props = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: Props) => {
  // Pinning is GLOBAL (affects every request app-wide). Apply the persisted
  // demo preference at startup — before any request — so the native HTTP client
  // is built with the right config. Toggling on the SSL screen + a relaunch
  // makes the change deterministic. (In production you'd just enablePinning.)
  useEffect(() => {
    applyPinningFromPreference();
  }, []);

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <ToastProvider>{children}</ToastProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
};
