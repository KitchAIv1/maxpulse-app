// Contribution Bar Component
// Shows individual metric contributions to Life Score

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ContributionBarProps } from '../../types/wellbeing';

export const ContributionBar: React.FC<ContributionBarProps> = ({
  label,
  percentage,
  color,
  onPress,
}) => {
  const clampedPercentage = Math.max(0, Math.min(1, percentage));
  const displayPercentage = Math.round(clampedPercentage * 100);

  const getIcon = (label: string): string => {
    switch (label.toLowerCase()) {
      case 'steps':
        return '👟';
      case 'hydration':
        return '💧';
      case 'sleep':
        return '😴';
      case 'mood':
        return '😊';
      case 'ai engagement':
        return '🤖';
      default:
        return '📊';
    }
  };

  const getStatusText = (percentage: number): string => {
    if (percentage >= 1) return 'Complete';
    if (percentage >= 0.8) return 'Great';
    if (percentage >= 0.6) return 'Good';
    if (percentage >= 0.4) return 'Fair';
    return 'Needs attention';
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component 
      style={[styles.container, onPress && styles.clickable]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <Text style={styles.icon}>{getIcon(label)}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
        <View style={styles.valueContainer}>
          <Text style={[styles.percentage, { color }]}>
            {displayPercentage}%
          </Text>
          <Text style={styles.status}>
            {getStatusText(clampedPercentage)}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${displayPercentage}%`,
                backgroundColor: color,
              }
            ]} 
          />
        </View>
        
        {/* Milestone markers */}
        <View style={styles.milestones}>
          {[25, 50, 75, 100].map((milestone) => (
            <View 
              key={milestone}
              style={[
                styles.milestone,
                { 
                  left: `${milestone}%`,
                  backgroundColor: displayPercentage >= milestone ? color : 'rgba(255, 255, 255, 0.3)'
                }
              ]} 
            />
          ))}
        </View>
      </View>

      {/* Click indicator */}
      {onPress && (
        <View style={styles.clickIndicator}>
          <Text style={styles.clickText}>Tap for details →</Text>
        </View>
      )}
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  clickable: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  percentage: {
    fontSize: 18,
    fontWeight: '700',
  },
  status: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  progressContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2, // Ensure some visual feedback even at 0%
  },
  milestones: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
  },
  milestone: {
    position: 'absolute',
    width: 2,
    height: 8,
    marginLeft: -1,
  },
  clickIndicator: {
    alignItems: 'center',
    marginTop: 4,
  },
  clickText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
});
