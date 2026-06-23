import React, { createContext, useContext, useState } from 'react';
import AppToast from '../components/common/AppToast';

type ToastType = 'info' | 'error' | 'default';

type ToastContextType = {
  showToast: (
    text: string,
    type?: ToastType,
    duration?: number,
    light?: boolean
  ) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<{
    text: string;
    type: ToastType;
    duration?: number;
    light?: boolean;
  } | null>(null);

  const showToast = (
    text: string,
    type: ToastType = 'default',
    duration = 3000,
    light = false
  ) => {
    setToast({ text, type, duration, light });
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Toast rendered at root level, above navigation & modals */}
      {toast && (
        <AppToast
          text={toast.text}
          type={toast.type}
          duration={toast.duration}
          light={toast.light}
          onHide={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};
