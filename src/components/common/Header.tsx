import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BackArrowIcon from '../../assets/images/global/arrow_back_ios_24dp_300.svg';
import Colors from '../../constants/Colors';
import { dynamicHeight } from '../../utils/layout';
import { FONTS } from '../../utils/typography';
import { DEVICE_WIDTH } from '../../constants/Dimensions';
import { navigateBack } from '../../navigation/navigation-utils';

interface HeaderProps {
  title?: string;
  onBackPress?: () => void;
}

export default function Header({ title, onBackPress }: HeaderProps) {
  const onBack = onBackPress ? onBackPress : navigateBack();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backIconContainer}
      >
        <BackArrowIcon
          width={dynamicHeight(32)}
          height={dynamicHeight(32)}
          fill={Colors.primary}
        />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: DEVICE_WIDTH,
    paddingHorizontal: DEVICE_WIDTH * 0.03,
    alignItems: 'center',
    justifyContent: 'center',
    height: dynamicHeight(64),
    backgroundColor: Colors.bg_700,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,

    // bottom separation
    borderBottomWidth: 2,
    borderBottomColor: Colors.bg_500, // subtle separator
  },
  backIconContainer: {
    position: 'absolute',
    left: DEVICE_WIDTH * 0.03,
  },
  title: {
    color: Colors.primary,
    fontSize: dynamicHeight(20),
    fontFamily: FONTS.lato_bold,
  },
});
