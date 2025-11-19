import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import GoogleLogo from '../../assets/images/global/google.svg';
import AppleLogo from '../../assets/images/global/apple.svg';
import FacebookLogo from '../../assets/images/global/facebook.svg';
import GithubLogo from '../../assets/images/global/github.svg';
import Colors from '../../constants/Colors';
import { moderateScale } from 'react-native-size-matters';

export default function SocialSignInIcons({}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logo_wrapper}>
        <GoogleLogo width={moderateScale(24)} height={moderateScale(24)} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.logo_wrapper}>
        <AppleLogo width={moderateScale(32)} height={moderateScale(32)} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.logo_wrapper}>
        <FacebookLogo width={moderateScale(28)} height={moderateScale(28)} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.logo_wrapper}>
        <GithubLogo width={moderateScale(24)} height={moderateScale(24)} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: moderateScale(24),
    marginTop: moderateScale(24),
    alignSelf: 'center',
  },
  logo_wrapper: {
    width: moderateScale(32),
    aspectRatio: 1,
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.offWhite_100,
    elevation: 0.5,
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
});
