import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Colors from '../../constants/Colors';

type LoaderProps = {
  size?: number;
  color?: string;
  count?: number; // number of spokes; iOS uses 12
};

/**
 * iOS UIActivityIndicator-style loader.
 * A ring of fading spokes that rotates continuously.
 *
 * Performance notes:
 * - Only ONE value is animated (rotation), via a single worklet on the UI
 *   thread — the whole ring spins as one transform, not 12 animations.
 * - The animation never triggers a React re-render (it lives in a shared
 *   value), so the spinning is fully off the JS thread and stays smooth
 *   even when JS is busy (which is exactly when a loader is shown).
 */
const Loader = ({
  size = 24,
  color = Colors.white,
  count = 12,
}: LoaderProps) => {
  // Shared value drives the rotation on the UI thread.
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Spin 0 → 360 forever, linearly (no easing ramp = constant speed).
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1, // infinite repeats
      false, // don't reverse — always spins the same direction
    );
  }, [rotation]);

  // Maps the shared rotation value to a transform; runs on the UI thread.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Spoke dimensions derived from size (kept identical to original UI).
  const lineWidth = Math.max(2, size * 0.1);
  const lineHeight = size * 0.26;

  /**
   * The spokes are static — only the container rotates — so we build them
   * once and reuse, instead of recreating 12 Views on every render.
   * Recomputed only when size/color/count actually change.
   */
  const spokes = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i; // even spacing around the circle
        const opacity = (i + 1) / count; // fade around the ring (the "tail")
        return (
          // Full-size wrapper rotated to the spoke's angle; the spoke sits
          // at the top edge (centered horizontally) → places it on the ring.
          <View
            key={i}
            style={[
              StyleSheet.absoluteFill,
              styles.lineWrapper,
              { transform: [{ rotate: `${angle}deg` }] },
            ]}
          >
            <View
              style={{
                width: lineWidth,
                height: lineHeight,
                borderRadius: lineWidth / 2,
                backgroundColor: color,
                opacity,
              }}
            />
          </View>
        );
      }),
    [color, count, lineHeight, lineWidth],
  );

  return (
    <Animated.View
      style={[styles.container, { width: size, height: size }, animatedStyle]}
    >
      {spokes}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineWrapper: {
    alignItems: 'center', // center the spoke horizontally in its wrapper
    justifyContent: 'flex-start', // push it to the top edge → onto the ring
  },
});

// Memoized so it doesn't re-render when a parent (e.g. a button) re-renders
// with the same size/color props.
export default React.memo(Loader);
