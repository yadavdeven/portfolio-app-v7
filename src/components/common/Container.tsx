import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppSelector } from '../../store/hooks';
import BlankScreenModal from './BlankScreenModal';
import Colors from '../../constants/Colors';
import AppToast from './AppToast';

type ToastType = 'success' | 'error' | 'default';

export type ToastRef = {
  showToast: (text: string, type?: ToastType, duration?: number) => void;
};

interface ContainerProps {
  children: React.ReactNode;
  containerStyle?: object;
}

const Container = forwardRef<ToastRef, ContainerProps>(
  ({ children, containerStyle }, ref) => {
    const { isAppLoading } = useAppSelector(state => state.app);

    const [toast, setToast] = useState<{
      text: string;
      type: ToastType;
      duration?: number;
    } | null>(null);

    useImperativeHandle(ref, () => ({
      showToast: (text, type = 'default', duration = 3000) => {
        setToast({ text, type, duration });
      },
    }));

    return (
      <View style={[styles.container, containerStyle]}>
        <BlankScreenModal showModal={isAppLoading} />
        {children}
        {toast && (
          <AppToast
            text={toast.text}
            type={toast.type}
            duration={toast.duration}
            onHide={() => setToast(null)}
          />
        )}
      </View>
    );
  },
);

export default Container;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg_700,
  },
});
