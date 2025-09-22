// Wellness Indicators Component
// Visual indicators for mood, energy, and stress levels

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MoodLevel, EnergyLevel, StressLevel } from '../../types/coach';

interface WellnessIndicatorsProps {
  mood?: MoodLevel;
  energy?: EnergyLevel;
  stress?: StressLevel;
  showLabels?: boolean;
}

export const WellnessIndicators: React.FC<WellnessIndicatorsProps> = ({
  mood,
  energy,
  stress,
  showLabels = true,
}) => {
  const getMoodIcon = (level: MoodLevel): string => {
    switch (level) {
      case 'excellent': return '😄';
      case 'good': return '😊';
      case 'neutral': return '😐';
      case 'low': return '😔';
      case 'poor': return '😢';
    }
  };

  const getEnergyIcon = (level: EnergyLevel): string => {
    switch (level) {
      case 'high': return '⚡⚡⚡';
      case 'good': return '⚡⚡';
      case 'moderate': return '⚡';
      case 'low': return '🔋';
      case 'exhausted': return '😴';
    }
  };

  const getStressIcon = (level: StressLevel): string => {
    switch (level) {
      case 'minimal': return '😌';
      case 'low': return '🙂';
      case 'moderate': return '😐';
      case 'high': return '😰';
      case 'overwhelming': return '😫';
    }
  };

  const getIndicatorColor = (type: 'mood' | 'energy' | 'stress', level: string): string => {
    if (type === 'mood') {
      switch (level) {
        case 'excellent': case 'good': return '#10B981';
        case 'neutral': return '#F59E0B';
        case 'low': case 'poor': return '#EF4444';
      }
    }
    if (type === 'energy') {
      switch (level) {
        case 'high': case 'good': return '#10B981';
        case 'moderate': return '#F59E0B';
        case 'low': case 'exhausted': return '#EF4444';
      }
    }
    if (type === 'stress') {
      switch (level) {
        case 'minimal': case 'low': return '#10B981';
        case 'moderate': return '#F59E0B';
        case 'high': case 'overwhelming': return '#EF4444';
      }
    }
    return '#6B7280';
  };

  if (!mood && !energy && !stress) return null;

  return (
    <View style={styles.container}>
      {mood && (
        <View style={styles.indicator}>
          <View style={[styles.iconContainer, { borderColor: getIndicatorColor('mood', mood) }]}>
            <Text style={styles.icon}>{getMoodIcon(mood)}</Text>
          </View>
          {showLabels && (
            <Text style={styles.label}>Mood: {mood}</Text>
          )}
        </View>
      )}

      {energy && (
        <View style={styles.indicator}>
          <View style={[styles.iconContainer, { borderColor: getIndicatorColor('energy', energy) }]}>
            <Text style={styles.icon}>{getEnergyIcon(energy)}</Text>
          </View>
          {showLabels && (
            <Text style={styles.label}>Energy: {energy}</Text>
          )}
        </View>
      )}

      {stress && (
        <View style={styles.indicator}>
          <View style={[styles.iconContainer, { borderColor: getIndicatorColor('stress', stress) }]}>
            <Text style={styles.icon}>{getStressIcon(stress)}</Text>
          </View>
          {showLabels && (
            <Text style={styles.label}>Stress: {stress}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  indicator: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    textAlign: 'center',
  },
});
