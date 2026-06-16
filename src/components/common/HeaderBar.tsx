import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import BackArrowIcon from '../../assets/images/global/arrow_back_ios_24dp_700.svg';
import { navigateBack } from '../../navigation/navigation-utils';
import { DEVICE_WIDTH } from '../../constants/Dimensions';
import { isAndroid } from '../../utils/helper-functions';
import { FONTS } from '../../utils/typography';
import Colors from '../../constants/Colors';

type HeaderBarProps = {
  title: string;
  bgColor?: string;
};

const HeaderBar = ({ title, bgColor }: HeaderBarProps) => {
  return (
    <View style={[styles.container, { backgroundColor: bgColor || 'white' }]}>
      <TouchableOpacity
        onPress={() => navigateBack()}
        style={styles.back_arrow}
      >
        <BackArrowIcon
          height={moderateScale(24, 0.2)}
          width={moderateScale(24, 0.2)}
          fill={Colors.primary}
        />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default HeaderBar;

const styles = StyleSheet.create({
  container: {
    width: DEVICE_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    height: isAndroid ? moderateScale(62, 0.2) : moderateScale(54, 0.2),
    borderBottomWidth: moderateScale(1, 0.2),
    borderBottomColor: Colors.offWhite_900,
  },
  back_arrow: {
    position: 'absolute',
    left: moderateScale(16, 0.2),
  },
  title: {
    fontFamily: FONTS.lato_bold,
    color: Colors.primary,
    fontSize: moderateScale(16, 0.4),
  },
});
