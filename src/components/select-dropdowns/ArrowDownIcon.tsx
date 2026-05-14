import React from 'react';
import Svg, { Path } from 'react-native-svg';
import Colors from '../../constants/Colors';

type ArrowDownIconProps = {
  size?: number;
  color?: string;
};

const ArrowDownIcon = ({
  size = 20,
  color = Colors.primary,
}: ArrowDownIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ArrowDownIcon;
