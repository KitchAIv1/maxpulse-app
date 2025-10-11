// Database Initializer Service
// Handles initial database setup for new users

import { supabase, activationService } from './supabase';
import { getTodayDate } from '../utils';

export class DatabaseInitializer {
  static async initializeUserData(userId: string, activationCodeId: string): Promise<boolean> {
    try {
      console.log('Initializing user data for:', userId);
      
      // 1. Get activation code data
      const activationCode = await activationService.getActivationCodeData(activationCodeId);
      if (!activationCode) {
        console.error('Activation code not found:', activationCodeId);
        return false;
      }

      // 2. Extract personalized targets
      const dynamicTargets = activationService.extractDynamicTargets(activationCode);
      console.log('Extracted dynamic targets:', dynamicTargets);

      // 3. Create daily metrics record with personalized targets
      const today = getTodayDate();
      const dailyMetricsData = {
        user_id: userId,
        date: today,
        steps_target: dynamicTargets.steps,
        steps_actual: 0,
        water_oz_target: dynamicTargets.waterOz,
        water_oz_actual: 0,
        sleep_hr_target: dynamicTargets.sleepHr,
        sleep_hr_actual: 0,
        mood_checkins_target: 7,
        mood_checkins_actual: 0,
        life_score: 0,
      };

      console.log('Creating daily metrics record:', dailyMetricsData);

      const { data: metricsData, error: metricsError } = await supabase
        .from('daily_metrics')
        .upsert(dailyMetricsData, { onConflict: 'user_id,date' })
        .select()
        .single();

      if (metricsError) {
        console.error('Failed to create daily metrics:', metricsError);
        return false;
      }

      console.log('Daily metrics created successfully:', metricsData);

      // 4. Create plan progress record
      const planProgressData = {
        user_id: userId,
        current_week: 1,
        current_phase: 1,
        weekly_scores: {},
      };

      const { data: progressData, error: progressError } = await supabase
        .from('plan_progress')
        .upsert(planProgressData, { onConflict: 'user_id' })
        .select()
        .single();

      if (progressError) {
        console.error('Failed to create plan progress:', progressError);
        // Don't fail the whole process for this
      } else {
        console.log('Plan progress created successfully:', progressData);
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize user data:', error);
      return false;
    }
  }

  static async verifyUserData(userId: string): Promise<{
    hasProfile: boolean;
    hasDailyMetrics: boolean;
    hasPlanProgress: boolean;
    targets?: any;
  }> {
    try {
      // Check profile
      const { data: profile } = await supabase
        .from('app_user_profiles')
        .select('activation_code_id')
        .eq('user_id', userId)
        .single();

      // Check daily metrics
      const today = getTodayDate();
      const { data: metrics } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      // Check plan progress
      const { data: progress } = await supabase
        .from('plan_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      return {
        hasProfile: !!profile,
        hasDailyMetrics: !!metrics,
        hasPlanProgress: !!progress,
        targets: metrics ? {
          steps: metrics.steps_target,
          waterOz: metrics.water_oz_target,
          sleepHr: metrics.sleep_hr_target,
        } : null,
      };
    } catch (error) {
      console.error('Failed to verify user data:', error);
      return {
        hasProfile: false,
        hasDailyMetrics: false,
        hasPlanProgress: false,
      };
    }
  }
}

export default DatabaseInitializer;
