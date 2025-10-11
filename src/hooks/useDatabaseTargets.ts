// Database Targets Hook
// Loads and manages targets from database daily_metrics table

import { useState, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { supabase } from '../services/supabase';
import { DailyMetrics } from '../types';
import { getTodayDate } from '../utils';

export interface DatabaseTargets {
  steps: number;
  waterOz: number;
  sleepHr: number;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useDatabaseTargets = () => {
  const { user } = useAppStore();
  const [dbTargets, setDbTargets] = useState<DatabaseTargets>({
    steps: 10000, // Personalized targets as fallback
    waterOz: 95,
    sleepHr: 8,
    isLoaded: false,
    isLoading: false,
    error: null,
  });

  const loadDatabaseTargets = async () => {
    if (!user) return;

    setDbTargets(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const today = getTodayDate();
      const { data, error } = await supabase
        .from('daily_metrics')
        .select('steps_target, water_oz_target, sleep_hr_target')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No record found - this is expected for new users
          console.log('No daily metrics found, using defaults');
          setDbTargets(prev => ({ 
            ...prev, 
            isLoaded: true, 
            isLoading: false,
            error: 'No daily metrics record found'
          }));
        } else {
          console.error('Error loading database targets:', error);
          setDbTargets(prev => ({ 
            ...prev, 
            isLoading: false,
            error: `Database error: ${error.message}`
          }));
        }
        return;
      }

      if (data) {
        setDbTargets({
          steps: data.steps_target,
          waterOz: data.water_oz_target,
          sleepHr: data.sleep_hr_target,
          isLoaded: true,
          isLoading: false,
          error: null,
        });
        console.log('Database targets loaded:', data);
      }
    } catch (error) {
      console.error('Failed to load database targets:', error);
      setDbTargets(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Failed to connect to database'
      }));
    }
  };

  useEffect(() => {
    loadDatabaseTargets();
  }, [user]);

  return {
    ...dbTargets,
    refresh: loadDatabaseTargets,
  };
};
