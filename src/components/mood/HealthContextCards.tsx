// Health Context Cards Component
// Dashboard-style cards showing current health metrics

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';

interface HealthContextData {
  sleepHours?: number;
  hydrationOz?: number;
  stepsCount?: number;
}

interface HealthContextCardsProps {
  healthContext?: HealthContextData;
}

interface ContextCardProps {
  icon: string;
  label: string;
  value: string;
  color: string;
  subtitle?: string;
}

const ContextCard: React.FC<ContextCardProps> = ({
  icon,
  label,
  value,
  color,
  subtitle,
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Icon name={icon} size={18} color={color} />
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
    <Text style={styles.cardValue}>{value}</Text>
    {subtitle && (
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    )}
  </View>
);

export const HealthContextCards: React.FC<HealthContextCardsProps> = ({
  healthContext,
}) => {
  if (!healthContext) return null;

  const { sleepHours, hydrationOz, stepsCount } = healthContext;
  
  // Generate contextual insights
  const getInsights = () => {
    const insights = [];
    
    if (sleepHours !== undefined && sleepHours < 7) {
      insights.push("Less sleep can affect mood and energy levels");
    }
    
    if (hydrationOz !== undefined && hydrationOz < 40) {
      insights.push("Staying hydrated helps with mood and focus");
    }
    
    if (stepsCount !== undefined && stepsCount > 8000) {
      insights.push("Physical activity often boosts mood");
    }
    
    return insights;
  };

  const insights = getInsights();
  const hasData = sleepHours !== undefined || hydrationOz !== undefined || stepsCount !== undefined;

  if (!hasData) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Context</Text>
      
      <View style={styles.cardsContainer}>
        {stepsCount !== undefined && (
          <ContextCard
            icon="footsteps"
            label="Steps"
            value={stepsCount.toLocaleString()}
            color={theme.colors.ringSteps}
            subtitle="today"
          />
        )}
        
        {hydrationOz !== undefined && (
          <ContextCard
            icon="water"
            label="Water"
            value={`${hydrationOz}oz`}
            color={theme.colors.ringHydration}
            subtitle="consumed"
          />
        )}
        
        {sleepHours !== undefined && (
          <ContextCard
            icon="moon"
            label="Sleep"
            value={`${sleepHours}h`}
            color={theme.colors.ringSleep}
            subtitle="last night"
          />
        )}
      </View>
      
      {insights.length > 0 && (
        <View style={styles.insightsContainer}>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <Icon 
                name="bulb-outline" 
                size={14} 
                color={theme.colors.ringMood} 
                style={styles.insightIcon}
              />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>
      )}
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
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.base,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    ...theme.shadows.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  cardLabel: {
    fontSize: theme.typography.xsmall,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  cardValue: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: theme.typography.tiny,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.tiny,
  },
  insightsContainer: {
    gap: theme.spacing.xs,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${theme.colors.ringMood}10`, // 10% opacity
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
  },
  insightIcon: {
    marginRight: theme.spacing.xs,
    marginTop: 1, // Align with text baseline
  },
  insightText: {
    flex: 1,
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeights.normal * theme.typography.xsmall,
  },
});
