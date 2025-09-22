// Daily Insights Component
// AI-generated summary and suggestions for Life Score

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DailyInsight } from '../../types/wellbeing';

interface DailyInsightsProps {
  insight: DailyInsight;
  onBoostAction?: () => void;
}

export const DailyInsights: React.FC<DailyInsightsProps> = ({
  insight,
  onBoostAction,
}) => {
  const getMoodIcon = (mood: DailyInsight['mood']): string => {
    switch (mood) {
      case 'positive':
        return '🎉';
      case 'neutral':
        return '📊';
      case 'needs-improvement':
        return '💪';
    }
  };

  const getMoodColor = (mood: DailyInsight['mood']): string => {
    switch (mood) {
      case 'positive':
        return '#10B981';
      case 'neutral':
        return '#F59E0B';
      case 'needs-improvement':
        return '#EF4444';
    }
  };

  const getMoodTitle = (mood: DailyInsight['mood']): string => {
    switch (mood) {
      case 'positive':
        return 'Great Progress!';
      case 'neutral':
        return 'Steady Going';
      case 'needs-improvement':
        return 'Room to Improve';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>{getMoodIcon(insight.mood)}</Text>
          <Text style={styles.title}>{getMoodTitle(insight.mood)}</Text>
        </View>
        <View style={[styles.moodBadge, { backgroundColor: getMoodColor(insight.mood) }]}>
          <Text style={styles.moodText}>AI Insight</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summary}>{insight.summary}</Text>
      </View>

      {/* Reason */}
      <View style={styles.reasonContainer}>
        <Text style={styles.reasonLabel}>Why:</Text>
        <Text style={styles.reason}>{insight.reason}</Text>
      </View>

      {/* Suggestion */}
      <View style={styles.suggestionContainer}>
        <View style={styles.suggestionHeader}>
          <Text style={styles.suggestionIcon}>💡</Text>
          <Text style={styles.suggestionLabel}>Boost your score now:</Text>
        </View>
        <Text style={styles.suggestion}>{insight.suggestion}</Text>
        
        {onBoostAction && (
          <TouchableOpacity 
            style={[styles.boostButton, { backgroundColor: getMoodColor(insight.mood) }]}
            onPress={onBoostAction}
            activeOpacity={0.8}
          >
            <Text style={styles.boostButtonText}>Do it now</Text>
            <Text style={styles.boostButtonIcon}>⚡</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* AI Coach teaser */}
      <View style={styles.coachTeaser}>
        <Text style={styles.coachText}>
          Want personalized advice? Ask your AI Coach for deeper insights.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  moodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summary: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
    fontWeight: '500',
  },
  reasonContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  reason: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  suggestionContainer: {
    marginBottom: 16,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  suggestionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  suggestion: {
    fontSize: 15,
    color: 'white',
    lineHeight: 22,
    marginBottom: 12,
  },
  boostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  boostButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 6,
  },
  boostButtonIcon: {
    fontSize: 16,
  },
  coachTeaser: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  coachText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
