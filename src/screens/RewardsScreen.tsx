// Rewards Screen for TriHabit
// Modern rewards interface with Cal AI design language

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  RewardsHeroCard,
  TodayEarningsGrid,
  StreakVisualization,
  AchievementBadges,
} from '../components/rewards';
import { useAppStore } from '../stores/appStore';
import { useLifeScore } from '../hooks/useAppSelectors';
import { theme } from '../utils/theme';

interface RewardsScreenProps {
  onBack: () => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({ onBack }) => {
  const { currentState, targets } = useAppStore();
  const { stepsPct, waterPct, sleepPct } = useLifeScore();

  const handleBackPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available on this platform
    }
    onBack();
  };

  // Mock rewards data (would come from backend in production)
  const mockRewards = {
    totalPoints: 1247,
    todayPoints: 85,
    weeklyProgress: 0.68, // 68% of weekly goal
    currentStreak: 5,
    longestStreak: 12,
    badges: [
      { 
        id: '1', 
        name: 'Hydration Hat-Trick', 
        description: '3 days of hydration goals', 
        icon: 'water', 
        earned: true,
        category: 'hydration' as const
      },
      { 
        id: '2', 
        name: 'Early Lights', 
        description: '3 nights >90% sleep target', 
        icon: 'moon', 
        earned: true,
        category: 'sleep' as const
      },
      { 
        id: '3', 
        name: 'Step Master', 
        description: '7 days of step goals', 
        icon: 'footsteps', 
        earned: false,
        progress: 5/7, // 5 out of 7 days completed
        category: 'steps' as const
      },
      { 
        id: '4', 
        name: 'Balanced Week', 
        description: 'All three hit 5/7 days', 
        icon: 'fitness', 
        earned: false,
        progress: 0.4, // 40% progress
        category: 'balanced' as const
      },
    ],
    todayBreakdown: [
      { type: 'Steps' as const, points: Math.round(stepsPct * 40), max: 40, pct: stepsPct },
      { type: 'Hydration' as const, points: Math.round(waterPct * 40), max: 40, pct: waterPct },
      { type: 'Sleep' as const, points: Math.round(sleepPct * 50), max: 50, pct: sleepPct },
      { type: 'Daily Bonus' as const, points: 0, max: 20, pct: 0 },
    ],
  };

  const allTargetsMet = stepsPct >= 1 && waterPct >= 1 && sleepPct >= 1;
  
  // Update daily bonus if all targets met
  if (allTargetsMet) {
    mockRewards.todayBreakdown[3].points = 20;
    mockRewards.todayBreakdown[3].pct = 1;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} translucent={true} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Rewards</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Hero Points Display */}
        <RewardsHeroCard
          totalPoints={mockRewards.totalPoints}
          weeklyProgress={mockRewards.weeklyProgress}
          todayPoints={mockRewards.todayPoints}
          animated={true}
        />

        {/* Today's Earnings Grid */}
        <TodayEarningsGrid
          earnings={mockRewards.todayBreakdown}
          allTargetsMet={allTargetsMet}
        />

        {/* Streak Visualization */}
        <StreakVisualization
          currentStreak={mockRewards.currentStreak}
          longestStreak={mockRewards.longestStreak}
          nextMilestone={7} // Next milestone at 7 days
          nextMilestoneBonus={30} // 30 points bonus
        />

        {/* Achievement Badges */}
        <AchievementBadges badges={mockRewards.badges} />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Cal AI beige background
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: 50, // Account for status bar
    paddingBottom: 100, // Account for bottom navigation
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.large, // Reduced from xlarge to large
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 40, // Match back button width
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
});
