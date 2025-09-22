// TriHabit TypeScript Types
// Based on PRD data model and requirements

export interface User {
  id: string;
  created_at: string;
  tz: string;
  display_name?: string;
}

export interface DailyMetrics {
  user_id: string;
  date: string; // YYYY-MM-DD format
  steps_actual: number;
  steps_target: number;
  water_oz_actual: number;
  water_oz_target: number;
  sleep_hr_actual: number;
  sleep_hr_target: number;
  life_score: number;
  finalized: boolean;
}

export interface HydrationLog {
  user_id: string;
  ts: string; // ISO timestamp
  amount_oz: number;
  source: 'manual' | 'healthkit' | 'googlefit';
}

export interface SleepSession {
  user_id: string;
  start_ts: string; // ISO timestamp
  end_ts: string; // ISO timestamp
  source: 'manual' | 'healthkit' | 'googlefit';
}

export interface PedometerSnapshot {
  user_id: string;
  ts: string; // ISO timestamp
  steps_cumulative: number;
  source: 'pedometer' | 'healthkit' | 'googlefit';
}

export interface RewardsLedger {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD format
  type: 'steps' | 'hydration' | 'sleep' | 'daily_bonus' | 'streak';
  points: number;
  meta?: Record<string, any>;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required?: number;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  earned_at: string; // ISO timestamp
}

export interface DeviceConnection {
  user_id: string;
  platform: 'ios' | 'android';
  health_source: 'pedometer' | 'apple_health' | 'google_fit';
  last_sync_at?: string; // ISO timestamp
}

// UI State Types
export interface AppState {
  user: User | null;
  dailyMetrics: DailyMetrics | null;
  targets: {
    steps: number;
    waterOz: number;
    sleepHr: number;
  };
  currentState: {
    steps: number;
    waterOz: number;
    sleepHr: number;
  };
  isLoading: boolean;
  error: string | null;
}

// Health Integration Types
export interface HealthPermissions {
  motion: boolean;
  healthKit: boolean;
  googleFit: boolean;
}

// Rewards Configuration (from PRD)
export interface RewardsConfig {
  points: {
    steps: { max: number; cutoffHour: number };
    hydration: { max: number; cutoffHour: number };
    sleep: { tiers: Array<[number, number, number]> }; // [min%, max%, points]
    dailyCompletionBonus: number;
  };
  streaks: {
    threshold: number; // 0.5 = 50% minimum to maintain streak
    bonuses: Record<string, number>; // { "3": 10, "7": 30, "14": 60 }
  };
}

// Coach/AI Types
export interface NextBestAction {
  key: 'Steps' | 'Hydration' | 'Sleep';
  pct: number;
  tip: string;
  priority: number;
}

// Component Props Types
export interface TriRingsProps {
  stepsPct: number;
  waterPct: number;
  sleepPct: number;
}

export interface KPICardProps {
  title: string;
  value: string;
  sub: string;
  percent: number;
  onAdd?: () => void;
  addLabel?: string;
  onLog?: () => void;
}

export interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning';
}

export interface BarProps {
  percent: number;
  color?: string;
}

// Export wellbeing types
export * from './wellbeing';
