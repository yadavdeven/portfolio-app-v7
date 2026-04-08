// RectangleSkeletonLoader.tsx
import React from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  DimensionValue,
  StyleSheet,
} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Colors from '../../constants/Colors';
import { moderateScale } from 'react-native-size-matters';

type Props = {
  height: number;
  width?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export default function RectangleSkeletonLoader({
  height,
  width = '100%' as DimensionValue,
  radius = 16,
  style,
}: Props) {
  const border = moderateScale(radius);

  return (
    <View
      style={[
        styles.container,
        { height: moderateScale(height), width, borderRadius: border },
        style,
      ]}
    >
      <SkeletonPlaceholder
        backgroundColor={Colors.bg_900}
        highlightColor={Colors.bg_500}
        speed={1200}
      >
        <SkeletonPlaceholder.Item width="100%" height="100%" />
      </SkeletonPlaceholder>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Colors.bg_900,
  },
});
