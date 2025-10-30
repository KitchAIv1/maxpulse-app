// Weekly Assessment Orchestrator Service
// Single responsibility: Coordinate the complete weekly assessment workflow

import { WeeklyPerformanceCalculator } from './WeeklyPerformanceCalculator';
import { ConsistencyAnalyzer } from './ConsistencyAnalyzer';
import { ProgressionRecommendationEngine } from './ProgressionRecommendationEngine';
import { supabase } from '../supabase';
import { WeeklyAssessmentData, WeeklyPerformanceHistory } from '../../types/assessment';
import { WeeklyTargets } from '../../types/progression';
import { V2EngineConnector } from '../V2EngineConnector';

export class WeeklyAssessmentOrchestrator {
  /**
   * Conduct complete weekly assessment for a user
   */
  static async conductWeeklyAssessment(
    userId: string,
    weekNumber: number,
    forceReassessment: boolean = false
  ): Promise<WeeklyAssessmentData | null> {
    try {
      // Check if assessment already exists (unless forcing reassessment)
      if (!forceReassessment) {
        const existingAssessment = await this.getExistingAssessment(userId, weekNumber);
        if (existingAssessment) {
          console.log(`Assessment already exists for week ${weekNumber}`);
          return existingAssessment;
        }
      }

      // Get week date range
      const dateRange = await this.getWeekDateRange(userId, weekNumber);
      if (!dateRange) {
        console.error('Could not determine week date range');
        return null;
      }

      // Calculate performance metrics
      const performance = await WeeklyPerformanceCalculator.calculateWeekPerformance(
        userId,
        weekNumber,
        dateRange.startDate,
        dateRange.endDate
      );

      if (!performance) {
        console.error('Could not calculate weekly performance');
        return null;
      }

      // Analyze consistency patterns
      const dailyMetrics = await this.getDailyMetricsForWeek(userId, dateRange.startDate, dateRange.endDate);
      const consistency = ConsistencyAnalyzer.analyzeWeeklyConsistency(performance.pillarBreakdown, dailyMetrics);

      // Get current week extensions
      const weekExtensions = await this.getWeekExtensions(userId, weekNumber);

      // Generate progression recommendation
      const assessment = ProgressionRecommendationEngine.generateRecommendation(
        performance,
        consistency,
        weekExtensions
      );

      // Get current and next week targets
      const currentTargets = await this.getCurrentWeekTargets(userId);
      const nextWeekTargets = assessment.recommendation === 'advance' 
        ? await this.getNextWeekTargets(userId, weekNumber + 1)
        : undefined;

      const assessmentData: WeeklyAssessmentData = {
        performance,
        consistency,
        assessment,
        currentTargets: currentTargets || this.getDefaultTargets(),
        nextWeekTargets,
      };

      // Store assessment results
      await this.storeAssessmentResults(userId, assessmentData);

      return assessmentData;
    } catch (error) {
      console.error('Error conducting weekly assessment:', error);
      return null;
    }
  }

  /**
   * Check if assessment already exists for this week
   */
  private static async getExistingAssessment(
    userId: string,
    weekNumber: number
  ): Promise<WeeklyAssessmentData | null> {
    const { data, error } = await supabase
      .from('weekly_performance_history')
      .select('*')
      .eq('user_id', userId)
      .eq('week_number', weekNumber)
      .single();

    if (error || !data) {
      return null;
    }

    // Convert stored data back to WeeklyAssessmentData format
    // This is a simplified version - in production, you'd want full reconstruction
    return null; // For MVP, always recalculate
  }

  /**
   * Get week date range based on user's plan start date
   */
  private static async getWeekDateRange(
    userId: string,
    weekNumber: number
  ): Promise<{ startDate: string; endDate: string } | null> {
    const { data, error } = await supabase
      .from('plan_progress')
      .select('start_date')
      .eq('user_id', userId)
      .single();

    if (error || !data?.start_date) {
      // Fallback: use current date and calculate backwards
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
  }

  /**
   * Get daily metrics for the week
   */
  private static async getDailyMetricsForWeek(
    userId: string,
    startDate: string,
    endDate: string
  ) {
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
   * Get current week extensions count
   */
  private static async getWeekExtensions(userId: string, weekNumber: number): Promise<number> {
    const { data, error } = await supabase
      .from('plan_progress')
      .select('week_extensions, current_week')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return 0;
    }

    // Only count extensions if we're still on the same week
    return data.current_week === weekNumber ? (data.week_extensions || 0) : 0;
  }

  /**
   * Get current week targets
   */
  private static async getCurrentWeekTargets(userId: string): Promise<WeeklyTargets | null> {
    try {
      return await V2EngineConnector.getCurrentWeekTargets(userId);
    } catch (error) {
      console.error('Error getting current week targets:', error);
      return null;
    }
  }

  /**
   * Get next week targets (for advance preview)
   */
  private static async getNextWeekTargets(userId: string, nextWeek: number): Promise<WeeklyTargets | null> {
    // This would require extending V2EngineConnector to get targets for specific weeks
    // For MVP, return null and handle in UI
    return null;
  }

  /**
   * Store assessment results in database
   */
  private static async storeAssessmentResults(
    userId: string,
    assessmentData: WeeklyAssessmentData
  ): Promise<void> {
    const { performance, consistency, assessment, currentTargets } = assessmentData;

    const historyRecord: Partial<WeeklyPerformanceHistory> = {
      userId,
      weekNumber: performance.week,
      phaseNumber: performance.phase,
      startDate: performance.startDate,
      endDate: performance.endDate,
      stepsAchievementAvg: performance.pillarBreakdown.find(p => p.pillar === 'steps')?.averageAchievement || 0,
      waterAchievementAvg: performance.pillarBreakdown.find(p => p.pillar === 'water')?.averageAchievement || 0,
      sleepAchievementAvg: performance.pillarBreakdown.find(p => p.pillar === 'sleep')?.averageAchievement || 0,
      moodAchievementAvg: performance.pillarBreakdown.find(p => p.pillar === 'mood')?.averageAchievement || 0,
      overallAchievementAvg: performance.averageAchievement,
      consistencyDays: consistency.consistentDays,
      totalTrackingDays: consistency.totalDays,
      progressionRecommendation: assessment.recommendation,
      decisionReasoning: assessment.reasoning,
      targetsAtAssessment: currentTargets,
      strongestPillar: performance.strongestPillar,
      weakestPillar: performance.weakestPillar,
    };

    const { error } = await supabase
      .from('weekly_performance_history')
      .upsert(historyRecord, { onConflict: 'user_id,week_number' });

    if (error) {
      console.error('Error storing assessment results:', error);
    }
  }

  /**
   * Get default targets as fallback
   */
  private static getDefaultTargets(): WeeklyTargets {
    return {
      steps: 8000,
      waterOz: 80,
      sleepHr: 7,
    };
  }
}
