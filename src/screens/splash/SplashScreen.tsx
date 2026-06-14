import React, { useEffect } from 'react';
import { Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resetNavigation } from '../../navigation/navigation-utils';
import { ROUTES } from '../../navigation/routes';
import styles from './styles';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Navigate to the main app or home screen after the delay
      resetNavigation([{ name: ROUTES.AUTH_NAVIGATOR }]);
    }, 2000); // 2 seconds

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Image
        resizeMode="contain"
        source={require('../../assets/images/global/logo_full.png')}
        style={styles.logo}
      />
    </SafeAreaView>
  );
}
