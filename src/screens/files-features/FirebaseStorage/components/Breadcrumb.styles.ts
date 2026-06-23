import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../../../constants/Colors';
import { FONTS } from '../../../../utils/typography';

export const styles = StyleSheet.create({
  // White box with a thin light border all around + subtle shadow/elevation.
  card: {
    backgroundColor: Colors.white,
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(10),
    marginTop: moderateScale(10),
    marginBottom: moderateScale(15),
    borderWidth: moderateScale(0.25),
    borderColor: Colors.bg_300,
    borderRadius: moderateScale(6),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeIcon: {
    justifyContent: 'center',
    marginRight: moderateScale(6),
  },
  nodeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crumbTouch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crumb: {
    fontSize: moderateScale(13.5, 0.3),
    fontFamily: FONTS.lato_regular,
    color: Colors.grey_200,
    maxWidth: moderateScale(140),
  },
  crumbCurrent: {
    fontFamily: FONTS.lato_bold,
    color: Colors.primary,
  },
  separator: {
    marginHorizontal: moderateScale(8),
    color: Colors.grey_500,
    fontSize: moderateScale(20, 0.3),
  },
  ellipsis: {
    fontSize: moderateScale(14, 0.3),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_300,
  },
  rootInfo: {
    marginLeft: moderateScale(8),
    fontSize: moderateScale(12.5, 0.3),
    fontFamily: FONTS.lato_bold,
    color: Colors.primary_200,
  },
});
