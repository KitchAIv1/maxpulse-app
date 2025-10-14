// Streak Visualization Component
// Professional streak display with progress rings

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MoodRing } from '../mood/MoodRing';
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
      <Text style={styles.title}>Streak Status</Text>
      
      <View style={styles.streakContainer}>
        {/* Current Streak */}
        <View style={styles.streakCard}>
          <View style={styles.streakRingContainer}>
            <MoodRing
              size={80}
              strokeWidth={8}
              progress={Math.min(currentStreak / 14, 1)} // Max visual at 14 days
              color={streakColor}
              isSelected={currentStreak > 0}
              animated={true}
            />
            <View style={styles.streakIconContainer}>
              <Icon
                name="flame"
                size={24}
                color={currentStreak > 0 ? streakColor : theme.colors.textTertiary}
              />
            </View>
          </View>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Current Streak</Text>
          <Text style={styles.streakSubtext}>
            {currentStreak > 0 ? 'Keep it going!' : 'Start today!'}
          </Text>
        </View>
        
        {/* Longest Streak */}
        <View style={styles.streakCard}>
          <View style={styles.streakRingContainer}>
            <MoodRing
              size={80}
              strokeWidth={8}
              progress={1} // Always full for personal best
              color={theme.colors.ringSteps} // Black for achievement
              isSelected={true}
              animated={true}
            />
            <View style={styles.streakIconContainer}>
              <Icon
                name="trophy"
                size={24}
                color={theme.colors.ringSteps}
              />
            </View>
          </View>
          <Text style={styles.streakNumber}>{longestStreak}</Text>
          <Text style={styles.streakLabel}>Personal Best</Text>
          <Text style={styles.streakSubtext}>Your record</Text>
        </View>
      </View>
      
      {/* Next Milestone Progress */}
      {!isAtMilestone && (
        <View style={styles.milestoneContainer}>
          <View style={styles.milestoneHeader}>
            <Text style={styles.milestoneLabel}>
              Next milestone: {nextMilestone}-day streak
            </Text>
            <Text style={styles.milestoneBonus}>+{nextMilestoneBonus} pts</Text>
          </View>
          
          <View style={styles.milestoneProgress}>
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
            <Text style={styles.progressText}>
              {currentStreak}/{nextMilestone} days
            </Text>
          </View>
        </View>
      )}
      
      {/* Milestone Achieved */}
      {isAtMilestone && (
        <View style={styles.milestoneAchieved}>
          <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
          <Text style={styles.milestoneAchievedText}>
            Milestone achieved! +{nextMilestoneBonus} bonus points earned
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.subtle,
  },
  title: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.base,
  },
  streakContainer: {
    flexDirection: 'row',
    gap: theme.spacing.base,
    marginBottom: theme.spacing.base,
  },
  streakCard: {
    flex: 1, alignItems: 'center', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border,
  },
  streakRingContainer: { position: 'relative', marginBottom: theme.spacing.sm },
  streakIconContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },
  streakNumber: {
    fontSize: theme.typography.xlarge, fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary, marginBottom: theme.spacing.xs,
  },
  streakLabel: {
    fontSize: theme.typography.small, fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary, marginBottom: theme.spacing.xs,
  },
  streakSubtext: {
    fontSize: theme.typography.xsmall, color: theme.colors.textSecondary, textAlign: 'center',
  },
  milestoneContainer: {
    padding: theme.spacing.sm, borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border,
  },
  milestoneHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  milestoneLabel: { fontSize: theme.typography.small, color: theme.colors.textSecondary },
  milestoneBonus: {
    fontSize: theme.typography.small, fontWeight: theme.typography.weights.semibold,
    color: theme.colors.ringMood,
  },
  milestoneProgress: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  progressTrack: {
    flex: 1, height: 6, backgroundColor: theme.colors.border, borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: {
    fontSize: theme.typography.xsmall, color: theme.colors.textSecondary, minWidth: 50,
  },
  milestoneAchieved: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm, backgroundColor: `${theme.colors.success}15`,
    borderWidth: 1, borderColor: `${theme.colors.success}40`,
  },
  milestoneAchievedText: {
    flex: 1, fontSize: theme.typography.small, color: theme.colors.success,
    fontWeight: theme.typography.weights.medium,
  },
});
