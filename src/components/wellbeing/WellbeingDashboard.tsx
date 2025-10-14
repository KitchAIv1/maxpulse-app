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
              <Icon name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Life Score Display - Hero */}
            <View style={styles.heroSection}>
              <BatteryGauge score={currentScore} size={220} animated />
            </View>

            {/* Streak Status - Compact */}
            <View style={styles.streakSection}>
              <StreakVisualization {...mockStreakData} />
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
    paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.base,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.cardBackground,
  },
  headerTitle: {
    fontSize: theme.typography.large, fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.typography.small, color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  closeButton: {
    width: 40, height: 40, borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background, alignItems: 'center',
    justifyContent: 'center', ...theme.shadows.subtle,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  heroSection: {
    alignItems: 'center', marginBottom: theme.spacing.xxl,
    paddingVertical: theme.spacing.lg,
  },
  streakSection: {
    marginBottom: theme.spacing.lg,
  },
  bottomSpacer: { height: theme.spacing.xl },
});
