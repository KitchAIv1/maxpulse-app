// Cal AI Triple Ring Layout Component
// Main steps card on top (large), hydration and sleep cards below (smaller)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalAiRing } from './CalAiRing';
import { theme } from '../../utils/theme';
import { calAiCard } from '../../utils/calAiStyles';
import { formatSleepDuration } from '../../utils';

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
      {/* Large Steps Card */}
      <RingCard
        title="Steps"
        icon="🚶‍♂️"
        percentage={stepsPct}
        current={stepsData.current.toLocaleString()}
        target={stepsData.target.toLocaleString()}
        size={200}
        isLarge={true}
      />
      
      {/* Bottom Row - Hydration and Sleep */}
      <View style={styles.bottomRow}>
        <RingCard
          title="Hydration"
          icon="💧"
          percentage={waterPct}
          current={`${waterData.current}`}
          target={`${waterData.target} oz`}
          size={150}
        />
        
        <RingCard
          title="Sleep"
          icon="😴"
          percentage={sleepPct}
          current={formatSleepDuration(sleepData.current)}
          target={formatSleepDuration(sleepData.target)}
          size={150}
        />
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
  ringCard: {
    alignItems: 'center',
    padding: theme.spacing.base,
    ...theme.shadows.medium,
  },
  largeCard: {
    minWidth: 240,
    paddingVertical: theme.spacing.lg,
  },
  smallCard: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    minWidth: 180,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    width: '100%',
    justifyContent: 'center',
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
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  largeRingValue: {
    fontSize: theme.typography.large,
  },
  ringTarget: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  largeRingTarget: {
    fontSize: theme.typography.small,
  },
  percentage: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
  },
  largePercentage: {
    fontSize: theme.typography.regular,
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
