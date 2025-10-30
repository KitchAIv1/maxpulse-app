// Target Manager Service
// Connects UI to V2 Engine for dynamic weekly targets

import { activationService } from './supabase';
import V2EngineConnector from './V2EngineConnector';

export class TargetManager {
  /**
   * Extract and return personalized targets from activation code
   * This is the SINGLE SOURCE OF TRUTH for user targets
   */
  static async getPersonalizedTargets(activationCodeId: string): Promise<{
    steps: number;
    waterOz: number;
    sleepHr: number;
  } | null> {
    try {
      console.log('🎯 Getting personalized targets for activation code:', activationCodeId);
      
      // Get activation code data directly
      const activationCode = await activationService.getActivationCodeData(activationCodeId);
      if (!activationCode) {
        console.error('❌ Activation code not found:', activationCodeId);
        return null;
      }

      console.log('📋 Raw onboarding_data structure:', JSON.stringify(activationCode.onboarding_data, null, 2));

      // BYPASS v2Analysis engine - directly extract from wherever the data actually is
      const onboardingData = activationCode.onboarding_data;
      
      // Try multiple possible locations for personalized targets
      let personalizedTargets = null;
      
      // Option 1: v2Analysis.personalizedTargets (current expectation)
      if (onboardingData?.v2Analysis?.personalizedTargets) {
        personalizedTargets = onboardingData.v2Analysis.personalizedTargets;
        console.log('✅ Found targets in v2Analysis.personalizedTargets');
      }
      // Option 2: Direct personalizedTargets
      else if (onboardingData?.personalizedTargets) {
        personalizedTargets = onboardingData.personalizedTargets;
        console.log('✅ Found targets in direct personalizedTargets');
      }
      // Option 3: Any other nested location - log and find it
      else {
        console.log('🔍 Searching for targets in onboarding_data...');
        console.log('Available keys:', Object.keys(onboardingData || {}));
        
        // Return zeros to indicate data extraction failed
        console.log('❌ No personalized targets found - using zeros to indicate failure');
        return {
          steps: 0,
          waterOz: 0,
          sleepHr: 0,
        };
      }

      if (personalizedTargets) {
        const extractedTargets = {
          steps: personalizedTargets.steps?.targetDaily || 0,
          waterOz: personalizedTargets.hydration?.targetLiters 
            ? Math.round(personalizedTargets.hydration.targetLiters * 33.814) 
            : 0,
          sleepHr: personalizedTargets.sleep?.targetMinHours && personalizedTargets.sleep?.targetMaxHours
            ? Math.round((personalizedTargets.sleep.targetMinHours + personalizedTargets.sleep.targetMaxHours) / 2)
            : 0,
        };

        console.log('✅ Extracted personalized targets:', extractedTargets);
        return extractedTargets;
      }

      // Final fallback - return zeros to indicate complete failure
      console.log('❌ Complete extraction failure - returning zeros');
      return {
        steps: 0,
        waterOz: 0,
        sleepHr: 0,
      };
    } catch (error) {
      console.error('❌ Failed to get personalized targets:', error);
      // Return zeros to indicate extraction error
      return {
        steps: 0,
        waterOz: 0,
        sleepHr: 0,
      };
    }
  }

  /**
   * Get default targets as fallback
   */
  static getDefaultTargets(): {
    steps: number;
    waterOz: number;
    sleepHr: number;
  } {
    // Always return personalized targets - no more old defaults
    return {
      steps: 10000,
      waterOz: 95,
      sleepHr: 8,
    };
  }

