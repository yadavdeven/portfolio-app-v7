import React, { useEffect } from 'react';
import { StyleSheet, Text, Dimensions } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import Colors from '../../constants/Colors';
import { FONTS } from '../../utils/typography';
import { dynamicHeight } from '../../utils/layout';

type AppToastProps = {
  text: string;
  type?: 'success' | 'error' | 'default';
  onHide?: () => void;
  duration?: number; // ms
  positionFromBottom?: number;
};

const { height: DEVICE_HEIGHT } = Dimensions.get('window');

export default function AppToast({
  text,
  type = 'default',
  onHide,
  duration = 3000, // default duration
  positionFromBottom = DEVICE_HEIGHT * 0.2,
}: AppToastProps) {
  const bgColor =
    type === 'success'
      ? Colors.green_shade
      : type === 'error'
      ? Colors.error
      : Colors.primary_200;

  useEffect(() => {
    const timer = setTimeout(() => {
      onHide?.();
    }, duration + 300); // buffer for exit animation
    return () => clearTimeout(timer);
  }, [duration, onHide]);

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(300)}
      style={[
        styles.container,
        { backgroundColor: bgColor, bottom: positionFromBottom },
      ]}
    >
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    paddingVertical: dynamicHeight(10),
    paddingHorizontal: dynamicHeight(20),
    borderRadius: 8,
    zIndex: 9999,
    elevation: 5,
    opacity: 0.5,
  },
  text: {
    fontFamily: FONTS.lato_bold,
    fontSize: dynamicHeight(16),
    color: 'white',
  },
});
