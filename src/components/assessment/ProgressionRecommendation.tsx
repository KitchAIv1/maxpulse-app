// Progression Recommendation Component
// Single responsibility: Display progression recommendation with reasoning

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ProgressionAssessment } from '../../types/assessment';
import { theme } from '../../utils/theme';

interface ProgressionRecommendationProps {
  assessment: ProgressionAssessment;
  currentWeek: number;
  currentPhase: number;
}

export const ProgressionRecommendation: React.FC<ProgressionRecommendationProps> = ({
  assessment,
  currentWeek,
  currentPhase,
}) => {
  const getRecommendationIcon = (recommendation: string): string => {
    switch (recommendation) {
      case 'advance': return 'arrow-forward-circle';
      case 'extend': return 'refresh-circle';
      case 'reset': return 'arrow-back-circle';
      default: return 'help-circle';
    }
  };

  const getRecommendationColor = (recommendation: string): string => {
    switch (recommendation) {
      case 'advance': return theme.colors.success;
      case 'extend': return theme.colors.warning;
      case 'reset': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getRecommendationTitle = (recommendation: string): string => {
    switch (recommendation) {
      case 'advance': return 'Ready to Advance!';
      case 'extend': return 'Let\'s Perfect This Week';
      case 'reset': return 'Rebuild Your Foundation';
      default: return 'Assessment Complete';
    }
  };

  const getRecommendationDescription = (recommendation: string): string => {
    switch (recommendation) {
      case 'advance': 
        return `You've mastered Week ${currentWeek}! Time to move to Week ${currentWeek + 1} and take on new challenges.`;
      case 'extend': 
        return `You're making good progress on Week ${currentWeek}. Let's strengthen your foundation before advancing.`;
      case 'reset': 
        return `Let's step back to Week ${Math.max(1, currentWeek - 1)} to rebuild your habits with a stronger foundation.`;
      default: 
        return 'Assessment completed successfully.';
    }
  };

  const getConfidenceMessage = (confidence: number): string => {
    if (confidence >= 90) return 'High confidence';
    if (confidence >= 75) return 'Good confidence';
    if (confidence >= 60) return 'Moderate confidence';
    return 'Low confidence';
  };

  const getPhaseInfo = (phase: number): { name: string; description: string } => {
    switch (phase) {
      case 1:
        return {
          name: 'Foundation Building',
          description: 'Focus on sleep optimization and hydration habits'
        };
      case 2:
        return {
          name: 'Movement & Activity',
          description: 'Increase physical activity while maintaining foundation'
        };
      case 3:
        return {
          name: 'Nutrition & Integration',
          description: 'Full integration of all health pillars'
        };
      default:
        return { name: 'Unknown Phase', description: '' };
    }
  };

  const phaseInfo = getPhaseInfo(currentPhase);
  const recommendationColor = getRecommendationColor(assessment.recommendation);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recommendation</Text>
      
      {/* Main Recommendation Card */}
      <View style={[styles.recommendationCard, { borderLeftColor: recommendationColor }]}>
        <View style={styles.recommendationHeader}>
          <View style={[styles.iconContainer, { backgroundColor: recommendationColor }]}>
            <Icon 
              name={getRecommendationIcon(assessment.recommendation)} 
              size={24} 
              color="white" 
            />
          </View>
          <View style={styles.recommendationInfo}>
            <Text style={styles.recommendationTitle}>
              {getRecommendationTitle(assessment.recommendation)}
            </Text>
            <Text style={styles.recommendationDescription}>
              {getRecommendationDescription(assessment.recommendation)}
            </Text>
          </View>
        </View>

        {/* Confidence Indicator */}
        <View style={styles.confidenceContainer}>
          <View style={styles.confidenceBar}>
            <View 
              style={[
                styles.confidenceFill,
                { 
                  width: `${assessment.confidence}%`,
                  backgroundColor: recommendationColor
                }
              ]}
            />
          </View>
          <Text style={styles.confidenceText}>
            {getConfidenceMessage(assessment.confidence)} ({assessment.confidence}%)
          </Text>
        </View>
      </View>

      {/* Reasoning */}
      <View style={styles.reasoningCard}>
        <Text style={styles.reasoningTitle}>Why this recommendation?</Text>
        {assessment.reasoning.map((reason, index) => (
          <View key={index} style={styles.reasonItem}>
            <View style={styles.reasonBullet} />
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        ))}
      </View>

      {/* Target Modifications (if extending) */}
      {assessment.recommendation === 'extend' && assessment.modifications && (
        <View style={styles.modificationsCard}>
          <View style={styles.modificationsHeader}>
            <Icon name="settings" size={16} color={theme.colors.warning} />
            <Text style={styles.modificationsTitle}>Adjusted Focus</Text>
          </View>
          <Text style={styles.modificationsText}>
            {assessment.modifications.adjustmentReason}
          </Text>
          {assessment.modifications.focusArea && (
            <View style={styles.focusArea}>
              <Text style={styles.focusLabel}>Primary Focus:</Text>
              <Text style={styles.focusValue}>
                {assessment.modifications.focusArea === 'steps' ? 'Steps' :
                 assessment.modifications.focusArea === 'water' ? 'Hydration' :
                 assessment.modifications.focusArea === 'sleep' ? 'Sleep' : 'Mood Check-ins'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Phase Context */}
      <View style={styles.phaseCard}>
        <Text style={styles.phaseTitle}>Phase {currentPhase}: {phaseInfo.name}</Text>
        <Text style={styles.phaseDescription}>{phaseInfo.description}</Text>
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
  recommendationCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.base,
    borderLeftWidth: 4,
    ...theme.shadows.subtle,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.base,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.base,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  recommendationDescription: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.small * 1.4,
  },
  confidenceContainer: {
    marginTop: theme.spacing.base,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginBottom: theme.spacing.xs,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: theme.typography.tiny,
    color: theme.colors.textTertiary,
  },
  reasoningCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.base,
    ...theme.shadows.subtle,
  },
  reasoningTitle: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  reasonBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textSecondary,
    marginTop: 6,
    marginRight: theme.spacing.sm,
  },
  reasonText: {
    flex: 1,
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.small * 1.3,
  },
  modificationsCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.warning,
    ...theme.shadows.subtle,
  },
  modificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  modificationsTitle: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.warning,
    marginLeft: theme.spacing.xs,
  },
  modificationsText: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.small * 1.3,
    marginBottom: theme.spacing.sm,
  },
  focusArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  focusLabel: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  focusValue: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.warning,
  },
  phaseCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  phaseTitle: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  phaseDescription: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
  },
});
