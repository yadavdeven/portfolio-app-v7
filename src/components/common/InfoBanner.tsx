import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { FONTS } from '../../utils/typography';

type InfoBannerProps = {
  title: string;
  description: string;
  containerStyle?: ViewStyle | ViewStyle[];
};

const InfoBanner = ({
  title,
  description,
  containerStyle,
}: InfoBannerProps) => {
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

const styles = StyleSheet.create({
  banner: {
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(13),
    paddingVertical: moderateScale(10),
    marginBottom: moderateScale(16),
    borderWidth: 0.5,
    backgroundColor: '#FFF8ED',
    borderColor: '#FAC775',
  },
  text: {
    fontSize: moderateScale(12, 0.4),
    fontFamily: FONTS.lato_regular,
    lineHeight: moderateScale(18),
    color: '#854F0B',
  },
  label: {
    fontFamily: FONTS.lato_bold,
  },
});
