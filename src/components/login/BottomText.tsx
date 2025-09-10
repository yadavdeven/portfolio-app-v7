import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {FONTS} from '../../utils/typography';
import Colors from '../../constants/Colors';
import {DEVICE_WIDTH} from '../../constants/Dimensions';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {dynamicHeight} from '../../utils/layout';

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
      style={[styles.container, {bottom: insets.bottom + dynamicHeight(10)}]}>
      <Text style={styles.text1}>{linkText}</Text>
      <TouchableOpacity onPress={onLinkPress}>
        <Text style={styles.text2}>{link}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    alignSelf: 'center',
  },
  text1: {
    fontSize: dynamicHeight(18),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_200,
  },
  text2: {
    fontSize: dynamicHeight(20),
    fontFamily: FONTS.lato_bold,
    color: Colors.primary,
    marginLeft: DEVICE_WIDTH * 0.02,
    textDecorationLine: 'underline',
  },
});
