// Mood Selector Component
// Grid layout for mood selection with modern cards

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MoodOption } from './MoodOption';
import { theme } from '../../utils/theme';
import { MoodLevel } from '../../types';

interface MoodSelectorProps {
  selectedMood: MoodLevel | null;
  onMoodSelect: (mood: MoodLevel) => void;
}

const MOOD_OPTIONS = [
  {
    level: 5 as MoodLevel,
    label: 'Excellent',
    description: 'Feeling fantastic and energized'
  },
  {
    level: 4 as MoodLevel,
    label: 'Good',
    description: 'Positive and content'
  },
  {
    level: 3 as MoodLevel,
    label: 'Neutral',
    description: 'Balanced, neither good nor bad'
  },
  {
    level: 2 as MoodLevel,
    label: 'Low',
    description: 'Feeling down or tired'
  },
  {
    level: 1 as MoodLevel,
    label: 'Poor',
    description: 'Struggling or overwhelmed'
  }
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onMoodSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling right now?</Text>
      
      <View style={styles.grid}>
        {MOOD_OPTIONS.map((option) => (
          <View key={option.level} style={styles.gridItem}>
            <MoodOption
              level={option.level}
              label={option.label}
              description={option.description}
              isSelected={selectedMood === option.level}
              onPress={() => onMoodSelect(option.level)}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.base,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%', // Two columns with gap
  },
});
