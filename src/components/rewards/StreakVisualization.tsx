// Streak Visualization Component
// Compact streak display for Life Score dashboard

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';

interface StreakVisualizationProps {
  currentStreak: number;
  longestStreak: number;
  nextMilestone: number;
  nextMilestoneBonus: number;
}

export const StreakVisualization: React.FC<StreakVisualizationProps> = ({
  currentStreak,
  longestStreak,
  nextMilestone,
  nextMilestoneBonus,
}) => {
  const progressToNext = Math.min(currentStreak / nextMilestone, 1);
  const isAtMilestone = currentStreak >= nextMilestone;
  
  // Determine streak intensity color
  const getStreakColor = (streak: number) => {
    if (streak >= 14) return '#FF6B35'; // Hot orange
    if (streak >= 7) return '#FF8E53'; // Medium orange
    if (streak >= 3) return '#FFB366'; // Light orange
    return theme.colors.ringMood; // Pink for starting streaks
  };

  const streakColor = getStreakColor(currentStreak);
  
  return (
    <View style={styles.container}>
      {/* Compact Inline Layout */}
      <View style={styles.streakRow}>
        {/* Current Streak */}
        <View style={styles.streakItem}>
          <View style={styles.iconCircle}>
            <Icon
              name="flame"
              size={20}
              color={currentStreak > 0 ? streakColor : theme.colors.textTertiary}
            />
          </View>
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Personal Best */}
        <View style={styles.streakItem}>
          <View style={styles.iconCircle}>
            <Icon
              name="trophy"
              size={20}
              color={theme.colors.ringSteps}
            />
          </View>
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{longestStreak}</Text>
            <Text style={styles.streakLabel}>personal best</Text>
          </View>
        </View>
      </View>
      
      {/* Progress Bar */}
      {!isAtMilestone ? (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              {currentStreak}/{nextMilestone} days to next milestone
            </Text>
            <Text style={styles.progressBonus}>+{nextMilestoneBonus} pts</Text>
          </View>
          <View style={styles.progressTrack}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${progressToNext * 100}%`,
                  backgroundColor: streakColor,
                }
              ]} 
            />
          </View>
        </View>
      ) : (
        <View style={styles.milestoneAchieved}>
          <Icon name="checkmark-circle" size={16} color={theme.colors.success} />
          <Text style={styles.milestoneText}>
            Milestone achieved! +{nextMilestoneBonus} points earned
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    ...theme.shadows.subtle,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.sm,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: theme.typography.large,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.large * 1.2,
  },
  streakLabel: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.xsmall * 1.2,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.sm,
  },
  progressSection: {
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  progressLabel: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
  },
  progressBonus: {
    fontSize: theme.typography.xsmall,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.ringMood,
  },
  progressTrack: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  milestoneAchieved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  milestoneText: {
    flex: 1,
    fontSize: theme.typography.xsmall,
    color: theme.colors.success,
    fontWeight: theme.typography.weights.medium,
  },
});