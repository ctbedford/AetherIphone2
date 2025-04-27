import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from 'tamagui';

interface ProgressRingProps {
  progress: number;  // 0 to 1 (or 0 to 100 as percentage)
  size?: number;     // Diameter of the circle
  strokeWidth?: number;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
}

/**
 * A circular progress indicator component
 */
export default function ProgressRing({
  progress: rawProgress,
  size = 60,
  strokeWidth = 6,
  primaryColor,
  secondaryColor,
  backgroundColor = 'transparent',
}: ProgressRingProps) {
  const theme = useTheme();
  
  // Normalize progress to 0-1 range
  const progress = rawProgress > 1 ? rawProgress / 100 : rawProgress;
  
  // Calculate radius and other dimensions
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  // Use theme colors if not explicitly provided
  const primary = primaryColor || theme.blue10.val;
  const secondary = secondaryColor || theme.gray4.val;

  return (
    <View style={{ width: size, height: size, backgroundColor }}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          stroke={secondary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <Circle
          stroke={primary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`} // Start from top
        />
      </Svg>
    </View>
  );
}
