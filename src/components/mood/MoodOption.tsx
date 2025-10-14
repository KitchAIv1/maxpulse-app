// Mood Option Component
// Individual mood selection card with ring and icon

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/Ionicons';
import { MoodRing } from './MoodRing';
import { theme } from '../../utils/theme';
import { MoodLevel } from '../../types';

interface MoodOptionProps {
  level: MoodLevel;
  label: string;
  description: string;
  isSelected: boolean;
  onPress: () => void;
}

const MOOD_CONFIG = {
  5: { 
    color: '#4CAF50', // Green - excellent
    icon: 'trending-up',
    progress: 1.0,
  },
  4: { 
    color: '#8BC34A', // Light green - good
    icon: 'happy-outline',
    progress: 0.8,
  },
  3: { 
    color: theme.colors.ringMood, // Pink - neutral (using mood ring color)
    icon: 'remove-outline',
    progress: 0.6,
  },
  2: { 
    color: '#FF9800', // Orange - low
    icon: 'trending-down',
    progress: 0.4,
  },
  1: { 
    color: '#F44336', // Red - poor
    icon: 'sad-outline',
    progress: 0.2,
  },
} as const;

export const MoodOption: React.FC<MoodOptionProps> = ({
  level,
  label,
  description,
  isSelected,
  onPress,
}) => {
  const config = MOOD_CONFIG[level];
  
  const handlePress = () => {
    // Add haptic feedback for better UX
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available on this platform
    }
    onPress();
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        { borderColor: isSelected ? config.color : theme.colors.border }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.ringContainer}>
        <MoodRing
          size={60}
          strokeWidth={6}
          progress={isSelected ? config.progress : 0}
          color={config.color}
          isSelected={isSelected}
          animated={true}
        />
        <View style={styles.iconContainer}>
          <Icon
            name={config.icon}
            size={24}
            color={isSelected ? config.color : theme.colors.textSecondary}
          />
        </View>
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[
          styles.label,
          { color: isSelected ? config.color : theme.colors.textPrimary }
        ]}>
          {label}
        </Text>
        <Text style={styles.description}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    minHeight: 140,
    ...theme.shadows.subtle,
  },
  containerSelected: {
    ...theme.shadows.soft,
  },
  ringContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  description: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.tight * theme.typography.xsmall,
  },
});
