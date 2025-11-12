// Life Score Breakdown Component
// Shows 4-pillar breakdown with percentages
// Reusable component for Life Score visualization

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';

interface LifeScoreBreakdownProps {
  breakdown: {
    steps: number;
    hydration: number;
    sleep: number;
    mood: number;
  };
}

const PILLAR_CONFIG = [
  {
    key: 'steps' as const,
    label: 'Steps',
    icon: 'footsteps',
    color: theme.colors.ringSteps,
  },
  {
    key: 'hydration' as const,
    label: 'Water',
    icon: 'water',
    color: theme.colors.ringHydration,
  },
  {
    key: 'sleep' as const,
    label: 'Sleep',
    icon: 'moon',
    color: theme.colors.ringSleep,
  },
  {
    key: 'mood' as const,
    label: 'Mood',
    icon: 'happy',
    color: theme.colors.ringMood,
  },
];

export const LifeScoreBreakdown: React.FC<LifeScoreBreakdownProps> = ({
  breakdown,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Progress</Text>
      <View style={styles.pillarsContainer}>
        {PILLAR_CONFIG.map((pillar) => {
          const percentage = breakdown[pillar.key];
          const safePercentage = Math.max(0, Math.min(100, percentage * 100));
          
          return (
            <View key={pillar.key} style={styles.pillarItem}>
              <View style={styles.pillarHeader}>
                <Icon 
                  name={pillar.icon} 
                  size={14} 
                  color={pillar.color} 
                  style={styles.pillarIcon}
                />
                <Text style={styles.pillarLabel}>{pillar.label}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarTrack}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${safePercentage}%`,
                        backgroundColor: pillar.color,
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.pillarPercentage, { color: pillar.color, marginLeft: theme.spacing.sm }]}>
                  {Math.round(safePercentage)}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.base,
    width: '100%',
  },
  title: {
    fontSize: theme.typography.xsmall,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  pillarsContainer: {
    width: '100%',
  },
  pillarItem: {
    width: '100%',
    marginBottom: theme.spacing.sm,
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  pillarIcon: {
    marginRight: theme.spacing.xs,
  },
  pillarLabel: {
    fontSize: theme.typography.xsmall,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  pillarPercentage: {
    fontSize: theme.typography.xsmall,
    fontWeight: theme.typography.weights.semibold,
    minWidth: 40,
    textAlign: 'right',
  },
});

