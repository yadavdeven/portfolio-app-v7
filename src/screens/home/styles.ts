import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { isAndroid } from '../../utils/helper-functions';
import { FONTS } from '../../utils/typography';
import { Theme } from '../../theme/themes';

// Theme-aware StyleSheet factory. Consumed via `useThemedStyles(createStyles)`
// so the sheet rebuilds when the active theme changes.
export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      flex: 1,
      paddingTop: isAndroid ? moderateScale(16) : moderateScale(4),
      paddingHorizontal: moderateScale(12),
      backgroundColor: theme.colors.background,
    },
    sectionTitleContainer: {
      backgroundColor: theme.colors.background,
      height: moderateScale(40),
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: moderateScale(18, 0.4),
      fontFamily: FONTS.lato_bold,
      color: theme.colors.heading,
    },
    sectionSeparator: {
      height: moderateScale(8),
    },
    sectionListContainer: {
      paddingHorizontal: moderateScale(8),
    },
    subCategoryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: moderateScale(6),
      paddingLeft: moderateScale(12),
      height: moderateScale(40),
    },
    subCategoryText: {
      color: theme.colors.onSurfaceVariant,
      fontSize: moderateScale(14, 0.4),
      fontFamily: FONTS.menlo,
    },
  });
