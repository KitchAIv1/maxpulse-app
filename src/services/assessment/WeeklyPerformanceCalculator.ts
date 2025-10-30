// Weekly Performance Calculator Service
// Single responsibility: Calculate weekly performance metrics from daily data

import { supabase } from '../supabase';
import { WeeklyPerformance, PillarPerformance, HealthPillar } from '../../types/assessment';
import { DailyMetrics } from '../../types';

export class WeeklyPerformanceCalculator {
  /**
   * Calculate comprehensive weekly performance for a user's specific week
   */
  static async calculateWeekPerformance(
    userId: string, 
    weekNumber: number, 
    startDate: string, 
    endDate: string
  ): Promise<WeeklyPerformance | null> {
    try {
      const dailyMetrics = await this.getDailyMetricsForWeek(userId, startDate, endDate);
      
      if (!dailyMetrics || dailyMetrics.length === 0) {
        return null;
      }

      const pillarBreakdown = this.calculatePillarBreakdown(dailyMetrics);
      const averageAchievement = this.calculateOverallAverage(pillarBreakdown);
      const consistencyDays = this.calculateConsistencyDays(pillarBreakdown);
      const { strongestPillar, weakestPillar } = this.identifyPillarStrengths(pillarBreakdown);
      const overallGrade = this.determinePerformanceGrade(averageAchievement, consistencyDays);
      const phase = Math.ceil(weekNumber / 4);

      return {
        week: weekNumber,
        phase,
        startDate,
        endDate,
        averageAchievement,
        consistencyDays,
        totalTrackingDays: dailyMetrics.length,
        strongestPillar,
        weakestPillar,
        overallGrade,
        pillarBreakdown,
      };
    } catch (error) {
      console.error('Error calculating weekly performance:', error);
      return null;
    }
  }

  /**
   * Get daily metrics for a specific week date range
   */
  private static async getDailyMetricsForWeek(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<DailyMetrics[]> {
    const { data, error } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching daily metrics:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Calculate performance breakdown for each health pillar
   */
  private static calculatePillarBreakdown(dailyMetrics: DailyMetrics[]): PillarPerformance[] {
    const pillars: HealthPillar[] = ['steps', 'water', 'sleep', 'mood'];
    
    return pillars.map(pillar => {
      const dailyValues = dailyMetrics.map(day => this.calculateDailyPillarPercentage(day, pillar));
      const averageAchievement = dailyValues.reduce((sum, val) => sum + val, 0) / dailyValues.length;
      const consistentDays = dailyValues.filter(val => val >= 80).length;
      const trend = this.calculateTrend(dailyValues);

      return {
        pillar,
        averageAchievement: Math.round(averageAchievement * 100) / 100,
        consistentDays,
        trend,
        dailyValues,
      };
    });
  }

  /**
   * Calculate daily achievement percentage for a specific pillar
   */
  private static calculateDailyPillarPercentage(day: DailyMetrics, pillar: HealthPillar): number {
    switch (pillar) {
      case 'steps':
        return day.steps_target > 0 ? Math.min(100, (day.steps_actual / day.steps_target) * 100) : 0;
      case 'water':
        return day.water_oz_target > 0 ? Math.min(100, (day.water_oz_actual / day.water_oz_target) * 100) : 0;
      case 'sleep':
        return day.sleep_hr_target > 0 ? Math.min(100, (day.sleep_hr_actual / day.sleep_hr_target) * 100) : 0;
      case 'mood':
        return day.mood_checkins_target > 0 ? Math.min(100, (day.mood_checkins_actual / day.mood_checkins_target) * 100) : 0;
      default:
        return 0;
    }
  }

  /**
   * Calculate overall average achievement across all pillars
   */
  private static calculateOverallAverage(pillarBreakdown: PillarPerformance[]): number {
    const totalAverage = pillarBreakdown.reduce((sum, pillar) => sum + pillar.averageAchievement, 0);
    return Math.round((totalAverage / pillarBreakdown.length) * 100) / 100;
  }

  /**
   * Calculate total consistency days (days where user hit 80%+ overall)
   */
  private static calculateConsistencyDays(pillarBreakdown: PillarPerformance[]): number {
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
   * Identify strongest and weakest health pillars
   */
  private static identifyPillarStrengths(pillarBreakdown: PillarPerformance[]): {
    strongestPillar: HealthPillar;
    weakestPillar: HealthPillar;
  } {
    const sortedPillars = [...pillarBreakdown].sort((a, b) => b.averageAchievement - a.averageAchievement);
    
    return {
      strongestPillar: sortedPillars[0].pillar,
      weakestPillar: sortedPillars[sortedPillars.length - 1].pillar,
    };
  }

  /**
   * Determine overall performance grade based on achievement and consistency
   */
  private static determinePerformanceGrade(
    averageAchievement: number, 
    consistencyDays: number
  ): 'mastery' | 'progress' | 'struggle' {
    if (averageAchievement >= 80 && consistencyDays >= 5) {
      return 'mastery';
    } else if (averageAchievement >= 60 && consistencyDays >= 3) {
      return 'progress';
    } else {
      return 'struggle';
    }
  }

  /**
   * Calculate trend direction for a pillar based on daily values
   */
  private static calculateTrend(dailyValues: number[]): 'improving' | 'stable' | 'declining' {
    if (dailyValues.length < 3) return 'stable';

    const firstHalf = dailyValues.slice(0, Math.floor(dailyValues.length / 2));
    const secondHalf = dailyValues.slice(Math.ceil(dailyValues.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }
}
