import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../../constants/Colors';
import { FONTS } from '../../../utils/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg_600,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: moderateScale(16),
  },
  headerContainer: {
    backgroundColor: Colors.primary_200,
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(48),
  },
  headerText: {
    fontSize: moderateScale(14, 0.4),
    color: Colors.white,
    fontFamily: FONTS.lato_bold,
  },
});

export default styles;
