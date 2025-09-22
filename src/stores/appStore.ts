// TriHabit App Store using Zustand
// Manages global app state including user data, metrics, and UI state

import { create } from 'zustand';
import { AppState, DailyMetrics, User, HydrationLog } from '../types';
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

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  initializeTargets: (profile) => {
    const targets = generateTargets(profile);
    set({ targets });
  },

  reset: () => set(initialState),
}));

// Selectors for computed values
export const useLifeScore = () => {
  const { currentState, targets } = useAppStore();
  const stepsPct = currentState.steps / targets.steps;
  const waterPct = currentState.waterOz / targets.waterOz;
  const sleepPct = currentState.sleepHr / targets.sleepHr;
  
  // Import computeLifeScore here to avoid circular dependency
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
  const s = clamp01(stepsPct);
  const w = clamp01(waterPct);
  const sl = clamp01(sleepPct);
  const score = s * 0.33 + w * 0.34 + sl * 0.33;
  
  return {
    score: Math.round(score * 100),
    stepsPct,
    waterPct,
    sleepPct,
  };
};

export const useNextBestAction = () => {
  const { score, stepsPct, waterPct, sleepPct } = useLifeScore();
  
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
  ];

  return actions.sort((a, b) => a.pct - b.pct)[0];
};
