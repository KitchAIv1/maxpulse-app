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
    steps: 8000,
    waterOz: 80,
    sleepHr: 8,
  },
  currentState: {
    steps: 0, // Will be loaded from database
    waterOz: 0,
    sleepHr: 0,
  },
  moodCheckInFrequency: {
    total_checkins: 0, // Will be calculated from database
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

    await AppStoreActions.loadTodayData(
      user.id,
      get().setDailyMetrics,
      (loading) => set({ isLoading: loading }),
      (error) => set({ error })
    );
  },

  updateCurrentState: (updates) =>
    set((state) => ({
      currentState: { ...state.currentState, ...updates },
    })),

  addHydration: async (amount) => {
    const { user, currentState } = get();
    if (!user) return;

    await AppStoreActions.addHydration(
      user.id,
      amount,
      currentState.waterOz,
      (updates) => set((state) => ({ ...state, ...updates })),
      (error) => set({ error })
    );
  },

  updateSteps: (steps) => {
    set((state) => ({
      currentState: { ...state.currentState, steps },
    }));
  },

  updateSleep: async (hours) => {
    const { user } = get();
    if (!user) return;

    await AppStoreActions.updateSleep(
      user.id,
      hours,
      (updates) => set((state) => ({ ...state, ...updates })),
      (error) => set({ error })
    );
  },

  addMoodCheckIn: async (checkIn) => {
    const { user } = get();
    if (!user) return;

    await AppStoreActions.addMoodCheckIn(
      user.id,
      checkIn,
      (updates) => set((state) => ({
        moodCheckInFrequency: { ...state.moodCheckInFrequency, ...updates }
      })),
      (error) => set({ error })
    );
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  initializeTargets: async (customTargets) => {
    const { user } = get();
    
    await AppStoreActions.initializeTargets(
      user?.id || '',
      (targets) => set({ targets }),
      (error) => set({ error }),
      customTargets
    );
  },

  reset: () => set(initialState),
}));
