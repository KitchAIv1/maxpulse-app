// Progress Bar Component for TriHabit
// Horizontal progress indicator

import React from 'react';
import { View, StyleSheet } from 'react-native';

interface BarProps {
  percent: number;
  color?: string;
  height?: number;
}

export const Bar: React.FC<BarProps> = ({ 
  percent, 
  color = 'rgba(255, 255, 255, 0.8)',
  height = 8 
}) => {
  const clampedPercent = Math.max(0, Math.min(100, percent * 100));

  return (
    <View style={[styles.container, { height }]}>
      <View 
        style={[
          styles.fill, 
          { 
            width: `${clampedPercent}%`,
            backgroundColor: color,
            height 
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative', // Ensure proper positioning
  },
  fill: {
    borderRadius: 4,
    position: 'absolute',
    top: 0,
    left: 0,
    maxWidth: '100%', // Ensure it never exceeds container width
  },
});
