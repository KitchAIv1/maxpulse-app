// Cal AI Triple Ring Layout Component
// Main steps card on top (large), hydration and sleep cards below (smaller)
// With smooth animated transitions when percentages change

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
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
  
  // Animated values for smooth ring transitions
  const [animatedStepsPct] = useState(new Animated.Value(stepsPct));
  const [animatedWaterPct] = useState(new Animated.Value(waterPct));
  const [animatedSleepPct] = useState(new Animated.Value(sleepPct));
  const [animatedMoodPct] = useState(new Animated.Value(moodPct));
  
  // Animate percentages when they change
  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedStepsPct, {
        toValue: stepsPct,
        duration: 800,
        useNativeDriver: false, // Can't use native driver for SVG animations
      }),
      Animated.timing(animatedWaterPct, {
        toValue: waterPct,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(animatedSleepPct, {
        toValue: sleepPct,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(animatedMoodPct, {
        toValue: moodPct,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  }, [stepsPct, waterPct, sleepPct, moodPct]);

  // Landscape Steps Card (label left, ring right, percentage below label)
  const LandscapeStepsCard: React.FC<{
    title: string;
    icon: string;
    percentage: number | Animated.Value;
    current: string;
    target: string;
    size: number;
    accentColor?: string;
  }> = ({ title, icon, percentage, current, target, size, accentColor }) => {
    // Create animated percentage text
    const displayPercentage = typeof percentage === 'number' 
      ? Math.round(percentage * 100)
      : 0; // For animated values, we'll just show static percentage
    
    return (
      <View style={[styles.landscapeStepsCard, calAiCard.base]}>
        <View style={styles.landscapeLeft}>
          <Text style={styles.landscapeTitle}>{title}</Text>
          <Text style={styles.landscapePercentage}>
            {displayPercentage}%
          </Text>
        </View>
        
        <View style={styles.landscapeRight}>
          <CalAiRing
            percentage={percentage}
            size={size}
            accentColor={accentColor}
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
  };

  // Small Ring Card (label top, percentage below label, ring below)
  const SmallRingCard: React.FC<{
    title: string;
    icon: string | { name: string; size?: number };
    percentage: number | Animated.Value;
    current: string;
    target: string;
    size: number;
    accentColor?: string;
  }> = ({ title, icon, percentage, current, target, size, accentColor }) => (
    <View style={[styles.smallRingCard, calAiCard.base]}>
      <Text style={styles.smallCardTitle}>{title}</Text>
      
      <CalAiRing
        percentage={percentage}
        size={size}
        accentColor={accentColor}
        centerContent={
          <View style={styles.ringCenter}>
            {typeof icon === 'string' ? (
              <Text style={styles.smallRingIcon}>{icon}</Text>
            ) : (
              <Icon 
                name={icon.name} 
                size={icon.size || 20} 
                color={accentColor || theme.colors.textPrimary}
                style={styles.smallRingIconVector}
              />
            )}
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
        percentage={animatedStepsPct}
        current={stepsData.current.toLocaleString()}
        target={stepsData.target.toLocaleString()}
        size={stepsRingSize}
        accentColor={theme.colors.ringSteps}
      />
      
      {/* Bottom - Three Cards in a Row: Hydration, Sleep, Mood */}
      <View style={styles.threeCardRow}>
        <SmallRingCard
          title="Hydration"
          icon={{ name: 'water-outline', size: 18 }}
          percentage={animatedWaterPct}
          current={`${waterData.current}`}
          target={`${waterData.target} oz`}
          size={smallRingSize}
          accentColor={theme.colors.ringHydration}
        />
        
        <SmallRingCard
          title="Sleep"
          icon={{ name: 'moon-outline', size: 18 }}
          percentage={animatedSleepPct}
          current={formatSleepDuration(sleepData.current)}
          target={formatSleepDuration(sleepData.target)}
          size={smallRingSize}
          accentColor={theme.colors.ringSleep}
        />
        
        <SmallRingCard
          title="Mood"
          icon={{ name: 'happy-outline', size: 18 }}
          percentage={animatedMoodPct}
          current={`${moodData.current}`}
          target={`${moodData.target}`}
          size={smallRingSize}
          accentColor={theme.colors.ringMood}
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
    gap: theme.spacing.sm,
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
  smallRingIconVector: {
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
