import React from 'react';
import { ToastProvider } from './ToastProvider';

type Props = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: Props) => {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
};
