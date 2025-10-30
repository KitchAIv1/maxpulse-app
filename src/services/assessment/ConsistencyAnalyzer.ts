// Consistency Analyzer Service
// Single responsibility: Analyze daily consistency patterns and streaks

import { ConsistencyMetrics, TimePattern, PillarPerformance } from '../../types/assessment';
import { DailyMetrics } from '../../types';

export class ConsistencyAnalyzer {
  /**
   * Analyze consistency patterns for weekly performance data
   */
  static analyzeWeeklyConsistency(
    pillarBreakdown: PillarPerformance[],
    dailyMetrics: DailyMetrics[]
  ): ConsistencyMetrics {
    const totalDays = Math.max(...pillarBreakdown.map(p => p.dailyValues.length));
    const consistentDays = this.calculateOverallConsistentDays(pillarBreakdown);
    const consistencyRate = totalDays > 0 ? (consistentDays / totalDays) * 100 : 0;
    
    const streakData = this.calculateStreakMetrics(pillarBreakdown);
    const weekendConsistency = this.calculateWeekendConsistency(pillarBreakdown, dailyMetrics);
    const timeOfDayPatterns = this.analyzeTimeOfDayPatterns(dailyMetrics);

    return {
      totalDays,
      consistentDays,
      consistencyRate: Math.round(consistencyRate * 100) / 100,
      longestStreak: streakData.longestStreak,
      currentStreak: streakData.currentStreak,
      weekendConsistency,
      timeOfDayPatterns,
    };
  }

  /**
   * Calculate days where user achieved 80%+ across all pillars
   */
  private static calculateOverallConsistentDays(pillarBreakdown: PillarPerformance[]): number {
    const maxDays = Math.max(...pillarBreakdown.map(p => p.dailyValues.length));
    let consistentDays = 0;

    for (let dayIndex = 0; dayIndex < maxDays; dayIndex++) {
      const dayAverage = pillarBreakdown.reduce((sum, pillar) => {
        return sum + (pillar.dailyValues[dayIndex] || 0);
      }, 0) / pillarBreakdown.length;

      if (dayAverage >= 80) {
        consistentDays++;
      }
    }

    return consistentDays;
  }

  /**
   * Calculate streak metrics (longest and current streaks)
   */
  private static calculateStreakMetrics(pillarBreakdown: PillarPerformance[]): {
    longestStreak: number;
    currentStreak: number;
  } {
    const maxDays = Math.max(...pillarBreakdown.map(p => p.dailyValues.length));
    const dailyConsistency: boolean[] = [];

    // Determine which days were consistent (80%+ overall)
    for (let dayIndex = 0; dayIndex < maxDays; dayIndex++) {
      const dayAverage = pillarBreakdown.reduce((sum, pillar) => {
        return sum + (pillar.dailyValues[dayIndex] || 0);
      }, 0) / pillarBreakdown.length;

      dailyConsistency.push(dayAverage >= 80);
    }

    // Calculate longest streak
    let longestStreak = 0;
    let currentStreakLength = 0;

    for (const isConsistent of dailyConsistency) {
      if (isConsistent) {
        currentStreakLength++;
        longestStreak = Math.max(longestStreak, currentStreakLength);
      } else {
        currentStreakLength = 0;
      }
    }

    // Calculate current streak (from the end)
    let currentStreak = 0;
    for (let i = dailyConsistency.length - 1; i >= 0; i--) {
      if (dailyConsistency[i]) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { longestStreak, currentStreak };
  }

  /**
   * Calculate weekend vs weekday consistency comparison
   */
  private static calculateWeekendConsistency(
    pillarBreakdown: PillarPerformance[],
    dailyMetrics: DailyMetrics[]
  ): number {
    if (dailyMetrics.length === 0) return 0;

    const weekendDays: number[] = [];
    const weekdayDays: number[] = [];

    dailyMetrics.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
      
      const dayAverage = pillarBreakdown.reduce((sum, pillar) => {
        return sum + (pillar.dailyValues[index] || 0);
      }, 0) / pillarBreakdown.length;

      if (isWeekend) {
        weekendDays.push(dayAverage);
      } else {
        weekdayDays.push(dayAverage);
      }
    });

    if (weekendDays.length === 0 || weekdayDays.length === 0) return 100;

    const weekendAvg = weekendDays.reduce((sum, val) => sum + val, 0) / weekendDays.length;
    const weekdayAvg = weekdayDays.reduce((sum, val) => sum + val, 0) / weekdayDays.length;

    // Return weekend performance as percentage of weekday performance
    return weekdayAvg > 0 ? Math.round((weekendAvg / weekdayAvg) * 100) : 100;
  }

  /**
   * Analyze time-of-day patterns (placeholder for future enhancement)
   */
  private static analyzeTimeOfDayPatterns(dailyMetrics: DailyMetrics[]): TimePattern[] {
    // For MVP, return basic patterns
    // In future versions, this could analyze actual logging times from hydration_logs, etc.
    return [
      {
        period: 'morning',
        averagePerformance: 85,
        consistency: 75,
      },
      {
        period: 'afternoon',
        averagePerformance: 78,
        consistency: 68,
      },
      {
        period: 'evening',
        averagePerformance: 72,
        consistency: 82,
      },
    ];
  }

  /**
   * Calculate consistency rate for a specific pillar
   */
  static calculatePillarConsistency(pillarPerformance: PillarPerformance): number {
    const totalDays = pillarPerformance.dailyValues.length;
    if (totalDays === 0) return 0;

    const consistentDays = pillarPerformance.dailyValues.filter(value => value >= 80).length;
    return Math.round((consistentDays / totalDays) * 100);
  }

  /**
   * Identify consistency patterns and issues
   */
  static identifyConsistencyPatterns(consistency: ConsistencyMetrics): {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Analyze consistency rate
    if (consistency.consistencyRate >= 80) {
      strengths.push('Excellent overall consistency');
    } else if (consistency.consistencyRate >= 60) {
      strengths.push('Good consistency with room for improvement');
    } else {
      weaknesses.push('Inconsistent daily performance');
      recommendations.push('Focus on building daily habits and routines');
    }

    // Analyze streaks
    if (consistency.currentStreak >= 3) {
      strengths.push(`Strong current streak of ${consistency.currentStreak} days`);
    } else if (consistency.longestStreak >= 5) {
      strengths.push('Has demonstrated ability to maintain streaks');
      recommendations.push('Work on rebuilding your previous streak momentum');
    } else {
      weaknesses.push('Difficulty maintaining consistent streaks');
      recommendations.push('Start with small, achievable daily goals');
    }

    // Analyze weekend performance
    if (consistency.weekendConsistency >= 90) {
      strengths.push('Maintains consistency on weekends');
    } else if (consistency.weekendConsistency < 70) {
      weaknesses.push('Weekend performance drops significantly');
      recommendations.push('Plan weekend routines to maintain healthy habits');
    }

    return { strengths, weaknesses, recommendations };
  }
}
