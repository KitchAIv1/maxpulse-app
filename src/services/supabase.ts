// TriHabit Supabase Service
// Handles all backend interactions with Supabase

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { 
  User, 
  DailyMetrics, 
  HydrationLog, 
  SleepSession, 
  PedometerSnapshot,
  RewardsLedger,
  Badge,
  UserBadge,
  DeviceConnection 
} from '../types';

// Supabase configuration
// Note: These should be environment variables in production
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Custom storage adapter for Expo SecureStore
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth functions
export const authService = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },
};

// Daily metrics functions
export const metricsService = {
  async getTodayMetrics(userId: string, date: string): Promise<DailyMetrics | null> {
    const { data, error } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching daily metrics:', error);
      return null;
    }

    return data;
  },

  async upsertDailyMetrics(metrics: Partial<DailyMetrics>) {
    const { data, error } = await supabase
      .from('daily_metrics')
      .upsert(metrics, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting daily metrics:', error);
      throw error;
    }

    return data;
  },

  async getMetricsHistory(userId: string, days: number = 7) {
    const { data, error } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(days);

    if (error) {
      console.error('Error fetching metrics history:', error);
      throw error;
    }

    return data;
  },
};

// Hydration functions
export const hydrationService = {
  async logHydration(log: Omit<HydrationLog, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('hydration_logs')
      .insert({
        ...log,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging hydration:', error);
      throw error;
    }

    return data;
  },

  async getTodayHydration(userId: string, date: string) {
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data, error } = await supabase
      .from('hydration_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('ts', startOfDay)
      .lte('ts', endOfDay)
      .order('ts', { ascending: true });

    if (error) {
      console.error('Error fetching hydration logs:', error);
      throw error;
    }

    return data;
  },
};

// Sleep functions
export const sleepService = {
  async logSleep(session: Omit<SleepSession, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('sleep_sessions')
      .insert({
        ...session,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging sleep:', error);
      throw error;
    }

    return data;
  },

  async getLastNightSleep(userId: string) {
    // Get sleep session from yesterday evening to this morning
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(18, 0, 0, 0); // Start from 6 PM yesterday

    const { data, error } = await supabase
      .from('sleep_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_ts', yesterday.toISOString())
      .lte('end_ts', now.toISOString())
      .order('start_ts', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching sleep data:', error);
      throw error;
    }

    return data?.[0] || null;
  },
};

// Pedometer functions
export const pedometerService = {
  async logSteps(snapshot: Omit<PedometerSnapshot, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('pedometer_snapshots')
      .insert({
        ...snapshot,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging steps:', error);
      throw error;
    }

    return data;
  },
};

// Rewards functions
export const rewardsService = {
  async getUserPoints(userId: string) {
    const { data, error } = await supabase
      .from('rewards_ledger')
      .select('points')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user points:', error);
      throw error;
    }

    const totalPoints = data.reduce((sum, entry) => sum + entry.points, 0);
    return totalPoints;
  },

  async getTodayPoints(userId: string, date: string) {
    const { data, error } = await supabase
      .from('rewards_ledger')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date);

    if (error) {
      console.error('Error fetching today points:', error);
      throw error;
    }

    return data;
  },

  async getUserBadges(userId: string) {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges (*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user badges:', error);
      throw error;
    }

    return data;
  },
};

// Device connection functions
export const deviceService = {
  async updateConnection(connection: Omit<DeviceConnection, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('device_connections')
      .upsert({
        ...connection,
        user_id: user.id,
        last_sync_at: new Date().toISOString(),
      }, { onConflict: 'user_id,platform,health_source' })
      .select()
      .single();

    if (error) {
      console.error('Error updating device connection:', error);
      throw error;
    }

    return data;
  },

  async getConnections(userId: string) {
    const { data, error } = await supabase
      .from('device_connections')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching device connections:', error);
      throw error;
    }

    return data;
  },
};
