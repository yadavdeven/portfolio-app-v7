import {StyleSheet} from 'react-native';
import {moderateScale, s} from 'react-native-size-matters';
import Colors from '../../constants/Colors';
import {FONTS} from '../../utils/typography';
import {dynamicHeight} from '../../utils/layout';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg_600,
    paddingTop: moderateScale(5),
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
  },
  categoryContainer: {
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(15),
    borderRadius: moderateScale(10),
    marginBottom: moderateScale(15),
    borderWidth: 1,
    borderColor: Colors.grey_800,
    overflow: 'hidden',
    alignItems: 'center',
  },
  categoryWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    height: dynamicHeight(40),
  },
  categoryText: {
    fontSize: dynamicHeight(20),
    fontFamily: FONTS.lato_bold,
    color: Colors.white,
  },
  subCategoryContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: dynamicHeight(40),
  },
  subCategoryText: {
    fontSize: dynamicHeight(18),
    fontFamily: FONTS.menlo,
    color: Colors.primary_100,
  },
});

export default styles;
