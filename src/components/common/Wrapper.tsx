import React from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../constants/Colors';
import HeaderBar from './HeaderBar';

const Wrapper = ({
  headerTitle,
  children,
  containerStyle,
  scrollView = true,
}: {
  headerTitle: string;
  children?: React.ReactNode;
  containerStyle?: any;
  scrollView?: boolean;
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.bg_600} barStyle="dark-content" />
      <HeaderBar title={headerTitle} bgColor={Colors.bg_600} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg_600,
  },
  contentContainer: {
    flex: 1,
    padding: moderateScale(16),
  },
});
