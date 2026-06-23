import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Theme } from '../../theme/themes';
import { useThemedStyles } from '../../theme/ThemeContext';
import HeaderBar from './HeaderBar';

const Wrapper = ({
  headerTitle,
  children,
  containerStyle,
  scrollView = true,
  backgroundColor,
}: {
  headerTitle: string;
  children?: React.ReactNode;
  containerStyle?: any;
  scrollView?: boolean;
  /** Override the themed screen/header background (e.g. to match a specific screen). */
  backgroundColor?: string;
}) => {
  const styles = useThemedStyles(createStyles);
  return (
    <SafeAreaView
      style={[styles.container, backgroundColor ? { backgroundColor } : null]}
    >
      <HeaderBar title={headerTitle} bgColor={backgroundColor} />
      {scrollView ? (
        <ScrollView style={[styles.contentContainer, { ...containerStyle }]}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.contentContainer, { ...containerStyle }]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
};

export default Wrapper;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      flex: 1,
      padding: moderateScale(16),
    },
  });
