// Auto Progression Service
// Single responsibility: Execute user progression decisions automatically

import { supabase } from '../supabase';
import { ProgressionDecision } from '../../types/progression';
import { WeekAdvancementManager } from './WeekAdvancementManager';
import { ProgressionExecutor } from './ProgressionExecutor';
import { TargetModificationService } from './TargetModificationService';
import { WeeklyPerformanceHistory } from '../../types/assessment';

export class AutoProgressionService {
  /**
   * Execute a user's progression decision
   */
  static async executeProgressionDecision(decision: ProgressionDecision): Promise<void> {
    try {
      console.log('Executing progression decision:', decision);

      // Record the decision in history
      await this.recordProgressionDecision(decision);

      // Execute the progression based on decision type
      await ProgressionExecutor.executeProgression(decision.userId, decision);

      // Log successful execution
      console.log('Progression decision executed successfully:', {
        userId: decision.userId,
        type: decision.type,
        week: decision.weekNumber,
        phase: decision.phaseNumber,
      });

    } catch (error) {
      console.error('Error executing progression decision:', error);
      throw new Error(`Failed to execute progression decision: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Record progression decision in weekly performance history
   */
  private static async recordProgressionDecision(decision: ProgressionDecision): Promise<void> {
    try {
      const { error } = await supabase
        .from('weekly_performance_history')
        .update({
          user_decision: decision.type,
          decision_reasoning: decision.reasoning,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', decision.userId)
        .eq('week_number', decision.weekNumber);

      if (error) {
        console.error('Error recording progression decision:', error);
        throw error;
      }

    } catch (error) {
      console.error('Error in recordProgressionDecision:', error);
      throw error;
    }
  }

  /**
   * Get user's progression history
   */
  static async getProgressionHistory(userId: string, limit: number = 10): Promise<WeeklyPerformanceHistory[]> {
    try {
      const { data, error } = await supabase
        .from('weekly_performance_history')
        .select('*')
        .eq('user_id', userId)
        .order('week_number', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching progression history:', error);
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error in getProgressionHistory:', error);
      throw error;
    }
  }

  /**
   * Check if user can advance to next week
   */
  static async canAdvanceToNextWeek(userId: string): Promise<{
    canAdvance: boolean;
    reason: string;
    currentWeek: number;
    currentPhase: number;
  }> {
    try {
      // Get current plan progress
      const { data: planProgress, error: planError } = await supabase
        .from('plan_progress')
        .select('current_week, current_phase, start_date, week_extensions')
        .eq('user_id', userId)
        .single();

      if (planError || !planProgress) {
        return {
          canAdvance: false,
          reason: 'No active plan found',
          currentWeek: 1,
          currentPhase: 1,
        };
      }

      // Check if we're at the end of the 90-day plan
      const maxWeek = 12; // 90 days / 7 days per week ≈ 12-13 weeks
      if (planProgress.current_week >= maxWeek) {
        return {
          canAdvance: false,
          reason: 'Plan completed - congratulations!',
          currentWeek: planProgress.current_week,
          currentPhase: planProgress.current_phase,
        };
      }

      // Check if user has been extended too many times
      const maxExtensions = 3;
      if (planProgress.week_extensions >= maxExtensions) {
        return {
          canAdvance: true,
          reason: 'Maximum extensions reached - advancing automatically',
          currentWeek: planProgress.current_week,
          currentPhase: planProgress.current_phase,
        };
      }

      return {
        canAdvance: true,
        reason: 'Ready to advance',
        currentWeek: planProgress.current_week,
        currentPhase: planProgress.current_phase,
      };

    } catch (error) {
      console.error('Error checking advancement eligibility:', error);
      return {
        canAdvance: false,
        reason: 'Error checking eligibility',
        currentWeek: 1,
        currentPhase: 1,
      };
    }
  }

  /**
   * Auto-advance users who meet criteria (for scheduled jobs)
   */
  static async autoAdvanceEligibleUsers(): Promise<{
    processed: number;
    advanced: number;
    errors: string[];
  }> {
    const results = {
      processed: 0,
      advanced: 0,
      errors: [] as string[],
    };

    try {
      // Get users who might be eligible for auto-advancement
      // This would typically be called by a scheduled job
      const { data: users, error } = await supabase
        .from('plan_progress')
        .select('user_id, current_week, current_phase, last_assessment_date')
        .not('last_assessment_date', 'is', null)
        .gte('last_assessment_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last week

      if (error) {
        results.errors.push(`Error fetching users: ${error.message}`);
        return results;
      }

      for (const user of users || []) {
        try {
          results.processed++;

          // Check if user can advance
          const eligibility = await this.canAdvanceToNextWeek(user.user_id);
          
          if (eligibility.canAdvance) {
            // For auto-advancement, we'd need additional logic to determine
            // if the user actually achieved mastery. This is a placeholder.
            console.log(`User ${user.user_id} is eligible for advancement`);
            results.advanced++;
          }

        } catch (error) {
          results.errors.push(`Error processing user ${user.user_id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

    } catch (error) {
      results.errors.push(`Error in autoAdvanceEligibleUsers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }

  /**
   * Rollback a progression decision (emergency use)
   */
  static async rollbackProgression(userId: string, weekNumber: number): Promise<void> {
    try {
      console.log('Rolling back progression for user:', userId, 'week:', weekNumber);

      // Get the previous week's data
      const { data: history, error: historyError } = await supabase
        .from('weekly_performance_history')
        .select('*')
        .eq('user_id', userId)
        .eq('week_number', weekNumber - 1)
        .single();

      if (historyError || !history) {
        throw new Error('Cannot find previous week data for rollback');
      }

      // Reset to previous week
      await WeekAdvancementManager.resetToPreviousWeek(userId);

      console.log('Progression rollback completed successfully');

    } catch (error) {
      console.error('Error rolling back progression:', error);
      throw new Error(`Failed to rollback progression: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get progression statistics for analytics
   */
  static async getProgressionStats(userId: string): Promise<{
    totalWeeksCompleted: number;
    averageWeeklyScore: number;
    advancementRate: number; // Percentage of weeks advanced vs extended
    strongestPillar: string;
    improvementTrend: 'improving' | 'stable' | 'declining';
  }> {
    try {
      const { data: history, error } = await supabase
        .from('weekly_performance_history')
        .select('*')
        .eq('user_id', userId)
        .order('week_number', { ascending: true });

      if (error) {
        throw error;
      }

      const totalWeeks = history?.length || 0;
      if (totalWeeks === 0) {
        return {
          totalWeeksCompleted: 0,
          averageWeeklyScore: 0,
          advancementRate: 0,
          strongestPillar: 'steps',
          improvementTrend: 'stable',
        };
      }

      // Calculate average weekly score
      const averageScore = history.reduce((sum, week) => sum + (week.overall_achievement_avg || 0), 0) / totalWeeks;

      // Calculate advancement rate
      const advancements = history.filter(week => week.user_decision === 'advance' || week.progression_recommendation === 'advance').length;
      const advancementRate = (advancements / totalWeeks) * 100;

      // Find strongest pillar
      const pillarTotals = {
        steps: 0,
        water: 0,
        sleep: 0,
        mood: 0,
      };

      history.forEach(week => {
        pillarTotals.steps += week.steps_achievement_avg || 0;
        pillarTotals.water += week.water_achievement_avg || 0;
        pillarTotals.sleep += week.sleep_achievement_avg || 0;
        pillarTotals.mood += week.mood_achievement_avg || 0;
      });

      const strongestPillar = Object.entries(pillarTotals)
        .reduce((a, b) => pillarTotals[a[0] as keyof typeof pillarTotals] > pillarTotals[b[0] as keyof typeof pillarTotals] ? a : b)[0];

      // Calculate improvement trend (last 3 weeks vs first 3 weeks)
      let improvementTrend: 'improving' | 'stable' | 'declining' = 'stable';
      if (totalWeeks >= 6) {
        const firstThree = history.slice(0, 3).reduce((sum, week) => sum + (week.overall_achievement_avg || 0), 0) / 3;
        const lastThree = history.slice(-3).reduce((sum, week) => sum + (week.overall_achievement_avg || 0), 0) / 3;
        
        if (lastThree > firstThree + 5) improvementTrend = 'improving';
        else if (lastThree < firstThree - 5) improvementTrend = 'declining';
      }

      return {
        totalWeeksCompleted: totalWeeks,
        averageWeeklyScore: Math.round(averageScore),
        advancementRate: Math.round(advancementRate),
        strongestPillar,
        improvementTrend,
      };

    } catch (error) {
      console.error('Error calculating progression stats:', error);
      throw error;
    }
  }
}
