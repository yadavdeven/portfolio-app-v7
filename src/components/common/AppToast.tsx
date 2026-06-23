import React, { useEffect } from 'react';
import { StyleSheet, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { dynamicHeight } from '../../utils/layout';
import { FONTS } from '../../utils/typography';
import Colors from '../../constants/Colors';

type AppToastProps = {
  text: string;
  type?: 'info' | 'error' | 'default';
  /** White surface with the type color applied to the text instead of the bg. */
  light?: boolean;
  onHide?: () => void;
  duration?: number; // ms
  positionFromBottom?: number;
};

const { height: DEVICE_HEIGHT } = Dimensions.get('window');
const ANIM_DURATION = 300;
const OFFSET = dynamicHeight(20);

export default function AppToast({
  text,
  type = 'default',
  light = false,
  onHide,
  duration = 3000, // default duration
  positionFromBottom = DEVICE_HEIGHT * 0.2,
}: AppToastProps) {
  const typeColor =
    type === 'info'
      ? '#FFB300'
      : type === 'error'
      ? Colors.error
      : Colors.primary_200;

  // Light variant flips it: white surface with the type color on the text.
  const bgColor = light ? Colors.white : typeColor;
  const textColor = light ? typeColor : Colors.white;

  // Drive the animation manually instead of using Reanimated's declarative
  // entering/exiting layout animations: those are unreliable on Android (the
  // toast freezes then pops off). Here we control opacity + translateY directly
  // and only call onHide() after the exit animation has actually finished.
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(OFFSET);

  useEffect(() => {
    // animate in
    opacity.value = withTiming(1, {
      duration: ANIM_DURATION,
      easing: Easing.out(Easing.ease),
    });
    translateY.value = withTiming(0, {
      duration: ANIM_DURATION,
      easing: Easing.out(Easing.ease),
    });

    // after the visible window, animate out then unmount
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, {
        duration: ANIM_DURATION,
        easing: Easing.in(Easing.ease),
      });
      translateY.value = withTiming(
        -OFFSET,
        { duration: ANIM_DURATION, easing: Easing.in(Easing.ease) },
        finished => {
          if (finished && onHide) scheduleOnRN(onHide);
        },
      );
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onHide, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        light && styles.lightContainer,
        { backgroundColor: bgColor, bottom: positionFromBottom },
        animatedStyle,
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
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
  },
  // White toasts need a hairline + softer shadow so they read against the screen.
  lightContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.bg_400,
    shadowColor: Colors.grey_500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    fontFamily: FONTS.lato_bold,
    fontSize: dynamicHeight(16),
  },
});
