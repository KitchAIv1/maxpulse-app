// TriHabit Supabase Service
// Handles all backend interactions with Supabase

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  DailyMetrics, 
  HydrationLog, 
  SleepSession, 
  PedometerSnapshot,
  RewardsLedger,
  Badge,
  UserBadge,
  DeviceConnection,
  ActivationCode,
  ActivationCodeValidationResult,
  ActivationCodeConsumptionResult,
  UserProfileFromActivation,
  DynamicTargets,
  PlanProgress
} from '../types';

// SecureStore has a 2048 byte limit - use chunking for large values
const SECURE_STORE_MAX_SIZE = 2048;
const CHUNK_PREFIX = 'chunk_';
const CHUNK_COUNT_KEY = 'chunk_count_';

/**
 * Secure storage adapter that handles values >2048 bytes by chunking
 * Falls back to AsyncStorage for very large values if chunking fails
 */
const createSecureStorageAdapter = () => {
  const getItem = async (key: string): Promise<string | null> => {
    try {
      // Try SecureStore first
      const value = await SecureStore.getItemAsync(key);
      if (value !== null) {
        return value;
      }

      // Check if it's chunked
      const chunkCountStr = await SecureStore.getItemAsync(`${CHUNK_COUNT_KEY}${key}`);
      if (chunkCountStr) {
        const chunkCount = parseInt(chunkCountStr, 10);
        const chunks: string[] = [];
        let allChunksFound = true;

        for (let i = 0; i < chunkCount; i++) {
          const chunk = await SecureStore.getItemAsync(`${CHUNK_PREFIX}${key}_${i}`);
          if (chunk === null) {
            allChunksFound = false;
            break;
          }
          chunks.push(chunk);
        }

        if (allChunksFound && chunks.length > 0) {
          return chunks.join('');
        }
      }

      // Fallback to AsyncStorage for large values
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get item from SecureStore (${key}), falling back to AsyncStorage:`, error);
      try {
        return await AsyncStorage.getItem(key);
      } catch (fallbackError) {
        console.error(`Failed to get item from AsyncStorage (${key}):`, fallbackError);
        return null;
      }
    }
  };

  const removeItem = async (key: string): Promise<void> => {
    try {
      // Remove from SecureStore
      await SecureStore.deleteItemAsync(key);
      
      // Remove chunks if they exist
      const chunkCountStr = await SecureStore.getItemAsync(`${CHUNK_COUNT_KEY}${key}`);
      if (chunkCountStr) {
        const chunkCount = parseInt(chunkCountStr, 10);
        for (let i = 0; i < chunkCount; i++) {
          await SecureStore.deleteItemAsync(`${CHUNK_PREFIX}${key}_${i}`);
        }
        await SecureStore.deleteItemAsync(`${CHUNK_COUNT_KEY}${key}`);
      }
    } catch (error) {
      console.warn(`Failed to remove item from SecureStore (${key}):`, error);
    }
    
    // Also remove from AsyncStorage
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove item from AsyncStorage (${key}):`, error);
    }
  };

  const setItem = async (key: string, value: string): Promise<void> => {
    try {
      // If value fits in SecureStore, use it directly
      if (value.length <= SECURE_STORE_MAX_SIZE) {
        await SecureStore.setItemAsync(key, value);
        // Clean up any old chunks
        await removeItem(key);
        return;
      }

      // Value is too large - try chunking
      const chunkSize = SECURE_STORE_MAX_SIZE - 100; // Leave buffer for chunk metadata
      const chunks: string[] = [];
      
      for (let i = 0; i < value.length; i += chunkSize) {
        chunks.push(value.slice(i, i + chunkSize));
      }

      // Store chunks
      for (let i = 0; i < chunks.length; i++) {
        await SecureStore.setItemAsync(`${CHUNK_PREFIX}${key}_${i}`, chunks[i]);
      }
      
      // Store chunk count
      await SecureStore.setItemAsync(`${CHUNK_COUNT_KEY}${key}`, chunks.length.toString());
      
      // Also store in AsyncStorage as backup
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set item in SecureStore (${key}), using AsyncStorage fallback:`, error);
      // Fallback to AsyncStorage
      try {
        await AsyncStorage.setItem(key, value);
      } catch (fallbackError) {
        console.error(`Failed to set item in AsyncStorage (${key}):`, fallbackError);
        throw fallbackError;
      }
    }
  };

  return { getItem, setItem, removeItem };
};

// Lazy initialization to prevent module-load crashes
let supabaseClient: SupabaseClient | null = null;
let initializationError: Error | null = null;

/**
 * Get or initialize Supabase client
 * Throws error only when actually used, not at module load time
 */
const getSupabaseClient = (): SupabaseClient => {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (initializationError) {
    throw initializationError;
  }

  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const error = new Error(
      'Missing Supabase environment variables. ' +
      'Please ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in your build configuration.'
    );
    initializationError = error;
    console.error('❌ Supabase initialization failed:', error.message);
    throw error;
  }

  try {
    const storageAdapter = createSecureStorageAdapter();
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: storageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    console.log('✅ Supabase client initialized successfully');
    return supabaseClient;
  } catch (error) {
    initializationError = error instanceof Error ? error : new Error('Failed to initialize Supabase client');
    console.error('❌ Supabase initialization error:', initializationError);
    throw initializationError;
  }
};

// Export supabase client getter (maintains backward compatibility)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
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

// Activation Code Service
export const activationService = {
  /**
   * Validate an activation code - check if it exists, is unused, and not expired
   */
  async validateActivationCode(code: string): Promise<ActivationCodeValidationResult> {
    try {
      const { data, error } = await supabase
        .from('activation_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            isValid: false,
            isExpired: false,
            isUsed: false,
            error: 'Invalid activation code'
          };
        }
        throw error;
      }

      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      const isExpired = now > expiresAt;
      const isUsed = data.status === 'activated' || data.activated_at !== null;

      return {
        isValid: !isExpired && !isUsed,
        isExpired,
        isUsed,
        activationCode: data,
        error: isExpired ? 'Activation code has expired' : 
               isUsed ? 'Activation code has already been used' : undefined
      };
    } catch (error) {
      console.error('Error validating activation code:', error);
      return {
        isValid: false,
        isExpired: false,
        isUsed: false,
        error: 'Failed to validate activation code'
      };
    }
  },

  /**
   * Consume an activation code - mark it as used and associate with user
   */
  async consumeActivationCode(code: string, userId: string): Promise<ActivationCodeConsumptionResult> {
    try {
      // First validate the code
      const validation = await this.validateActivationCode(code);
      if (!validation.isValid || !validation.activationCode) {
        return {
          success: false,
          error: validation.error || 'Invalid activation code'
        };
      }

      // Update the activation code to mark as used
      const { data, error } = await supabase
        .from('activation_codes')
        .update({
          status: 'activated',
          activated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('code', code.toUpperCase())
        .select()
        .single();

      if (error) {
        console.error('Error consuming activation code:', error);
        return {
          success: false,
          error: 'Failed to activate code'
        };
      }

      return {
        success: true,
        activationCode: data
      };
    } catch (error) {
      console.error('Error consuming activation code:', error);
      return {
        success: false,
        error: 'Failed to consume activation code'
      };
    }
  },

  /**
   * Get activation code data for profile setup
   */
  async getActivationCodeData(codeOrId: string): Promise<ActivationCode | null> {
    try {
      // Try to fetch by ID first (if it looks like a UUID), then by code
      let query = supabase.from('activation_codes').select('*');
      
      if (codeOrId.includes('-') && codeOrId.length > 10) {
        // Looks like a UUID (activation_code_id)
        query = query.eq('id', codeOrId);
      } else {
        // Looks like an activation code
        query = query.eq('code', codeOrId.toUpperCase());
      }
      
      const { data, error } = await query.single();

      if (error) {
        console.error('Error fetching activation code data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting activation code data:', error);
      return null;
    }
  },

  /**
   * Extract dynamic targets from activation code onboarding data
   */
  extractDynamicTargets(activationCode: ActivationCode): DynamicTargets {
    try {
      // The data is nested under v2Analysis.personalizedTargets
      const { v2Analysis } = activationCode.onboarding_data || {};
      const personalizedTargets = v2Analysis?.personalizedTargets;
      
      // Provide fallback values if data is missing - use personalized targets
      const defaultTargets = {
        steps: 10000,
        waterOz: 95,
        sleepHr: 8,
      };

      if (!personalizedTargets) {
        console.warn('No personalized targets found in v2Analysis, using defaults');
        return defaultTargets;
      }

      console.log('Found personalized targets:', personalizedTargets);
      
      return {
        steps: personalizedTargets.steps?.targetDaily || defaultTargets.steps,
        waterOz: personalizedTargets.hydration?.targetLiters 
          ? Math.round(personalizedTargets.hydration.targetLiters * 33.814) 
          : defaultTargets.waterOz,
        sleepHr: (personalizedTargets.sleep?.targetMinHours && personalizedTargets.sleep?.targetMaxHours)
          ? (personalizedTargets.sleep.targetMinHours + personalizedTargets.sleep.targetMaxHours) / 2
          : defaultTargets.sleepHr,
      };
    } catch (error) {
      console.error('Error extracting dynamic targets:', error);
      // Return safe defaults - use personalized targets
      return {
        steps: 10000,
        waterOz: 95,
        sleepHr: 8,
      };
    }
  },

  /**
   * Create user profile from activation code data
   */
  createUserProfileFromActivation(activationCode: ActivationCode, userId: string): UserProfileFromActivation {
    try {
      const { demographics, medical, mentalHealth } = activationCode.onboarding_data || {};
      
      // Provide fallback values for missing data
      const safeDemographics = demographics || {
        age: 30,
        gender: 'other',
        heightCm: 170,
        weightKg: 70,
        bmi: 24.2,
      };
      
      const safeMedical = medical || {
        conditions: [],
        allergies: [],
        medications: [],
      };
      
      return {
        email: activationCode.customer_email || '',
        name: activationCode.customer_name || 'User',
        age: safeDemographics.age,
        gender: safeDemographics.gender,
        height_cm: safeDemographics.heightCm,
        weight_kg: safeDemographics.weightKg,
        bmi: safeDemographics.bmi,
        medical_conditions: safeMedical.conditions,
        medical_allergies: safeMedical.allergies,
        medical_medications: safeMedical.medications,
        mental_health_data: mentalHealth || {},
        activation_code_id: activationCode.id,
        distributor_id: activationCode.distributor_id,
        session_id: activationCode.session_id,
        plan_type: activationCode.plan_type,
      };
    } catch (error) {
      console.error('Error creating user profile from activation code:', error);
      // Return minimal profile with safe defaults
      return {
        email: activationCode.customer_email || '',
        name: activationCode.customer_name || 'User',
        age: 30,
        gender: 'other',
        height_cm: 170,
        weight_kg: 70,
        bmi: 24.2,
        medical_conditions: [],
        medical_allergies: [],
        medical_medications: [],
        mental_health_data: {
          energy: 'unknown',
          stress: 'unknown', 
          burnout: 'unknown',
          mindfulness: 'unknown',
          socialSupport: 'unknown'
        },
        activation_code_id: activationCode.id,
        distributor_id: activationCode.distributor_id,
        session_id: activationCode.session_id,
        plan_type: activationCode.plan_type,
      };
    }
  }
};

// Plan Service for 90-day transformation roadmap
export const planService = {
  /**
   * Get current week targets based on user's plan progress
   */
  async getCurrentWeekTargets(userId: string): Promise<DynamicTargets | null> {
    try {
            // Get user's activation code and plan progress
            const { data: userProfile, error: profileError } = await supabase
              .from('app_user_profiles')
        .select('activation_code_id')
        .eq('user_id', userId)
        .single();

      if (profileError || !userProfile?.activation_code_id) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }

      const activationCode = await activationService.getActivationCodeData(userProfile.activation_code_id);
      if (!activationCode) {
        return null;
      }

      // Get plan progress to determine current week
      const { data: progress } = await supabase
        .from('plan_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      const currentWeek = progress?.current_week || 1;
      const currentPhase = Math.ceil(currentWeek / 4); // 4 weeks per phase
      
      // Extract base targets from activation data
      const baseTargets = activationService.extractDynamicTargets(activationCode);
      
      // Apply weekly progression (could be enhanced with more sophisticated logic)
      const weeklyMultiplier = this.getWeeklyProgressionMultiplier(currentWeek, currentPhase);
      
      return {
        steps: Math.round(baseTargets.steps * weeklyMultiplier.steps),
        waterOz: Math.round(baseTargets.waterOz * weeklyMultiplier.hydration),
        sleepHr: Math.round(baseTargets.sleepHr * weeklyMultiplier.sleep * 10) / 10, // Round to 1 decimal
      };
    } catch (error) {
      console.error('Error getting current week targets:', error);
      return null;
    }
  },

  /**
   * Get weekly progression multipliers based on transformation roadmap
   */
  getWeeklyProgressionMultiplier(week: number, phase: number): { steps: number; hydration: number; sleep: number } {
    // Phase 1 (Weeks 1-4): Foundation - gradual increase
    if (phase === 1) {
      const weekInPhase = week;
      return {
        steps: 0.7 + (weekInPhase * 0.075), // 70% to 92.5%
        hydration: 0.5 + (weekInPhase * 0.125), // 50% to 87.5%
        sleep: 0.9 + (weekInPhase * 0.025), // 90% to 100%
      };
    }
    
    // Phase 2 (Weeks 5-8): Movement - maintain and optimize
    if (phase === 2) {
      return {
        steps: 1.0, // Full target
        hydration: 1.0, // Full target
        sleep: 1.0, // Full target
      };
    }
    
    // Phase 3 (Weeks 9-12): Nutrition - maintain excellence
    return {
      steps: 1.0,
      hydration: 1.0,
      sleep: 1.0,
    };
  },

  /**
   * Update user's plan progress
   */
  async updatePlanProgress(userId: string, weeklyData: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('plan_progress')
        .upsert({
          user_id: userId,
          current_week: weeklyData.week,
          current_phase: Math.ceil(weeklyData.week / 4),
          weekly_scores: weeklyData.scores,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error updating plan progress:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating plan progress:', error);
      return false;
    }
  }
};
