// Pillar Strength Indicator Component
// Single responsibility: Display strongest and weakest health pillars

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { HealthPillar, PillarPerformance } from '../../types/assessment';
import { theme } from '../../utils/theme';

interface PillarStrengthIndicatorProps {
  strongestPillar: HealthPillar;
  weakestPillar: HealthPillar;
  pillarBreakdown: PillarPerformance[];
}

export const PillarStrengthIndicator: React.FC<PillarStrengthIndicatorProps> = ({
  strongestPillar,
  weakestPillar,
  pillarBreakdown,
}) => {
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
      case 'mood': return 'Mood Check-ins';
      default: return pillar;
    }
  };

  const getPillarPerformance = (pillar: HealthPillar): PillarPerformance | undefined => {
    return pillarBreakdown.find(p => p.pillar === pillar);
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining'): string => {
    switch (trend) {
      case 'improving': return 'trending-up';
      case 'declining': return 'trending-down';
      case 'stable': return 'remove';
      default: return 'help-circle';
    }
  };

  const getTrendColor = (trend: 'improving' | 'stable' | 'declining'): string => {
    switch (trend) {
      case 'improving': return theme.colors.success;
      case 'declining': return theme.colors.error;
      case 'stable': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  };

  const strongestPerformance = getPillarPerformance(strongestPillar);
  const weakestPerformance = getPillarPerformance(weakestPillar);

  const getEncouragementMessage = (pillar: HealthPillar, performance?: PillarPerformance): string => {
    if (!performance) return '';
    
    const pillarName = getPillarName(pillar);
    
    if (performance.averageAchievement >= 85) {
      return `Your ${pillarName.toLowerCase()} habits are excellent! Keep it up.`;
    } else if (performance.averageAchievement >= 70) {
      return `Great ${pillarName.toLowerCase()} progress! You're building strong habits.`;
    } else if (performance.trend === 'improving') {
      return `Your ${pillarName.toLowerCase()} is improving! Stay consistent.`;
    } else {
      return `Focus on ${pillarName.toLowerCase()} consistency this week.`;
    }
  };

  const getImprovementTip = (pillar: HealthPillar): string => {
    switch (pillar) {
      case 'steps':
        return 'Try taking short walks throughout the day or using stairs instead of elevators.';
      case 'water':
        return 'Set hourly reminders or keep a water bottle visible as a visual cue.';
      case 'sleep':
        return 'Create a consistent bedtime routine and avoid screens 30 minutes before bed.';
      case 'mood':
        return 'Set a daily reminder to check in with your emotions, even for just 30 seconds.';
      default:
        return 'Small, consistent actions lead to big improvements over time.';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Pillar Analysis</Text>
      
      {/* Strongest Pillar */}
      <View style={[styles.pillarCard, styles.strongestCard]}>
        <View style={styles.pillarHeader}>
          <View style={styles.pillarIconContainer}>
            <Icon 
              name={getPillarIcon(strongestPillar)} 
              size={20} 
              color={theme.colors.success} 
            />
          </View>
          <View style={styles.pillarInfo}>
            <Text style={styles.pillarTitle}>Strongest Area</Text>
            <Text style={styles.pillarName}>{getPillarName(strongestPillar)}</Text>
          </View>
          <View style={styles.pillarStats}>
            <Text style={[styles.pillarScore, { color: theme.colors.success }]}>
              {strongestPerformance ? Math.round(strongestPerformance.averageAchievement) : 0}%
            </Text>
            {strongestPerformance && (
              <View style={styles.trendContainer}>
                <Icon 
                  name={getTrendIcon(strongestPerformance.trend)} 
                  size={12} 
                  color={getTrendColor(strongestPerformance.trend)} 
                />
                <Text style={[styles.trendText, { color: getTrendColor(strongestPerformance.trend) }]}>
                  {strongestPerformance.trend}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.encouragementText}>
          {getEncouragementMessage(strongestPillar, strongestPerformance)}
        </Text>
      </View>

      {/* Weakest Pillar */}
      <View style={[styles.pillarCard, styles.weakestCard]}>
        <View style={styles.pillarHeader}>
          <View style={styles.pillarIconContainer}>
            <Icon 
              name={getPillarIcon(weakestPillar)} 
              size={20} 
              color={theme.colors.warning} 
            />
          </View>
          <View style={styles.pillarInfo}>
            <Text style={styles.pillarTitle}>Focus Area</Text>
            <Text style={styles.pillarName}>{getPillarName(weakestPillar)}</Text>
          </View>
          <View style={styles.pillarStats}>
            <Text style={[styles.pillarScore, { color: theme.colors.warning }]}>
              {weakestPerformance ? Math.round(weakestPerformance.averageAchievement) : 0}%
            </Text>
            {weakestPerformance && (
              <View style={styles.trendContainer}>
                <Icon 
                  name={getTrendIcon(weakestPerformance.trend)} 
                  size={12} 
                  color={getTrendColor(weakestPerformance.trend)} 
                />
                <Text style={[styles.trendText, { color: getTrendColor(weakestPerformance.trend) }]}>
                  {weakestPerformance.trend}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.improvementText}>
          💡 {getImprovementTip(weakestPillar)}
        </Text>
      </View>
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
  pillarCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.base,
    ...theme.shadows.subtle,
  },
  strongestCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  weakestCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  pillarIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.base,
  },
  pillarInfo: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  pillarName: {
    fontSize: theme.typography.medium,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
    marginTop: theme.spacing.xs,
  },
  pillarStats: {
    alignItems: 'flex-end',
  },
  pillarScore: {
    fontSize: theme.typography.large,
    fontWeight: theme.typography.weights.bold,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  trendText: {
    fontSize: theme.typography.tiny,
    fontWeight: theme.typography.weights.medium,
    marginLeft: theme.spacing.xs,
    textTransform: 'capitalize',
  },
  encouragementText: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.small * 1.4,
  },
  improvementText: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.small * 1.4,
    fontStyle: 'italic',
  },
});
