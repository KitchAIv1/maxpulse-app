// V2 Engine Connector
// Precisely connects UI displays to the V2 transformation engine

import { supabase } from './supabase';

export interface WeeklyTargets {
  steps: number;
  waterOz: number;
  sleepHr: number;
  week: number;
  phase: number;
  focus: string;
  expectedChanges: string[];
}

export class V2EngineConnector {
  /**
   * Get current week's targets from V2 engine data
   */
  static async getCurrentWeekTargets(userId: string): Promise<WeeklyTargets | null> {
    try {
      console.log('🔧 V2 Engine: Getting current week targets for user:', userId);

      // 1. Get user's current week from plan_progress
      const { data: progress } = await supabase
        .from('plan_progress')
        .select('current_week, current_phase')
        .eq('user_id', userId)
        .single();

      const currentWeek = progress?.current_week || 1;
      const currentPhase = progress?.current_phase || 1;
      
      console.log('📅 Current week:', currentWeek, 'Phase:', currentPhase);

      // 2. Get user's activation code and V2 analysis
      const { data: profile } = await supabase
        .from('app_user_profiles')
        .select('activation_code_id')
        .eq('user_id', userId)
        .single();

      if (!profile?.activation_code_id) {
        console.error('❌ No activation code found for user');
        return null;
      }

      const { data: activationCode } = await supabase
        .from('activation_codes')
        .select('onboarding_data')
        .eq('id', profile.activation_code_id)
        .single();

      if (!activationCode?.onboarding_data?.v2Analysis) {
        console.error('❌ No V2 analysis found in activation code');
        return null;
      }

      // 3. Extract transformation roadmap
      const { transformationRoadmap } = activationCode.onboarding_data.v2Analysis;
      
      if (!transformationRoadmap?.phases) {
        console.error('❌ No transformation phases found');
        return null;
      }

      // 4. Find the current phase and week within that phase
      const phase = transformationRoadmap.phases.find((p: any) => p.phase === currentPhase);
      
      if (!phase) {
        console.error('❌ Current phase not found:', currentPhase);
        return null;
      }

      // 5. Calculate week within phase (1-4 for each phase)
      const weekInPhase = ((currentWeek - 1) % 4) + 1;
      const milestone = phase.weeklyMilestones?.[weekInPhase - 1];

      if (!milestone) {
        console.error('❌ No milestone found for week', weekInPhase, 'in phase', currentPhase);
        return null;
      }

      // 6. Parse targets from milestone focus string
      const weeklyTargets = this.parseWeeklyTargets(milestone.focus, currentWeek, currentPhase);
      
      console.log('✅ V2 Engine extracted weekly targets:', weeklyTargets);

      return {
        ...weeklyTargets,
        week: currentWeek,
        phase: currentPhase,
        focus: milestone.focus,
        expectedChanges: milestone.expectedChanges || [],
      };

    } catch (error) {
      console.error('❌ V2 Engine connector failed:', error);
      return null;
    }
  }

  /**
   * Parse weekly targets from focus string
   */
  private static parseWeeklyTargets(focus: string, week: number, phase: number): { steps: number; waterOz: number; sleepHr: number } {
    console.log('🔍 Parsing focus string:', focus);

    // Default progressive targets based on week
    let steps = 8000;
    let waterOz = 80;
    let sleepHr = 7;

    // Phase 1: Foundation (Weeks 1-4) - Focus on sleep and hydration
    if (phase === 1) {
      // Sleep progression: 6.6 → 6.8 → 6.9 → 7.0
      sleepHr = 6.6 + (week - 1) * 0.1;
      
      // Hydration progression: 1.5L → 2.0L → 2.5L → 2.8L
      const liters = 1.5 + (week - 1) * 0.43; // Roughly 1.5, 1.93, 2.36, 2.8
      waterOz = Math.round(liters * 33.814);
      
      // Steps: Start at 6250, progress to 10000
      steps = 6250 + (week - 1) * 937; // 6250, 7187, 8124, 9061
    }
    
    // Phase 2: Movement (Weeks 5-8) - Focus on steps and exercise
    else if (phase === 2) {
      sleepHr = 7; // Maintain sleep target
      waterOz = 95; // Maintain hydration target (2.8L)
      
      // Steps progression: 6300 → 7500 → 8800 → 10000
      const weekInPhase = ((week - 1) % 4) + 1;
      const stepTargets = [6300, 7500, 8800, 10000];
      steps = stepTargets[weekInPhase - 1] || 10000;
    }
    
    // Phase 3: Nutrition (Weeks 9-12) - Maintain all targets
    else if (phase === 3) {
      steps = 10000; // Final target
      waterOz = 95;  // Final target (2.8L)
      sleepHr = 7;   // Final target
    }

    // Try to extract specific values from focus string if available
    const sleepMatch = focus.match(/Sleep (\d+\.?\d*)hrs?/i);
    if (sleepMatch) {
      sleepHr = parseFloat(sleepMatch[1]);
    }

    const waterMatch = focus.match(/Drink (\d+\.?\d*)L/i);
    if (waterMatch) {
      waterOz = Math.round(parseFloat(waterMatch[1]) * 33.814);
    }

    const stepsMatch = focus.match(/(\d+) steps/i);
    if (stepsMatch) {
      steps = parseInt(stepsMatch[1]);
    }

    return { steps, waterOz, sleepHr };
  }

