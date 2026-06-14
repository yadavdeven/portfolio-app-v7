import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { FONTS } from '../../utils/typography';
import Colors from '../../constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg_700,
    alignItems: 'center',
  },
  contentContainer: {
    paddingTop: moderateScale(15, 0.2),
    paddingHorizontal: moderateScale(15, 0.2),
  },

  orText: {
    fontSize: moderateScale(16, 0.4),
    color: Colors.grey_200,
    fontFamily: FONTS.lato_bold,
    textAlign: 'center',
    marginTop: moderateScale(24),
  },
});

export default styles;
