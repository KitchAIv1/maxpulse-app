// App Store Actions Service
// Database-integrated actions for the app store

import HealthDataService from './HealthDataService';
import { MoodCheckIn } from '../types';

export class AppStoreActions {
  private static healthService = HealthDataService.getInstance();

  static async addHydration(
    userId: string,
    amount: number,
    currentWaterOz: number,
    updateState: (updates: any) => void,
    setError: (error: string | null) => void
  ): Promise<void> {
    // Optimistic update
    updateState({
      currentState: { waterOz: currentWaterOz + amount },
    });

    try {
      const success = await this.healthService.logHydration(userId, amount);
      
      if (success) {
        // Update daily metrics
        const newTotal = currentWaterOz + amount;
        await this.healthService.updateDailyMetrics(userId, {
          water_oz_actual: newTotal,
        });
      } else {
        // Revert optimistic update on failure
        updateState({
          currentState: { waterOz: currentWaterOz },
        });
        setError('Failed to log hydration');
      }
    } catch (error) {
      console.error('Failed to add hydration:', error);
      // Revert optimistic update
      updateState({
        currentState: { waterOz: currentWaterOz },
      });
      setError('Failed to log hydration');
    }
  }

  static async updateSleep(
    userId: string,
    sleepHours: number,
    updateState: (updates: any) => void,
    setError: (error: string | null) => void
  ): Promise<void> {
    // Optimistic update
    updateState({
      currentState: { sleepHr: sleepHours },
    });

    try {
      const success = await this.healthService.updateSleep(userId, sleepHours);
      
      if (!success) {
        setError('Failed to update sleep');
      }
    } catch (error) {
      console.error('Failed to update sleep:', error);
      setError('Failed to update sleep');
    }
  }

  static async addMoodCheckIn(
    userId: string,
    checkIn: Omit<MoodCheckIn, 'id' | 'user_id' | 'timestamp'>,
    updateMoodFrequency: (updates: any) => void,
    setError: (error: string | null) => void
  ): Promise<void> {
    try {
      const success = await this.healthService.logMoodCheckIn(userId, checkIn);
      
      if (success) {
        // Optimistically update mood frequency
        const now = new Date().toISOString();
        updateMoodFrequency((prev: any) => ({
          total_checkins: prev.total_checkins + 1,
          last_checkin: now,
          current_streak: prev.current_streak + 1,
        }));
      } else {
        setError('Failed to log mood check-in');
      }
    } catch (error) {
      console.error('Failed to add mood check-in:', error);
      setError('Failed to log mood check-in');
    }
  }

  static async initializeTargets(
    userId: string,
    setTargets: (targets: any) => void,
    setError: (error: string | null) => void,
    customTargets?: any
  ): Promise<void> {
    try {
      const healthService = this.healthService;
      
      // Generate targets (custom or default)
      const targets = customTargets || {
        steps: 8000,
        waterOz: 80,
        sleepHr: 8,
      };
      
      setTargets(targets);
      
      // Initialize daily metrics with these targets
      if (userId) {
        await healthService.initializeDailyMetrics(userId, targets);
      }
    } catch (error) {
      console.error('Failed to initialize targets:', error);
      setError('Failed to initialize targets');
    }
  }

  static async loadTodayData(
    userId: string,
    setDailyMetrics: (metrics: any) => void,
    setLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
  ): Promise<void> {
    setLoading(true);
    setError(null);
    
    try {
      const todayMetrics = await this.healthService.getTodayMetrics(userId);
      
      if (todayMetrics) {
        setDailyMetrics(todayMetrics);
      }
    } catch (error) {
      console.error('Failed to load today data:', error);
      setError('Failed to load today data');
    } finally {
      setLoading(false);
    }
  }
}

export default AppStoreActions;
