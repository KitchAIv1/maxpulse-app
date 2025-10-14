// Health Summary Card Component
// Displays key health metrics without rings - text-based summary

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';

interface HealthMetric {
  icon: string;
  label: string;
  current: string;
  target: string;
  percentage: number;
  unit?: string;
}

interface HealthSummaryCardProps {
  lifeScore: number;
  metrics: HealthMetric[];
}

export const HealthSummaryCard: React.FC<HealthSummaryCardProps> = ({
  lifeScore,
  metrics,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.error;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <View style={styles.container}>
      {/* Life Score Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="fitness" size={20} color={theme.colors.textPrimary} />
          <Text style={styles.title}>Health Summary</Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreValue, { color: getScoreColor(lifeScore) }]}>
            {lifeScore}
          </Text>
          <Text style={styles.scoreLabel}>{getScoreLabel(lifeScore)}</Text>
        </View>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <View key={index} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Icon name={metric.icon as any} size={16} color={theme.colors.textSecondary} />
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
            
            <View style={styles.metricValues}>
              <Text style={styles.metricCurrent}>
                {metric.current}
                {metric.unit && <Text style={styles.metricUnit}> {metric.unit}</Text>}
              </Text>
              <Text style={styles.metricTarget}>of {metric.target}{metric.unit}</Text>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(metric.percentage, 100)}%`,
                    backgroundColor: metric.percentage >= 100 
                      ? theme.colors.success 
                      : theme.colors.primary
                  }
                ]} 
              />
            </View>
            
            <Text style={styles.metricPercentage}>
              {Math.round(metric.percentage)}% complete
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.base,
    ...theme.shadows.subtle,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  title: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.base,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  scoreValue: {
    fontSize: theme.typography.xxlarge,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xs,
  },
  scoreLabel: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  metricCard: {
    width: '50%',
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.base,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  metricLabel: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  metricValues: {
    marginBottom: theme.spacing.sm,
  },
  metricCurrent: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  metricUnit: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textSecondary,
  },
  metricTarget: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginBottom: theme.spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  metricPercentage: {
    fontSize: theme.typography.tiny,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
});
