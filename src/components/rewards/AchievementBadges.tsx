// Achievement Badges Component
// Professional badge system with vector icons and progress

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MoodRing } from '../mood/MoodRing';
import { theme } from '../../utils/theme';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Ionicon name
  earned: boolean;
  progress?: number; // 0-1 for in-progress badges
  category: 'hydration' | 'sleep' | 'steps' | 'balanced';
}

interface AchievementBadgesProps {
  badges: Badge[];
}

const BADGE_COLORS = {
  hydration: theme.colors.ringHydration,
  sleep: theme.colors.ringSleep,
  steps: theme.colors.ringSteps,
  balanced: theme.colors.ringMood,
} as const;

const BadgeCard: React.FC<{ badge: Badge }> = ({ badge }) => {
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
            <Icon name="checkmark" size={12} color={theme.colors.cardBackground} />
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
            <Icon name="lock-closed" size={10} color={theme.colors.textTertiary} />
            <Text style={styles.lockedText}>Locked</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({ badges }) => {
  // Filter out invalid badges
  const validBadges = badges.filter(b => b && b.id && b.name && b.category);
  
  const earnedBadges = validBadges.filter(b => b.earned);
  const inProgressBadges = validBadges.filter(b => !b.earned && b.progress && b.progress > 0);
  const lockedBadges = validBadges.filter(b => !b.earned && (!b.progress || b.progress === 0));
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.summary}>
          {earnedBadges.length}/{validBadges.length} earned
        </Text>
      </View>
      
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
    gap: theme.spacing.sm,
    justifyContent: 'space-between', // Evenly distribute cards
  },
  gridItem: { width: '48%' }, // Adjusted for better spacing
  badgeCard: {
    padding: theme.spacing.sm, 
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background, 
    borderWidth: 1, 
    borderColor: theme.colors.border,
    alignItems: 'center', 
    position: 'relative', 
    height: 160, // Fixed height for consistency
  },
  badgeCardEarned: { ...theme.shadows.soft },
  badgeRingContainer: { position: 'relative', marginBottom: theme.spacing.sm },
  badgeIconContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  badgeContent: { alignItems: 'center', flex: 1 },
  badgeName: { fontSize: theme.typography.small, fontWeight: theme.typography.weights.semibold, color: theme.colors.textPrimary, textAlign: 'center', marginBottom: theme.spacing.xs },
  badgeDescription: { fontSize: theme.typography.xsmall, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.sm, lineHeight: theme.typography.lineHeights.tight * theme.typography.xsmall },
  badgeDescriptionLocked: { color: theme.colors.textTertiary },
  earnedBadge: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.sm },
  earnedText: { fontSize: theme.typography.tiny, fontWeight: theme.typography.weights.medium, color: theme.colors.cardBackground },
  progressContainer: { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.sm, backgroundColor: theme.colors.border },
  progressText: { fontSize: theme.typography.tiny, color: theme.colors.textSecondary, fontWeight: theme.typography.weights.medium },
  lockedBadge: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.sm, backgroundColor: theme.colors.border },
  lockedText: { fontSize: theme.typography.tiny, color: theme.colors.textTertiary, fontWeight: theme.typography.weights.medium },
});
