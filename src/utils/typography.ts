// src/utils/typography.ts
import { moderateScale } from 'react-native-size-matters';

const lato_14 = {
  fontSize: moderateScale(14, 0.2),
  fontFamily: 'Lato-Bold' as const,
};

const lato_15 = {
  fontSize: moderateScale(15, 0.2),
  fontFamily: 'Lato-Bold' as const,
};

const lato_16 = {
  fontSize: moderateScale(16, 0.2),
  fontFamily: 'Lato-Bold' as const,
};
const lato_17 = {
  fontSize: moderateScale(17, 0.2),
  fontFamily: 'Lato-Bold' as const,
};

const lato_18 = {
  fontSize: moderateScale(18, 0.2),
  fontFamily: 'Lato-Bold' as const,
};

const lato_20 = {
  fontSize: moderateScale(20, 0.2),
  fontFamily: 'Lato-Bold' as const,
};

export const FONTS = {
  lato_light: 'Lato-Regular',
  lato_regular: 'Lato-Regular',
  lato_black: 'Lato-Bold',
  lato_bold: 'Lato-Bold',
  josefin_regular: 'JosefinSans-Regular',
  josefin_medium: 'JosefinSans-Medium',
  josefin_semi_bold: 'JosefinSans-SemiBold',
  josefin_bold: 'JosefinSans-Bold',
  menlo: 'Menlo-Regular',
};

export const FONT_STYLES = {
  lato_14,
  lato_15,
  lato_16,
  lato_17,
  lato_18,
  lato_20,
};
