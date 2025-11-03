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
        console.warn(`⚠️ Could not calculate performance for week ${weekNumber} - no tracking data yet`);
        
        // Fallback: Try to load last completed assessment from history
        const lastCompletedAssessment = await this.getLastCompletedAssessment(userId, weekNumber);
        if (lastCompletedAssessment) {
          console.log(`✅ Loaded last completed assessment (Week ${lastCompletedAssessment.performance.week}) as fallback`);
          return lastCompletedAssessment;
        }
        
        console.error('No assessment data available - neither current week nor historical');
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
      // Store results for future reference (optional - fails gracefully if table doesn't exist)
      try {
        await this.storeAssessmentResults(userId, assessmentData);
        
        // Clear Life Score cache and trigger refresh
        const { LifeScoreCalculator } = await import('../LifeScoreCalculator');
        LifeScoreCalculator.clearCache();
        console.log('✅ Life Score cache cleared after assessment completion');
      } catch (storageError) {
        console.warn('⚠️ Could not store assessment history (table may not exist yet):', storageError);
        // Continue anyway - assessment data is still valid
      }

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
    try {
      const { data, error } = await supabase
        .from('weekly_performance_history')
        .select('*')
        .eq('user_id', userId)
        .eq('week_number', weekNumber)
        .single();

      if (error || !data) {
        return null;
      }

      console.log(`✅ Found cached assessment for week ${weekNumber}`);

      // Reconstruct WeeklyAssessmentData from stored history
      return this.reconstructAssessmentFromHistory(data);
    } catch (error) {
      // Table might not exist yet - that's okay
      console.warn('⚠️ Could not check existing assessment (table may not exist yet)');
      return null;
    }
  }

  /**
   * Get the last completed assessment (highest week number less than current week)
   * Used as fallback when current week has no tracking data yet
   */
  private static async getLastCompletedAssessment(
    userId: string,
    currentWeek: number
  ): Promise<WeeklyAssessmentData | null> {
    try {
      const { data, error } = await supabase
        .from('weekly_performance_history')
        .select('*')
        .eq('user_id', userId)
        .lt('week_number', currentWeek)
        .order('week_number', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.log(`No completed assessments found before week ${currentWeek}`);
        return null;
      }

      console.log(`📚 Found last completed assessment: Week ${data.week_number}`);

      // Reconstruct and mark as historical
      const assessment = this.reconstructAssessmentFromHistory(data);
      
      return assessment;
    } catch (error) {
      console.warn('⚠️ Could not load last completed assessment:', error);
      return null;
    }
  }

  /**
   * Reconstruct full assessment data from stored history record
   */
  private static reconstructAssessmentFromHistory(
    history: any
  ): WeeklyAssessmentData {
    // Reconstruct performance data
    const performance = {
      week: history.week_number,
      phase: history.phase_number,
      startDate: history.start_date,
      endDate: history.end_date,
      averageAchievement: history.overall_achievement_avg,
      consistencyDays: history.consistency_days,
      totalTrackingDays: history.total_tracking_days,
      strongestPillar: history.strongest_pillar,
      weakestPillar: history.weakest_pillar,
      overallGrade: this.determineGrade(history.overall_achievement_avg, history.consistency_days),
      pillarBreakdown: [
        {
          pillar: 'steps' as const,
          averageAchievement: history.steps_achievement_avg,
          consistentDays: Math.round((history.steps_achievement_avg / 100) * history.total_tracking_days),
          trend: 'stable' as const,
          dailyValues: [],
        },
        {
          pillar: 'water' as const,
          averageAchievement: history.water_achievement_avg,
          consistentDays: Math.round((history.water_achievement_avg / 100) * history.total_tracking_days),
          trend: 'stable' as const,
          dailyValues: [],
        },
        {
          pillar: 'sleep' as const,
          averageAchievement: history.sleep_achievement_avg,
          consistentDays: Math.round((history.sleep_achievement_avg / 100) * history.total_tracking_days),
          trend: 'stable' as const,
          dailyValues: [],
        },
        {
          pillar: 'mood' as const,
          averageAchievement: history.mood_achievement_avg,
          consistentDays: Math.round((history.mood_achievement_avg / 100) * history.total_tracking_days),
          trend: 'stable' as const,
          dailyValues: [],
        },
      ],
    };

    // Reconstruct consistency data
    const consistency = {
      consistentDays: history.consistency_days,
      totalDays: history.total_tracking_days,
      consistencyRate: history.total_tracking_days > 0 
        ? (history.consistency_days / history.total_tracking_days) * 100 
        : 0,
      currentStreak: history.consistency_days, // Use consistency_days as approximation
      longestStreak: history.consistency_days, // Simplified - assume current is longest
      weekdayConsistency: 100, // Simplified - not stored separately
      weekendConsistency: 100, // Simplified - not stored separately
    };

    // Reconstruct assessment recommendation
    const assessment = {
      recommendation: history.progression_recommendation,
      confidence: this.calculateConfidence(history.overall_achievement_avg, history.consistency_days),
      reasoning: history.decision_reasoning || [],
      riskFactors: [],
      opportunities: [],
      modifications: history.progression_recommendation === 'extend' && history.weakest_pillar
        ? {
            focusArea: history.weakest_pillar,
            adjustmentReason: `Reducing ${this.getPillarDisplayName(history.weakest_pillar)} target to build consistency`,
          }
        : undefined,
    };

    // Get targets from stored data
    const currentTargets = history.targets_at_assessment || this.getDefaultTargets();

    return {
      performance,
      consistency,
      assessment,
      currentTargets,
      nextWeekTargets: undefined,
    };
  }

  /**
   * Determine performance grade from stored metrics
   */
  private static determineGrade(
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
   * Calculate confidence score from metrics
   */
  private static calculateConfidence(
    averageAchievement: number,
    consistencyDays: number
  ): number {
    const achievementScore = (averageAchievement / 100) * 50;
    const consistencyScore = (consistencyDays / 7) * 50;
    return Math.round(achievementScore + consistencyScore);
  }

  /**
   * Get display-friendly pillar names
   */
  private static getPillarDisplayName(pillar: string): string {
    switch (pillar) {
      case 'steps': return 'Steps';
      case 'water': return 'Hydration';
      case 'sleep': return 'Sleep';
      case 'mood': return 'Mood Check-ins';
      default: return pillar;
    }
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
      user_id: userId,
      week_number: performance.week,
      phase_number: performance.phase,
      start_date: performance.startDate,
      end_date: performance.endDate,
      steps_achievement_avg: performance.pillarBreakdown.find(p => p.pillar === 'steps')?.averageAchievement || 0,
      water_achievement_avg: performance.pillarBreakdown.find(p => p.pillar === 'water')?.averageAchievement || 0,
      sleep_achievement_avg: performance.pillarBreakdown.find(p => p.pillar === 'sleep')?.averageAchievement || 0,
      mood_achievement_avg: performance.pillarBreakdown.find(p => p.pillar === 'mood')?.averageAchievement || 0,
      overall_achievement_avg: performance.averageAchievement,
      consistency_days: consistency.consistentDays,
      total_tracking_days: consistency.totalDays,
      progression_recommendation: assessment.recommendation,
      decision_reasoning: assessment.reasoning,
      targets_at_assessment: currentTargets,
      strongest_pillar: performance.strongestPillar,
      weakest_pillar: performance.weakestPillar,
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
