// Target Manager Service
// Simple, direct target management without complex database dependencies

import { activationService } from './supabase';

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
      
      // Get activation code data
      const activationCode = await activationService.getActivationCodeData(activationCodeId);
      if (!activationCode) {
        console.error('❌ Activation code not found:', activationCodeId);
        return null;
      }

      // Extract targets using existing logic
      const dynamicTargets = activationService.extractDynamicTargets(activationCode);
      
      console.log('✅ Extracted personalized targets:', {
        steps: dynamicTargets.steps,
        waterOz: dynamicTargets.waterOz,
        sleepHr: dynamicTargets.sleepHr,
      });

      return {
        steps: dynamicTargets.steps,
        waterOz: dynamicTargets.waterOz,
        sleepHr: dynamicTargets.sleepHr,
      };
    } catch (error) {
      console.error('❌ Failed to get personalized targets:', error);
      return null;
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
    return {
      steps: 8000,
      waterOz: 80,
      sleepHr: 8,
    };
  }

  /**
   * Get targets for a user - tries personalized first, falls back to defaults
   */
  static async getUserTargets(activationCodeId?: string): Promise<{
    steps: number;
    waterOz: number;
    sleepHr: number;
    source: 'personalized' | 'default';
  }> {
    if (activationCodeId) {
      const personalizedTargets = await this.getPersonalizedTargets(activationCodeId);
      if (personalizedTargets) {
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
