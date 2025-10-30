// Week Progress Chart Component
// Single responsibility: Visual chart showing daily progress throughout the week

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { WeeklyPerformance, HealthPillar } from '../../types/assessment';
import { theme } from '../../utils/theme';

interface WeekProgressChartProps {
  performance: WeeklyPerformance;
  selectedPillar?: HealthPillar;
  onPillarSelect?: (pillar: HealthPillar) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - (theme.spacing.lg * 2);
const barWidth = (chartWidth - (theme.spacing.sm * 6)) / 7; // 7 days with spacing

export const WeekProgressChart: React.FC<WeekProgressChartProps> = ({
  performance,
  selectedPillar = 'steps',
  onPillarSelect,
}) => {
  const getPillarData = (pillar: HealthPillar) => {
    return performance.pillarBreakdown.find(p => p.pillar === pillar);
  };

  const getPillarIcon = (pillar: HealthPillar): string => {
    switch (pillar) {
      case 'steps': return 'footsteps';
      case 'water': return 'water';
      case 'sleep': return 'moon';
      case 'mood': return 'happy';
      default: return 'help-circle';
    }
  };

  const getPillarName = (pillar: HealthPillar): string => {
    switch (pillar) {
      case 'steps': return 'Steps';
      case 'water': return 'Hydration';
      case 'sleep': return 'Sleep';
      case 'mood': return 'Mood';
      default: return pillar;
    }
  };

  const getBarColor = (value: number): string => {
    if (value >= 90) return theme.colors.success;
    if (value >= 80) return '#4CAF50'; // Light green
    if (value >= 60) return theme.colors.warning;
    if (value >= 40) return '#FF9800'; // Light orange
    return theme.colors.error;
  };

  const getDayLabel = (dayIndex: number): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex] || `D${dayIndex + 1}`;
  };

  const selectedPillarData = getPillarData(selectedPillar);
  const dailyValues = selectedPillarData?.dailyValues || [];

  // Ensure we have 7 days of data (fill missing with 0)
  const chartData = Array.from({ length: 7 }, (_, index) => ({
    day: getDayLabel(index),
    value: dailyValues[index] || 0,
    dayIndex: index,
  }));

  const maxValue = Math.max(100, ...dailyValues);
  const averageValue = dailyValues.length > 0 
    ? dailyValues.reduce((sum, val) => sum + val, 0) / dailyValues.length 
    : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Daily Progress</Text>
        <Text style={styles.subtitle}>
          {getPillarName(selectedPillar)} • Week {performance.week}
        </Text>
      </View>

      {/* Pillar Selector */}
      <View style={styles.pillarSelector}>
        {(['steps', 'water', 'sleep', 'mood'] as HealthPillar[]).map((pillar) => {
          const pillarData = getPillarData(pillar);
          const isSelected = pillar === selectedPillar;
          
          return (
            <View
              key={pillar}
              style={[
                styles.pillarTab,
                isSelected && styles.selectedPillarTab
              ]}
            >
              <Icon 
                name={getPillarIcon(pillar)} 
                size={16} 
                color={isSelected ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.pillarTabText,
                isSelected && styles.selectedPillarTabText
              ]}>
                {getPillarName(pillar)}
              </Text>
              <Text style={[
                styles.pillarTabValue,
                isSelected && styles.selectedPillarTabValue
              ]}>
                {pillarData ? Math.round(pillarData.averageAchievement) : 0}%
              </Text>
            </View>
          );
        })}
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>100%</Text>
          <Text style={styles.yAxisLabel}>80%</Text>
          <Text style={styles.yAxisLabel}>60%</Text>
          <Text style={styles.yAxisLabel}>40%</Text>
          <Text style={styles.yAxisLabel}>20%</Text>
          <Text style={styles.yAxisLabel}>0%</Text>
        </View>

        {/* Chart area */}
        <View style={styles.chartArea}>
          {/* Grid lines */}
          <View style={styles.gridLines}>
            {[100, 80, 60, 40, 20, 0].map((value) => (
              <View 
                key={value} 
                style={[
                  styles.gridLine,
                  value === 80 && styles.targetLine // Highlight 80% line
                ]} 
              />
            ))}
          </View>

          {/* Average line */}
          <View 
            style={[
              styles.averageLine,
              { bottom: `${(averageValue / maxValue) * 100}%` }
            ]}
          />

          {/* Bars */}
          <View style={styles.barsContainer}>
            {chartData.map((data, index) => {
              const barHeight = (data.value / maxValue) * 100;
              const isWeekend = data.dayIndex === 0 || data.dayIndex === 6;
              
              return (
                <View key={data.day} style={styles.barContainer}>
                  {/* Bar */}
                  <View style={styles.barWrapper}>
                    <View 
                      style={[
                        styles.bar,
                        {
                          height: `${barHeight}%`,
                          backgroundColor: getBarColor(data.value),
                          opacity: data.value === 0 ? 0.3 : 1,
                        }
                      ]}
                    />
                    {/* Value label on bar */}
                    {data.value > 0 && (
                      <Text style={styles.barValueLabel}>
                        {Math.round(data.value)}%
                      </Text>
                    )}
                  </View>
                  
                  {/* Day label */}
                  <Text style={[
                    styles.dayLabel,
                    isWeekend && styles.weekendLabel
                  ]}>
                    {data.day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: theme.colors.success }]} />
          <Text style={styles.legendText}>Excellent (90%+)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: theme.colors.warning }]} />
          <Text style={styles.legendText}>Good (60-89%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: theme.colors.error }]} />
          <Text style={styles.legendText}>Needs Work (<60%)</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round(averageValue)}%</Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {selectedPillarData?.consistentDays || 0}/{performance.totalTrackingDays}
          </Text>
          <Text style={styles.statLabel}>Consistent Days</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {selectedPillarData?.trend === 'improving' ? '↗️' : 
             selectedPillarData?.trend === 'declining' ? '↘️' : '→'}
          </Text>
          <Text style={styles.statLabel}>Trend</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.base,
    ...theme.shadows.subtle,
  },
  header: {
    marginBottom: theme.spacing.base,
  },
  title: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  pillarSelector: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
  },
  pillarTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  selectedPillarTab: {
    backgroundColor: theme.colors.primaryLight,
  },
  pillarTabText: {
    fontSize: theme.typography.tiny,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontWeight: theme.typography.weights.medium,
  },
  selectedPillarTabText: {
    color: theme.colors.primary,
  },
  pillarTabValue: {
    fontSize: theme.typography.tiny,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
    fontWeight: theme.typography.weights.bold,
  },
  selectedPillarTabValue: {
    color: theme.colors.primary,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 200,
    marginBottom: theme.spacing.base,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: theme.spacing.sm,
  },
  yAxisLabel: {
    fontSize: theme.typography.tiny,
    color: theme.colors.textTertiary,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: theme.colors.border,
    opacity: 0.3,
  },
  targetLine: {
    backgroundColor: theme.colors.warning,
    opacity: 0.6,
    height: 2,
  },
  averageLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.accent,
    opacity: 0.8,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    justifyContent: 'space-between',
  },
  barContainer: {
    alignItems: 'center',
    width: barWidth,
  },
  barWrapper: {
    width: '100%',
    height: '85%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  bar: {
    width: '80%',
    borderRadius: theme.borderRadius.xs,
    minHeight: 2,
  },
  barValueLabel: {
    position: 'absolute',
    top: -20,
    fontSize: theme.typography.tiny,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.bold,
  },
  dayLabel: {
    fontSize: theme.typography.tiny,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontWeight: theme.typography.weights.medium,
  },
  weekendLabel: {
    color: theme.colors.accent,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.base,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: theme.spacing.xs,
  },
  legendText: {
    fontSize: theme.typography.tiny,
    color: theme.colors.textTertiary,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.base,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: theme.typography.tiny,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
