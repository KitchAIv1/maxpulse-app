// Cal AI Ring Component
// Single ring with light gray background track and black progress arc
// Supports animated percentage values for smooth transitions

import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CalAiRingProps {
  percentage: number | Animated.Value; // 0 to 1, can be animated
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
  const center = size / 2;

  // Handle both static and animated percentages
  const isAnimated = percentage instanceof Animated.Value;
  
  let strokeDashoffset: number | Animated.AnimatedInterpolation<number>;
  
  if (isAnimated) {
    // Interpolate animated value to strokeDashoffset
    strokeDashoffset = percentage.interpolate({
      inputRange: [0, 1],
      outputRange: [circumference, 0],
    });
  } else {
    // Static calculation
    const clampedPercentage = Math.max(0, Math.min(1, percentage));
    strokeDashoffset = circumference * (1 - clampedPercentage);
  }

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
        
        {/* Progress arc - use AnimatedCircle when percentage is animated */}
        {isAnimated ? (
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={accentColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        ) : (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={accentColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset as number}
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}
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
