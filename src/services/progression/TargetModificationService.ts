// Target Modification Service
// Single responsibility: Modify targets for week extensions and customizations

import { supabase } from '../supabase';
import { TargetModifications, WeeklyTargets, HealthPillar } from '../../types/progression';
import { WeeklyPerformance } from '../../types/assessment';
import { V2EngineConnector } from '../V2EngineConnector';

export class TargetModificationService {
  /**
   * Generate modified targets for week extension based on performance
   */
  static generateModifiedTargets(
    currentTargets: WeeklyTargets,
    performance: WeeklyPerformance,
    focusArea?: HealthPillar
  ): TargetModifications {
    const weakestPillar = focusArea || performance.weakestPillar;
    const weakestPillarPerformance = performance.pillarBreakdown.find(p => p.pillar === weakestPillar);
    
    // Determine adjustment percentage based on performance level
    const adjustmentPercent = this.calculateAdjustmentPercent(weakestPillarPerformance?.averageAchievement || 0);
    
    const modifications: TargetModifications = {
      focusArea: weakestPillar,
      adjustmentReason: this.generateAdjustmentReason(weakestPillar, weakestPillarPerformance?.averageAchievement || 0),
    };

    // Apply modifications based on focus area
    switch (weakestPillar) {
      case 'steps':
        modifications.steps = Math.round(currentTargets.steps * (1 - adjustmentPercent));
        break;
      case 'water':
        modifications.waterOz = Math.round(currentTargets.waterOz * (1 - adjustmentPercent));
        break;
      case 'sleep':
        modifications.sleepHr = Math.round(currentTargets.sleepHr * (1 - adjustmentPercent) * 10) / 10;
        break;
      case 'mood':
        // Mood targets are typically daily, so we don't modify the weekly target
        // Instead, we might suggest different check-in strategies
        modifications.adjustmentReason = 'Focus on consistent daily mood check-ins rather than quantity';
        break;
    }

    return modifications;
  }

  /**
   * Apply target modifications to create new weekly targets
   */
  static applyModifications(
    baseTargets: WeeklyTargets,
    modifications: TargetModifications
  ): WeeklyTargets {
    const modifiedTargets: WeeklyTargets = { ...baseTargets };

    if (modifications.steps !== undefined) {
      modifiedTargets.steps = modifications.steps;
    }
    if (modifications.waterOz !== undefined) {
      modifiedTargets.waterOz = modifications.waterOz;
    }
    if (modifications.sleepHr !== undefined) {
      modifiedTargets.sleepHr = modifications.sleepHr;
    }

    return modifiedTargets;
  }

