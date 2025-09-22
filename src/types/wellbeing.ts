// Wellbeing Dashboard Types
// Types for Life Score breakdown and wellbeing features

export interface LifeScoreBreakdown {
  steps: number; // Percentage (0-1)
  hydration: number; // Percentage (0-1)
  sleep: number; // Percentage (0-1)
  mood?: number; // Percentage (0-1) - Optional for future
  aiEngagement?: number; // Percentage (0-1) - Optional for future
}

export interface DailyLifeScore {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  score: number; // 0-100
  breakdown: LifeScoreBreakdown;
  created_at: string;
}

export interface DailyInsight {
  summary: string;
  reason: string;
  suggestion: string;
  mood: 'positive' | 'neutral' | 'needs-improvement';
}

export interface LifeScoreTrend {
  date: string;
  score: number;
  breakdown: LifeScoreBreakdown;
}

export interface WellbeingMilestone {
  id: string;
  name: string;
  description: string;
  threshold: number; // Score threshold (0-100)
  icon: string;
  color: string;
  achieved: boolean;
  achievedAt?: string;
}

export interface LifeScoreLevel {
  level: number;
  pointsRequired: number;
  title: string;
  description: string;
  perks: string[];
}

export interface WellbeingDashboardProps {
  visible: boolean;
  onClose: () => void;
  currentScore: number;
  breakdown: LifeScoreBreakdown;
  onNavigateToModule?: (module: 'steps' | 'hydration' | 'sleep' | 'mood') => void;
}

export type LifeScoreColor = 'red' | 'yellow' | 'green' | 'blue';

export interface BatteryGaugeProps {
  score: number;
  size?: number;
  animated?: boolean;
}

export interface ContributionBarProps {
  label: string;
  percentage: number;
  color: string;
  onPress?: () => void;
}

export interface TrendsChartProps {
  data: LifeScoreTrend[];
  period: '7d' | '30d';
  onPeriodChange: (period: '7d' | '30d') => void;
}
