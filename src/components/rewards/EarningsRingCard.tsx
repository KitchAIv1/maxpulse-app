// Earnings Ring Card Component
// Individual health metric with ring progress and points

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MoodRing } from '../mood/MoodRing';
import { theme } from '../../utils/theme';

interface EarningsRingCardProps {
  type: 'Steps' | 'Hydration' | 'Sleep' | 'Daily Bonus';
  points: number;
  maxPoints: number;
  progress: number; // 0-1
  isCompleted?: boolean;
}

const EARNINGS_CONFIG = {
  'Steps': {
    color: theme.colors.ringSteps,
    icon: 'footsteps',
    iconSize: 20,
  },
  'Hydration': {
    color: theme.colors.ringHydration,
    icon: 'water',
    iconSize: 18,
  },
  'Sleep': {
    color: theme.colors.ringSleep,
    icon: 'moon',
    iconSize: 18,
  },
  'Daily Bonus': {
    color: theme.colors.ringMood,
    icon: 'gift',
    iconSize: 18,
  },
} as const;

export const EarningsRingCard: React.FC<EarningsRingCardProps> = ({
  type,
  points,
  maxPoints,
  progress,
  isCompleted = false,
}) => {
  const config = EARNINGS_CONFIG[type];
  const progressValue = Math.min(progress, 1); // Cap at 100%
  
  // Show minimum visual progress for better UX
  const displayProgress = progressValue > 0 ? Math.max(progressValue, 0.05) : 0;
  
  return (
    <View style={[
      styles.container,
      isCompleted && styles.containerCompleted
    ]}>
      <View style={styles.ringContainer}>
        <MoodRing
          size={60}
          strokeWidth={6}
          progress={displayProgress}
          color={config.color}
          isSelected={isCompleted}
          animated={true}
        />
        <View style={styles.iconContainer}>
          <Icon
            name={config.icon}
            size={config.iconSize}
            color={progressValue > 0 ? config.color : theme.colors.textSecondary} // Show color when there's any progress
          />
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.typeLabel}>{type}</Text>
        <Text style={[
          styles.pointsText,
          isCompleted && { color: config.color }
        ]}>
          {points}/{maxPoints} pts
        </Text>
        <Text style={styles.progressText}>
          {progressValue > 0 ? Math.max(Math.round(progressValue * 100), 1) : 0}%
        </Text>
      </View>
      
      {isCompleted && (
        <View style={[styles.completedBadge, { backgroundColor: config.color }]}>
          <Icon name="checkmark" size={12} color={theme.colors.cardBackground} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base, // Increased from sm to base for better touch targets
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
    minHeight: 130, // Increased from 120 for better proportions
    ...theme.shadows.subtle,
  },
  containerCompleted: {
    ...theme.shadows.soft,
  },
  ringContainer: {
    position: 'relative',
    marginBottom: theme.spacing.xs,
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
  contentContainer: {
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: theme.typography.xsmall,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.tiny,
    textAlign: 'center',
  },
  pointsText: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.tiny,
  },
  progressText: {
    fontSize: theme.typography.tiny,
    color: theme.colors.textTertiary,
  },
  completedBadge: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
