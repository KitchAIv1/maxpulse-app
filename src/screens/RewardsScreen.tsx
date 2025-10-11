// Rewards Screen for TriHabit
// Shows points, streaks, badges, and progress

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Badge, Bar } from '../components';
import { useAppStore } from '../stores/appStore';
import { useLifeScore } from '../hooks/useAppSelectors';
import { theme } from '../utils/theme';
import { calAiCard } from '../utils/calAiStyles';

interface RewardsScreenProps {
  onBack: () => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({ onBack }) => {
  const { currentState, targets } = useAppStore();
  const { stepsPct, waterPct, sleepPct } = useLifeScore();

  // Mock rewards data (would come from backend in production)
  const mockRewards = {
    totalPoints: 1247,
    todayPoints: 85,
    weeklyProgress: 0.68, // 68% of weekly goal
    currentStreak: 5,
    longestStreak: 12,
    badges: [
      { id: '1', name: 'Hydration Hat-Trick', description: '3 days of hydration goals', icon: '💧', earned: true },
      { id: '2', name: 'Early Lights', description: '3 nights >90% sleep target', icon: '🌙', earned: true },
      { id: '3', name: 'Step Master', description: '7 days of step goals', icon: '👟', earned: false },
      { id: '4', name: 'Balanced Week', description: 'All three hit 5/7 days', icon: '⚖️', earned: false },
    ],
    todayBreakdown: [
      { type: 'Steps', points: 24, max: 40, pct: stepsPct },
      { type: 'Hydration', points: 30, max: 40, pct: waterPct },
      { type: 'Sleep', points: 30, max: 50, pct: sleepPct },
      { type: 'Daily Bonus', points: 0, max: 20, pct: 0 }, // Not earned yet
    ],
  };

  const allTargetsMet = stepsPct >= 1 && waterPct >= 1 && sleepPct >= 1;

  return (
    <View style={styles.gradient}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Rewards</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Points Summary */}
          <View style={styles.pointsCard}>
            <View style={styles.pointsHeader}>
              <View>
                <Text style={styles.pointsValue}>{mockRewards.totalPoints.toLocaleString()}</Text>
                <Text style={styles.pointsLabel}>Total Points</Text>
              </View>
              <View style={styles.weeklyProgress}>
                <Text style={styles.weeklyLabel}>Weekly Progress</Text>
                <Bar percent={mockRewards.weeklyProgress} height={6} />
                <Text style={styles.weeklyPercent}>{Math.round(mockRewards.weeklyProgress * 100)}%</Text>
              </View>
            </View>
          </View>

          {/* Today's Earnings */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Today's Earnings</Text>
            <View style={styles.earningsGrid}>
              {mockRewards.todayBreakdown.map((item, index) => (
                <View key={index} style={styles.earningItem}>
                  <Text style={styles.earningType}>{item.type}</Text>
                  <Text style={styles.earningPoints}>
                    {item.points}/{item.max} pts
                  </Text>
                  <Bar percent={item.points / item.max} height={4} />
                </View>
              ))}
            </View>
            
            {!allTargetsMet && (
              <View style={styles.bonusPrompt}>
                <Text style={styles.bonusText}>
                  Complete all 3 targets to earn +20 bonus points!
                </Text>
              </View>
            )}
            
            {allTargetsMet && (
              <View style={styles.bonusEarned}>
                <Text style={styles.bonusEarnedText}>
                  🎉 Daily completion bonus earned: +20 points!
                </Text>
              </View>
            )}
          </View>

          {/* Streak Status */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Streak Status</Text>
            <View style={styles.streakContainer}>
              <View style={styles.streakItem}>
                <Text style={styles.streakNumber}>{mockRewards.currentStreak}</Text>
                <Text style={styles.streakLabel}>Current Streak</Text>
                <Text style={styles.streakSubtext}>🔥 Keep it going!</Text>
              </View>
              <View style={styles.streakItem}>
                <Text style={styles.streakNumber}>{mockRewards.longestStreak}</Text>
                <Text style={styles.streakLabel}>Longest Streak</Text>
                <Text style={styles.streakSubtext}>Personal best</Text>
              </View>
            </View>
            
            <View style={styles.streakProgress}>
              <Text style={styles.streakProgressLabel}>Next milestone: 7-day streak (+30 pts)</Text>
              <Bar percent={mockRewards.currentStreak / 7} height={6} />
            </View>
          </View>

          {/* Badges */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Badges</Text>
            <View style={styles.badgesGrid}>
              {mockRewards.badges.map((badge) => (
                <View 
                  key={badge.id} 
                  style={[
                    styles.badgeItem,
                    !badge.earned && styles.badgeItemLocked
                  ]}
                >
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={[
                    styles.badgeName,
                    !badge.earned && styles.badgeNameLocked
                  ]}>
                    {badge.name}
                  </Text>
                  <Text style={[
                    styles.badgeDescription,
                    !badge.earned && styles.badgeDescriptionLocked
                  ]}>
                    {badge.description}
                  </Text>
                  {badge.earned && (
                    <Badge label="Earned" variant="success" />
                  )}
                  {!badge.earned && (
                    <Badge label="Locked" />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Next Badge Progress */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Next Badge</Text>
            <View style={styles.nextBadgeContainer}>
              <Text style={styles.nextBadgeIcon}>👟</Text>
              <View style={styles.nextBadgeInfo}>
                <Text style={styles.nextBadgeName}>Step Master</Text>
                <Text style={styles.nextBadgeDescription}>
                  Complete step goals for 7 days (5/7 completed)
                </Text>
                <Bar percent={5/7} height={6} />
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: 50,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.xsmall,
  },
  backButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.medium,
  },
  title: {
    fontSize: theme.typography.xlarge,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 60,
  },
  pointsCard: {
    ...calAiCard.base,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.base,
    ...theme.shadows.medium,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: theme.typography.xxlarge,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  pointsLabel: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
  },
  weeklyProgress: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  weeklyLabel: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  weeklyPercent: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  sectionCard: {
    ...calAiCard.base,
    marginBottom: theme.spacing.base,
  },
  sectionTitle: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  earningItem: {
    width: '47%',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  earningType: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  earningPoints: {
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xsmall,
  },
  bonusPrompt: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.warning + '20',
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  bonusText: {
    fontSize: theme.typography.small,
    color: theme.colors.warning,
    textAlign: 'center',
    fontWeight: theme.typography.weights.medium,
  },
  bonusEarned: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.success + '20',
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  bonusEarnedText: {
    fontSize: theme.typography.small,
    color: theme.colors.success,
    textAlign: 'center',
    fontWeight: theme.typography.weights.medium,
  },
  streakContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  streakNumber: {
    fontSize: theme.typography.xxlarge,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: theme.typography.small,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.medium,
    marginBottom: 4,
  },
  streakSubtext: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
  },
  streakProgress: {
    marginTop: theme.spacing.xsmall,
  },
  streakProgressLabel: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xsmall,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeItem: {
    width: '47%',
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    ...theme.shadows.subtle,
  },
  badgeItemLocked: {
    opacity: 0.6,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xsmall,
  },
  badgeName: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: theme.colors.textTertiary,
  },
  badgeDescription: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xsmall,
  },
  badgeDescriptionLocked: {
    color: theme.colors.textTertiary,
  },
  nextBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.base,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  nextBadgeIcon: {
    fontSize: 40,
  },
  nextBadgeInfo: {
    flex: 1,
  },
  nextBadgeName: {
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  nextBadgeDescription: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xsmall,
  },
  bottomSpacer: {
    height: theme.spacing.lg,
  },
});
