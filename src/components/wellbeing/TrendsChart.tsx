// Trends Chart Component
// Shows Life Score history over time with interactive period selection

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { TrendsChartProps, LifeScoreTrend } from '../../types/wellbeing';

export const TrendsChart: React.FC<TrendsChartProps> = ({
  data,
  period,
  onPeriodChange,
}) => {
  const maxScore = Math.max(...data.map(d => d.score), 100);
  const minScore = Math.min(...data.map(d => d.score), 0);
  const scoreRange = maxScore - minScore || 1;

  // Calculate average score
  const averageScore = data.length > 0 
    ? Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length)
    : 0;

  // Find best and worst days
  const bestDay = data.reduce((best, current) => 
    current.score > best.score ? current : best, data[0] || { score: 0, date: '' });
  const worstDay = data.reduce((worst, current) => 
    current.score < worst.score ? current : worst, data[0] || { score: 100, date: '' });

  // Calculate streak (consecutive days above 70%)
  const calculateStreak = (): number => {
    let streak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].score >= 70) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#3B82F6';
    if (score >= 70) return '#10B981';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View style={styles.container}>
      {/* Header with period selector */}
      <View style={styles.header}>
        <Text style={styles.title}>Trends & History</Text>
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, period === '7d' && styles.periodButtonActive]}
            onPress={() => onPeriodChange('7d')}
          >
            <Text style={[styles.periodText, period === '7d' && styles.periodTextActive]}>
              7 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === '30d' && styles.periodButtonActive]}
            onPress={() => onPeriodChange('30d')}
          >
            <Text style={[styles.periodText, period === '30d' && styles.periodTextActive]}>
              30 Days
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{averageScore}%</Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {bestDay?.score || 0}%
          </Text>
          <Text style={styles.statLabel}>Best Day</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: currentStreak > 0 ? '#F59E0B' : '#6B7280' }]}>
            {currentStreak}
          </Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Chart */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.chartContainer}
        contentContainerStyle={styles.chartContent}
      >
        <View style={styles.chart}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            {[100, 75, 50, 25, 0].map((value) => (
              <Text key={value} style={styles.yAxisLabel}>
                {value}%
              </Text>
            ))}
          </View>

          {/* Chart bars */}
          <View style={styles.barsContainer}>
            {data.map((item, index) => {
              const barHeight = ((item.score - minScore) / scoreRange) * 120;
              const color = getScoreColor(item.score);
              
              return (
                <View key={index} style={styles.barContainer}>
                  {/* Bar */}
                  <View style={styles.barWrapper}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: Math.max(barHeight, 2),
                          backgroundColor: color,
                        }
                      ]} 
                    />
                    {/* Score label on bar */}
                    <Text style={[styles.barLabel, { color }]}>
                      {Math.round(item.score)}
                    </Text>
                  </View>
                  
                  {/* Date label */}
                  <Text style={styles.dateLabel}>
                    {formatDate(item.date)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Streak badges */}
      {currentStreak > 0 && (
        <View style={styles.streakContainer}>
          <Text style={styles.streakIcon}>🔥</Text>
          <Text style={styles.streakText}>
            {currentStreak}-day streak of 70%+ scores!
          </Text>
          {currentStreak >= 7 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>Week Warrior</Text>
            </View>
          )}
        </View>
      )}
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: 'white',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  periodTextActive: {
    color: '#1f2937',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  chartContainer: {
    marginBottom: 16,
  },
  chartContent: {
    paddingRight: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 160,
  },
  yAxis: {
    justifyContent: 'space-between',
    height: 120,
    marginRight: 8,
    paddingVertical: 10,
  },
  yAxisLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'right',
    width: 30,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    paddingVertical: 10,
  },
  barContainer: {
    alignItems: 'center',
    marginHorizontal: 3,
    minWidth: 32,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 100,
    position: 'relative',
  },
  bar: {
    width: 20,
    borderRadius: 2,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
    position: 'absolute',
    top: -16,
  },
  dateLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
    transform: [{ rotate: '-45deg' }],
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  streakIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  streakText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
    flex: 1,
  },
  streakBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
});
