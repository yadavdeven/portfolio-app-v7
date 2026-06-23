import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { FONTS } from '../../../../utils/typography';
import Colors from '../../../../constants/Colors';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(8),
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: moderateScale(38),
    paddingHorizontal: moderateScale(14),
    borderRadius: moderateScale(4),
    borderWidth: 0.5,
    borderColor: Colors.bg_400,
    backgroundColor: Colors.white,
  },
  sortText: {
    marginLeft: moderateScale(6),
    fontSize: moderateScale(13, 0.3),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_200,
  },
  toggle: {
    flexDirection: 'row',
    height: moderateScale(38),
    borderRadius: moderateScale(4),
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    borderColor: Colors.bg_400,
    overflow: 'hidden',
  },
  toggleBtn: {
    justifyContent: 'center',
    paddingHorizontal: moderateScale(12),
  },
  toggleActive: {
    backgroundColor: Colors.secondary,
  },
});
