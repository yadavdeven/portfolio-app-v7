import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../../../constants/Colors';
import { FONTS } from '../../../../utils/typography';

const FAB_SIZE = moderateScale(56);
const OPTION_SIZE = moderateScale(46);
const FAB_RIGHT = moderateScale(32);
const FAB_BOTTOM = moderateScale(60); // lifted to clear the bottom safe area
// Centre each option on the FAB along both axes.
const OPTION_RIGHT = FAB_RIGHT + (FAB_SIZE - OPTION_SIZE) / 2;
const OPTION_BOTTOM = FAB_BOTTOM + (FAB_SIZE - OPTION_SIZE) / 2;

// Big circle behind the options; centred on the FAB so only the upper-left
// quarter shows on screen.
const BG_DIAMETER = moderateScale(290);
const BG_RIGHT = FAB_RIGHT + FAB_SIZE / 2 - BG_DIAMETER / 2;
const BG_BOTTOM = FAB_BOTTOM + FAB_SIZE / 2 - BG_DIAMETER / 2;

export const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  fab: {
    position: 'absolute',
    right: FAB_RIGHT,
    bottom: FAB_BOTTOM,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.grey_500,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  bgCircle: {
    position: 'absolute',
    right: BG_RIGHT,
    bottom: BG_BOTTOM,
    width: BG_DIAMETER,
    height: BG_DIAMETER,
    borderRadius: BG_DIAMETER / 2,
    backgroundColor: Colors.primary,
  },
  fabIcon: {
    fontSize: moderateScale(30),
    fontWeight: '300',
    color: Colors.white,
    lineHeight: moderateScale(34),
  },
  option: {
    position: 'absolute',
    right: OPTION_RIGHT,
    bottom: OPTION_BOTTOM,
    width: OPTION_SIZE,
    height: OPTION_SIZE,
    overflow: 'visible',
  },
  optionBtn: {
    width: OPTION_SIZE,
    height: OPTION_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    position: 'absolute',
    top: OPTION_SIZE - moderateScale(4),
    left: (OPTION_SIZE - moderateScale(92)) / 2,
    width: moderateScale(92),
    textAlign: 'center',
    fontSize: moderateScale(10),
    fontFamily: FONTS.lato_bold,
    color: Colors.white,
  },
});
