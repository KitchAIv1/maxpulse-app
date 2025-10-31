// Life Score Dashboard Modal
// Simplified Life Score overview with streaks and achievements

import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { WellbeingDashboardProps } from '../../types/wellbeing';
import { BatteryGauge } from './BatteryGauge';
import { StreakVisualization } from '../rewards/StreakVisualization';
import { AchievementBadges } from '../rewards/AchievementBadges';
import { theme } from '../../utils/theme';

export const WellbeingDashboard: React.FC<WellbeingDashboardProps> = ({
  visible,
  onClose,
  currentScore,
  breakdown,
  onNavigateToModule,
}) => {

  // Mock data
  const mockStreakData = { currentStreak: 5, longestStreak: 12, nextMilestone: 7, nextMilestoneBonus: 50 };
  const mockBadges = [
    { id: 'hydration_week', name: 'Hydration Hero', description: 'Hit hydration target 7 days in a row', icon: 'water', earned: true, category: 'hydration' as const, progress: undefined },
    { id: 'early_bird', name: 'Early Bird', description: 'Get 8+ hours of sleep for 5 nights', icon: 'moon', earned: false, progress: 0.6, category: 'sleep' as const },
    { id: 'step_master', name: 'Step Master', description: 'Reach 10,000 steps in a single day', icon: 'footsteps', earned: true, category: 'steps' as const, progress: undefined },
    { id: 'balanced_life', name: 'Balanced Life', description: 'Hit all targets in one day', icon: 'checkmark-circle', earned: false, progress: 0.8, category: 'balanced' as const },
    { id: 'consistency_king', name: 'Consistency King', description: 'Maintain 80%+ Life Score for 14 days', icon: 'trophy', earned: false, progress: 0, category: 'balanced' as const },
    { id: 'wellness_warrior', name: 'Wellness Warrior', description: 'Complete 30 days of tracking', icon: 'shield', earned: false, progress: 0.3, category: 'balanced' as const },
  ];


  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} translucent={false} />
        <View style={styles.background}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Life Score</Text>
              <Text style={styles.headerSubtitle}>Your wellness overview</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Life Score & Streak - Two Column Layout */}
            <View style={styles.twoColumnLayout}>
              {/* Left Column - Life Score */}
              <View style={styles.lifeScoreContainer}>
                <BatteryGauge score={currentScore} size={160} animated />
              </View>

              {/* Right Column - Streak Info */}
              <View style={styles.rightColumn}>
                {/* Day Streak Card */}
                <View style={styles.dayStreakCard}>
                  <Icon name="flame" size={24} color="#FF6B35" style={styles.streakIcon} />
                  <Text style={styles.streakTitle} numberOfLines={1} adjustsFontSizeToFit>DAY STREAK</Text>
                  <Text style={styles.streakValue}>{mockStreakData.currentStreak}</Text>
                  <Text style={styles.streakLabel} numberOfLines={1}>days in a row</Text>
                </View>

                {/* Personal Best Card */}
                <View style={styles.personalBestCard}>
                  <Icon name="trophy" size={24} color="#FFD700" style={styles.streakIcon} />
                  <Text style={styles.streakTitle} numberOfLines={1} adjustsFontSizeToFit>BEST</Text>
                  <Text style={styles.streakValue}>{mockStreakData.longestStreak}</Text>
                  <Text style={styles.streakLabel} numberOfLines={1}>days total</Text>
                </View>
              </View>
            </View>

            {/* Days to Next Milestone - Simplified without progress bar */}
            <View style={styles.milestoneSection}>
              <View style={styles.milestoneCard}>
                <View style={styles.milestoneHeader}>
                  <Icon name="flag" size={14} color={theme.colors.ringMood} />
                  <Text style={styles.milestoneText}>
                    {mockStreakData.nextMilestone - mockStreakData.currentStreak} days until next milestone
                  </Text>
                </View>
                <Text style={styles.milestoneBonus}>+{mockStreakData.nextMilestoneBonus} bonus points</Text>
              </View>
            </View>

            {/* Achievements */}
            <AchievementBadges badges={mockBadges} />

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: theme.spacing.base, paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.cardBackground,
  },
  headerTitle: {
    fontSize: theme.typography.medium, fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.typography.xsmall, color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 36, height: 36, borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background, alignItems: 'center',
    justifyContent: 'center', ...theme.shadows.subtle,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.base,
    paddingBottom: theme.spacing.base,
  },
  // Two-column layout
  twoColumnLayout: {
    flexDirection: 'row',
    alignItems: 'stretch', // Ensure both columns have same height
    gap: theme.spacing.base,
    marginBottom: theme.spacing.base,
  },
  // Left column - Life Score (main highlight)
  lifeScoreContainer: {
    flex: 1.5, // Further decreased width for more compact design
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180, // Decreased to 180px
    ...theme.shadows.subtle,
  },
  // Right column - Compact streak cards
  rightColumn: {
    flex: 1,
    justifyContent: 'space-between', // Distribute cards evenly
    gap: theme.spacing.sm,
  },
  // Day Streak Card
  dayStreakCard: {
    flex: 1, // Take equal space in right column
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.sm, // Reduced horizontal padding to prevent text wrapping
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
    minHeight: 120, // Ensure consistent card height
    ...theme.shadows.subtle,
  },
  // Personal Best Card
  personalBestCard: {
    flex: 1, // Take equal space in right column
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.sm, // Reduced horizontal padding to prevent text wrapping
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
    minHeight: 120, // Ensure consistent card height
    ...theme.shadows.subtle,
  },
  streakIcon: {
    marginBottom: theme.spacing.sm,
  },
  streakTitle: {
    fontSize: theme.typography.tiny, // Reduced from xsmall to tiny
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm, // Increased spacing
    textAlign: 'center',
  },
  streakValue: {
    fontSize: theme.typography.medium, // Decreased - should not compete with Life Score
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.medium * 1.2,
    marginBottom: theme.spacing.xs, // Add space before label
  },
  streakLabel: {
    fontSize: theme.typography.tiny,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: theme.typography.tiny * 1.2,
  },
  // Milestone section
  milestoneSection: {
    marginBottom: theme.spacing.lg,
  },
  milestoneCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  milestoneText: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
  },
  milestoneBonus: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.ringMood,
  },
  bottomSpacer: { height: theme.spacing.xl },
});
