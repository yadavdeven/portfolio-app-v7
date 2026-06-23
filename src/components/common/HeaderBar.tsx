import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import BackArrowIcon from '../../assets/images/global/arrow_back_ios_24dp_700.svg';
import { navigateBack } from '../../navigation/navigation-utils';
import { DEVICE_WIDTH } from '../../constants/Dimensions';
import { isAndroid } from '../../utils/helper-functions';
import { FONTS } from '../../utils/typography';
import { Theme } from '../../theme/themes';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import Colors from '../../constants/Colors';

type HeaderBarProps = {
  title: string;
  bgColor?: string;
};

const HeaderBar = ({ title, bgColor }: HeaderBarProps) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgColor || theme.colors.background },
      ]}
    >
      <TouchableOpacity
        onPress={() => navigateBack()}
        style={styles.back_arrow}
      >
        <BackArrowIcon
          height={moderateScale(24, 0.2)}
          width={moderateScale(24, 0.2)}
          fill={theme.colors.primary}
        />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default HeaderBar;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: DEVICE_WIDTH,
      justifyContent: 'center',
      alignItems: 'center',
      height: isAndroid ? moderateScale(62, 0.2) : moderateScale(54, 0.2),
      borderBottomWidth: moderateScale(0.8),
      borderBottomColor: Colors.primary_800,
    },
    back_arrow: {
      position: 'absolute',
      left: moderateScale(16, 0.2),
    },
    title: {
      fontFamily: FONTS.lato_bold,
      color: theme.colors.heading,
      fontSize: moderateScale(16, 0.4),
    },
  });
