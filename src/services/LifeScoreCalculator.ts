// Life Score Calculator Service
// Single responsibility: Calculate cumulative Life Score from weekly assessments and current progress

import { supabase } from './supabase';
import { WeeklyPerformanceHistory } from '../types/assessment';

interface LifeScoreCache {
  value: number;
  timestamp: number;
  userId: string;
}

interface CurrentWeekMetrics {
  stepsPct: number;
  waterPct: number;
  sleepPct: number;
  moodPct: number;
}

interface WeekDateRange {
  startDate: string;
  endDate: string;
}

export class LifeScoreCalculator {
  private static cache: LifeScoreCache | null = null;
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Calculate Life Score with cumulative assessment data
   * Progressive weighting:
   * - Week 1: 0% past, 100% current
   * - Week 2: 25% past, 75% current
   * - Week 3+: 40% past, 60% current
   */
  static async calculateLifeScore(
    userId: string,
    currentWeekMetrics: CurrentWeekMetrics,
    forceRefresh = false
  ): Promise<number> {
    // Check cache first
    if (!forceRefresh && this.isCacheValid(userId)) {
      console.log('📊 Life Score: Cache hit');
      return this.cache!.value;
    }

    console.log('📊 Life Score: Calculating from database...');

    try {
      // Get current week number for progressive weighting
      const currentWeek = await this.getCurrentWeek(userId);
      
      // Fetch past weekly assessments
      const pastAssessments = await this.fetchPastAssessments(userId);
      
      // Calculate score based on data availability and week number
      const score = pastAssessments.length > 0 && currentWeek > 1
        ? this.calculateBlendedScore(pastAssessments, currentWeekMetrics, currentWeek)
        : this.calculateCurrentWeekOnlyScore(currentWeekMetrics);

      // Update cache
      this.updateCache(userId, score);

      return score;
    } catch (error) {
      console.error('❌ Error calculating Life Score:', error);
      // Fallback to current week only on error
      return this.calculateCurrentWeekOnlyScore(currentWeekMetrics);
    }
  }

  /**
   * Clear cache (call after assessment completion)
   */
  static clearCache(): void {
    this.cache = null;
    console.log('🗑️ Life Score cache cleared');
  }

  /**
   * Fetch all past weekly assessments for user
   */
  private static async fetchPastAssessments(
    userId: string
  ): Promise<WeeklyPerformanceHistory[]> {
    const { data, error } = await supabase
      .from('weekly_performance_history')
      .select('overall_achievement_avg, week_number')
      .eq('user_id', userId)
      .order('week_number', { ascending: false });

    if (error) {
      console.error('❌ Error fetching past assessments:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Calculate blended score with progressive weighting based on week number
   * Week 1: 0% past, 100% current
   * Week 2: 25% past, 75% current
   * Week 3+: 40% past, 60% current
   */
  private static calculateBlendedScore(
    pastAssessments: WeeklyPerformanceHistory[],
    currentWeek: CurrentWeekMetrics,
    weekNumber: number
  ): number {
    // Determine weights based on week number
    let pastWeight: number;
    let currentWeight: number;
    
    if (weekNumber === 1) {
      // Week 1: No past data, use current week only
      pastWeight = 0;
      currentWeight = 1.0;
    } else if (weekNumber === 2) {
      // Week 2: 25% past, 75% current
      pastWeight = 0.25;
      currentWeight = 0.75;
    } else {
      // Week 3+: 40% past, 60% current
      pastWeight = 0.4;
      currentWeight = 0.6;
    }

    // Calculate average of all past assessments (stored as percentage 0-100, convert to decimal 0-1)
    const pastAveragePercent = this.calculatePastAverage(pastAssessments);
    const pastAverageDecimal = pastAveragePercent / 100; // Convert to 0-1 range
    const pastContribution = pastAverageDecimal * pastWeight;

    // Calculate current week (distributed across 4 pillars)
    const currentContribution = 
      this.clamp(currentWeek.stepsPct) * 0.25 +
      this.clamp(currentWeek.waterPct) * 0.25 +
      this.clamp(currentWeek.sleepPct) * 0.25 +
      this.clamp(currentWeek.moodPct) * 0.25;

    const finalScore = (pastContribution + (currentContribution * currentWeight)) * 100;
    
    console.log(`📊 Blended Score (Week ${weekNumber}): Past (${pastAveragePercent.toFixed(1)}% → ${pastAverageDecimal.toFixed(3)}) * ${(pastWeight * 100).toFixed(0)}% + Current (${(currentContribution * 100).toFixed(1)}%) * ${(currentWeight * 100).toFixed(0)}% = ${finalScore.toFixed(0)}`);
    
    return Math.round(finalScore);
  }

  /**
   * Calculate score from current week only (fallback for Week 1)
   */
  private static calculateCurrentWeekOnlyScore(
    currentWeek: CurrentWeekMetrics
  ): number {
    const score = (
      this.clamp(currentWeek.stepsPct) * 0.25 +
      this.clamp(currentWeek.waterPct) * 0.25 +
      this.clamp(currentWeek.sleepPct) * 0.25 +
      this.clamp(currentWeek.moodPct) * 0.25
    ) * 100;

    console.log(`📊 Current Week Only Score: ${score.toFixed(0)}`);
    
    return Math.round(score);
  }

  /**
   * Calculate average of past assessments
   */
  private static calculatePastAverage(
    assessments: WeeklyPerformanceHistory[]
  ): number {
    if (assessments.length === 0) return 0;

    const sum = assessments.reduce(
      (acc, assessment) => acc + assessment.overall_achievement_avg,
      0
    );

    return sum / assessments.length;
  }

  /**
   * Clamp value between 0 and 1
   */
  private static clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  /**
   * Check if cache is valid
   */
  private static isCacheValid(userId: string): boolean {
    if (!this.cache || this.cache.userId !== userId) {
      return false;
    }

    const age = Date.now() - this.cache.timestamp;
    return age < this.CACHE_TTL;
  }

  /**
   * Update cache with new value
   */
  private static updateCache(userId: string, value: number): void {
    this.cache = {
      value,
      timestamp: Date.now(),
      userId,
    };
  }

  /**
   * Get current week number from plan_progress
   */
  private static async getCurrentWeek(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('plan_progress')
        .select('current_week')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.warn('⚠️ Could not get current week, defaulting to 1');
        return 1;
      }

      return data.current_week || 1;
    } catch (error) {
      console.error('❌ Error getting current week:', error);
      return 1;
    }
  }

  /**
   * Get current week date range based on plan start date
   */
  private static async getCurrentWeekDateRange(userId: string, weekNumber: number): Promise<WeekDateRange | null> {
    try {
      const { data, error } = await supabase
        .from('plan_progress')
        .select('start_date')
        .eq('user_id', userId)
        .single();

      if (error || !data?.start_date) {
        console.warn('⚠️ Could not get plan start_date, using fallback');
        // Fallback: calculate from current date
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - ((weekNumber - 1) * 7));
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        };
      }

      const planStartDate = new Date(data.start_date);
      const weekStartDate = new Date(planStartDate);
      weekStartDate.setDate(planStartDate.getDate() + ((weekNumber - 1) * 7));
      
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);