  /**
   * Get targets for a specific week (used for progression planning)
   */
  static async getTargetsForWeek(userId: string, weekNumber: number, phaseNumber: number): Promise<WeeklyTargets | null> {
    try {
      console.log(`🔧 V2 Engine: Getting targets for week ${weekNumber}, phase ${phaseNumber}`);

      // Get user's activation code and V2 analysis
      const { data: profile } = await supabase
        .from('app_user_profiles')
        .select('activation_code_id')
        .eq('user_id', userId)
        .single();

      if (!profile?.activation_code_id) {
        console.error('❌ No activation code found for user');
        return null;
      }

      const { data: activationCode } = await supabase
        .from('activation_codes')
        .select('onboarding_data')
        .eq('id', profile.activation_code_id)
        .single();

      if (!activationCode?.onboarding_data?.v2Analysis) {
        console.error('❌ No V2 analysis found in activation code');
        return null;
      }

      // Extract transformation roadmap
      const { transformationRoadmap } = activationCode.onboarding_data.v2Analysis;
      
      if (!transformationRoadmap?.phases) {
        console.error('❌ No transformation phases found');
        return null;
      }

      // Find the specified phase
      const phase = transformationRoadmap.phases.find((p: any) => p.phase === phaseNumber);
      
      if (!phase) {
        console.error('❌ Specified phase not found:', phaseNumber);
        return null;
      }

      // Calculate week within phase (1-4 for each phase)
      const weekInPhase = ((weekNumber - 1) % 4) + 1;
      const milestone = phase.weeklyMilestones?.[weekInPhase - 1];

      if (!milestone) {
        console.error('❌ No milestone found for week', weekInPhase, 'in phase', phaseNumber);
        return null;
      }

      // Parse targets from milestone focus string
      const weeklyTargets = this.parseWeeklyTargets(milestone.focus, weekNumber, phaseNumber);
      
      console.log('✅ V2 Engine extracted targets for specific week:', weeklyTargets);

      return {
        ...weeklyTargets,
        week: weekNumber,
        phase: phaseNumber,
        focus: milestone.focus,
        expectedChanges: milestone.expectedChanges || [],
      };

    } catch (error) {
      console.error('❌ V2 Engine getTargetsForWeek failed:', error);
      return null;
    }
  }

  /**
   * Get final targets (end of 90-day plan)
   */
  static async getFinalTargets(activationCodeId: string): Promise<{ steps: number; waterOz: number; sleepHr: number } | null> {
    try {
      const { data: activationCode } = await supabase
        .from('activation_codes')
        .select('onboarding_data')
        .eq('id', activationCodeId)
        .single();

      const personalizedTargets = activationCode?.onboarding_data?.v2Analysis?.personalizedTargets;
      
      if (!personalizedTargets) return null;

      return {
        steps: personalizedTargets.steps?.targetDaily || 0,
        waterOz: personalizedTargets.hydration?.targetLiters 
          ? Math.round(personalizedTargets.hydration.targetLiters * 33.814) 
          : 0,
        sleepHr: personalizedTargets.sleep?.targetMinHours && personalizedTargets.sleep?.targetMaxHours
          ? Math.round((personalizedTargets.sleep.targetMinHours + personalizedTargets.sleep.targetMaxHours) / 2)
          : 0,
      };
    } catch (error) {
      console.error('❌ Failed to get final targets:', error);
      return null;
    }
  }
}

export default V2EngineConnector;
