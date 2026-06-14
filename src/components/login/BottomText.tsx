import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEVICE_WIDTH } from '../../constants/Dimensions';
import { moderateScale } from 'react-native-size-matters';
import { FONTS } from '../../utils/typography';
import Colors from '../../constants/Colors';

export default function BottomText({
  linkText,
  link,
  onLinkPress,
}: {
  linkText: string;
  link: string;
  onLinkPress: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.container, { bottom: insets.bottom + moderateScale(16) }]}
    >
      <Text style={styles.text1}>{linkText}</Text>
      <TouchableOpacity onPress={onLinkPress}>
        <Text style={styles.text2}>{link}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  text1: {
    fontSize: moderateScale(15, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_200,
  },
  text2: {
    fontSize: moderateScale(16, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.primary,
    marginLeft: DEVICE_WIDTH * 0.02,
    textDecorationLine: 'underline',
  },
});
