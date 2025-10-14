// Mood Ring Component
// Animated circular progress ring for mood visualization

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../../utils/theme';

interface MoodRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0-1
  color: string;
  isSelected?: boolean;
  animated?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const MoodRing: React.FC<MoodRingProps> = ({
  size,
  strokeWidth,
  progress,
  color,
  isSelected = false,
  animated = true,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: theme.animation.normal, // Reduced from slow to normal for snappier feel
        useNativeDriver: false,
        isInteraction: false, // Don't block other interactions
      }).start();
    } else {
      animatedValue.setValue(progress);
    }
  }, [progress, animated, animatedValue]);

  const strokeDasharray = circumference;
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const ringOpacity = animatedValue.interpolate({
    inputRange: [0, 0.1, 1],
    outputRange: [0.3, 0.6, 1],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]} renderToHardwareTextureAndroid={true}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progress > 0 ? `${color}20` : theme.colors.border} // Use color with 20% opacity when there's progress
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
        />
        
        {/* Progress ring */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          opacity={ringOpacity}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      {/* Selection indicator */}
      {isSelected && (
        <View style={[
          styles.selectionRing,
          {
            width: size + 8,
            height: size + 8,
            borderRadius: (size + 8) / 2,
            borderColor: color,
          }
        ]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  selectionRing: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'solid',
  },
});
