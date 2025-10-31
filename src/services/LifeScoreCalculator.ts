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

export class LifeScoreCalculator {
  private static cache: LifeScoreCache | null = null;
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Calculate Life Score with cumulative assessment data
   * Formula: 20% past assessments + 80% current week (20% per pillar)
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
      // Fetch past weekly assessments
      const pastAssessments = await this.fetchPastAssessments(userId);
      
      // Calculate score based on data availability
      const score = pastAssessments.length > 0
        ? this.calculateBlendedScore(pastAssessments, currentWeekMetrics)
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
   * Calculate blended score: 20% past + 80% current
   */
  private static calculateBlendedScore(
    pastAssessments: WeeklyPerformanceHistory[],
    currentWeek: CurrentWeekMetrics
  ): number {
    // Calculate average of all past assessments (stored as percentage 0-100, convert to decimal 0-1)
    const pastAveragePercent = this.calculatePastAverage(pastAssessments);
    const pastAverageDecimal = pastAveragePercent / 100; // Convert to 0-1 range
    const pastContribution = pastAverageDecimal * 0.2;

    // Calculate current week (80% weight, 20% per pillar)
    const currentContribution = 
      this.clamp(currentWeek.stepsPct) * 0.2 +
      this.clamp(currentWeek.waterPct) * 0.2 +
      this.clamp(currentWeek.sleepPct) * 0.2 +
      this.clamp(currentWeek.moodPct) * 0.2;

    const finalScore = (pastContribution + currentContribution) * 100;
    
    console.log(`📊 Blended Score: Past (${pastAveragePercent.toFixed(1)}% → ${pastAverageDecimal.toFixed(3)}) * 0.2 + Current (${(currentContribution * 100).toFixed(1)}%) * 0.8 = ${finalScore.toFixed(0)}`);
    
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
}

