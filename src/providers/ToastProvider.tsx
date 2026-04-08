import React, { createContext, useContext, useState } from 'react';
import AppToast from '../components/common/AppToast';

type ToastType = 'success' | 'error' | 'default';

type ToastContextType = {
  showToast: (text: string, type?: ToastType, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<{
    text: string;
    type: ToastType;
    duration?: number;
  } | null>(null);

  const showToast = (
    text: string,
    type: ToastType = 'default',
    duration = 3000
  ) => {
    setToast({ text, type, duration });
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast rendered at root level, above navigation & modals */}
      {toast && (
        <AppToast
          text={toast.text}
          type={toast.type}
          duration={toast.duration}
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
