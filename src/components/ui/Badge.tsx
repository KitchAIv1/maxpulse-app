// Badge Component for TriHabit
// Small status indicators and labels

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: 'rgba(34, 197, 94, 0.2)', // green-500 with opacity
          borderColor: 'rgba(34, 197, 94, 0.3)',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.2)', // amber-500 with opacity
          borderColor: 'rgba(245, 158, 11, 0.3)',
        };
      case 'info':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.2)', // blue-500 with opacity
          borderColor: 'rgba(59, 130, 246, 0.3)',
        };
      default:
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        };
    }
  };

  return (
    <View style={[styles.badge, getVariantStyles()]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
});
