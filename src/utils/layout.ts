import {Dimensions} from 'react-native';
import {initialWindowMetrics} from 'react-native-safe-area-context';

const {width, height} = Dimensions.get('window');

export const isTablet = width >= 768;

const insets = initialWindowMetrics?.insets ?? {top: 0, bottom: 0};

export const usableHeight = height - insets.top - insets.bottom;

// Export usable height if needed elsewhere
export const USABLE_HEIGHT = usableHeight;

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

export const dynamicHeight = (value: number): number => {
  const heightScale = usableHeight / BASE_HEIGHT;
  const widthScale = width / BASE_WIDTH;
  let averageScale = (heightScale + widthScale) / 2;

  if (isTablet) {
    averageScale *= 0.75;
  }

  // Apply a dampening factor to reduce jump between consecutive values
  const dampening = 0.85; // Reduce to ~85% of raw scale
  const effectiveScale = averageScale * dampening;

  return value * effectiveScale;
};
