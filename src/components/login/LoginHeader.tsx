import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { DEVICE_WIDTH } from '../../constants/Dimensions';
import { moderateScale } from 'react-native-size-matters';

export default function LoginHeader() {
  return (
    <View style={styles.container}>
      <Image
        resizeMode="contain"
        source={require('../../assets/images/global/logo_full.png')}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  logo: {
    width: DEVICE_WIDTH * 0.6,
    height: moderateScale(36),
  },
});
