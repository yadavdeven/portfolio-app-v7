import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import Colors from '../../constants/Colors';

type EyeIconProps = {
  visible: boolean;
  size?: number;
  color?: string;
};

const EyeIcon = ({
  visible,
  size = 22,
  color = Colors.grey_600,
}: EyeIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
      {!visible && (
        <Line
          x1={4}
          y1={4}
          x2={20}
          y2={20}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
};

export default EyeIcon;
