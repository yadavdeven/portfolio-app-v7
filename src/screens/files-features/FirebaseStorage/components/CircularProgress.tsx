import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../../../constants/Colors';
import { FONTS } from '../../../../utils/typography';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  percent: number; // 0..1
  size?: number;
  strokeWidth?: number;
}

// A circular progress ring with the percentage centred inside. The arc eases
// smoothly between progress updates via a reanimated shared value driving the
// circle's strokeDashoffset.
export default function CircularProgress({
  percent,
  size = moderateScale(40),
  strokeWidth = moderateScale(3),
}: Props) {
  const clamped = Math.min(1, Math.max(0, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(clamped, { duration: 200 });
  }, [clamped, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={Colors.bg_500}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={Colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          // Start the arc at 12 o'clock instead of 3 o'clock.
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.label}>
        <Text style={styles.percent}>{Math.round(clamped * 100)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    fontSize: moderateScale(10),
    fontFamily: FONTS.lato_bold,
    color: Colors.primary,
  },
});
