import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import GoogleLogo from '../../assets/images/global/google.svg';
import AppleLogo from '../../assets/images/global/apple.svg';
import FacebookLogo from '../../assets/images/global/facebook.svg';
import GithubLogo from '../../assets/images/global/github.svg';
import Colors from '../../constants/Colors';
import {dynamicHeight} from '../../utils/layout';

export default function SocialSignInIcons({}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logo_wrapper}>
        <GoogleLogo width={dynamicHeight(28)} height={dynamicHeight(28)} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.logo_wrapper}>
        <AppleLogo width={dynamicHeight(36)} height={dynamicHeight(36)} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.logo_wrapper}>
        <FacebookLogo width={dynamicHeight(32)} height={dynamicHeight(32)} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.logo_wrapper}>
        <GithubLogo width={dynamicHeight(28)} height={dynamicHeight(28)} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: dynamicHeight(24),
    marginTop: dynamicHeight(24),
    alignSelf: 'center',
  },
  logo_wrapper: {
    width: dynamicHeight(44),
    aspectRatio: 1,
    borderRadius: dynamicHeight(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.offWhite_100,
    elevation: 0.5,
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
});