  /**
   * Store modified targets for a user's current week
   */
  static async storeModifiedTargets(
    userId: string,
    modifications: TargetModifications,
    weekNumber: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current targets
      const currentTargets = await V2EngineConnector.getCurrentWeekTargets(userId);
      if (!currentTargets) {
        return { success: false, error: 'Could not get current targets' };
      }

      // Apply modifications
      const modifiedTargets = this.applyModifications(currentTargets, modifications);

      // Store modification record
      const modificationRecord = {
        userId,
        weekNumber,
        originalTargets: currentTargets,
        modifications,
        modifiedTargets,
        appliedAt: new Date().toISOString(),
      };

      // Update plan_progress with modification history
      const { data: currentProgress } = await supabase
        .from('plan_progress')
        .select('progression_decisions')
        .eq('user_id', userId)
        .single();

      const existingDecisions = currentProgress?.progression_decisions || [];
      const updatedDecisions = [
        ...existingDecisions,
        {
          type: 'target_modification',
          timestamp: new Date().toISOString(),
          data: modificationRecord,
        },
      ];

      const { error } = await supabase
        .from('plan_progress')
        .update({ progression_decisions: updatedDecisions })
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error storing modified targets:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Calculate appropriate adjustment percentage based on performance
   */
  private static calculateAdjustmentPercent(averageAchievement: number): number {
    if (averageAchievement < 30) {
      return 0.25; // Reduce by 25% for very low performance
    } else if (averageAchievement < 50) {
      return 0.20; // Reduce by 20% for low performance
    } else if (averageAchievement < 70) {
      return 0.15; // Reduce by 15% for moderate performance
    } else {
      return 0.10; // Reduce by 10% for decent performance
    }
  }

  /**
   * Generate human-readable adjustment reason
   */
  private static generateAdjustmentReason(pillar: HealthPillar, performance: number): string {
    const pillarName = this.getPillarDisplayName(pillar);
    
    if (performance < 30) {
      return `Significantly reducing ${pillarName} target to build confidence and consistency`;
    } else if (performance < 50) {
      return `Reducing ${pillarName} target to focus on habit formation`;
    } else if (performance < 70) {
      return `Slightly reducing ${pillarName} target to improve consistency`;
    } else {
      return `Minor ${pillarName} adjustment to perfect your routine`;
    }
  }

  /**
   * Get display-friendly pillar names
   */
  private static getPillarDisplayName(pillar: HealthPillar): string {
    switch (pillar) {
      case 'steps': return 'step';
      case 'water': return 'hydration';
      case 'sleep': return 'sleep';
      case 'mood': return 'mood check-in';
      default: return pillar;
    }
  }

  /**
   * Validate target modifications are within acceptable ranges
   */
  static validateModifications(
    originalTargets: WeeklyTargets,
    modifications: TargetModifications
  ): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    let isValid = true;

    // Define minimum acceptable targets
    const minimums = {
      steps: 3000,
      waterOz: 30,
      sleepHr: 5.0,
    };

    // Check steps
    if (modifications.steps !== undefined) {
      if (modifications.steps < minimums.steps) {
        warnings.push(`Step target too low (minimum: ${minimums.steps})`);
        isValid = false;
      }
      const reductionPercent = ((originalTargets.steps - modifications.steps) / originalTargets.steps) * 100;
      if (reductionPercent > 40) {
        warnings.push('Step reduction exceeds 40% - may be too drastic');
      }
    }

    // Check water
    if (modifications.waterOz !== undefined) {
      if (modifications.waterOz < minimums.waterOz) {
        warnings.push(`Water target too low (minimum: ${minimums.waterOz}oz)`);
        isValid = false;
      }
      const reductionPercent = ((originalTargets.waterOz - modifications.waterOz) / originalTargets.waterOz) * 100;
      if (reductionPercent > 40) {
        warnings.push('Water reduction exceeds 40% - may be too drastic');
      }
    }

    // Check sleep
    if (modifications.sleepHr !== undefined) {
      if (modifications.sleepHr < minimums.sleepHr) {
        warnings.push(`Sleep target too low (minimum: ${minimums.sleepHr}hr)`);
        isValid = false;
      }
      const reductionPercent = ((originalTargets.sleepHr - modifications.sleepHr) / originalTargets.sleepHr) * 100;
      if (reductionPercent > 25) {
        warnings.push('Sleep reduction exceeds 25% - may be too drastic');
      }
    }

    return { isValid, warnings };
  }

  /**
   * Get modification history for a user
   */
  static async getModificationHistory(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('plan_progress')
      .select('progression_decisions')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return [];
    }

    const decisions = data.progression_decisions || [];
    return decisions.filter((decision: any) => decision.type === 'target_modification');
  }

  /**
   * Revert to original targets (undo modifications)
   */
  static async revertToOriginalTargets(
    userId: string,
    weekNumber: number
  ): Promise<{ success: boolean; originalTargets?: WeeklyTargets; error?: string }> {
    try {
      // Get modification history to find original targets
      const history = await this.getModificationHistory(userId);
      const weekModification = history.find(
        (mod: any) => mod.data?.weekNumber === weekNumber
      );

      if (!weekModification) {
        return { success: false, error: 'No modifications found for this week' };
      }

      const originalTargets = weekModification.data.originalTargets;

      // Record the reversion
      const { data: currentProgress } = await supabase
        .from('plan_progress')
        .select('progression_decisions')
        .eq('user_id', userId)
        .single();

      const existingDecisions = currentProgress?.progression_decisions || [];
      const updatedDecisions = [
        ...existingDecisions,
        {
          type: 'target_reversion',
          timestamp: new Date().toISOString(),
          data: {
            weekNumber,
            revertedTo: originalTargets,
            reason: 'User requested reversion to original targets',
          },
        },
      ];

      const { error } = await supabase
        .from('plan_progress')
        .update({ progression_decisions: updatedDecisions })
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, originalTargets };
    } catch (error) {
      console.error('Error reverting to original targets:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
