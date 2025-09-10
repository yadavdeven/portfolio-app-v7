import {StyleSheet} from 'react-native';
import Colors from '../../constants/Colors';
import {moderateScale} from 'react-native-size-matters';
import {FONTS} from '../../utils/typography';
import {dynamicHeight, isTablet} from '../../utils/layout';
import {isAndroid} from '../../utils/helperFunctions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(20),
    paddingTop: isTablet
      ? dynamicHeight(200)
      : isAndroid
      ? dynamicHeight(160)
      : dynamicHeight(140),
  },
  inputsContainer: {
    marginTop: dynamicHeight(120),
    rowGap: dynamicHeight(24),
  },
  loginText: {
    fontSize: dynamicHeight(18),
    color: Colors.primary_100,
    fontFamily: FONTS.lato_bold,
    textAlign: 'left',
  },
  orText: {
    fontSize: dynamicHeight(20),
    color: Colors.grey_200,
    fontFamily: FONTS.lato_bold,
    textAlign: 'center',
    marginTop: dynamicHeight(32),
  },
});

export default styles;
