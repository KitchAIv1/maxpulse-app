// TriHabit App Store using Zustand
// Manages global app state including user data, metrics, and UI state

import { create } from 'zustand';
import { AppState, DailyMetrics, User, MoodCheckIn } from '../types';
import { generateTargets } from '../utils';
import AppStoreActions from '../services/AppStoreActions';

interface AppStore extends AppState {
  // Actions
  setUser: (user: User | null) => void;
  setDailyMetrics: (metrics: DailyMetrics | null) => void;
  updateCurrentState: (updates: Partial<AppState['currentState']>) => void;
  addHydration: (amount: number) => Promise<void>;
  updateSteps: (steps: number) => void;
  updateSleep: (hours: number) => Promise<void>;
  addMoodCheckIn: (checkIn: Omit<MoodCheckIn, 'id' | 'user_id' | 'timestamp'>) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeTargets: (customTargets?: any) => Promise<void>;
  loadTodayData: () => Promise<void>;
  reset: () => void;
}

const initialState: AppState = {
  user: null,
  dailyMetrics: null,
  targets: {
    steps: 10000, // Will be overridden by personalized targets
    waterOz: 95,  // Will be overridden by personalized targets
    sleepHr: 8,   // Will be overridden by personalized targets
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

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

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

    // Load data in background without blocking UI
    try {
      await AppStoreActions.loadTodayData(
        user.id,
        get().setDailyMetrics,
        () => {}, // Don't show loading spinner for background sync
        (error) => console.warn('Failed to load today data:', error) // Don't break UI
      );
    } catch (error) {
      console.warn('Background data load failed:', error);
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
    set((state) => ({
      currentState: {
        ...state.currentState,
        waterOz: state.currentState.waterOz + amount,
      },
    }));

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

  updateSteps: (steps) => {
    set((state) => ({
      currentState: { ...state.currentState, steps },
    }));
  },

  updateSleep: async (hours) => {
    const { user } = get();
    
    // Always update UI immediately (optimistic update)
    set((state) => ({
      currentState: { ...state.currentState, sleepHr: hours },
    }));

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
    // Always set targets immediately for UI
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

    // Skip database sync for now - personalized targets are the source of truth
    console.log('✅ Targets set to:', targets);
  },

  reset: () => set(initialState),
}));
