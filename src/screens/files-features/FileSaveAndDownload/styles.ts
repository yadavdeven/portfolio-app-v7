import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { FONTS } from '../../../utils/typography';
import Colors from '../../../constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg_600,
  },
  contentContainer: {
    flex: 1,
    paddingTop: moderateScale(16),
    paddingHorizontal: moderateScale(16),
  },
  initialContentContainer: {
    flex: 1,
    paddingTop: moderateScale(120),
    alignItems: 'center',
  },
  initialContentText: {
    marginTop: moderateScale(16),
    fontSize: moderateScale(15, 0.4),
    color: Colors.primary_100,
    fontFamily: FONTS.lato_regular,
    paddingHorizontal: moderateScale(24),
    textAlign: 'center',
  },
  noDataContentText: {
    marginTop: moderateScale(24),
    fontSize: moderateScale(15, 0.4),
    color: Colors.primary_100,
    fontFamily: FONTS.lato_regular,
    paddingHorizontal: moderateScale(24),
  },
  noDataContentContainer: {
    flex: 1,
    paddingTop: moderateScale(120),
    alignItems: 'center',
  },
  skeletonLoadersContainer: {
    rowGap: moderateScale(16),
  },
  ordersContainer: {},
  footerLoaderContainer: {
    marginBottom: moderateScale(16),
  },
});

export default styles;
