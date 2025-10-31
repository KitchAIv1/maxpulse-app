// Weekly Assessment Modal Component
// Single responsibility: Modal container for weekly assessment display

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { WeeklyAssessmentData } from '../../types/assessment';
import { ProgressionDecision } from '../../types/progression';
import { PerformanceBreakdown } from './PerformanceBreakdown';
import { ProgressionRecommendation } from './ProgressionRecommendation';
import { ProgressionChoices } from './ProgressionChoices';
import { theme } from '../../utils/theme';

interface WeeklyAssessmentModalProps {
  visible: boolean;
  onClose: () => void;
  assessmentData: WeeklyAssessmentData;
  onDecision: (decision: ProgressionDecision) => void;
  isExecuting?: boolean;
}

export const WeeklyAssessmentModal: React.FC<WeeklyAssessmentModalProps> = ({
  visible,
  onClose,
  assessmentData,
  onDecision,
  isExecuting = false,
}) => {
  const { performance, assessment } = assessmentData;

  const getDecisionActionText = (decisionType: 'accepted' | 'override_advance' | 'coach_consultation'): string => {
    if (decisionType === 'coach_consultation') {
      return 'Request AI Coach Consultation';
    }
    
    const actualType = decisionType === 'override_advance' ? 'advance' : assessment.recommendation;
    
    switch (actualType) {
      case 'advance':
        return `Advance to Week ${performance.week + 1}`;
      case 'extend':
        return `Continue Week ${performance.week} with adjusted targets`;
      case 'reset':
        return `Reset to Week ${performance.week - 1}`;
      default:
        return 'Proceed';
    }
  };

  const getDecisionMessage = (decisionType: 'accepted' | 'override_advance' | 'coach_consultation'): string => {
    if (decisionType === 'coach_consultation') {
      return 'Your request will be logged and an AI coach will review your progress. You\'ll stay on your current week until you receive guidance.';
    }
    
    const actualType = decisionType === 'override_advance' ? 'advance' : assessment.recommendation;
    
    switch (actualType) {
      case 'advance':
        return 'Your targets will be updated to the next week\'s goals. Your progress will reset and you\'ll start tracking toward new targets.';
      case 'extend':
        return 'You\'ll stay on the current week with modified targets based on your performance. This gives you more time to build consistency.';
      case 'reset':
        return 'You\'ll go back to the previous week\'s targets. This helps rebuild your foundation before moving forward.';
      default:
        return 'Your targets and progress will be updated accordingly.';
    }
  };

  const handleDecision = (decisionType: 'accepted' | 'override_advance' | 'coach_consultation') => {
    const actionText = getDecisionActionText(decisionType);
    const message = getDecisionMessage(decisionType);

    Alert.alert(
      'Confirm Your Decision',
      `${actionText}\n\n${message}\n\nAre you sure you want to proceed?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          style: 'default',
          onPress: () => {
            const decision: ProgressionDecision = {
              type: decisionType === 'override_advance' ? 'advance' : assessment.recommendation,
              weekNumber: performance.week,
              phaseNumber: performance.phase,
              userId: '', // Will be set by parent component
              reasoning: decisionType === 'accepted' 
                ? assessment.reasoning 
                : ['User chose to override recommendation'],
              confidence: assessment.confidence,
              modifications: assessment.modifications,
              executedBy: 'user',
            };

            onDecision(decision);
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} translucent={false} />
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Week {performance.week} Assessment</Text>
            <Text style={styles.headerSubtitle}>
              Phase {performance.phase} • {performance.startDate} to {performance.endDate}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            disabled={isExecuting}
          >
            <Icon name="close" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Performance Breakdown */}
          <PerformanceBreakdown 
            performance={performance}
            consistency={assessmentData.consistency}
          />

          {/* Progression Recommendation */}
          <ProgressionRecommendation 
            assessment={assessment}
            currentWeek={performance.week}
            currentPhase={performance.phase}
          />

          {/* Progression Choices */}
          <ProgressionChoices
            recommendation={assessment.recommendation}
            onChoice={handleDecision}
            isExecuting={isExecuting}
            weekNumber={performance.week}
          />

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.cardBackground,
  },
  headerTitle: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.subtle,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.base,
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
});
