import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { isAndroid } from '../../utils/helperFunctions';
import { FONTS } from '../../utils/typography';
import Colors from '../../constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentContainer: {
    paddingTop: isAndroid ? moderateScale(16) : moderateScale(4),
    paddingHorizontal: moderateScale(12),
    backgroundColor: Colors.white,
  },
  sectionTitleContainer: {
    backgroundColor: 'white',
    height: moderateScale(40),
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: moderateScale(18, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.primary,
  },
  sectionSeparator: {
    height: moderateScale(8),
  },
  sectionListContainer: {
    paddingHorizontal: moderateScale(8),
  },
  subCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary_100,
    paddingLeft: moderateScale(12),
    height: moderateScale(40),
  },
  subCategoryText: {
    color: Colors.white,
    fontSize: moderateScale(14, 0.4),
    fontFamily: FONTS.menlo,
  },
});

export default styles;
