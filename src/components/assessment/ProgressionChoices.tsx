// Progression Choices Component
// Single responsibility: User decision interface for progression choices

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';

interface ProgressionChoicesProps {
  recommendation: 'advance' | 'extend' | 'reset';
  onChoice: (choice: 'accepted' | 'override_advance' | 'coach_consultation') => void;
  isExecuting: boolean;
  weekNumber: number;
}

export const ProgressionChoices: React.FC<ProgressionChoicesProps> = ({
  recommendation,
  onChoice,
  isExecuting,
  weekNumber,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const handleChoice = (choice: 'accepted' | 'override_advance' | 'coach_consultation') => {
    setSelectedChoice(choice);
    onChoice(choice);
  };

  const getRecommendationActionText = (rec: string): string => {
    switch (rec) {
      case 'advance': return 'Advance to Next Week';
      case 'extend': return 'Continue This Week';
      case 'reset': return 'Go Back One Week';
      default: return 'Follow Recommendation';
    }
  };

  const getOverrideText = (rec: string): string => {
    switch (rec) {
      case 'extend': return 'Advance Anyway';
      case 'reset': return 'Stay on Current Week';
      default: return 'Override Recommendation';
    }
  };

  const getOverrideDescription = (rec: string): string => {
    switch (rec) {
      case 'extend': 
        return 'Move to the next week despite not fully mastering this one';
      case 'reset': 
        return 'Continue with current week targets instead of going back';
      default: 
        return 'Choose a different path than recommended';
    }
  };

  const shouldShowOverride = recommendation !== 'advance';

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>What would you like to do?</Text>
      <Text style={styles.subtitle}>
        Your choice will shape your journey. Choose what feels right for you.
      </Text>

      {/* Primary Recommendation Choice */}
      <TouchableOpacity
        style={[
          styles.choiceCard,
          styles.primaryChoice,
          selectedChoice === 'accepted' && styles.selectedChoice,
          isExecuting && selectedChoice !== 'accepted' && styles.disabledChoice
        ]}
        onPress={() => handleChoice('accepted')}
        disabled={isExecuting}
      >
        <View style={styles.choiceHeader}>
          <View style={[styles.choiceIcon, styles.primaryIcon]}>
            <Icon 
              name={recommendation === 'advance' ? 'checkmark-circle' : 
                   recommendation === 'extend' ? 'refresh' : 'arrow-back'} 
              size={18} 
              color="white" 
            />
          </View>
          <View style={styles.choiceContent}>
            <Text style={styles.choiceTitle}>
              {getRecommendationActionText(recommendation)}
            </Text>
            <Text style={styles.choiceDescription}>
              Follow the AI recommendation based on your performance
            </Text>
          </View>
          {isExecuting && selectedChoice === 'accepted' && (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          )}
        </View>
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>Recommended</Text>
        </View>
      </TouchableOpacity>

      {/* Override Choice (if applicable) */}
      {shouldShowOverride && (
        <TouchableOpacity
          style={[
            styles.choiceCard,
            styles.secondaryChoice,
            selectedChoice === 'override_advance' && styles.selectedChoice,
            isExecuting && selectedChoice !== 'override_advance' && styles.disabledChoice
          ]}
          onPress={() => handleChoice('override_advance')}
          disabled={isExecuting}
        >
          <View style={styles.choiceHeader}>
            <View style={[styles.choiceIcon, styles.secondaryIcon]}>
              <Icon name="arrow-forward" size={18} color={theme.colors.warning} />
            </View>
            <View style={styles.choiceContent}>
              <Text style={styles.choiceTitle}>
                {getOverrideText(recommendation)}
              </Text>
              <Text style={styles.choiceDescription}>
                {getOverrideDescription(recommendation)}
              </Text>
            </View>
            {isExecuting && selectedChoice === 'override_advance' && (
              <ActivityIndicator size="small" color={theme.colors.warning} />
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* Coach Consultation Choice */}
      <TouchableOpacity
        style={[
          styles.choiceCard,
          styles.tertiaryChoice,
          selectedChoice === 'coach_consultation' && styles.selectedChoice,
          isExecuting && selectedChoice !== 'coach_consultation' && styles.disabledChoice
        ]}
        onPress={() => handleChoice('coach_consultation')}
        disabled={isExecuting}
      >
        <View style={styles.choiceHeader}>
          <View style={[styles.choiceIcon, styles.tertiaryIcon]}>
            <Icon name="chatbubble-ellipses" size={18} color={theme.colors.accent} />
          </View>
          <View style={styles.choiceContent}>
            <Text style={styles.choiceTitle}>
              Talk to AI Coach
            </Text>
            <Text style={styles.choiceDescription}>
              Get personalized guidance before making your decision
            </Text>
          </View>
          {isExecuting && selectedChoice === 'coach_consultation' && (
            <ActivityIndicator size="small" color={theme.colors.accent} />
          )}
        </View>
        <View style={styles.premiumBadge}>
          <Icon name="star" size={10} color="#FFD700" />
          <Text style={styles.premiumText}>Premium</Text>
        </View>
      </TouchableOpacity>

      {/* Execution Status */}
      {isExecuting && (
        <View style={styles.executionStatus}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.executionText}>
            Updating your plan...
          </Text>
        </View>
      )}

      {/* Help Text */}
      <View style={styles.helpSection}>
        <Icon name="information-circle" size={14} color={theme.colors.textTertiary} />
        <Text style={styles.helpText}>
          You can always adjust your plan later in Settings. Your health journey is unique to you.
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
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.base,
    lineHeight: theme.typography.small * 1.3,
  },
  choiceCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.subtle,
  },
  primaryChoice: {
    borderColor: theme.colors.primary,
  },
  secondaryChoice: {
    borderColor: theme.colors.border,
  },
  tertiaryChoice: {
    borderColor: theme.colors.border,
  },
  selectedChoice: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  disabledChoice: {
    opacity: 0.5,
  },
  choiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  choiceIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  primaryIcon: {
    backgroundColor: theme.colors.primary,
  },
  secondaryIcon: {
    backgroundColor: theme.colors.warningLight,
  },
  tertiaryIcon: {
    backgroundColor: theme.colors.accentLight,
  },
  choiceContent: {
    flex: 1,
  },
  choiceTitle: {
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  choiceDescription: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.small * 1.3,
  },
  recommendedBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  recommendedText: {
    fontSize: theme.typography.tiny,
    color: 'white',
    fontWeight: theme.typography.weights.semibold,
  },
  premiumBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: '#FFF8DC',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumText: {
    fontSize: theme.typography.tiny,
    color: '#B8860B',
    fontWeight: theme.typography.weights.semibold,
    marginLeft: theme.spacing.xs,
  },
  executionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.base,
  },
  executionText: {
    fontSize: theme.typography.small,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
    marginLeft: theme.spacing.sm,
  },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
  },
  helpText: {
    flex: 1,
    fontSize: theme.typography.small,
    color: theme.colors.textTertiary,
    lineHeight: theme.typography.small * 1.3,
    marginLeft: theme.spacing.sm,
  },
});
