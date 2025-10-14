// Today Earnings Grid Component
// Grid layout showing today's points breakdown with rings

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EarningsRingCard } from './EarningsRingCard';
import { theme } from '../../utils/theme';

interface EarningItem {
  type: 'Steps' | 'Hydration' | 'Sleep' | 'Daily Bonus';
  points: number;
  max: number;
  pct: number;
}

interface TodayEarningsGridProps {
  earnings: EarningItem[];
  allTargetsMet: boolean;
}

export const TodayEarningsGrid: React.FC<TodayEarningsGridProps> = ({
  earnings,
  allTargetsMet,
}) => {
  const totalEarned = earnings.reduce((sum, item) => sum + item.points, 0);
  const totalPossible = earnings.reduce((sum, item) => sum + item.max, 0);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Earnings</Text>
        <Text style={styles.summary}>
          {totalEarned}/{totalPossible} points
        </Text>
      </View>
      
      <View style={styles.grid}>
        {earnings.map((item, index) => (
          <View key={index} style={styles.gridItem}>
            <EarningsRingCard
              type={item.type}
              points={item.points}
              maxPoints={item.max}
              progress={item.points / item.max}
              isCompleted={item.pct >= 1 || (item.type === 'Daily Bonus' && allTargetsMet)}
            />
          </View>
        ))}
      </View>
      
      {/* Bonus Status */}
      {!allTargetsMet ? (
        <View style={styles.bonusPrompt}>
          <Text style={styles.bonusText}>
            Complete all 3 targets to earn +20 bonus points!
          </Text>
        </View>
      ) : (
        <View style={styles.bonusEarned}>
          <Text style={styles.bonusEarnedText}>
            🎉 Daily completion bonus earned: +20 points!
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  title: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  summary: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md, // Increased from sm to md for better breathing room
    marginBottom: theme.spacing.base,
  },
  gridItem: {
    width: '46%', // Slightly reduced to accommodate larger gap
  },
  bonusPrompt: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.ringMood}15`, // 15% opacity
    borderWidth: 1,
    borderColor: `${theme.colors.ringMood}40`, // 40% opacity
  },
  bonusText: {
    fontSize: theme.typography.small,
    color: theme.colors.ringMood,
    textAlign: 'center',
    fontWeight: theme.typography.weights.medium,
  },
  bonusEarned: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.success}15`, // 15% opacity
    borderWidth: 1,
    borderColor: `${theme.colors.success}40`, // 40% opacity
  },
  bonusEarnedText: {
    fontSize: theme.typography.small,
    color: theme.colors.success,
    textAlign: 'center',
    fontWeight: theme.typography.weights.medium,
  },
});
