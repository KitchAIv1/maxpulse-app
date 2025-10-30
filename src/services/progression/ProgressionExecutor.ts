// Progression Executor Service
// Single responsibility: Execute progression decisions and coordinate all progression actions

import { WeekAdvancementManager } from './WeekAdvancementManager';
import { TargetModificationService } from './TargetModificationService';
import { supabase } from '../supabase';
import { 
  ProgressionDecision, 
  ProgressionExecutionResult, 
  WeekExtension, 
  WeekReset 
} from '../../types/progression';
import { WeeklyAssessmentData } from '../../types/assessment';
import { V2EngineConnector } from '../V2EngineConnector';

export class ProgressionExecutor {
  /**
   * Execute a progression decision based on user choice and assessment
   */
  static async executeProgression(
    userId: string,
    decision: ProgressionDecision,
    assessmentData: WeeklyAssessmentData
  ): Promise<ProgressionExecutionResult> {
    try {
      // Validate the decision
      const validation = await this.validateProgressionDecision(userId, decision);
      if (!validation.isValid) {
        return {
          success: false,
          type: decision.type,
          newWeek: decision.weekNumber,
          newPhase: decision.phaseNumber,
          newTargets: assessmentData.currentTargets,
          message: validation.reason || 'Invalid progression decision',
          error: validation.reason,
        };
      }

      // Execute based on decision type
      switch (decision.type) {
        case 'advance':
          return await this.executeAdvancement(userId, decision, assessmentData);
        
        case 'extend':
          return await this.executeExtension(userId, decision, assessmentData);
        
        case 'reset':
          return await this.executeReset(userId, decision, assessmentData);
        
        default:
          return {
            success: false,
            type: decision.type,
            newWeek: decision.weekNumber,
            newPhase: decision.phaseNumber,
            newTargets: assessmentData.currentTargets,
            message: 'Unknown progression type',
            error: `Unsupported progression type: ${decision.type}`,
          };
      }
    } catch (error) {
      console.error('Error executing progression:', error);
      return {
        success: false,
        type: decision.type,
        newWeek: decision.weekNumber,
        newPhase: decision.phaseNumber,
        newTargets: assessmentData.currentTargets,
        message: 'Unexpected error during progression execution',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute week advancement
   */
  private static async executeAdvancement(
    userId: string,
    decision: ProgressionDecision,
    assessmentData: WeeklyAssessmentData
  ): Promise<ProgressionExecutionResult> {
    const advancementReason = decision.reasoning.join('; ');
    const result = await WeekAdvancementManager.advanceToNextWeek(
      userId,
      decision.weekNumber,
      advancementReason
    );

    // Record the user decision
    if (result.success) {
      await this.recordUserDecision(userId, decision, 'accepted');
      await this.updateLastAssessmentDate(userId);
    }

    return result;
  }

  /**
   * Execute week extension with optional target modifications
   */
  private static async executeExtension(
    userId: string,
    decision: ProgressionDecision,
    assessmentData: WeeklyAssessmentData
  ): Promise<ProgressionExecutionResult> {
    try {
      // Increment week extensions counter
      const extensionResult = await this.incrementWeekExtensions(userId);
      if (!extensionResult.success) {
        return {
          success: false,
          type: 'extend',
          newWeek: decision.weekNumber,
          newPhase: decision.phaseNumber,
          newTargets: assessmentData.currentTargets,
          message: 'Failed to record week extension',
          error: extensionResult.error,
        };
      }

      let newTargets = assessmentData.currentTargets;
      let modificationMessage = '';

      // Apply target modifications if specified
      if (decision.modifications) {
        const modificationResult = await TargetModificationService.storeModifiedTargets(
          userId,
          decision.modifications,
          decision.weekNumber
        );

        if (modificationResult.success) {
          newTargets = TargetModificationService.applyModifications(
            assessmentData.currentTargets,
            decision.modifications
          );
          modificationMessage = ` with modified ${decision.modifications.focusArea} target`;
        }
      }

      // Record extension
      await this.recordWeekExtension(userId, decision, extensionResult.extensionCount);

      // Record user decision
      await this.recordUserDecision(userId, decision, 'accepted');

      return {
        success: true,
        type: 'extend',
        newWeek: decision.weekNumber, // Stay on same week
        newPhase: decision.phaseNumber,
        newTargets,
        message: `Week ${decision.weekNumber} extended${modificationMessage}. Focus on building consistency.`,
      };
    } catch (error) {
      console.error('Error executing extension:', error);
      return {
        success: false,
        type: 'extend',
        newWeek: decision.weekNumber,
        newPhase: decision.phaseNumber,
        newTargets: assessmentData.currentTargets,
        message: 'Failed to execute week extension',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute week reset (go back to previous week)
   */
  private static async executeReset(
    userId: string,
    decision: ProgressionDecision,
    assessmentData: WeeklyAssessmentData
  ): Promise<ProgressionExecutionResult> {
    try {
      const previousWeek = Math.max(1, decision.weekNumber - 1);
      const previousPhase = Math.ceil(previousWeek / 4);

      // Update plan_progress to previous week
      const { error } = await supabase
        .from('plan_progress')
        .update({
          current_week: previousWeek,
          current_phase: previousPhase,
          week_extensions: 0, // Reset extensions
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        return {
          success: false,
          type: 'reset',
          newWeek: decision.weekNumber,
          newPhase: decision.phaseNumber,
          newTargets: assessmentData.currentTargets,
          message: 'Failed to reset to previous week',
          error: error.message,
        };
      }

      // Get targets for previous week
      const resetTargets = await V2EngineConnector.getCurrentWeekTargets(userId);

      // Record reset
      await this.recordWeekReset(userId, decision, previousWeek, previousPhase, resetTargets);

      // Record user decision
      await this.recordUserDecision(userId, decision, 'accepted');

      return {
        success: true,
        type: 'reset',
        newWeek: previousWeek,
        newPhase: previousPhase,
        newTargets: resetTargets || this.getDefaultTargets(),
        message: `Reset to Week ${previousWeek}. Let's rebuild your foundation.`,
      };
    } catch (error) {
      console.error('Error executing reset:', error);
      return {
        success: false,
        type: 'reset',
        newWeek: decision.weekNumber,
        newPhase: decision.phaseNumber,
        newTargets: assessmentData.currentTargets,
        message: 'Failed to execute week reset',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate progression decision before execution
   */
  private static async validateProgressionDecision(
    userId: string,
    decision: ProgressionDecision
  ): Promise<{ isValid: boolean; reason?: string }> {
    // Get current plan state
    const { data, error } = await supabase
      .from('plan_progress')
      .select('current_week, current_phase, week_extensions')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return { isValid: false, reason: 'Could not verify current plan state' };
    }

    // Validate week matches
    if (data.current_week !== decision.weekNumber) {
      return { isValid: false, reason: 'Week mismatch - please refresh and try again' };
    }

    // Validate specific decision types
    switch (decision.type) {
      case 'advance':
        if (decision.weekNumber >= 12) {
          return { isValid: false, reason: 'Cannot advance beyond week 12' };
        }
        break;

      case 'extend':
        if ((data.week_extensions || 0) >= 5) {
          return { isValid: false, reason: 'Maximum extensions reached for this week' };
        }
        break;

      case 'reset':
        if (decision.weekNumber <= 1) {
          return { isValid: false, reason: 'Cannot reset from week 1' };
        }
        break;
    }

    return { isValid: true };
  }

  /**
   * Increment week extensions counter
   */
  private static async incrementWeekExtensions(userId: string): Promise<{
    success: boolean;
    extensionCount: number;
    error?: string;
  }> {
    const { data, error } = await supabase
      .from('plan_progress')
      .select('week_extensions')
      .eq('user_id', userId)
      .single();

    if (error) {
      return { success: false, extensionCount: 0, error: error.message };
    }

    const newExtensionCount = (data?.week_extensions || 0) + 1;

    const { error: updateError } = await supabase
      .from('plan_progress')
      .update({ week_extensions: newExtensionCount })
      .eq('user_id', userId);

    if (updateError) {
      return { success: false, extensionCount: 0, error: updateError.message };
    }

    return { success: true, extensionCount: newExtensionCount };
  }

  /**
   * Record week extension in progression history
   */
  private static async recordWeekExtension(
    userId: string,
    decision: ProgressionDecision,
    extensionCount: number
  ): Promise<void> {
    const extension: Omit<WeekExtension, 'executedAt'> = {
      weekNumber: decision.weekNumber,
      phaseNumber: decision.phaseNumber,
      extensionCount,
      modifiedTargets: decision.modifications ? 
        TargetModificationService.applyModifications(
          { steps: 8000, waterOz: 80, sleepHr: 7 }, // This should be current targets
          decision.modifications
        ) : undefined,
      focusArea: decision.modifications?.focusArea || 'steps',
      extensionReason: decision.reasoning.join('; '),
      maxExtensionsReached: extensionCount >= 5,
    };

    await this.addToProgressionHistory(userId, 'extension', extension);
  }

  /**
   * Record week reset in progression history
   */
  private static async recordWeekReset(
    userId: string,
    decision: ProgressionDecision,
    resetToWeek: number,
    resetToPhase: number,
    resetTargets: any
  ): Promise<void> {
    const reset: Omit<WeekReset, 'executedAt'> = {
      fromWeek: decision.weekNumber,
      toWeek: resetToWeek,
      fromPhase: decision.phaseNumber,
      toPhase: resetToPhase,
      resetTargets,
      resetReason: decision.reasoning.join('; '),
      supportRecommendations: [
        'Focus on one habit at a time',
        'Set smaller daily goals',
        'Track progress consistently',
      ],
    };

    await this.addToProgressionHistory(userId, 'reset', reset);
  }

  /**
   * Record user decision in assessment history
   */
  private static async recordUserDecision(
    userId: string,
    decision: ProgressionDecision,
    userChoice: 'accepted' | 'override_advance' | 'coach_consultation'
  ): Promise<void> {
    // Update weekly_performance_history with user decision
    await supabase
      .from('weekly_performance_history')
      .update({ user_decision: userChoice })
      .eq('user_id', userId)
      .eq('week_number', decision.weekNumber);
  }

  /**
   * Update last assessment date
   */
  private static async updateLastAssessmentDate(userId: string): Promise<void> {
    await supabase
      .from('plan_progress')
      .update({ last_assessment_date: new Date().toISOString().split('T')[0] })
      .eq('user_id', userId);
  }

  /**
   * Add entry to progression history
   */
  private static async addToProgressionHistory(
    userId: string,
    type: string,
    data: any
  ): Promise<void> {
    const { data: currentProgress } = await supabase
      .from('plan_progress')
      .select('progression_decisions')
      .eq('user_id', userId)
      .single();

    const existingDecisions = currentProgress?.progression_decisions || [];
    const updatedDecisions = [
      ...existingDecisions,
      {
        type,
        timestamp: new Date().toISOString(),
        data: { ...data, executedAt: new Date().toISOString() },
      },
    ];

    await supabase
      .from('plan_progress')
      .update({ progression_decisions: updatedDecisions })
      .eq('user_id', userId);
  }

  /**
   * Get default targets
   */
  private static getDefaultTargets() {
    return {
      steps: 8000,
      waterOz: 80,
      sleepHr: 7,
    };
  }
}