  /**
   * Get current week's targets using V2 Engine (PREFERRED METHOD)
   */
  static async getCurrentWeekTargets(userId: string): Promise<{
    steps: number;
    waterOz: number;
    sleepHr: number;
    source: 'v2_engine' | 'personalized' | 'default';
    week?: number;
    phase?: number;
    focus?: string;
  }> {
    // Try V2 Engine first (dynamic weekly targets)
    const weeklyTargets = await V2EngineConnector.getCurrentWeekTargets(userId);
    if (weeklyTargets) {
      return {
        steps: weeklyTargets.steps,
        waterOz: weeklyTargets.waterOz,
        sleepHr: weeklyTargets.sleepHr,
        source: 'v2_engine',
        week: weeklyTargets.week,
        phase: weeklyTargets.phase,
        focus: weeklyTargets.focus,
      };
    }

    // Fallback to static personalized targets
    console.warn('⚠️ V2 Engine failed, falling back to static personalized targets');
    
    // Get user's activation code
    const { supabase } = await import('./supabase');
    const { data: profile } = await supabase
      .from('app_user_profiles')
      .select('activation_code_id')
      .eq('user_id', userId)
      .single();

    if (profile?.activation_code_id) {
      const personalizedTargets = await this.getPersonalizedTargets(profile.activation_code_id);
      if (personalizedTargets && personalizedTargets.steps > 0) {
        return {
          ...personalizedTargets,
          source: 'personalized',
        };
      }
    }

    // Final fallback
    return {
      ...this.getDefaultTargets(),
      source: 'default',
    };
  }

  /**
   * Get targets for a user - LEGACY METHOD (use getCurrentWeekTargets instead)
   */
  static async getUserTargets(activationCodeId?: string): Promise<{
    steps: number;
    waterOz: number;
    sleepHr: number;
    source: 'personalized' | 'default';
  }> {
    if (activationCodeId) {
      const personalizedTargets = await this.getPersonalizedTargets(activationCodeId);
      if (personalizedTargets && personalizedTargets.steps > 0) {
        return {
          ...personalizedTargets,
          source: 'personalized',
        };
      }
    }

    return {
      ...this.getDefaultTargets(),
      source: 'default',
    };
  }

