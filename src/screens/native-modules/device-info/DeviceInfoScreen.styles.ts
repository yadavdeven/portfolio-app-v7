import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../../constants/Colors';
import { FONTS } from '../../../utils/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ── Result card ────────────────────────────────────────────────
  card: {
    marginTop: moderateScale(28),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    padding: moderateScale(16),
    shadowColor: Colors.grey_500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: moderateScale(15, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.primary,
    marginBottom: moderateScale(6),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: moderateScale(8),
    borderTopWidth: 1,
    borderTopColor: Colors.bg_500,
  },
  rowKey: {
    width: moderateScale(120),
    fontSize: moderateScale(13, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_200,
    marginRight: moderateScale(10),
  },
  rowValue: {
    flex: 1,
    fontSize: moderateScale(13, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.primary,
  },
});
