import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ButtonStandardProps } from '../../types/components/common';
import { UIActivityIndicator } from 'react-native-indicators';
import { DEVICE_WIDTH } from '../../constants/Dimensions';
import { useAppSelector } from '../../store/hooks';
import { FONTS } from '../../utils/typography';
import Colors from '../../constants/Colors';
import { moderateScale } from 'react-native-size-matters';

export default function ButtonStandard({
  btnLabel,
  marginTop = moderateScale(24),
  onPress,
  btnWidth,
}: ButtonStandardProps) {
  const { isAppLoading } = useAppSelector(state => state.app);
  return (
    <TouchableOpacity
      style={[styles.btn, { width: btnWidth, marginTop }]}
      onPress={onPress}
    >
      {isAppLoading && <View style={styles.loaderWrapper} />}
      <Text style={styles.btnText}>{btnLabel}</Text>
      {isAppLoading && (
        <View style={styles.loaderWrapper}>
          <UIActivityIndicator
            color="white"
            count={12}
            size={moderateScale(14)}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: DEVICE_WIDTH * 0.9,
    height: moderateScale(40, 0.4),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 7,
    shadowColor: Colors.grey_500,
    flexDirection: 'row',
    shadowOffset: {
      width: 7,
      height: 7,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
    columnGap: DEVICE_WIDTH * 0.02,
    borderWidth: 1,
    borderColor: Colors.bg_600,
  },
  btnText: {
    fontSize: moderateScale(16),
    fontFamily: FONTS.lato_bold,
    color: Colors.white,
  },
  loaderWrapper: {
    width: DEVICE_WIDTH * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
