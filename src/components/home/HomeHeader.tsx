import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import MenuSvg from '../../assets/images/global/menu_24dp_200.svg';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../constants/Colors';
import { usableHeight } from '../../utils/layout';

export default function HomeHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.menuAndLogoContainer}>
        <MenuSvg
          width={moderateScale(36)}
          height={moderateScale(36)}
          fill={Colors.primary}
        />
        <Image
          source={require('../../assets/images/global/logo_full.png')}
          resizeMode="contain"
          style={styles.logo}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuAndLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: moderateScale(10),
  },
  logo: {
    width: moderateScale(150),
    height: usableHeight * 0.05,
  },
});
