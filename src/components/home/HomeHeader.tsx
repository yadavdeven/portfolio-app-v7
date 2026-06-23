import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import MenuSvg from '../../assets/images/global/menu_24dp_200.svg';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '../../theme/ThemeContext';
import { usableHeight } from '../../utils/layout';
import ThemeToggleIcon from './ThemeToggleIcon';

export default function HomeHeader() {
  const { theme, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={styles.container}>
      <View style={styles.menuAndLogoContainer}>
        <TouchableOpacity
          onPress={openDrawer}
          hitSlop={moderateScale(8)}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
        >
          <MenuSvg
            width={moderateScale(36)}
            height={moderateScale(36)}
            fill={theme.colors.primary}
          />
        </TouchableOpacity>
        <Image
          source={require('../../assets/images/global/logo_full.png')}
          resizeMode="contain"
          style={styles.logo}
        />
      </View>
      <TouchableOpacity
        onPress={toggleTheme}
        style={styles.themeToggle}
        hitSlop={moderateScale(8)}
        accessibilityRole="button"
        accessibilityLabel={
          isDark ? 'Switch to light theme' : 'Switch to dark theme'
        }
      >
        <ThemeToggleIcon
          isDark={isDark}
          size={moderateScale(28)}
          color={theme.colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  menuAndLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: moderateScale(10),
  },
  logo: {
    width: moderateScale(150),
    height: usableHeight * 0.05,
  },
  themeToggle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(10),
  },
});
