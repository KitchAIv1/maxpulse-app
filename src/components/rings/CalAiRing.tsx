// Cal AI Ring Component
// Single ring with light gray background track and black progress arc

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CalAiRingProps {
  percentage: number; // 0 to 1
  size?: number; // diameter in pixels
  strokeWidth?: number;
  accentColor?: string;
  centerContent?: React.ReactNode;
}

export const CalAiRing: React.FC<CalAiRingProps> = ({
  percentage,
  size = 150,
  strokeWidth = 7,
  accentColor = '#000000',
  centerContent,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - Math.max(0, Math.min(1, percentage)));
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#EDEDED"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Progress arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={accentColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{
            transition: 'stroke-dashoffset 0.3s ease-in-out',
          }}
        />
      </Svg>
      
      {/* Center content */}
      {centerContent && (
        <View style={styles.centerContent}>
          {centerContent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});
