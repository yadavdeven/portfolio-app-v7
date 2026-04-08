import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import Colors from '../../../constants/Colors';
import { moderateScale } from 'react-native-size-matters';
import { useToast } from '../../../providers/ToastProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderBar from '../../../components/common/HeaderBar';

const BiometricScreen = () => {
  const { showToast } = useToast();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.bg_600} barStyle="dark-content" />
      <HeaderBar title="Biometrics" bgColor={Colors.bg_600} />
      <View style={styles.contentContainer}></View>
    </SafeAreaView>
  );
};

export default BiometricScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg_600,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(16),
  },
});
