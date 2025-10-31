// Performance Breakdown Component
// Single responsibility: Display weekly performance metrics breakdown

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { WeeklyPerformance, ConsistencyMetrics, HealthPillar } from '../../types/assessment';
import { ConsistencyIndicator } from './ConsistencyIndicator';
import { PillarStrengthIndicator } from './PillarStrengthIndicator';
import { theme } from '../../utils/theme';

interface PerformanceBreakdownProps {
  performance: WeeklyPerformance;
  consistency: ConsistencyMetrics;
}

export const PerformanceBreakdown: React.FC<PerformanceBreakdownProps> = ({
  performance,
  consistency,
}) => {
  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'mastery': return theme.colors.success;
      case 'progress': return theme.colors.warning;
      case 'struggle': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getGradeIcon = (grade: string): string => {
    switch (grade) {
      case 'mastery': return 'checkmark-circle';
      case 'progress': return 'trending-up';
      case 'struggle': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  const getPillarIcon = (pillar: HealthPillar): string => {
    switch (pillar) {
      case 'steps': return 'footsteps';
      case 'water': return 'water';
      case 'sleep': return 'moon';
      case 'mood': return 'happy';
      default: return 'help-circle';
    }
  };

  const getPillarName = (pillar: HealthPillar): string => {
    switch (pillar) {
      case 'steps': return 'Steps';
      case 'water': return 'Hydration';
      case 'sleep': return 'Sleep';
      case 'mood': return 'Mood';
      default: return pillar;
    }
  };

  return (
    <View style={styles.container}>
      {/* Overall Performance Header */}
      <View style={styles.overallHeader}>
        <View style={styles.scoreSection}>
          <Text style={styles.scoreValue}>
            {Math.round(performance.averageAchievement)}%
          </Text>
          <Text style={styles.scoreLabel}>Average Achievement</Text>
        </View>
        
        <View style={styles.gradeSection}>
          <View style={[styles.gradeContainer, { backgroundColor: getGradeColor(performance.overallGrade) }]}>
            <Icon 
              name={getGradeIcon(performance.overallGrade)} 
              size={18} 
              color="white" 
            />
          </View>
          <Text style={[styles.gradeText, { color: getGradeColor(performance.overallGrade) }]}>
            {performance.overallGrade === 'mastery' ? 'Excellent' : 
             performance.overallGrade === 'progress' ? 'Good Progress' : 'Needs Attention'}
          </Text>
        </View>
      </View>

      {/* Pillar Breakdown */}
      <View style={styles.pillarSection}>
        <Text style={styles.sectionTitle}>Health Pillars Performance</Text>
        <View style={styles.pillarGrid}>
          {performance.pillarBreakdown.map((pillar) => (
            <View key={pillar.pillar} style={styles.pillarCard}>
              <View style={styles.pillarHeader}>
                <Icon 
                  name={getPillarIcon(pillar.pillar)} 
                  size={14} 
                  color={theme.colors.textSecondary} 
                />
                <Text style={styles.pillarName}>{getPillarName(pillar.pillar)}</Text>
              </View>
              
              <Text style={styles.pillarScore}>
                {Math.round(pillar.averageAchievement)}%
              </Text>
              
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${Math.min(pillar.averageAchievement, 100)}%`,
                      backgroundColor: pillar.averageAchievement >= 80 
                        ? theme.colors.success 
                        : pillar.averageAchievement >= 60
                        ? theme.colors.warning
                        : theme.colors.error
                    }
                  ]}
                />
              </View>
              
              <Text style={styles.pillarConsistency}>
                {pillar.consistentDays}/{performance.totalTrackingDays} consistent days
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Consistency Analysis */}
      <ConsistencyIndicator consistency={consistency} />

      {/* Pillar Strengths */}
      <PillarStrengthIndicator 
        strongestPillar={performance.strongestPillar}
        weakestPillar={performance.weakestPillar}
        pillarBreakdown={performance.pillarBreakdown}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.base,
    ...theme.shadows.subtle,
  },
  scoreSection: {
    alignItems: 'flex-start',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  scoreLabel: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  gradeSection: {
    alignItems: 'center',
  },
  gradeContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  gradeText: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
  },
  pillarSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  pillarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  pillarCard: {
    width: '50%',
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.base,
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  pillarName: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  pillarScore: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  pillarConsistency: {
    fontSize: theme.typography.tiny,
    color: theme.colors.textTertiary,
  },
});
