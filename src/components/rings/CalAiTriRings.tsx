// Cal AI Triple Ring Layout Component
// Main steps card on top (large), hydration and sleep cards below (smaller)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CalAiRing } from './CalAiRing';
import { theme } from '../../utils/theme';
import { calAiCard } from '../../utils/calAiStyles';
import { formatSleepDuration } from '../../utils';

const { width: screenWidth } = Dimensions.get('window');

interface CalAiTriRingsProps {
  stepsPct: number;
  waterPct: number;
  sleepPct: number;
  stepsData: {
    current: number;
    target: number;
  };
  waterData: {
    current: number;
    target: number;
  };
  sleepData: {
    current: number;
    target: number;
  };
  onLifeScorePress?: () => void;
}

export const CalAiTriRings: React.FC<CalAiTriRingsProps> = ({
  stepsPct,
  waterPct,
  sleepPct,
  stepsData,
  waterData,
  sleepData,
  onLifeScorePress,
}) => {
  // Calculate responsive ring sizes based on screen width
  const stepsRingSize = Math.min(screenWidth * 0.4, 160);
  const smallRingSize = Math.min(screenWidth * 0.25, 100);

  const RingCard: React.FC<{
    title: string;
    icon: string;
    percentage: number;
    current: string;
    target: string;
    size: number;
    isLarge?: boolean;
  }> = ({ title, icon, percentage, current, target, size, isLarge = false }) => (
    <View style={[
      styles.ringCard,
      isLarge ? styles.largeCard : styles.smallCard,
      calAiCard.base,
    ]}>
      <Text style={styles.cardTitle}>{title}</Text>
      
      <CalAiRing
        percentage={percentage}
        size={size}
        centerContent={
          <View style={styles.ringCenter}>
            <Text style={styles.ringIcon}>{icon}</Text>
            <Text style={[styles.ringValue, isLarge && styles.largeRingValue]}>
              {current}
            </Text>
            <Text style={[styles.ringTarget, isLarge && styles.largeRingTarget]}>
              of {target}
            </Text>
          </View>
        }
      />
      
      <Text style={[styles.percentage, isLarge && styles.largePercentage]}>
        {Math.round(percentage * 100)}%
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Horizontal Layout: Steps Left, Hydration/Sleep Right */}
      <View style={styles.horizontalLayout}>
        {/* Left Side - Steps Card */}
        <View style={styles.leftSide}>
          <RingCard
            title="Steps"
            icon="🚶‍♂️"
            percentage={stepsPct}
            current={stepsData.current.toLocaleString()}
            target={stepsData.target.toLocaleString()}
            size={stepsRingSize}
            isLarge={true}
          />
        </View>
        
        {/* Right Side - Hydration and Sleep Stacked */}
        <View style={styles.rightSide}>
          <RingCard
            title="Hydration"
            icon="💧"
            percentage={waterPct}
            current={`${waterData.current}`}
            target={`${waterData.target} oz`}
            size={smallRingSize}
          />
          
          <RingCard
            title="Sleep"
            icon="😴"
            percentage={sleepPct}
            current={formatSleepDuration(sleepData.current)}
            target={formatSleepDuration(sleepData.target)}
            size={smallRingSize}
          />
        </View>
      </View>
      
      {/* Life Score Button */}
      {onLifeScorePress && (
        <TouchableOpacity style={styles.lifeScoreButton} onPress={onLifeScorePress}>
          <Text style={styles.lifeScoreText}>View Life Score</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: theme.spacing.base,
  },
  horizontalLayout: {
    flexDirection: 'row',
    width: '100%',
    gap: theme.spacing.sm,
    alignItems: 'stretch',
    minHeight: 280, // Ensure consistent height
  },
  leftSide: {
    flex: 1.2, // Slightly larger for steps
    maxWidth: '55%',
  },
  rightSide: {
    flex: 1,
    gap: theme.spacing.sm,
    maxWidth: '45%',
  },
  ringCard: {
    alignItems: 'center',
    padding: theme.spacing.sm,
    ...theme.shadows.medium,
    flex: 1,
    justifyContent: 'center',
    minHeight: 120,
  },
  largeCard: {
    paddingVertical: theme.spacing.base,
    minHeight: 260,
  },
  smallCard: {
    paddingVertical: theme.spacing.xs,
    minHeight: 120,
  },
  cardTitle: {
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.tiny,
  },
  ringValue: {
    fontSize: Math.min(screenWidth * 0.04, theme.typography.medium),
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  largeRingValue: {
    fontSize: Math.min(screenWidth * 0.05, theme.typography.large),
  },
  ringTarget: {
    fontSize: Math.min(screenWidth * 0.025, theme.typography.xsmall),
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  largeRingTarget: {
    fontSize: Math.min(screenWidth * 0.03, theme.typography.small),
  },
  percentage: {
    fontSize: Math.min(screenWidth * 0.03, theme.typography.small),
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
  },
  largePercentage: {
    fontSize: Math.min(screenWidth * 0.035, theme.typography.regular),
  },
  lifeScoreButton: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
  lifeScoreText: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primary,
  },
});
