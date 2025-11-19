import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { FONTS } from '../../utils/typography';
import Colors from '../../constants/Colors';
import { moderateScale } from 'react-native-size-matters';

interface ForgotPasswordTextProps {
  onForgotPasswordPress: () => void;
}

export default function ForgotPasswordText({
  onForgotPasswordPress,
}: ForgotPasswordTextProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onForgotPasswordPress}>
      <Text style={styles.forgot_text}>Forgot Password?</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
  },
  forgot_text: {
    fontFamily: FONTS.lato_bold,
    fontSize: moderateScale(15, 0.4),
    color: Colors.grey_300,
    textDecorationLine: 'underline',
  },
});
