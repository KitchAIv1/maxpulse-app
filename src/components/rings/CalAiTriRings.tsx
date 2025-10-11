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
  moodPct: number;
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
  moodData: {
    current: number;
    target: number;
  };
  onLifeScorePress?: () => void;
}

export const CalAiTriRings: React.FC<CalAiTriRingsProps> = ({
  stepsPct,
  waterPct,
  sleepPct,
  moodPct,
  stepsData,
  waterData,
  sleepData,
  moodData,
  onLifeScorePress,
}) => {
  // Calculate responsive ring sizes based on screen width
  const stepsRingSize = Math.min(screenWidth * 0.30, 120); // Decreased from 0.35/140 to 0.30/120
  const smallRingSize = Math.min(screenWidth * 0.22, 90); // Optimized for better fit in smaller containers

  // Landscape Steps Card (label left, ring right, percentage below label)
  const LandscapeStepsCard: React.FC<{
    title: string;
    icon: string;
    percentage: number;
    current: string;
    target: string;
    size: number;
  }> = ({ title, icon, percentage, current, target, size }) => (
    <View style={[styles.landscapeStepsCard, calAiCard.base]}>
      <View style={styles.landscapeLeft}>
        <Text style={styles.landscapeTitle}>{title}</Text>
        <Text style={styles.landscapePercentage}>
          {Math.round(percentage * 100)}%
        </Text>
      </View>
      
      <View style={styles.landscapeRight}>
        <CalAiRing
          percentage={percentage}
          size={size}
        centerContent={
          <View style={styles.ringCenter}>
            <Text style={styles.largeRingIcon}>{icon}</Text>
            <Text style={styles.largeRingValue}>
              {current}
            </Text>
            <Text style={styles.largeRingTarget}>
              of {target}
            </Text>
          </View>
        }
        />
      </View>
    </View>
  );

  // Small Ring Card (label top, percentage below label, ring below)
  const SmallRingCard: React.FC<{
    title: string;
    icon: string;
    percentage: number;
    current: string;
    target: string;
    size: number;
  }> = ({ title, icon, percentage, current, target, size }) => (
    <View style={[styles.smallRingCard, calAiCard.base]}>
      <Text style={styles.smallCardTitle}>{title}</Text>
      
      <CalAiRing
        percentage={percentage}
        size={size}
        centerContent={
          <View style={styles.ringCenter}>
            <Text style={styles.smallRingIcon}>{icon}</Text>
            <Text style={styles.ringValue}>
              {current}
            </Text>
            <Text style={styles.ringTarget}>
              of {target}
            </Text>
          </View>
        }
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top - Landscape Steps Card */}
      <LandscapeStepsCard
        title="Steps"
        icon="🚶‍♂️"
        percentage={stepsPct}
        current={stepsData.current.toLocaleString()}
        target={stepsData.target.toLocaleString()}
        size={stepsRingSize}
      />
      
      {/* Bottom - Three Cards in a Row: Hydration, Sleep, Mood */}
      <View style={styles.threeCardRow}>
        <SmallRingCard
          title="Hydration"
          icon="💧"
          percentage={waterPct}
          current={`${waterData.current}`}
          target={`${waterData.target} oz`}
          size={smallRingSize}
        />
        
        <SmallRingCard
          title="Sleep"
          icon="😴"
          percentage={sleepPct}
          current={formatSleepDuration(sleepData.current)}
          target={formatSleepDuration(sleepData.target)}
          size={smallRingSize}
        />
        
        <SmallRingCard
          title="Mood"
          icon="😊"
          percentage={moodPct}
          current={`${moodData.current}`}
          target={`${moodData.target}`}
          size={smallRingSize}
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
  threeCardRow: {
    flexDirection: 'row',
    width: '100%',
    gap: theme.spacing.sm, // Increased from xs to sm for better spacing
    justifyContent: 'space-between',
  },
  // Landscape Steps Card Styles
  landscapeStepsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.base,
    minHeight: 160,
  },
  landscapeLeft: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: theme.spacing.sm, // Move label to the right
  },
  landscapeTitle: {
    fontSize: theme.typography.large,
    fontWeight: '360', // Decreased by 40% from semibold (600) to 360
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  landscapePercentage: {
    fontSize: theme.typography.small, // Decreased by half (from medium ~18px to small ~14px)
    fontWeight: theme.typography.weights.regular, // Removed boldness (changed from bold to regular)
    color: theme.colors.textPrimary,
  },
  landscapeRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Small Ring Card Styles
  smallRingCard: {
    alignItems: 'center',
    padding: theme.spacing.xs, // Reduced padding for tighter container
    flex: 1,
    justifyContent: 'center',
    minHeight: 160, // Reduced from 180 to 160
    maxWidth: '32%', // Ensure proper sizing with spacing
  },
  smallCardTitle: {
    fontSize: theme.typography.small, // Decreased from regular to small
    fontWeight: '425', // Decreased by 0.25 from semibold (600) to 425
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm, // Increased margin for better spacing without percentage
  },
  // Common Ring Styles
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeRingIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.tiny,
  },
  smallRingIcon: {
    fontSize: 18, // Decreased from 24 to 18 for smaller cards
    marginBottom: theme.spacing.tiny,
  },
  ringValue: {
    fontSize: Math.min(screenWidth * 0.03, theme.typography.small),
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  largeRingValue: {
    fontSize: Math.min(screenWidth * 0.045, theme.typography.medium),
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  ringTarget: {
    fontSize: Math.min(screenWidth * 0.02, theme.typography.tiny),
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 0, // Reduced from 2 to 0 to decrease spacing
  },
  largeRingTarget: {
    fontSize: Math.min(screenWidth * 0.025, theme.typography.xsmall),
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 0, // Reduced from 2 to 0 to decrease spacing
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
