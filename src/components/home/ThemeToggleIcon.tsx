import React from 'react';
import { Image } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

type Props = {
  /** Render the sun (true) or the night-mode glyph (false). */
  isDark: boolean;
  size: number;
  color: string;
};

// In dark mode we show a Feather-style sun (tap to switch to light). In light
// mode we show the night-mode PNG glyph (tap to switch to dark) — tinted to the
// theme color so it stays consistent with the sun.
export default function ThemeToggleIcon({ isDark, size, color }: Props) {
  if (isDark) {
    // "Switch to light" sun glyph runs a touch large, so trim it by 20%.
    const sunSize = size * 0.74;
    return (
      <Svg
        width={sunSize}
        height={sunSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Circle cx={12} cy={12} r={5} />
        <Line x1={12} y1={1} x2={12} y2={3} />
        <Line x1={12} y1={21} x2={12} y2={23} />
        <Line x1={4.22} y1={4.22} x2={5.64} y2={5.64} />
        <Line x1={18.36} y1={18.36} x2={19.78} y2={19.78} />
        <Line x1={1} y1={12} x2={3} y2={12} />
        <Line x1={21} y1={12} x2={23} y2={12} />
        <Line x1={4.22} y1={19.78} x2={5.64} y2={18.36} />
        <Line x1={18.36} y1={5.64} x2={19.78} y2={4.22} />
      </Svg>
    );
  }

  return (
    <Image
      source={require('../../assets/images/global/night_mode3.png')}
      style={{ width: size, height: size, tintColor: color }}
      resizeMode="contain"
    />
  );
}
