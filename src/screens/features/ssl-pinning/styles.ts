import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../../constants/Colors';
import { FONTS } from '../../../utils/typography';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputSpacing: {
    marginTop: moderateScale(16),
  },
  // ── SSL pinning toggle ─────────────────────────────────────────
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(16),
    marginBottom: moderateScale(8),
    shadowColor: Colors.grey_500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  toggleHint: {
    fontSize: moderateScale(11, 0.4),
    fontFamily: FONTS.lato_regular,
    fontStyle: 'italic',
    color: Colors.grey_400,
    marginBottom: moderateScale(20),
    paddingHorizontal: moderateScale(4),
  },
  toggleTextWrap: {
    flex: 1,
    marginRight: moderateScale(12),
  },
  toggleTitle: {
    fontSize: moderateScale(15, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.primary,
  },
  toggleSubtitle: {
    marginTop: moderateScale(2),
    fontSize: moderateScale(12, 0.4),
    fontFamily: FONTS.lato_regular,
    lineHeight: moderateScale(16),
  },
  toggleOn: {
    color: Colors.green_shade,
  },
  toggleOff: {
    color: Colors.error,
  },
  // ── Response card ──────────────────────────────────────────────
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(14),
  },
  message: {
    flex: 1,
    fontSize: moderateScale(15, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.primary,
    marginRight: moderateScale(10),
  },
  badge: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(20),
  },
  cardError: {
    borderWidth: 1,
    borderColor: Colors.error,
  },
  badgeSuccess: {
    backgroundColor: Colors.green_shade,
  },
  badgeFailed: {
    backgroundColor: Colors.error,
  },
  errorText: {
    fontSize: moderateScale(13, 0.4),
    fontFamily: FONTS.lato_regular,
    color: Colors.error,
    lineHeight: moderateScale(18),
  },
  badgeText: {
    fontSize: moderateScale(11, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: moderateScale(12, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_300,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: moderateScale(12),
    marginBottom: moderateScale(8),
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
  rowValueMissing: {
    color: Colors.error,
    fontFamily: FONTS.lato_regular,
    fontStyle: 'italic',
  },
  emptyHint: {
    fontSize: moderateScale(13, 0.4),
    fontFamily: FONTS.lato_regular,
    fontStyle: 'italic',
    color: Colors.grey_400,
    paddingVertical: moderateScale(6),
  },
  timestamp: {
    marginTop: moderateScale(16),
    fontSize: moderateScale(11, 0.4),
    fontFamily: FONTS.lato_regular,
    color: Colors.grey_400,
  },
});

export default styles;
