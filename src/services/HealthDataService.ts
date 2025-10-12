// Health Data Service
// Unified interface for all health data operations with offline support

import { supabase } from './supabase';
import OfflineQueueService from './OfflineQueueService';
import { DailyMetrics, HydrationLog, SleepSession, MoodCheckIn } from '../types';
import { getTodayDate } from '../utils';

export interface HealthDataConfig {
  enableOfflineQueue: boolean;
  autoSyncInterval: number; // milliseconds
}

class HealthDataService {
  private static instance: HealthDataService;
  private offlineQueue: OfflineQueueService;
  private config: HealthDataConfig = {
    enableOfflineQueue: true,
    autoSyncInterval: 30000, // 30 seconds
  };

  public static getInstance(): HealthDataService {
    if (!HealthDataService.instance) {
      HealthDataService.instance = new HealthDataService();
    }
    return HealthDataService.instance;
  }

  constructor() {
    this.offlineQueue = OfflineQueueService.getInstance();
  }

  // Daily Metrics Operations
  async getTodayMetrics(userId: string): Promise<DailyMetrics | null> {
    try {
      const today = getTodayDate();
      const { data, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily metrics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get today metrics:', error);
      return null;
    }
  }

  /**
   * Fetch metrics for a specific date
   * @param userId - User ID
   * @param date - Date in YYYY-MM-DD format
   * @returns DailyMetrics or null if not found
   */
  async getMetricsByDate(userId: string, date: string): Promise<DailyMetrics | null> {
    try {
      const { data, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching metrics for date:', date, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get metrics by date:', error);
      return null;
    }
  }

  /**
   * Validate if date is within allowed range (past 3 weeks)
   * @param dateString - Date in YYYY-MM-DD format
   * @returns true if date is valid, false otherwise
   */
  isDateInValidRange(dateString: string): boolean {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const selectedDate = new Date(dateString);
      selectedDate.setHours(0, 0, 0, 0);
      
      // Check if date is in the future
      if (selectedDate > today) {
        return false;
      }
      
      // Check if date is older than 3 weeks (21 days)
      const diffMs = today.getTime() - selectedDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      return diffDays >= 0 && diffDays <= 21;
    } catch (error) {
      console.error('Error validating date range:', error);
      return false;
    }
  }

  async initializeDailyMetrics(userId: string, targets: {
    steps: number;
    waterOz: number;
    sleepHr: number;
  }): Promise<DailyMetrics | null> {
    try {
      // First check if today's metrics already exist
      const existing = await this.getTodayMetrics(userId);
      if (existing) {
        console.log('Daily metrics already exist for today');
        return existing;
      }

      const today = getTodayDate();
      
      const dailyMetrics = {
        user_id: userId,
        date: today,
        steps_target: targets.steps,
        steps_actual: 0,
        water_oz_target: targets.waterOz,
        water_oz_actual: 0,
        sleep_hr_target: targets.sleepHr,
        sleep_hr_actual: 0,
        mood_checkins_target: 7, // Daily check-ins for a week
        mood_checkins_actual: 0,
        // life_score is a generated column - don't insert value
        // finalized column doesn't exist in actual database
      };

      console.log('Attempting to insert daily metrics:', dailyMetrics);
      
      const { data, error } = await supabase
        .from('daily_metrics')
        .upsert(dailyMetrics, { onConflict: 'user_id,date' }) // Use upsert to handle existing records
        .select()
        .single();

      if (error) {
        console.error('Error initializing daily metrics:', error);
        console.error('Full error:', JSON.stringify(error, null, 2));
        console.error('Attempted to insert:', dailyMetrics);
        
        // Try a simpler insert without select
        console.log('Trying simpler insert...');
        const { error: simpleError } = await supabase
          .from('daily_metrics')
          .upsert(dailyMetrics, { onConflict: 'user_id,date' });
          
        if (simpleError) {
          console.error('Simple insert also failed:', simpleError);
          return null;
        } else {
          console.log('Simple insert succeeded, fetching record...');
          // Fetch the record separately
          return await this.getTodayMetrics(userId);
        }
      }

      console.log('Daily metrics initialized successfully');
      return data;
    } catch (error) {
      console.error('Failed to initialize daily metrics:', error);
      return null;
    }
  }

