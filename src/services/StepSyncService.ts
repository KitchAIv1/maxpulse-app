// Step Sync Service
// Handles syncing step data from pedometer to database

import { supabase } from './supabase';
import { getTodayDate } from '../utils';
import { StepData } from '../types/health';

export class StepSyncService {
  private static instance: StepSyncService;
  private lastSyncTime = 0;
  private syncInProgress = false;

  public static getInstance(): StepSyncService {
    if (!StepSyncService.instance) {
      StepSyncService.instance = new StepSyncService();
    }
    return StepSyncService.instance;
  }

  /**
   * Sync step data to the database
   * @param userId - User ID
   * @param stepData - Step data from pedometer
   */
  async syncStepsToDatabase(userId: string, stepData: StepData): Promise<void> {
    // Throttle database updates to prevent excessive writes
    const now = Date.now();
    if (now - this.lastSyncTime < 10000) { // Max 1 sync per 10 seconds
      return;
    }

    if (this.syncInProgress) {
      return;
    }

    try {
      this.syncInProgress = true;
      this.lastSyncTime = now;

      const today = getTodayDate();
      
      console.log(`📊 Syncing steps to database: ${stepData.steps} steps for ${today}`);

      // Update the daily_metrics table with current step count
      const { error } = await supabase
        .from('daily_metrics')
        .update({
          steps_actual: stepData.steps,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('date', today);

      if (error) {
        console.error('❌ Failed to sync steps to database:', error);
        throw error;
      }

      console.log(`✅ Successfully synced ${stepData.steps} steps to database`);

    } catch (error) {
      console.error('❌ Step sync failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Ensure daily metrics row exists before syncing steps
   * @param userId - User ID
   * @param stepTarget - Step target for the day
   */
  async ensureDailyMetricsExists(userId: string, stepTarget: number): Promise<boolean> {
    try {
      const today = getTodayDate();

      // Check if row exists
      const { data: existing } = await supabase
        .from('daily_metrics')
        .select('date')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (existing) {
        return true; // Row already exists
      }

      // Create row with default values
      const { error } = await supabase
        .from('daily_metrics')
        .insert({
          user_id: userId,
          date: today,
          steps_target: stepTarget,
          steps_actual: 0,
          water_oz_target: 95, // Default values - will be updated by V2 Engine
          water_oz_actual: 0,
          sleep_hr_target: 8,
          sleep_hr_actual: 0,
          mood_checkins_target: 7,
          mood_checkins_actual: 0,
        });

      if (error) {
        console.error('❌ Failed to create daily metrics row:', error);
        return false;
      }

      console.log(`✅ Created daily metrics row for ${today}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to ensure daily metrics exists:', error);
      return false;
    }
  }

  /**
   * Reset step data for new day
   * This is called when the app detects a new day
   */
  async resetStepsForNewDay(userId: string): Promise<void> {
    try {
      const today = getTodayDate();
      console.log(`🆕 Resetting steps for new day: ${today}`);

      // The daily metrics row will be created by DailyMetricsUpdater
      // We just need to ensure steps start at 0 for the new day
      console.log('✅ Steps reset for new day (will start from 0)');

    } catch (error) {
      console.error('❌ Failed to reset steps for new day:', error);
    }
  }

  /**
   * Get current step count from database
   * @param userId - User ID
   * @returns Current step count from database
   */
  async getCurrentStepsFromDatabase(userId: string): Promise<number> {
    try {
      const today = getTodayDate();

      const { data, error } = await supabase
        .from('daily_metrics')
        .select('steps_actual')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (error || !data) {
        console.log('No step data found in database for today');
        return 0;
      }

      return data.steps_actual || 0;

    } catch (error) {
      console.error('❌ Failed to get steps from database:', error);
      return 0;
    }
  }
}

export default StepSyncService;
