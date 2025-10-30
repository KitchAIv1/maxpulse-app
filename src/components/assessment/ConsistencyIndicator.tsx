// Consistency Indicator Component
// Single responsibility: Display consistency metrics and patterns

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ConsistencyMetrics } from '../../types/assessment';
import { theme } from '../../utils/theme';

interface ConsistencyIndicatorProps {
  consistency: ConsistencyMetrics;
}

export const ConsistencyIndicator: React.FC<ConsistencyIndicatorProps> = ({
  consistency,
}) => {
  const getConsistencyColor = (rate: number): string => {
    if (rate >= 80) return theme.colors.success;
    if (rate >= 60) return theme.colors.warning;
    return theme.colors.error;
  };

  const getConsistencyMessage = (rate: number): string => {
    if (rate >= 80) return 'Excellent consistency';
    if (rate >= 60) return 'Good consistency';
    if (rate >= 40) return 'Moderate consistency';
    return 'Needs improvement';
  };

  const getStreakIcon = (streak: number): string => {
    if (streak >= 5) return 'flame';
    if (streak >= 3) return 'trending-up';
    return 'remove-circle-outline';
  };

  const getStreakColor = (streak: number): string => {
    if (streak >= 5) return '#FF6B35'; // Fire orange
    if (streak >= 3) return theme.colors.warning;
    return theme.colors.textSecondary;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Consistency Analysis</Text>
      
      {/* Main Consistency Rate */}
      <View style={styles.consistencyCard}>
        <View style={styles.consistencyHeader}>
          <View style={styles.consistencyRate}>
            <Text style={[styles.rateValue, { color: getConsistencyColor(consistency.consistencyRate) }]}>
              {Math.round(consistency.consistencyRate)}%
            </Text>
            <Text style={styles.rateLabel}>Consistency Rate</Text>
          </View>
          
          <View style={styles.consistencyDetails}>
            <Text style={styles.detailText}>
              {consistency.consistentDays} out of {consistency.totalDays} days
            </Text>
            <Text style={[styles.detailMessage, { color: getConsistencyColor(consistency.consistencyRate) }]}>
              {getConsistencyMessage(consistency.consistencyRate)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${Math.min(consistency.consistencyRate, 100)}%`,
                backgroundColor: getConsistencyColor(consistency.consistencyRate)
              }
            ]}
          />
        </View>
      </View>

      {/* Streak Information */}
      <View style={styles.streakSection}>
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Icon 
              name={getStreakIcon(consistency.currentStreak)} 
              size={20} 
              color={getStreakColor(consistency.currentStreak)} 
            />
            <Text style={styles.streakTitle}>Current Streak</Text>
          </View>
          <Text style={[styles.streakValue, { color: getStreakColor(consistency.currentStreak) }]}>
            {consistency.currentStreak}
          </Text>
          <Text style={styles.streakLabel}>days</Text>
        </View>

        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Icon name="trophy" size={20} color="#FFD700" />
            <Text style={styles.streakTitle}>Best Streak</Text>
          </View>
          <Text style={[styles.streakValue, { color: '#FFD700' }]}>
            {consistency.longestStreak}
          </Text>
          <Text style={styles.streakLabel}>days</Text>
        </View>
      </View>

      {/* Weekend Performance */}
      {consistency.weekendConsistency !== 100 && (
        <View style={styles.weekendCard}>
          <View style={styles.weekendHeader}>
            <Icon name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.weekendTitle}>Weekend Performance</Text>
          </View>
          <View style={styles.weekendContent}>
            <Text style={styles.weekendValue}>
              {consistency.weekendConsistency}%
            </Text>
            <Text style={styles.weekendDescription}>
              {consistency.weekendConsistency >= 90 
                ? 'Great weekend habits!' 
                : consistency.weekendConsistency >= 70
                ? 'Good weekend consistency'
                : 'Weekends need attention'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.base,
  },
  consistencyCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.base,
    ...theme.shadows.subtle,
  },
  consistencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  consistencyRate: {
    alignItems: 'flex-start',
  },
  rateValue: {
    fontSize: theme.typography.xlarge,
    fontWeight: theme.typography.weights.bold,
  },
  rateLabel: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  consistencyDetails: {
    alignItems: 'flex-end',
  },
  detailText: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
  },
  detailMessage: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.medium,
    marginTop: theme.spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  streakSection: {
    flexDirection: 'row',
    gap: theme.spacing.base,
    marginBottom: theme.spacing.base,
  },
  streakCard: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    alignItems: 'center',
    ...theme.shadows.subtle,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  streakTitle: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  streakValue: {
    fontSize: theme.typography.large,
    fontWeight: theme.typography.weights.bold,
  },
  streakLabel: {
    fontSize: theme.typography.tiny,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
  },
  weekendCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    ...theme.shadows.subtle,
  },
  weekendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  weekendTitle: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  weekendContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekendValue: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  weekendDescription: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
  },
});
