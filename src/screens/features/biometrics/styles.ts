import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { FONTS } from '../../../utils/typography';
import Colors from '../../../constants/Colors';

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  /* Hero */
  hero: {
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    fontSize: moderateScale(14, 0.4),
    marginBottom: moderateScale(12),
    fontFamily: FONTS.lato_bold,
    color: Colors.primary,
    marginTop: moderateScale(32),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(14, 0.4),
    color: Colors.primary_200,
    fontFamily: FONTS.lato_regular,
    textAlign: 'center',
  },

  /* Section */
  section: {
    width: '100%',
  },
  sectionLabel: {
    fontSize: moderateScale(12, 0.4),
    fontFamily: FONTS.lato_bold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.grey_500,
    marginBottom: moderateScale(7),
    paddingLeft: moderateScale(4),
  },

  /* Card */
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    borderWidth: 0.5,
    borderColor: Colors.bg_300,
    overflow: 'hidden',
    marginBottom: moderateScale(10),
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.bg_300,
    marginHorizontal: moderateScale(14),
  },

  /* Master toggle row */
  masterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(16),
  },
  masterText: {
    flex: 1,
    marginRight: moderateScale(8),
  },
  masterLabel: {
    fontSize: moderateScale(15, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_primary,
  },
  masterSub: {
    fontSize: moderateScale(12, 0.4),
    fontFamily: FONTS.lato_regular,
    color: Colors.grey_400,
    marginTop: moderateScale(2),
  },
  masterChevron: {
    fontSize: moderateScale(20),
    color: Colors.primary,
    fontFamily: FONTS.lato_regular,
  },

  /* Toggle row */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(12),
    gap: moderateScale(12),
  },
  rowDisabled: {
    opacity: 0.4,
  },
  rowIconWrap: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(10),
    backgroundColor: Colors.bg_600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconImg: {
    width: moderateScale(22),
    height: moderateScale(22),
    resizeMode: 'contain',
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: moderateScale(14, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_primary,
  },
  rowSub: {
    fontSize: moderateScale(12, 0.4),
    fontFamily: FONTS.lato_regular,
    color: Colors.grey_400,
    marginTop: moderateScale(2),
  },

  /* Info banner */
  banner: {
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(13),
    paddingVertical: moderateScale(10),
    marginBottom: moderateScale(12),
    borderWidth: 0.5,
    backgroundColor: '#FFF8ED',
    borderColor: '#FAC775',
  },
  bannerText: {
    fontSize: moderateScale(12, 0.4),
    fontFamily: FONTS.lato_regular,
    lineHeight: moderateScale(18),
    color: '#854F0B',
  },
  bannerTextSuccess: {
    color: Colors.primary,
  },
  bannerTextWarn: {},

  /* Danger button */
  dangerBtn: {
    paddingVertical: moderateScale(14),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.alert_red,
    alignItems: 'center',
  },
  dangerBtnText: {
    fontSize: moderateScale(14, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.white,
  },
});

export default styles;
