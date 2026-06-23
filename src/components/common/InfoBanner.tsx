import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { FONTS } from '../../utils/typography';
import { Theme } from '../../theme/themes';
import { useThemedStyles } from '../../theme/ThemeContext';

type InfoBannerProps = {
  title: string;
  description: string;
  containerStyle?: ViewStyle | ViewStyle[];
};

const InfoBanner = ({ title, description, containerStyle }: InfoBannerProps) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.banner, containerStyle]}>
      <Text style={styles.text}>
        <Text style={styles.label}>{title} — </Text>
        {description}
      </Text>
    </View>
  );
};

export default InfoBanner;

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    banner: {
      borderRadius: moderateScale(8),
      paddingHorizontal: moderateScale(13),
      paddingVertical: moderateScale(10),
      marginBottom: moderateScale(16),
      borderWidth: 1,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    text: {
      fontSize: moderateScale(12, 0.4),
      fontFamily: FONTS.lato_regular,
      lineHeight: moderateScale(18),
      color: theme.colors.textSecondary,
    },
    label: {
      fontFamily: FONTS.lato_bold,
      color: theme.colors.heading,
    },
  });