      return {
        startDate: weekStartDate.toISOString().split('T')[0],
        endDate: weekEndDate.toISOString().split('T')[0],
      };
    } catch (error) {
      console.error('❌ Error getting week date range:', error);
      return null;
    }
  }

  /**
   * Aggregate current week metrics from daily_metrics table
   * Returns average percentages across all days in the current week
   */
  static async aggregateCurrentWeekMetrics(userId: string): Promise<CurrentWeekMetrics | null> {
    try {
      const currentWeek = await this.getCurrentWeek(userId);
      const dateRange = await this.getCurrentWeekDateRange(userId, currentWeek);
      
      if (!dateRange) {
        console.warn('⚠️ Could not get week date range, returning null');
        return null;
      }

      const today = new Date().toISOString().split('T')[0];
      const endDate = dateRange.endDate > today ? today : dateRange.endDate; // Don't include future dates

      console.log(`📊 Aggregating current week metrics: ${dateRange.startDate} to ${endDate}`);

      // Query daily_metrics for current week
      const { data: metrics, error } = await supabase
        .from('daily_metrics')
        .select('steps_actual, steps_target, water_oz_actual, water_oz_target, sleep_hr_actual, sleep_hr_target, mood_checkins_actual, mood_checkins_target')
        .eq('user_id', userId)
        .gte('date', dateRange.startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) {
        console.error('❌ Error fetching current week metrics:', error);
        return null;
      }

      if (!metrics || metrics.length === 0) {
        console.warn('⚠️ No metrics found for current week');
        return null;
      }

      // Calculate average percentages across all days
      let totalStepsPct = 0;
      let totalWaterPct = 0;
      let totalSleepPct = 0;
      let totalMoodPct = 0;
      let stepsDays = 0;
      let waterDays = 0;
      let sleepDays = 0;
      let moodDays = 0;

      for (const metric of metrics) {
        // Steps percentage
        if (metric.steps_target > 0) {
          totalStepsPct += metric.steps_actual / metric.steps_target;
          stepsDays++;
        }
        
        // Water percentage
        if (metric.water_oz_target > 0) {
          totalWaterPct += metric.water_oz_actual / metric.water_oz_target;
          waterDays++;
        }
        
        // Sleep percentage
        if (metric.sleep_hr_target > 0) {
          totalSleepPct += metric.sleep_hr_actual / metric.sleep_hr_target;
          sleepDays++;
        }
        
        // Mood percentage
        if (metric.mood_checkins_target > 0) {
          totalMoodPct += metric.mood_checkins_actual / metric.mood_checkins_target;
          moodDays++;
        }
      }

      const stepsPct = stepsDays > 0 ? totalStepsPct / stepsDays : 0;
      const waterPct = waterDays > 0 ? totalWaterPct / waterDays : 0;
      const sleepPct = sleepDays > 0 ? totalSleepPct / sleepDays : 0;
      const moodPct = moodDays > 0 ? totalMoodPct / moodDays : 0;

      console.log(`📊 Current week aggregated: ${metrics.length} days, Steps: ${(stepsPct * 100).toFixed(1)}% (${stepsDays} days), Water: ${(waterPct * 100).toFixed(1)}% (${waterDays} days), Sleep: ${(sleepPct * 100).toFixed(1)}% (${sleepDays} days), Mood: ${(moodPct * 100).toFixed(1)}% (${moodDays} days)`);

      return {
        stepsPct,
        waterPct,
        sleepPct,
        moodPct,
      };
    } catch (error) {
      console.error('❌ Error aggregating current week metrics:', error);
      return null;
    }
  }
}

