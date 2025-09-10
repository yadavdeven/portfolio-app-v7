import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { dynamicHeight } from '../../utils/layout';
import { FONTS } from '../../utils/typography';
import Colors from '../../constants/Colors';

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
    marginTop: dynamicHeight(12),
  },
  forgot_text: {
    fontSize: dynamicHeight(18),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_300,
  },
});
