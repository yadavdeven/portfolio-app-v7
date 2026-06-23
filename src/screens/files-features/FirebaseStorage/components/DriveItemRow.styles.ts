import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../../../constants/Colors';
import { FONTS } from '../../../../utils/typography';

// Action squares match the left folder icon (44 / radius 10).
const ACTION_SIZE = moderateScale(44);
const ACTION_GAP = moderateScale(14);
const ACTION_PAD = moderateScale(14);

export const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: Colors.bg_500,
  },
  // Action squares pinned to the right edge.
  actions: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    // No right padding: the close button sits flush right, aligning with the
    // more_vert icon it replaces.
    paddingLeft: ACTION_PAD,
    columnGap: ACTION_GAP,
  },
  actionSquare: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary_200,
  },
  closeBtn: {
    padding: moderateScale(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(12),
  },
  iconSquare: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(10),
    backgroundColor: Colors.bg_700,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(14),
  },
  fileImage: {
    width: moderateScale(20),
    height: moderateScale(20),
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: moderateScale(14, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_100,
  },
  meta: {
    fontSize: moderateScale(11.5, 0.3),
    fontFamily: FONTS.lato_regular,
    color: Colors.grey_400,
    marginTop: moderateScale(3),
  },
  moreBtn: {
    marginLeft: moderateScale(6),
    padding: moderateScale(4),
  },
});
