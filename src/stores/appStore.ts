// TriHabit App Store using Zustand
// Manages global app state including user data, metrics, and UI state

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, DailyMetrics, User, MoodCheckIn } from '../types';
import { generateTargets, getTodayDate } from '../utils';
import AppStoreActions from '../services/AppStoreActions';
import HealthDataService from '../services/HealthDataService';
import { dateMetricsCache } from '../utils/dateMetricsCache';

interface AppStore extends AppState {
  // Date navigation state
  selectedDate: string; // YYYY-MM-DD format
  isViewingPastDate: boolean;
  todayStateCache: {
    currentState: AppState['currentState'];
    targets: AppState['targets'];
    moodCheckInFrequency: AppState['moodCheckInFrequency'];
  } | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setDailyMetrics: (metrics: DailyMetrics | null) => void;
  updateCurrentState: (updates: Partial<AppState['currentState']>) => void;
  addHydration: (amount: number) => Promise<void>;
  updateSteps: (steps: number) => Promise<void>;
  updateSleep: (hours: number) => Promise<void>;
  addMoodCheckIn: (checkIn: Omit<MoodCheckIn, 'id' | 'user_id' | 'timestamp'>) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeTargets: (customTargets?: any) => Promise<void>;
  loadTodayData: () => Promise<void>;
  
  // Date navigation actions
  setSelectedDate: (date: string) => Promise<void>;
  loadDateMetrics: (date: string) => Promise<void>;
  
  reset: () => void;
}

const initialState: AppState = {
  user: null,
  dailyMetrics: null,
  targets: {
    steps: 0, // Will be set by V2 Engine
    waterOz: 0, // Will be set by V2 Engine
    sleepHr: 0, // Will be set by V2 Engine
  },
  currentState: {
    steps: 0, // Will be updated by step tracking service
    waterOz: 0, // Starts at 0, increments with user actions
    sleepHr: 0, // Starts at 0, updated by user
  },
  moodCheckInFrequency: {
    total_checkins: 0, // Starts at 0, increments with check-ins
    target_checkins: 7, // Target: daily check-ins (7 per week)
    current_streak: 0,
    last_checkin: null,
  },
  isLoading: false,
  error: null,
};

