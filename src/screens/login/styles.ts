import { moderateScale } from 'react-native-size-matters';
import { isIOS } from '../../utils/helper-functions';
import { FONTS } from '../../utils/typography';
import Colors from '../../constants/Colors';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg_800,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: isIOS ? moderateScale(125, 0.2) : moderateScale(160, 0.2),
    paddingHorizontal: moderateScale(20),
    paddingBottom: 0,
  },
  inputsContainer: {
    marginTop: moderateScale(64, 0.2),
  },
  loginText: {
    fontFamily: FONTS.lato_bold,
    fontSize: moderateScale(16, 0.4),
    color: Colors.primary_100,
    textAlign: 'left',
    marginBottom: moderateScale(32),
  },
  orText: {
    fontSize: moderateScale(16),
    color: Colors.grey_200,
    fontFamily: FONTS.lato_bold,
    textAlign: 'center',
    marginTop: moderateScale(32),
  },
  bottomTextContainer: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
  },
});

export default styles;