  /**
   * Refresh targets after progression decision
   * This method ensures the app store gets updated with new weekly targets
   */
  static async refreshTargetsAfterProgression(userId: string): Promise<{
    success: boolean;
    targets?: {
      steps: number;
      waterOz: number;
      sleepHr: number;
      source: string;
      week?: number;
      phase?: number;
      focus?: string;
    };
    error?: string;
  }> {
    try {
      console.log('🔄 Refreshing targets after progression for user:', userId);

      // Get fresh targets from V2 Engine
      const newTargets = await this.getCurrentWeekTargets(userId);
      
      // Update app store with new targets
      const { useAppStore } = await import('../stores/appStore');
      const store = useAppStore.getState();
      
      await store.initializeTargets({
        steps: newTargets.steps,
        waterOz: newTargets.waterOz,
        sleepHr: newTargets.sleepHr,
      });

      console.log('✅ Targets refreshed successfully:', newTargets);

      return {
        success: true,
        targets: newTargets,
      };

    } catch (error) {
      console.error('❌ Error refreshing targets after progression:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get targets for specific week (used for progression planning)
   */
  static async getTargetsForWeek(userId: string, weekNumber: number, phaseNumber: number): Promise<{
    steps: number;
    waterOz: number;
    sleepHr: number;
    week: number;
    phase: number;
    focus?: string;
  } | null> {
    try {
      console.log(`🎯 Getting targets for week ${weekNumber}, phase ${phaseNumber}`);

      // Use V2 Engine to get targets for specific week
      const targets = await V2EngineConnector.getTargetsForWeek(userId, weekNumber, phaseNumber);
      
      if (targets) {
        return {
          steps: targets.steps,
          waterOz: targets.waterOz,
          sleepHr: targets.sleepHr,
          week: weekNumber,
          phase: phaseNumber,
          focus: targets.focus,
        };
      }

      return null;

    } catch (error) {
      console.error('Error getting targets for specific week:', error);
      return null;
    }
  }

  /**
   * Validate targets are within reasonable bounds
   */
  static validateTargets(targets: {
    steps: number;
    waterOz: number;
    sleepHr: number;
  }): {
    isValid: boolean;
    errors: string[];
    adjustedTargets?: {
      steps: number;
      waterOz: number;
      sleepHr: number;
    };
  } {
    const errors: string[] = [];
    const adjustedTargets = { ...targets };

    // Steps validation (2,000 - 25,000)
    if (targets.steps < 2000) {
      errors.push('Steps target too low (minimum 2,000)');
      adjustedTargets.steps = 2000;
    } else if (targets.steps > 25000) {
      errors.push('Steps target too high (maximum 25,000)');
      adjustedTargets.steps = 25000;
    }

    // Water validation (32oz - 150oz)
    if (targets.waterOz < 32) {
      errors.push('Water target too low (minimum 32oz)');
      adjustedTargets.waterOz = 32;
    } else if (targets.waterOz > 150) {
      errors.push('Water target too high (maximum 150oz)');
      adjustedTargets.waterOz = 150;
    }

    // Sleep validation (5 - 12 hours)
    if (targets.sleepHr < 5) {
      errors.push('Sleep target too low (minimum 5 hours)');
      adjustedTargets.sleepHr = 5;
    } else if (targets.sleepHr > 12) {
      errors.push('Sleep target too high (maximum 12 hours)');
      adjustedTargets.sleepHr = 12;
    }

    return {
      isValid: errors.length === 0,
      errors,
      adjustedTargets: errors.length > 0 ? adjustedTargets : undefined,
    };
  }

  /**
   * Apply target modifications (used during week extensions)
   */
  static async applyTargetModifications(
    userId: string,
    modifications: {
      steps?: number;
      waterOz?: number;
      sleepHr?: number;
      focusArea?: 'steps' | 'water' | 'sleep' | 'mood';
      adjustmentReason: string;
    }
  ): Promise<{
    success: boolean;
    appliedTargets?: {
      steps: number;
      waterOz: number;
      sleepHr: number;
    };
    error?: string;
  }> {
    try {
      console.log('🔧 Applying target modifications for user:', userId, modifications);

      // Get current targets
      const currentTargets = await this.getCurrentWeekTargets(userId);
      
      // Apply modifications
      const modifiedTargets = {
        steps: modifications.steps || currentTargets.steps,
        waterOz: modifications.waterOz || currentTargets.waterOz,
        sleepHr: modifications.sleepHr || currentTargets.sleepHr,
      };

      // Validate modified targets
      const validation = this.validateTargets(modifiedTargets);
      const finalTargets = validation.adjustedTargets || modifiedTargets;

      // Update app store
      const { useAppStore } = await import('../stores/appStore');
      const store = useAppStore.getState();
      
      await store.initializeTargets(finalTargets);

      console.log('✅ Target modifications applied successfully:', finalTargets);

      return {
        success: true,
        appliedTargets: finalTargets,
      };

    } catch (error) {
      console.error('❌ Error applying target modifications:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Reset targets to V2 Engine defaults (used after progression reset)
   */
  static async resetToV2EngineTargets(userId: string): Promise<{
    success: boolean;
    targets?: {
      steps: number;
      waterOz: number;
      sleepHr: number;
      source: string;
    };
    error?: string;
  }> {
    try {
      console.log('🔄 Resetting to V2 Engine targets for user:', userId);

      // Force refresh from V2 Engine
      const engineTargets = await V2EngineConnector.getCurrentWeekTargets(userId);
      
      if (!engineTargets) {
        throw new Error('V2 Engine returned no targets');
      }

      const targets = {
        steps: engineTargets.steps,
        waterOz: engineTargets.waterOz,
        sleepHr: engineTargets.sleepHr,
      };

      // Update app store
      const { useAppStore } = await import('../stores/appStore');
      const store = useAppStore.getState();
      
      await store.initializeTargets(targets);

      console.log('✅ Reset to V2 Engine targets successfully:', targets);

      return {
        success: true,
        targets: {
          ...targets,
          source: 'v2_engine',
        },
      };

    } catch (error) {
      console.error('❌ Error resetting to V2 Engine targets:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default TargetManager;
