import { StyleSheet } from 'react-native';
import { DEVICE_WIDTH } from '../../../constants/Dimensions';
import { moderateScale } from 'react-native-size-matters';
import { FONTS } from '../../../utils/typography';
import { isTablet } from '../../../utils/layout';
import Colors from '../../../constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg_700,
  },
  contentContainer: {
    flex: 1,
  },
  cardsContainer: {
    marginTop: moderateScale(10),
    rowGap: moderateScale(10),
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    width: isTablet ? DEVICE_WIDTH * 0.72 : DEVICE_WIDTH * 0.9,
    paddingHorizontal: isTablet ? DEVICE_WIDTH * 0.04 : DEVICE_WIDTH * 0.05,
    columnGap: isTablet ? DEVICE_WIDTH * 0.04 : DEVICE_WIDTH * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    height: moderateScale(90, 0.4),
  },
  image: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    opacity: 0.8,
  },
  name: {
    fontSize: moderateScale(16, 0.4),
    fontFamily: FONTS.josefin_semi_bold,
    color: Colors.black,
  },
  jobTitle: {
    fontSize: moderateScale(12, 0.4),
    fontFamily: FONTS.lato_regular,
  },
  email: {
    fontSize: moderateScale(14, 0.4),
    fontFamily: 'Menlo',
    color: Colors.primary,
    width: DEVICE_WIDTH * 0.55,
    marginTop: moderateScale(4),
  },
});

export default styles;