// Request deduplication map to prevent concurrent DB queries for same date
const pendingRequests = new Map<string, Promise<void>>();

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,
  selectedDate: getTodayDate(),
  isViewingPastDate: false,
  todayStateCache: null,

  setUser: (user) => set({ user }),

  setDailyMetrics: (dailyMetrics) => {
    set({ dailyMetrics });
    
    // Update current state from daily metrics if available
    if (dailyMetrics) {
      set({
        currentState: {
          steps: dailyMetrics.steps_actual,
          waterOz: dailyMetrics.water_oz_actual,
          sleepHr: dailyMetrics.sleep_hr_actual,
        },
        targets: {
          steps: dailyMetrics.steps_target,
          waterOz: dailyMetrics.water_oz_target,
          sleepHr: dailyMetrics.sleep_hr_target,
        },
        moodCheckInFrequency: {
          total_checkins: dailyMetrics.mood_checkins_actual,
          target_checkins: dailyMetrics.mood_checkins_target,
          current_streak: 0, // Would be calculated from historical data
          last_checkin: null, // Would be fetched from backend
        },
      });
    }
  },

  loadTodayData: async () => {
    const { user } = get();
    if (!user) return;

    // First, try to restore today's persisted state from AsyncStorage
    const today = getTodayDate();
    if (__DEV__) console.log(`🔍 Looking for AsyncStorage key: @todayState_${today}`);
    let hasPersistedState = false;
    try {
      const persistedState = await AsyncStorage.getItem(`@todayState_${today}`);
      if (__DEV__) console.log('📱 AsyncStorage raw value:', persistedState ? persistedState.substring(0, 100) + '...' : 'NULL');
      
      if (persistedState) {
        const state = JSON.parse(persistedState);
        if (__DEV__) console.log('✅ Restored today\'s persisted state:', state);
        set({
          currentState: {
            steps: state.steps || 0,
            waterOz: state.waterOz || 0,
            sleepHr: state.sleepHr || 0,
          },
          moodCheckInFrequency: state.moodCheckInFrequency || {
            total_checkins: 0,
            target_checkins: 7,
            current_streak: 0,
            last_checkin: null,
          }
        });
        hasPersistedState = true;
      } else {
        if (__DEV__) console.log('⚠️ No persisted state found in AsyncStorage for today');
      }
    } catch (error) {
      console.warn('Failed to restore today state:', error);
    }

    // Load data in background WITHOUT overriding currentState if we have persisted data
    try {
      await AppStoreActions.loadTodayData(
        user.id,
        (dailyMetrics) => {
          // Only update targets and dailyMetrics from DB
          if (dailyMetrics) {
            if (hasPersistedState) {
              // Keep currentState AND moodCheckInFrequency from AsyncStorage, only update targets and dailyMetrics
              set({
                dailyMetrics,
                targets: {
                  steps: dailyMetrics.steps_target,
                  waterOz: dailyMetrics.water_oz_target,
                  sleepHr: dailyMetrics.sleep_hr_target,
                },
                // Don't override currentState or moodCheckInFrequency - they were restored from AsyncStorage
              });
            } else {
              // No persisted state, use DB data for everything
              get().setDailyMetrics(dailyMetrics);
            }
          } else {
            // No DB data yet - this is fine for first run or offline mode
            if (__DEV__) console.log('No DB metrics found - using current state (AsyncStorage or zeros)');
          }
        },
        () => {}, // Don't show loading spinner for background sync
        (error) => {
          // Only warn in dev mode - missing DB data is normal on first run
          if (__DEV__) console.warn('Failed to load today data:', error);
        }
      );
    } catch (error) {
      if (__DEV__) console.warn('Background data load failed:', error);
      // Don't break the app - UI will work with current state
    }
  },

  updateCurrentState: (updates) =>
    set((state) => ({
      currentState: { ...state.currentState, ...updates },
    })),

  addHydration: async (amount) => {
    const { user, currentState } = get();
    
    // Always update UI immediately (optimistic update)
    const newWaterOz = currentState.waterOz + amount;
    set((state) => ({
      currentState: {
        ...state.currentState,
        waterOz: newWaterOz,
      },
    }));

    // Persist today's state to AsyncStorage for reload persistence
    const today = getTodayDate();
    try {
      const stateToSave = {
        steps: get().currentState.steps,
        waterOz: newWaterOz,
        sleepHr: get().currentState.sleepHr,
        moodCheckInFrequency: get().moodCheckInFrequency,
      };
      await AsyncStorage.setItem(`@todayState_${today}`, JSON.stringify(stateToSave));
      if (__DEV__) console.log('💾 Saved to AsyncStorage:', stateToSave);
    } catch (error) {
      console.warn('Failed to persist today state:', error);
    }

    // Invalidate today's cache since data changed
    dateMetricsCache.invalidate(today);

    // Try database sync in background if user is authenticated
    if (user) {
      try {
        await AppStoreActions.addHydration(
          user.id,
          amount,
          currentState.waterOz,
          () => {}, // Don't update UI again, already done optimistically
          (error) => console.warn('Database sync failed:', error) // Don't break UI on DB errors
        );
      } catch (error) {
        console.warn('Failed to sync hydration to database:', error);
        // Don't revert UI - keep the optimistic update
      }
    }
  },

  updateSteps: async (steps) => {
    set((state) => ({
      currentState: { ...state.currentState, steps },
    }));

    // DON'T persist to AsyncStorage here!
    // Steps are updated automatically by pedometer, not user action
    // Persisting here causes race condition that overwrites water/sleep with zeros
    // Water and sleep should only be persisted when user manually tracks them
  },

  updateSleep: async (hours) => {
    const { user } = get();
    
    // Always update UI immediately (optimistic update)
    set((state) => ({
      currentState: { ...state.currentState, sleepHr: hours },
    }));

    // Persist today's state to AsyncStorage for reload persistence
    const today = getTodayDate();
    try {
      const stateToSave = {
        steps: get().currentState.steps,
        waterOz: get().currentState.waterOz,
        sleepHr: hours,
        moodCheckInFrequency: get().moodCheckInFrequency,
      };
      await AsyncStorage.setItem(`@todayState_${today}`, JSON.stringify(stateToSave));
      if (__DEV__) console.log('💾 Saved to AsyncStorage:', stateToSave);
    } catch (error) {
      console.warn('Failed to persist today state:', error);
    }

    // Invalidate today's cache since data changed
    dateMetricsCache.invalidate(today);

    // Try database sync in background if user is authenticated
    if (user) {
      try {
        await AppStoreActions.updateSleep(
          user.id,
          hours,
          () => {}, // Don't update UI again, already done optimistically
          (error) => console.warn('Database sync failed:', error) // Don't break UI on DB errors
        );
      } catch (error) {
        console.warn('Failed to sync sleep to database:', error);
        // Don't revert UI - keep the optimistic update
      }
    }
  },

  addMoodCheckIn: async (checkIn) => {
    const { user } = get();
    
    // Always update UI immediately (optimistic update)
    const now = new Date().toISOString();
    set((state) => ({
      moodCheckInFrequency: {
        ...state.moodCheckInFrequency,
        total_checkins: state.moodCheckInFrequency.total_checkins + 1,
        last_checkin: now,
        current_streak: state.moodCheckInFrequency.current_streak + 1,
      },
    }));

    // Persist today's state to AsyncStorage for reload persistence
    const today = getTodayDate();
    try {
      await AsyncStorage.setItem(`@todayState_${today}`, JSON.stringify({
        steps: get().currentState.steps,
        waterOz: get().currentState.waterOz,
        sleepHr: get().currentState.sleepHr,
        moodCheckInFrequency: get().moodCheckInFrequency,
      }));
    } catch (error) {
      console.warn('Failed to persist today state:', error);
    }

    // Try database sync in background if user is authenticated
    if (user) {
      try {
        await AppStoreActions.addMoodCheckIn(
          user.id,
          checkIn,
          () => {}, // Don't update UI again, already done optimistically
          (error) => console.warn('Database sync failed:', error) // Don't break UI on DB errors
        );
      } catch (error) {
        console.warn('Failed to sync mood check-in to database:', error);
        // Don't revert UI - keep the optimistic update
      }
    }
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  initializeTargets: async (customTargets) => {
    // Always set targets immediately for UI (V2 Engine has priority)
    const targets = customTargets || generateTargets();
    set({ targets });

    // Sync step target with step tracking store
    try {
      const { useStepTrackingStore } = await import('./stepTrackingStore');
      const stepStore = useStepTrackingStore.getState();
      if (stepStore.updateTarget) {
        stepStore.updateTarget(targets.steps);
      }
    } catch (error) {
      console.warn('Failed to sync step target:', error);
    }

    // Skip database sync for now - V2 Engine is the source of truth
    console.log('✅ Targets set to:', targets);
  },

  setSelectedDate: async (date: string) => {
    const today = getTodayDate();
    const isViewingPast = date !== today;
    const currentState = get();
    
    // Prevent unnecessary re-execution ONLY if we're already on this date AND the data is loaded
    // This allows restoration to happen when returning from a past date
    if (currentState.selectedDate === date && 
        currentState.isViewingPastDate === isViewingPast &&
        (isViewingPast || currentState.currentState.waterOz > 0 || currentState.currentState.sleepHr > 0)) {
      if (__DEV__) console.log(`Already viewing ${date} with data loaded, skipping...`);
      return;
    }
    
    // Validate date is within range (past 3 weeks)
    const healthService = HealthDataService.getInstance();
    if (!healthService.isDateInValidRange(date)) {
      console.warn('Date is outside valid range (past 3 weeks):', date);
      return;
    }
    
    // If switching FROM today TO a past date, cache today's state
    if (!currentState.isViewingPastDate && isViewingPast) {
      if (__DEV__) console.log('📦 Caching today\'s state before viewing past date');
      set({
        todayStateCache: {
          currentState: { ...currentState.currentState },
          targets: { ...currentState.targets },
          moodCheckInFrequency: { ...currentState.moodCheckInFrequency },
        }
      });
    }
    
    // Update selected date and viewing state FIRST
    set({ 
      selectedDate: date,
      isViewingPastDate: isViewingPast
    });
    
    // Persist to AsyncStorage
    try {
      await AsyncStorage.setItem('@selectedDate', date);
    } catch (error) {
      console.warn('Failed to persist selected date:', error);
    }
    
    // Load data based on date
    if (isViewingPast) {
      // Viewing a past date - load from database
      await get().loadDateMetrics(date);
    } else {
      // Returning to today - restore from AsyncStorage (source of truth!)
      const cache = get().todayStateCache;
      if (cache) {
        if (__DEV__) console.log('📤 Restoring today\'s state from AsyncStorage');
        
        // Restore from AsyncStorage, NOT from in-memory cache (which might be stale)
        try {
          const persistedState = await AsyncStorage.getItem(`@todayState_${date}`);
          if (persistedState) {
            const state = JSON.parse(persistedState);
            if (__DEV__) console.log('✅ Restored from AsyncStorage:', state);
            set({
              currentState: {
                steps: state.steps || 0,
                waterOz: state.waterOz || 0,
                sleepHr: state.sleepHr || 0,
              },
              moodCheckInFrequency: state.moodCheckInFrequency || cache.moodCheckInFrequency,
              targets: cache.targets, // Keep targets from cache
              todayStateCache: null, // Clear cache after restoring
            });
          } else {
            // No AsyncStorage data, use cache as fallback
            if (__DEV__) console.log('⚠️ No AsyncStorage data, using cached state');
            set({
              currentState: cache.currentState,
              targets: cache.targets,
              moodCheckInFrequency: cache.moodCheckInFrequency,
              todayStateCache: null,
            });
          }
        } catch (error) {
          console.warn('Failed to restore from AsyncStorage:', error);
          // Fallback to cache
          set({
            currentState: cache.currentState,
            targets: cache.targets,
            moodCheckInFrequency: cache.moodCheckInFrequency,
            todayStateCache: null,
          });
        }
      } else {
        if (__DEV__) console.log('⚠️ No cached state found - keeping current state');
      }
    }
  },

  loadDateMetrics: async (date: string) => {
    const { user } = get();
    if (!user) {
      console.warn('No user authenticated, cannot load date metrics');
      return;
    }
    
    // Check if there's already a pending request for this date (deduplication)
    const existingRequest = pendingRequests.get(date);
    if (existingRequest) {
      console.log(`⏳ Request for ${date} already in progress, waiting...`);
      return existingRequest;
    }
    
    // Check cache first
    const cachedMetrics = dateMetricsCache.get(date);
    if (cachedMetrics !== undefined) {
      console.log(`✨ Cache hit for ${date}`);
      const metrics = cachedMetrics;
      
      if (metrics) {
        set({
          dailyMetrics: metrics,
          currentState: {
            steps: metrics.steps_actual,
            waterOz: metrics.water_oz_actual,
            sleepHr: metrics.sleep_hr_actual,
          },
          targets: {
            steps: metrics.steps_target,
            waterOz: metrics.water_oz_target,
            sleepHr: metrics.sleep_hr_target,
          },
          moodCheckInFrequency: {
            total_checkins: metrics.mood_checkins_actual,
            target_checkins: metrics.mood_checkins_target,
            current_streak: 0,
            last_checkin: null,
          },
        });
      } else {
        const currentTargets = get().targets;
        set({
          dailyMetrics: null,
          currentState: { steps: 0, waterOz: 0, sleepHr: 0 },
          moodCheckInFrequency: {
            total_checkins: 0,
            target_checkins: 7,
            current_streak: 0,
            last_checkin: null,
          },
          targets: currentTargets.steps > 0 ? currentTargets : {
            steps: 10000,
            waterOz: 64,
            sleepHr: 8,
          }
        });
      }
      return;
    }
    
    // Cache miss - fetch from database
    set({ isLoading: true, error: null });
    
    const requestPromise = (async () => {
      try {
        const healthService = HealthDataService.getInstance();
        const metrics = await healthService.getMetricsByDate(user.id, date);
        
        // Store in cache
        dateMetricsCache.set(date, metrics);
        
        if (metrics) {
          // Update state with fetched metrics
          if (__DEV__) {
            console.log(`📊 Loaded metrics for ${date}:`, {
              steps: `${metrics.steps_actual}/${metrics.steps_target}`,
              water: `${metrics.water_oz_actual}/${metrics.water_oz_target}`,
              sleep: `${metrics.sleep_hr_actual}/${metrics.sleep_hr_target}`,
              mood: `${metrics.mood_checkins_actual}/${metrics.mood_checkins_target}`
            });
          }
          
          set({
            dailyMetrics: metrics,
            currentState: {
              steps: metrics.steps_actual,
              waterOz: metrics.water_oz_actual,
              sleepHr: metrics.sleep_hr_actual,
            },
            targets: {
              steps: metrics.steps_target,
              waterOz: metrics.water_oz_target,
              sleepHr: metrics.sleep_hr_target,
            },
            moodCheckInFrequency: {
              total_checkins: metrics.mood_checkins_actual,
              target_checkins: metrics.mood_checkins_target,
              current_streak: 0,
              last_checkin: null,
            },
          });
        } else {
          // No data for this date - show zeros but keep targets
          const currentTargets = get().targets;
          set({
            dailyMetrics: null,
            currentState: { steps: 0, waterOz: 0, sleepHr: 0 },
            moodCheckInFrequency: {
              total_checkins: 0,
              target_checkins: 7,
              current_streak: 0,
              last_checkin: null,
            },
            targets: currentTargets.steps > 0 ? currentTargets : {
              steps: 10000,
              waterOz: 64,
              sleepHr: 8,
            }
          });
        }
      } catch (error) {
        console.error('Failed to load date metrics:', error);
        set({ error: 'Failed to load data for selected date' });
      } finally {
        set({ isLoading: false });
        pendingRequests.delete(date);
      }
    })();
    
    pendingRequests.set(date, requestPromise);
    return requestPromise;
  },

  reset: () => set({ ...initialState, selectedDate: getTodayDate(), isViewingPastDate: false }),
}));
