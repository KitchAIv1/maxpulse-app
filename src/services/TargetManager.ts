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
}

export default TargetManager;
