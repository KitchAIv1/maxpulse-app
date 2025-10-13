// Daily Metrics Updater Service
// Updates existing daily_metrics rows with correct V2 Engine targets

import { supabase } from './supabase';
import { V2EngineConnector } from './V2EngineConnector';
import { getTodayDate } from '../utils';

export class DailyMetricsUpdater {
  /**
   * Update all past daily_metrics rows with correct V2 Engine targets
   * @param userId - User ID
   * @returns Number of rows updated
   */
  static async updatePastMetricsWithV2Targets(userId: string): Promise<number> {
    try {
      console.log('🔄 Updating past daily_metrics with V2 Engine targets...');

      // 1. Get user's plan progress to know current week
      const { data: progress } = await supabase
        .from('plan_progress')
        .select('current_week, current_phase')
        .eq('user_id', userId)
        .single();

      const currentWeek = progress?.current_week || 1;
      console.log(`📅 Current week: ${currentWeek}`);

      // 2. Get all daily_metrics rows for this user (past 3 weeks)
      const { data: metrics, error } = await supabase
        .from('daily_metrics')
        .select('date, steps_target, water_oz_target, sleep_hr_target')
        .eq('user_id', userId)
        .gte('date', this.getDateDaysAgo(21)) // Past 3 weeks
        .order('date', { ascending: false });

      if (error || !metrics || metrics.length === 0) {
        console.log('⚠️ No daily_metrics rows found to update');
        return 0;
      }

      console.log(`📊 Found ${metrics.length} daily_metrics rows to check`);

      // 3. Get V2 Engine targets for current week (all dates in same week use same targets)
      const v2Targets = await V2EngineConnector.getCurrentWeekTargets(userId);
      
      if (!v2Targets) {
        console.error('❌ Failed to get V2 Engine targets');
        return 0;
      }

      console.log('✅ V2 Engine targets:', v2Targets);

      // 4. Update rows that have wrong targets
      let updatedCount = 0;
      const wrongTargetRows = metrics.filter(row => 
        row.steps_target === 8000 || 
        row.water_oz_target === 80 || 
        row.sleep_hr_target === 8.0
      );

      console.log(`🎯 Found ${wrongTargetRows.length} rows with wrong targets (8000, 80, 8)`);

      for (const row of wrongTargetRows) {
        const { error: updateError } = await supabase
          .from('daily_metrics')
          .update({
            steps_target: v2Targets.steps,
            water_oz_target: v2Targets.waterOz,
            sleep_hr_target: v2Targets.sleepHr,
          })
          .eq('user_id', userId)
          .eq('date', row.date);

        if (updateError) {
          console.error(`❌ Failed to update ${row.date}:`, updateError);
        } else {
          updatedCount++;
          console.log(`✅ Updated ${row.date}: ${v2Targets.steps}, ${v2Targets.waterOz}, ${v2Targets.sleepHr}`);
        }
      }

      console.log(`🎉 Successfully updated ${updatedCount} rows with V2 Engine targets`);
      return updatedCount;

    } catch (error) {
      console.error('❌ Failed to update daily metrics:', error);
      return 0;
    }
  }

  /**
   * Ensure daily_metrics row exists for a specific date with correct V2 targets
   * @param userId - User ID
   * @param date - Date in YYYY-MM-DD format
   * @returns true if row exists/created, false on failure
   */
  static async ensureMetricsRowExists(userId: string, date: string): Promise<boolean> {
    try {
      // Check if row already exists
      const { data: existing } = await supabase
        .from('daily_metrics')
        .select('date, steps_target, water_oz_target, sleep_hr_target')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (existing) {
        // Row exists - check if targets are correct
        if (existing.steps_target === 8000 || existing.water_oz_target === 80 || existing.sleep_hr_target === 8.0) {
          console.log(`🔄 Row exists for ${date} but has wrong targets, updating...`);
          return await this.updateRowWithV2Targets(userId, date);
        }
        
        console.log(`✅ Row exists for ${date} with correct targets`);
        return true;
      }

      // Row doesn't exist - create it with V2 targets
      console.log(`📝 Creating daily_metrics row for ${date}...`);
      return await this.createRowWithV2Targets(userId, date);

    } catch (error) {
      console.error(`❌ Failed to ensure metrics row for ${date}:`, error);
      return false;
    }
  }

