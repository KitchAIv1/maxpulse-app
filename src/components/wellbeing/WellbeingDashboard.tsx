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
import { LifeScoreBreakdown } from './LifeScoreBreakdown';
import { theme } from '../../utils/theme';
import { useAppStore } from '../../stores/appStore';
import { useAchievements } from '../../hooks/achievements/useAchievements';
import { useStreakData } from '../../hooks/streaks/useStreakData';
import { StreakInfoModal } from './StreakInfoModal';
import { LifeScoreInfoModal } from './LifeScoreInfoModal';

export const WellbeingDashboard: React.FC<WellbeingDashboardProps> = ({
  visible,
  onClose,
  currentScore,
  breakdown,
  onNavigateToModule,
}) => {
  const { user } = useAppStore();
  const { badges, isLoading: achievementsLoading, error: achievementsError } = useAchievements(user?.id);
  const { streakData, isLoading: streakLoading, error: streakError } = useStreakData(user?.id);
  const [streakInfoVisible, setStreakInfoVisible] = React.useState(false);
  const [lifeScoreInfoVisible, setLifeScoreInfoVisible] = React.useState(false);
  const [currentWeek, setCurrentWeek] = React.useState<number>(1);

  // Fetch current week for Life Score info modal
  React.useEffect(() => {
    const fetchCurrentWeek = async () => {
      if (!user?.id) return;
      
      try {
        const { supabase } = await import('../../services/supabase');
        const { data, error } = await supabase
          .from('plan_progress')
          .select('current_week')
          .eq('user_id', user.id)
          .single();
        
        if (!error && data) {
          setCurrentWeek(data.current_week || 1);
        }
      } catch (error) {
        console.warn('Could not fetch current week:', error);
      }
    };
    
    fetchCurrentWeek();
  }, [user?.id]);


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
            <View style={styles.headerLeft}>
              <View>
                <View style={styles.headerTitleRow}>
                  <Text style={styles.headerTitle}>Life Score</Text>
                  <TouchableOpacity 
                    style={styles.infoIconButton}
                    onPress={() => setLifeScoreInfoVisible(true)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icon name="information-circle" size={18} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.headerSubtitle}>Your wellness overview</Text>
              </View>
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
                <LifeScoreBreakdown breakdown={breakdown} />
              </View>

              {/* Right Column - Streak Info */}
              <View style={styles.rightColumn}>
                {/* Day Streak Card */}
                <View style={styles.dayStreakCard}>
                  <View style={styles.streakCardHeader}>
                    <Icon name="flame" size={24} color="#FF6B35" style={styles.streakIcon} />
                    <TouchableOpacity 
                      style={styles.infoIconButton}
                      onPress={() => setStreakInfoVisible(true)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Icon name="information-circle" size={16} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.streakTitle} numberOfLines={1} adjustsFontSizeToFit>DAY STREAK</Text>
                  {streakLoading ? (
                    <Text style={styles.streakValue}>...</Text>
                  ) : (
                    <>
                      <Text style={styles.streakValue}>{streakData.currentStreak}</Text>
                      <Text style={styles.streakLabel} numberOfLines={1}>days in a row</Text>
                    </>
                  )}
                </View>

                {/* Personal Best Card */}
                <View style={styles.personalBestCard}>
                  <View style={styles.streakCardHeader}>
                    <Icon name="trophy" size={24} color="#FFD700" style={styles.streakIcon} />
                    <TouchableOpacity 
                      style={styles.infoIconButton}
                      onPress={() => setStreakInfoVisible(true)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Icon name="information-circle" size={16} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.streakTitle} numberOfLines={1} adjustsFontSizeToFit>BEST</Text>
                  {streakLoading ? (
                    <Text style={styles.streakValue}>...</Text>
                  ) : (
                    <>
                      <Text style={styles.streakValue}>{streakData.longestStreak}</Text>
                      <Text style={styles.streakLabel} numberOfLines={1}>days total</Text>
                    </>
                  )}
                </View>
              </View>
            </View>

            {/* Days to Next Milestone - Simplified without progress bar */}
            {!streakLoading && streakData.currentStreak > 0 && (
              <View style={styles.milestoneSection}>
                <View style={styles.milestoneCard}>
                  <View style={styles.milestoneHeader}>
                    <Icon name="flag" size={14} color={theme.colors.ringMood} />
                    {streakData.daysUntilMilestone === 0 ? (
                      <Text style={styles.milestoneText}>
                        🎉 Milestone reached! Keep going for {streakData.nextMilestone} days
                      </Text>
                    ) : (
                      <Text style={styles.milestoneText}>
                        {streakData.daysUntilMilestone} {streakData.daysUntilMilestone === 1 ? 'day' : 'days'} until next milestone
                      </Text>
                    )}
                  </View>
                  <Text style={styles.milestoneBonus}>+{streakData.nextMilestoneBonus} bonus points</Text>
                </View>
              </View>
            )}

            {/* Achievements - Live Data */}
            <AchievementBadges 
              badges={badges} 
              isLoading={achievementsLoading}
              error={achievementsError}
            />

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </View>

      {/* Streak Info Modal */}
      <StreakInfoModal
        visible={streakInfoVisible}
        onClose={() => setStreakInfoVisible(false)}
      />

      {/* Life Score Info Modal */}
      <LifeScoreInfoModal
        visible={lifeScoreInfoVisible}
        onClose={() => setLifeScoreInfoVisible(false)}
        currentWeek={currentWeek}
      />
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
  headerLeft: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconButton: {
    marginLeft: theme.spacing.xs,
    padding: 4,
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
    justifyContent: 'flex-start',
    minHeight: 280, // Increased to accommodate breakdown
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
  streakCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: theme.spacing.xs,
  },
  streakIcon: {
    marginBottom: theme.spacing.sm,
  },
  infoIconButton: {
    padding: 4,
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