  async updateDailyMetrics(userId: string, updates: Partial<DailyMetrics>): Promise<boolean> {
    try {
      const today = getTodayDate();
      
      const { error } = await supabase
        .from('daily_metrics')
        .update(updates)
        .eq('user_id', userId)
        .eq('date', today);

      if (error) {
        console.error('Error updating daily metrics:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update daily metrics:', error);
      return false;
    }
  }

  // Hydration Operations
  async logHydration(userId: string, amountOz: number): Promise<boolean> {
    try {
      const hydrationLog: Omit<HydrationLog, 'user_id'> = {
        ts: new Date().toISOString(),
        amount_oz: amountOz,
        source: 'manual',
      };

      const logData = { ...hydrationLog, user_id: userId };

      // Try real-time sync first
      const { error } = await supabase
        .from('hydration_logs')
        .insert(logData);

      if (error) {
        // Queue for offline sync if enabled
        if (this.config.enableOfflineQueue) {
          await this.offlineQueue.queueOperation({
            type: 'hydration',
            operation: 'insert',
            data: logData,
            timestamp: new Date().toISOString(),
            userId,
          });
          return true; // Optimistic success
        }
        console.error('Error logging hydration:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to log hydration:', error);
      return false;
    }
  }

  async getTodayHydration(userId: string): Promise<HydrationLog[]> {
    try {
      const today = getTodayDate();
      const startOfDay = `${today}T00:00:00.000Z`;
      const endOfDay = `${today}T23:59:59.999Z`;

      const { data, error } = await supabase
        .from('hydration_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('ts', startOfDay)
        .lte('ts', endOfDay)
        .order('ts', { ascending: true });

      if (error) {
        console.error('Error fetching hydration logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get today hydration:', error);
      return [];
    }
  }

  // Sleep Operations
  async updateSleep(userId: string, sleepHours: number): Promise<boolean> {
    try {
      // Update daily metrics directly for manual sleep entry
      return await this.updateDailyMetrics(userId, {
        sleep_hr_actual: sleepHours,
      });
    } catch (error) {
      console.error('Failed to update sleep:', error);
      return false;
    }
  }

  // Mood Operations
  async logMoodCheckIn(userId: string, moodData: Omit<MoodCheckIn, 'id' | 'user_id' | 'timestamp'>): Promise<boolean> {
    try {
      const moodCheckIn = {
        user_id: userId,
        timestamp: new Date().toISOString(),
        mood_level: moodData.mood_level,
        notes: moodData.notes || null,
        journal_entry: moodData.journal_entry || null,
        health_context: moodData.health_context || null,
      };

      // Try real-time sync first
      const { error } = await supabase
        .from('mood_checkins')
        .insert(moodCheckIn);

      if (error) {
        // Queue for offline sync if enabled
        if (this.config.enableOfflineQueue) {
          await this.offlineQueue.queueOperation({
            type: 'mood',
            operation: 'insert',
            data: moodCheckIn,
            timestamp: new Date().toISOString(),
            userId,
          });
          return true; // Optimistic success
        }
        console.error('Error logging mood check-in:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to log mood check-in:', error);
      return false;
    }
  }

  // Sync Operations
  async syncPendingData(): Promise<void> {
    try {
      await this.offlineQueue.processQueue();
    } catch (error) {
      console.error('Failed to sync pending data:', error);
    }
  }

  async getPendingOperationsCount(): Promise<number> {
    return await this.offlineQueue.getQueueSize();
  }
}

export default HealthDataService;
