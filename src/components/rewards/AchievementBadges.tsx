// Achievement Badges Component
// Professional badge system with vector icons and progress
// Reusable component - accepts achievement badges data

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MoodRing } from '../mood/MoodRing';
import { theme } from '../../utils/theme';
import { AchievementBadge } from '../../hooks/achievements/useAchievements';

interface AchievementBadgesProps {
  badges: AchievementBadge[];
  isLoading?: boolean;
  error?: string | null;
}

const BADGE_COLORS = {
  hydration: theme.colors.ringHydration,
  sleep: theme.colors.ringSleep,
  steps: theme.colors.ringSteps,
  balanced: theme.colors.ringMood,
} as const;

const BadgeCard: React.FC<{ badge: AchievementBadge }> = ({ badge }) => {
  // Defensive checks
  if (!badge || !badge.id || !badge.name || !badge.category) {
    return null;
  }
  
  const badgeColor = BADGE_COLORS[badge.category] || theme.colors.textTertiary;
  const progress = typeof badge.progress === 'number' ? badge.progress : (badge.earned ? 1 : 0);
  
  // Ensure progress is a valid number
  const safeProgress = isNaN(progress) ? 0 : Math.max(0, Math.min(1, progress));
  
  return (
    <View style={[
      styles.badgeCard,
      badge.earned ? styles.badgeCardEarned : null
    ]}>
      <View style={styles.badgeRingContainer}>
        <MoodRing
          size={60}
          strokeWidth={6}
          progress={safeProgress}
          color={badgeColor}
          isSelected={badge.earned}
          animated={true}
        />
        <View style={styles.badgeIconContainer}>
          <Icon
            name={badge.icon || 'help-circle'}
            size={20}
            color={badge.earned ? badgeColor : theme.colors.textTertiary}
          />
        </View>
      </View>
      
      <View style={styles.badgeContent}>
        <Text style={[
          styles.badgeName,
          badge.earned ? { color: badgeColor } : null
        ]}>
          {badge.name || 'Badge'}
        </Text>
        <Text style={[
          styles.badgeDescription,
          !badge.earned ? styles.badgeDescriptionLocked : null
        ]}>
          {badge.description || 'No description'}
        </Text>
        
        {badge.earned ? (
          <View style={[styles.earnedBadge, { backgroundColor: badgeColor }]}>
            <Icon name="checkmark" size={12} color={theme.colors.cardBackground} style={{ marginRight: theme.spacing.xs }} />
            <Text style={styles.earnedText}>Earned</Text>
          </View>
        ) : null}
        
        {!badge.earned && safeProgress > 0 ? (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {Math.round(safeProgress * 100)}% complete
            </Text>
          </View>
        ) : null}
        
        {!badge.earned && safeProgress === 0 ? (
          <View style={styles.lockedBadge}>
            <Icon name="lock-closed" size={10} color={theme.colors.textTertiary} style={{ marginRight: theme.spacing.xs }} />
            <Text style={styles.lockedText}>Locked</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({ 
  badges, 
  isLoading = false,
  error = null 
}) => {
  // Filter out invalid badges
  const validBadges = badges.filter(b => b && b.id && b.name && b.category);
  
  const earnedBadges = validBadges.filter(b => b.earned);
  const inProgressBadges = validBadges.filter(b => !b.earned && b.progress && b.progress > 0);
  const lockedBadges = validBadges.filter(b => !b.earned && (!b.progress || b.progress === 0));
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        {!isLoading && (
          <Text style={styles.summary}>
            {earnedBadges.length}/{validBadges.length} earned
          </Text>
        )}
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={20} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : validBadges.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No achievements available</Text>
        </View>
      ) : (
        <View style={styles.badgesGrid}>
          {/* Show earned badges first */}
          {earnedBadges.map((badge) => (
            <View key={badge.id} style={styles.gridItem}>
              <BadgeCard badge={badge} />
            </View>
          ))}
          
          {/* Then in-progress badges */}
          {inProgressBadges.map((badge) => (
            <View key={badge.id} style={styles.gridItem}>
              <BadgeCard badge={badge} />
            </View>
          ))}
          
          {/* Finally locked badges */}
          {lockedBadges.map((badge) => (
            <View key={badge.id} style={styles.gridItem}>
              <BadgeCard badge={badge} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground, borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base, marginBottom: theme.spacing.lg, ...theme.shadows.subtle,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  title: {
    fontSize: theme.typography.medium, fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  summary: {
    fontSize: theme.typography.small, fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
  badgesGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
  },
  gridItem: { 
    width: '48%',
    marginBottom: theme.spacing.base,
  },
  badgeCard: {
    padding: theme.spacing.base, 
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background, 
    borderWidth: 1, 
    borderColor: theme.colors.border,
    alignItems: 'center', 
    position: 'relative',
    minHeight: 170,
    justifyContent: 'space-between',
  },
  badgeCardEarned: { 
    borderWidth: 2,
    borderColor: theme.colors.success,
    backgroundColor: '#F0FDF4',
    ...theme.shadows.soft,
  },
  badgeRingContainer: { position: 'relative', marginBottom: theme.spacing.base },
  badgeIconContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  badgeContent: { alignItems: 'center', width: '100%', flex: 1, justifyContent: 'flex-start' },
  badgeName: { fontSize: theme.typography.small, fontWeight: theme.typography.weights.semibold, color: theme.colors.textPrimary, textAlign: 'center', marginBottom: theme.spacing.xs },
  badgeDescription: { fontSize: theme.typography.xsmall, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.sm, lineHeight: theme.typography.lineHeights.normal * theme.typography.xsmall, minHeight: 32 },
  badgeDescriptionLocked: { color: theme.colors.textTertiary },
  earnedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.sm },
  earnedText: { fontSize: theme.typography.tiny, fontWeight: theme.typography.weights.medium, color: theme.colors.cardBackground },
  progressContainer: { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.sm, backgroundColor: theme.colors.border },
  progressText: { fontSize: theme.typography.tiny, color: theme.colors.textSecondary, fontWeight: theme.typography.weights.medium },
  lockedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.sm, backgroundColor: theme.colors.border },
  lockedText: { fontSize: theme.typography.tiny, color: theme.colors.textTertiary, fontWeight: theme.typography.weights.medium },
  loadingContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  loadingText: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  errorText: {
    fontSize: theme.typography.small,
    color: theme.colors.error,
    flex: 1,
  },
  emptyContainer: {
    padding: theme.spacing.base,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
  },
});
