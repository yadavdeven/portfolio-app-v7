import React, { useEffect } from 'react';
import { Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROUTES } from '../../navigation/routes';
import { navigate } from '../../navigation/navigation-utils';
import styles from './styles';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Navigate to the main app or home screen after the delay
      navigate(ROUTES.AUTH_NAVIGATOR);
    }, 2000); // 2 seconds

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <Image
        resizeMode="contain"
        source={require('../../assets/images/global/logo_full.png')}
        style={styles.logo}
      />
    </SafeAreaView>
  );
}
