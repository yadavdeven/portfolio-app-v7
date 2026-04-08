import { StyleSheet } from 'react-native';
import Colors from '../../../constants/Colors';
import { moderateScale } from 'react-native-size-matters';
import { DEVICE_WIDTH } from '../../../constants/Dimensions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg_600,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: moderateScale(16),
  },
  editor: {
    padding: moderateScale(8),
    fontSize: moderateScale(14, 0.4),
    backgroundColor: Colors.white,
    height: moderateScale(250, 0.4),
    width: DEVICE_WIDTH - moderateScale(32),
    borderWidth: 1,
    borderColor: Colors.grey_200,
    borderRadius: moderateScale(4),
  },
  toolbarContainer: {
    marginTop: moderateScale(12),
    width: DEVICE_WIDTH - moderateScale(32),
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grey_200,
    borderRadius: moderateScale(4),
    paddingVertical: moderateScale(8),
  },
  toolbarContent: {
    paddingHorizontal: moderateScale(8),
  },
  toolButton: {
    minWidth: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: moderateScale(4),
    borderRadius: moderateScale(4),
    backgroundColor: Colors.grey_500,
    paddingHorizontal: moderateScale(8),
  },
  toolButtonText: {
    fontSize: moderateScale(14, 0.4),
    fontWeight: '600',
    color: Colors.grey_700,
  },
});

export default styles;