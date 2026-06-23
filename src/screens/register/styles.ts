import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { FONTS } from '../../utils/typography';
import Colors from '../../constants/Colors';

const styles = StyleSheet.create({
  // Wrapper supplies the SafeAreaView + header; strip its default padding so the
  // KeyboardAwareScrollView below owns the content insets.
  wrapperContent: {
    padding: 0,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: moderateScale(15, 0.2),
    paddingHorizontal: moderateScale(15, 0.2),
    // Reserve room for the absolutely-positioned BottomText footer (which sits
    // ~insets.bottom + 16 + text height up from the bottom) so the social icons
    // don't sit underneath it.
    // paddingBottom: moderateScale(110),
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
