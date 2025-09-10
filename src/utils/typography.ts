// src/utils/typography.ts
import {moderateScale} from 'react-native-size-matters';
import {Dimensions} from 'react-native';

const {width} = Dimensions.get('window');
const isTablet = width >= 768;

export const FontSizes = {
  xs: isTablet ? 12 : moderateScale(12, 0.3),
  sm: isTablet ? 14 : moderateScale(14, 0.3),
  md: isTablet ? 16 : moderateScale(16, 0.3),
  lg: isTablet ? 18 : moderateScale(18, 0.3),
  xl: isTablet ? 22 : moderateScale(22, 0.3),
  '2xl': isTablet ? 26 : moderateScale(26, 0.3),
  '3xl': isTablet ? 32 : moderateScale(32, 0.3),
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