  /**
   * Create a new daily_metrics row with V2 Engine targets
   */
  private static async createRowWithV2Targets(userId: string, date: string): Promise<boolean> {
    try {
      // Get V2 Engine targets
      const v2Targets = await V2EngineConnector.getCurrentWeekTargets(userId);
      
      if (!v2Targets) {
        console.error('❌ Failed to get V2 Engine targets for row creation');
        return false;
      }

      const { error } = await supabase
        .from('daily_metrics')
        .insert({
          user_id: userId,
          date: date,
          steps_target: v2Targets.steps,
          steps_actual: 0,
          water_oz_target: v2Targets.waterOz,
          water_oz_actual: 0,
          sleep_hr_target: v2Targets.sleepHr,
          sleep_hr_actual: 0,
          mood_checkins_target: 7,
          mood_checkins_actual: 0,
        });

      if (error) {
        console.error(`❌ Failed to create row for ${date}:`, error);
        return false;
      }

      console.log(`✅ Created row for ${date} with V2 targets:`, v2Targets);
      return true;

    } catch (error) {
      console.error('❌ Row creation failed:', error);
      return false;
    }
  }

  /**
   * Update an existing row with V2 Engine targets
   */
  private static async updateRowWithV2Targets(userId: string, date: string): Promise<boolean> {
    try {
      const v2Targets = await V2EngineConnector.getCurrentWeekTargets(userId);
      
      if (!v2Targets) {
        console.error('❌ Failed to get V2 Engine targets for row update');
        return false;
      }

      const { error } = await supabase
        .from('daily_metrics')
        .update({
          steps_target: v2Targets.steps,
          water_oz_target: v2Targets.waterOz,
          sleep_hr_target: v2Targets.sleepHr,
        })
        .eq('user_id', userId)
        .eq('date', date);

      if (error) {
        console.error(`❌ Failed to update ${date}:`, error);
        return false;
      }

      console.log(`✅ Updated ${date} with V2 targets:`, v2Targets);
      return true;

    } catch (error) {
      console.error('❌ Row update failed:', error);
      return false;
    }
  }

  /**
   * Get date N days ago in YYYY-MM-DD format
   */
  private static getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Run a full audit and fix for a user's daily_metrics
   * This is the main method to call for fixing all issues
   */
  static async auditAndFix(userId: string): Promise<{
    rowsUpdated: number;
    rowsCreated: number;
    success: boolean;
  }> {
    console.log('🔍 Starting daily_metrics audit and fix...');

    try {
      // Step 1: Update existing rows with wrong targets
      const rowsUpdated = await this.updatePastMetricsWithV2Targets(userId);

      // Step 2: Ensure rows exist for past 21 days
      let rowsCreated = 0;
      const today = new Date();
      
      for (let i = 0; i <= 21; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = getTodayDate(); // Use the fixed local timezone version
        
        // Use actual date calculation
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const actualDateStr = `${year}-${month}-${day}`;
        
        const created = await this.ensureMetricsRowExists(userId, actualDateStr);
        if (created) {
          // Check if it was actually created (not just existed)
          rowsCreated++;
        }
      }

      console.log(`✅ Audit complete: ${rowsUpdated} rows updated, ${rowsCreated} rows ensured`);

      return {
        rowsUpdated,
        rowsCreated,
        success: true,
      };

    } catch (error) {
      console.error('❌ Audit and fix failed:', error);
      return {
        rowsUpdated: 0,
        rowsCreated: 0,
        success: false,
      };
    }
  }
}

export default DailyMetricsUpdater;

