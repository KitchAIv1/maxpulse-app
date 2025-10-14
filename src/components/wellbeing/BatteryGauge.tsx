// Battery Gauge Component
// Circular battery-style gauge for Life Score visualization

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { BatteryGaugeProps, LifeScoreColor } from '../../types/wellbeing';

export const BatteryGauge: React.FC<BatteryGaugeProps> = ({
  score,
  size = 200,
  animated = true,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  
  // Calculate stroke dash offset for progress
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const strokeDashoffset = circumference * (1 - progress);

  // Determine color based on score
  const getScoreColor = (score: number): LifeScoreColor => {
    if (score >= 90) return 'blue';
    if (score >= 70) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
  };

  const getColorValues = (color: LifeScoreColor) => {
    switch (color) {
      case 'blue':
        return { primary: '#3B82F6', secondary: '#1D4ED8', bg: 'rgba(59, 130, 246, 0.1)' };
      case 'green':
        return { primary: '#10B981', secondary: '#059669', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'yellow':
        return { primary: '#F59E0B', secondary: '#D97706', bg: 'rgba(245, 158, 11, 0.1)' };
      case 'red':
        return { primary: '#EF4444', secondary: '#DC2626', bg: 'rgba(239, 68, 68, 0.1)' };
    }
  };

  const scoreColor = getScoreColor(score);
  const colors = getColorValues(scoreColor);

  // Animation effect
  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(progress);
    }
  }, [progress, animated, animatedValue]);

  // Get score level text
  const getScoreLevel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* SVG Progress Circle */}
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="batteryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.secondary} />
          </LinearGradient>
        </Defs>
        
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E5E5"
          strokeWidth={8}
          fill="none"
        />
        
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#batteryGradient)"
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        <Text style={[styles.scoreText, { color: colors.primary }]}>
          {Math.round(score)}
        </Text>
        <Text style={styles.percentText}>%</Text>
        <Text style={styles.levelText}>{getScoreLevel(score)}</Text>
        
        {/* Battery icon indicator */}
        <View style={[styles.batteryIcon, { borderColor: colors.primary }]}>
          <View 
            style={[
              styles.batteryFill, 
              { 
                backgroundColor: colors.primary,
                height: `${progress * 100}%`
              }
            ]} 
          />
          <View style={[styles.batteryTip, { backgroundColor: colors.primary }]} />
        </View>
      </View>

      {/* Charging animation effect */}
      {animated && progress > 0 && (
        <View style={styles.chargingEffect}>
          <Text style={[styles.chargingText, { color: colors.primary }]}>⚡</Text>
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
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 52,
  },
  percentText: {
    fontSize: 16,
    color: '#8A8A8A',
    fontWeight: '500',
    marginTop: -8,
  },
  levelText: {
    fontSize: 14,
    color: '#6A6A6A',
    fontWeight: '500',
    marginTop: 4,
  },
  batteryIcon: {
    width: 20,
    height: 12,
    borderWidth: 1.5,
    borderRadius: 2,
    marginTop: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  batteryFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 1,
  },
  batteryTip: {
    position: 'absolute',
    top: 3,
    right: -3,
    width: 2,
    height: 6,
    borderRadius: 1,
  },
  chargingEffect: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 2,
  },
  chargingText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
