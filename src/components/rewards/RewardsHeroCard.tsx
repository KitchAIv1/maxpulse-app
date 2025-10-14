// Rewards Hero Card Component
// Large points display with animated weekly progress ring

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../../utils/theme';

interface RewardsHeroCardProps {
  totalPoints: number;
  weeklyProgress: number; // 0-1
  todayPoints: number;
  animated?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const RewardsHeroCard: React.FC<RewardsHeroCardProps> = ({
  totalPoints,
  weeklyProgress,
  todayPoints,
  animated = true,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  const size = 100; // Optimized size for left section
  const strokeWidth = 5; // Further reduced for cleaner look with smaller text
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    if (animated) {
      // Animate ring progress
      Animated.timing(animatedValue, {
        toValue: weeklyProgress,
        duration: theme.animation.slow * 2,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(weeklyProgress);
    }
  }, [weeklyProgress, animated, animatedValue]);

  const strokeDasharray = circumference;
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });


  return (
    <View style={styles.container} renderToHardwareTextureAndroid={true}>
      <View style={styles.contentRow}>
        {/* Left side: Ring and Total Points */}
        <View style={styles.leftSection}>
          <View style={styles.ringContainer}>
            <Svg width={size} height={size} style={styles.svg}>
              {/* Background track */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={theme.colors.border}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeLinecap="round"
              />
              
              {/* Progress ring */}
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={theme.colors.ringMood} // Pink for achievements
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </Svg>
            
            {/* Center content - only total points */}
            <View style={styles.centerContent}>
              <Text style={styles.pointsValue}>
                {totalPoints.toLocaleString()}
              </Text>
              <Text style={styles.pointsLabel}>Total Points</Text>
            </View>
          </View>
        </View>
        
        {/* Right side: Progress info */}
        <View style={styles.rightSection}>
          {todayPoints > 0 && (
            <Text style={styles.todayPoints}>+{todayPoints} today</Text>
          )}
          <Text style={styles.progressLabel}>Weekly Progress</Text>
          <Text style={styles.progressPercent}>
            {Math.round(weeklyProgress * 100)}% complete
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.xl, // Increased to xl for more inward push
    marginBottom: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Changed from space-between to center for more inward positioning
    gap: theme.spacing.base, // Increased slightly from sm to base for balanced spacing
  },
  leftSection: {
    alignItems: 'center',
    flex: 0, // Don't grow, just fit content
  },
  rightSection: {
    flex: 0, // Changed from 1 to 0 to not expand, just fit content
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: theme.spacing.base, // Increased back to base for proper spacing between sections
  },
  ringContainer: {
    position: 'relative',
    width: 100, // Reduced from 140 to make room for right section
    height: 100, // Reduced from 140 to make room for right section
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: theme.typography.medium, // Further reduced from large to medium (18px)
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.tiny,
    textAlign: 'center',
  },
  pointsLabel: {
    fontSize: theme.typography.tiny, // Further reduced from xsmall to tiny (10px)
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  todayPoints: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.ringMood,
    marginBottom: theme.spacing.xs, // Reduced from sm for tighter spacing
  },
  progressLabel: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.tiny, // Reduced from xs for tighter spacing
  },
  progressPercent: {
    fontSize: theme.typography.medium, // Reduced from regular to medium for better proportion
    fontWeight: theme.typography.weights.bold, // Increased from semibold for emphasis
    color: theme.colors.textPrimary, // Changed from textSecondary to textPrimary for emphasis
  },
});
