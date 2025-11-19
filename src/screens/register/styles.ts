import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import { dynamicHeight } from '../../utils/layout';
import { FONTS } from '../../utils/typography';
import { moderateScale } from 'react-native-size-matters';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.bg_800,
  },
  contentContainer: {
    paddingTop: moderateScale(24, 0.2),
    paddingHorizontal: moderateScale(24, 0.2),
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
