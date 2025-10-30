// Week Advancement Manager Service
// Single responsibility: Handle week advancement logic and execution

import { supabase } from '../supabase';
import { WeekAdvancement, ProgressionExecutionResult } from '../../types/progression';
import { WeeklyTargets } from '../../types/assessment';
import { V2EngineConnector } from '../V2EngineConnector';

export class WeekAdvancementManager {
  /**
   * Advance user to the next week in their transformation plan
   */
  static async advanceToNextWeek(
    userId: string,
    currentWeek: number,
    reason: string
  ): Promise<ProgressionExecutionResult> {
    try {
      const nextWeek = currentWeek + 1;
      const maxWeeks = 12;

      // Validate advancement is possible
      if (nextWeek > maxWeeks) {
        return {
          success: false,
          type: 'advance',
          newWeek: currentWeek,
          newPhase: Math.ceil(currentWeek / 4),
          newTargets: await this.getCurrentTargets(userId),
          message: 'Cannot advance beyond week 12',
          error: 'Maximum weeks reached',
        };
      }

      // Get current phase information
      const currentPhase = Math.ceil(currentWeek / 4);
      const nextPhase = Math.ceil(nextWeek / 4);

      // Update plan_progress table
      const updateResult = await this.updatePlanProgress(userId, nextWeek, nextPhase);
      if (!updateResult.success) {
        return {
          success: false,
          type: 'advance',
          newWeek: currentWeek,
          newPhase: currentPhase,
          newTargets: await this.getCurrentTargets(userId),
          message: 'Failed to update plan progress',
          error: updateResult.error,
        };
      }

      // Get new targets for the advanced week
      const newTargets = await this.getTargetsForWeek(userId, nextWeek);
      if (!newTargets) {
        // Rollback the advancement
        await this.updatePlanProgress(userId, currentWeek, currentPhase);
        return {
          success: false,
          type: 'advance',
          newWeek: currentWeek,
          newPhase: currentPhase,
          newTargets: await this.getCurrentTargets(userId),
          message: 'Failed to get targets for next week',
          error: 'Target calculation failed',
        };
      }

      // Record the advancement
      await this.recordAdvancement(userId, currentWeek, nextWeek, currentPhase, nextPhase, newTargets, reason);

      // Reset week extensions counter
      await this.resetWeekExtensions(userId);

      return {
        success: true,
        type: 'advance',
        newWeek: nextWeek,
        newPhase: nextPhase,
        newTargets,
        message: `Successfully advanced to Week ${nextWeek}${nextPhase !== currentPhase ? ` (Phase ${nextPhase})` : ''}`,
      };
    } catch (error) {
      console.error('Error advancing to next week:', error);
      return {
        success: false,
        type: 'advance',
        newWeek: currentWeek,
        newPhase: Math.ceil(currentWeek / 4),
        newTargets: await this.getCurrentTargets(userId),
        message: 'Unexpected error during advancement',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update plan_progress table with new week and phase
   */
  private static async updatePlanProgress(
    userId: string,
    newWeek: number,
    newPhase: number
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('plan_progress')
      .update({
        current_week: newWeek,
        current_phase: newPhase,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating plan progress:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Get targets for a specific week
   */
  private static async getTargetsForWeek(userId: string, weekNumber: number): Promise<WeeklyTargets | null> {
    try {
      // For now, use V2EngineConnector which gets current week targets
      // In future, this could be enhanced to get targets for any specific week
      return await V2EngineConnector.getCurrentWeekTargets(userId);
    } catch (error) {
      console.error('Error getting targets for week:', error);
      return null;
    }
  }

  /**
   * Get current targets as fallback
   */
  private static async getCurrentTargets(userId: string): Promise<WeeklyTargets> {
    try {
      const targets = await V2EngineConnector.getCurrentWeekTargets(userId);
      return targets || this.getDefaultTargets();
    } catch (error) {
      return this.getDefaultTargets();
    }
  }

  /**
   * Record advancement in progression history
   */
  private static async recordAdvancement(
    userId: string,
    fromWeek: number,
    toWeek: number,
    fromPhase: number,
    toPhase: number,
    newTargets: WeeklyTargets,
    reason: string
  ): Promise<void> {
    const advancement: Omit<WeekAdvancement, 'executedAt'> = {
      fromWeek,
      toWeek,
      fromPhase,
      toPhase,
      newTargets,
      advancementReason: reason,
    };

    // Store in plan_progress progression_decisions array
    const { data: currentProgress } = await supabase
      .from('plan_progress')
      .select('progression_decisions')
      .eq('user_id', userId)
      .single();

    const existingDecisions = currentProgress?.progression_decisions || [];
    const updatedDecisions = [
      ...existingDecisions,
      {
        type: 'advancement',
        timestamp: new Date().toISOString(),
        data: advancement,
      },
    ];

    await supabase
      .from('plan_progress')
      .update({ progression_decisions: updatedDecisions })
      .eq('user_id', userId);
  }

  /**
   * Reset week extensions counter after advancement
   */
  private static async resetWeekExtensions(userId: string): Promise<void> {
    await supabase
      .from('plan_progress')
      .update({ week_extensions: 0 })
      .eq('user_id', userId);
  }

  /**
   * Get default targets
   */
  private static getDefaultTargets(): WeeklyTargets {
    return {
      steps: 8000,
      waterOz: 80,
      sleepHr: 7,
    };
  }

  /**
   * Validate if advancement is possible
   */
  static async validateAdvancement(userId: string, currentWeek: number): Promise<{
    canAdvance: boolean;
    reason?: string;
  }> {
    // Check if already at maximum weeks
    if (currentWeek >= 12) {
      return { canAdvance: false, reason: 'Already at maximum week (12)' };
    }

    // Check if user has active plan
    const { data, error } = await supabase
      .from('plan_progress')
      .select('current_week, current_phase')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return { canAdvance: false, reason: 'No active transformation plan found' };
    }

    // Check if current week matches expected week
    if (data.current_week !== currentWeek) {
      return { canAdvance: false, reason: 'Week mismatch - please refresh and try again' };
    }

    return { canAdvance: true };
  }

  /**
   * Get advancement preview (what would happen if advanced)
   */
  static async getAdvancementPreview(userId: string, currentWeek: number): Promise<{
    nextWeek: number;
    nextPhase: number;
    phaseChange: boolean;
    nextTargets?: WeeklyTargets;
    phaseName?: string;
  } | null> {
    const nextWeek = currentWeek + 1;
    const currentPhase = Math.ceil(currentWeek / 4);
    const nextPhase = Math.ceil(nextWeek / 4);
    const phaseChange = nextPhase !== currentPhase;

    if (nextWeek > 12) {
      return null;
    }

    const phaseNames = {
      1: 'Foundation Building',
      2: 'Movement & Activity',
      3: 'Nutrition & Integration',
    };

    return {
      nextWeek,
      nextPhase,
      phaseChange,
      phaseName: phaseNames[nextPhase as keyof typeof phaseNames],
      // nextTargets would be calculated here in full implementation
    };
  }

  /**
   * Reset to previous week (used when user struggles significantly)
   */
  static async resetToPreviousWeek(userId: string): Promise<void> {
    try {
      console.log('⏪ Resetting to previous week for user:', userId);

      // Get current plan progress
      const { data: currentProgress, error: progressError } = await supabase
        .from('plan_progress')
        .select('current_week, current_phase')
        .eq('user_id', userId)
        .single();

      if (progressError || !currentProgress) {
        throw new Error('Failed to get current plan progress');
      }

      const previousWeek = Math.max(1, currentProgress.current_week - 1);
      const previousPhase = previousWeek <= 4 ? 1 : previousWeek <= 8 ? 2 : 3;

      // Update plan progress
      const { error: updateError } = await supabase
        .from('plan_progress')
        .update({
          current_week: previousWeek,
          current_phase: previousPhase,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      console.log(`✅ Reset to week ${previousWeek}, phase ${previousPhase}`);

    } catch (error) {
      console.error('Error resetting to previous week:', error);
      throw error;
    }
  }
}
