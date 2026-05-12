import { StyleSheet } from 'react-native';
import Colors from '../../../constants/Colors';
import { moderateScale } from 'react-native-size-matters';
import { DEVICE_WIDTH } from '../../../constants/Dimensions';

const styles = StyleSheet.create({
  editorWrapper: {
    position: 'relative',
  },
  editor: {
    padding: moderateScale(8),
    fontSize: moderateScale(14, 0.4),
    backgroundColor: Colors.white,
    height: moderateScale(250, 0.4),
    width: DEVICE_WIDTH - moderateScale(32),
    borderWidth: moderateScale(1.5),
    borderColor: Colors.primary_700,
    borderRadius: moderateScale(4),
  },
  toolbarContainer: {
    backgroundColor: Colors.offWhite_200,
    height: moderateScale(40),
    width: '100%',
    // ← flexDirection & columnGap removed (moved to toolbarContent)
  },
  // ✅ NEW STYLE – this makes horizontal scroll work
  toolbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(8),
    columnGap: moderateScale(8),
  },
  toolbarItem: {
    paddingHorizontal: moderateScale(2),
    paddingVertical: moderateScale(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbarItemActive: {
    backgroundColor: Colors.primary_300,
    borderRadius: moderateScale(4),
    elevation: 1,
  },
});

export default styles;
