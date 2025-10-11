// TriHabit App Store using Zustand
// Manages global app state including user data, metrics, and UI state

import { create } from 'zustand';
import { AppState, DailyMetrics, User, HydrationLog, MoodCheckIn, MoodCheckInFrequency } from '../types';
import { generateTargets, getTodayDate } from '../utils';
import { useStepTrackingStore } from './stepTrackingStore';

interface AppStore extends AppState {
  // Actions
  setUser: (user: User | null) => void;
  setDailyMetrics: (metrics: DailyMetrics | null) => void;
  updateCurrentState: (updates: Partial<AppState['currentState']>) => void;
  addHydration: (amount: number) => void;
  updateSteps: (steps: number) => void;
  updateSleep: (hours: number) => void;
  addMoodCheckIn: (checkIn: Omit<MoodCheckIn, 'id' | 'user_id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeTargets: (profile?: any) => void;
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
    steps: 4200, // Mock data for demo
    waterOz: 48,
    sleepHr: 6.5,
  },
  moodCheckInFrequency: {
    total_checkins: 5, // Mock: 5 check-ins this week
    target_checkins: 7, // Target: daily check-ins (7 per week)
    current_streak: 3,
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

  updateCurrentState: (updates) =>
    set((state) => ({
      currentState: { ...state.currentState, ...updates },
    })),

  addHydration: (amount) =>
    set((state) => ({
      currentState: {
        ...state.currentState,
        waterOz: state.currentState.waterOz + amount,
      },
    })),

  updateSteps: (steps) => {
    set((state) => ({
      currentState: { ...state.currentState, steps },
    }));
  },

  updateSleep: (hours) =>
    set((state) => ({
      currentState: { ...state.currentState, sleepHr: hours },
    })),

  addMoodCheckIn: (checkIn) =>
    set((state) => {
      const now = new Date().toISOString();
      const newFrequency = {
        ...state.moodCheckInFrequency,
        total_checkins: state.moodCheckInFrequency.total_checkins + 1,
        last_checkin: now,
        current_streak: state.moodCheckInFrequency.current_streak + 1, // Simplified - would need proper streak calculation
      };
      
      // In a real app, would also save the check-in to backend
      return {
        moodCheckInFrequency: newFrequency,
      };
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  initializeTargets: (customTargets) => {
    // If custom targets are provided (from activation code), use them
    // Otherwise generate default targets
    const targets = customTargets || generateTargets();
    set({ targets });
  },

  reset: () => set(initialState),
}));

// Selectors for computed values
export const useLifeScore = () => {
  const { currentState, targets, moodCheckInFrequency } = useAppStore();
  const stepsPct = currentState.steps / targets.steps;
  const waterPct = currentState.waterOz / targets.waterOz;
  const sleepPct = currentState.sleepHr / targets.sleepHr;
  const moodCheckInPct = moodCheckInFrequency.total_checkins / moodCheckInFrequency.target_checkins;
  
  // Import computeLifeScore here to avoid circular dependency
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
  const s = clamp01(stepsPct);
  const w = clamp01(waterPct);
  const sl = clamp01(sleepPct);
  const m = clamp01(moodCheckInPct);
  const score = s * 0.25 + w * 0.25 + sl * 0.25 + m * 0.25;
  
  return {
    score: Math.round(score * 100),
    stepsPct,
    waterPct,
    sleepPct,
    moodCheckInPct,
  };
};

export const useNextBestAction = () => {
  const { score, stepsPct, waterPct, sleepPct, moodCheckInPct } = useLifeScore();
  
  const actions = [
    {
      key: 'Steps' as const,
      pct: stepsPct,
      tip: 'Take a 10‑min brisk walk (~1k steps).',
    },
    {
      key: 'Hydration' as const,
      pct: waterPct,
      tip: 'Drink a glass of water now (8oz).',
    },
    {
      key: 'Sleep' as const,
      pct: sleepPct,
      tip: 'Plan a wind‑down alarm 30 min earlier tonight.',
    },
    {
      key: 'Mood Check-In' as const,
      pct: moodCheckInPct,
      tip: 'Take a moment to reflect on your emotional state.',
    },
  ];

  return actions.sort((a, b) => a.pct - b.pct)[0];
};
