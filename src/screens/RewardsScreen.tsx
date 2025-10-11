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
import { LinearGradient } from 'expo-linear-gradient';
import { Badge, Bar } from '../components';
import { useAppStore } from '../stores/appStore';
import { useLifeScore } from '../hooks/useAppSelectors';

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
    <LinearGradient
      colors={['#047857', '#065f46', '#1f2937']}
      style={styles.gradient}
    >
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
      </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 50, // Account for status bar
    paddingBottom: 100, // Account for bottom navigation
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  headerSpacer: {
    width: 60,
  },
  pointsCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  pointsLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  weeklyProgress: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  weeklyLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  weeklyPercent: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  earningItem: {
    width: '47%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  earningType: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  earningPoints: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  bonusPrompt: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  bonusText: {
    fontSize: 14,
    color: 'rgba(245, 158, 11, 1)',
    textAlign: 'center',
    fontWeight: '500',
  },
  bonusEarned: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  bonusEarnedText: {
    fontSize: 14,
    color: 'rgba(34, 197, 94, 1)',
    textAlign: 'center',
    fontWeight: '500',
  },
  streakContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 4,
  },
  streakSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  streakProgress: {
    marginTop: 8,
  },
  streakProgressLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeItem: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  badgeItemLocked: {
    opacity: 0.6,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  badgeDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeDescriptionLocked: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  nextBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  nextBadgeIcon: {
    fontSize: 40,
  },
  nextBadgeInfo: {
    flex: 1,
  },
  nextBadgeName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  nextBadgeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  bottomSpacer: {
    height: 24,
  },
});
