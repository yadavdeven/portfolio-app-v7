import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../../constants/Colors';
import { FONTS } from '../../../utils/typography';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg_600,
  },
  content: {
    flex: 1,
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(8),
  },
  // Active-folder header highlighted with a left accent bar (no fill).
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(6),
  },
  accentBar: {
    width: moderateScale(4),
    height: moderateScale(22),
    borderRadius: moderateScale(2),
    backgroundColor: Colors.green_shade,
    marginRight: moderateScale(10),
  },
  activeFolder: {
    flex: 1,
    marginLeft: moderateScale(10),
    fontSize: moderateScale(14.5),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_primary,
  },
  headerIconBtn: {
    padding: moderateScale(6),
    marginLeft: moderateScale(4),
  },
  fill: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingBottom: moderateScale(90),
    flexGrow: 1,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: moderateScale(15, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_200,
  },
  emptySubtitle: {
    marginTop: moderateScale(6),
    fontSize: moderateScale(12.5, 0.3),
    fontFamily: FONTS.lato_regular,
    color: Colors.grey_400,
    textAlign: 'center',
  },
  message: {
    fontSize: moderateScale(13, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_200,
    marginTop: moderateScale(4),
  },
  error: {
    marginTop: moderateScale(24),
    color: Colors.error,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: moderateScale(14),
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(9),
    borderRadius: moderateScale(7),
    backgroundColor: Colors.primary,
  },
  retryText: {
    fontSize: moderateScale(13.5),
    fontFamily: FONTS.lato_bold,
    color: Colors.white,
  },
  fab: {
    position: 'absolute',
    right: moderateScale(20),
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.grey_500,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  fabIcon: {
    fontSize: moderateScale(30),
    color: Colors.white,
    lineHeight: moderateScale(34),
  },
});
