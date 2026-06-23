import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import SearchSvg from '../../assets/svgs/search_24dp_300.svg';
import CancelSvg from '../../assets/svgs/cancel_24dp_300.svg';
import { moderateScale } from 'react-native-size-matters';
import { FONTS } from '../../utils/typography';
import { Theme } from '../../theme/themes';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  containerStyle?: object;
  onSearchPress?: () => void;
};

export default function SearchBar({
  containerStyle,
  value,
  onChangeText,
  placeholder,
  onSearchPress,
}: Props) {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  const showCancel = value?.length > 0;
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Search'}
        placeholderTextColor={theme.colors.placeholder}
        autoCorrect={false}
        autoComplete="off"
      />
      {showCancel && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <CancelSvg
            fill={theme.colors.textSecondary}
            width={moderateScale(20)}
            height={moderateScale(20)}
          />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onSearchPress}>
        <SearchSvg
          fill={theme.colors.primary}
          width={moderateScale(22)}
          height={moderateScale(22)}
        />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      height: moderateScale(40),
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: moderateScale(8),
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: moderateScale(12),
      columnGap: moderateScale(8),
      marginTop: moderateScale(16),
      marginBottom: moderateScale(16),
    },
    input: {
      flex: 1,
      fontSize: moderateScale(14, 0.4),
      fontFamily: FONTS.geom_medium,
      color: theme.colors.text,
    },
  });
