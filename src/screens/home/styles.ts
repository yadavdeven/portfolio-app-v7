import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../constants/Colors';
import { isAndroid } from '../../utils/helperFunctions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg_800,
  },
  contentContainer: {
    paddingTop: isAndroid ? moderateScale(16) : moderateScale(4),
    paddingHorizontal: moderateScale(12),
    backgroundColor: Colors.bg_800,
  },
});

export default styles;
