// Assessment Types
// TypeScript interfaces for weekly assessment and performance tracking

export interface WeeklyPerformance {
  week: number;
  phase: number;
  startDate: string;
  endDate: string;
  averageAchievement: number;        // 0-100%
  consistencyDays: number;           // Days hitting 80% threshold
  totalTrackingDays: number;         // Total days with data
  strongestPillar: HealthPillar;
  weakestPillar: HealthPillar;
  overallGrade: PerformanceGrade;
  pillarBreakdown: PillarPerformance[];
}

export interface PillarPerformance {
  pillar: HealthPillar;
  averageAchievement: number;        // 0-100%
  consistentDays: number;            // Days above 80%
  trend: 'improving' | 'stable' | 'declining';
  dailyValues: number[];             // Daily achievement percentages
}

export interface ConsistencyMetrics {
  totalDays: number;
  consistentDays: number;            // Days above 80%
  consistencyRate: number;           // Percentage of consistent days
  longestStreak: number;
  currentStreak: number;
  weekendConsistency: number;        // Weekend vs weekday performance
  timeOfDayPatterns: TimePattern[];
}

export interface TimePattern {
  period: 'morning' | 'afternoon' | 'evening';
  averagePerformance: number;
  consistency: number;
}

export interface ProgressionAssessment {
  recommendation: ProgressionRecommendation;
  confidence: number;                // 0-100%
  reasoning: string[];
  modifications?: TargetModifications;
  riskFactors: string[];
  opportunities: string[];
}

export interface TargetModifications {
  steps?: number;
  waterOz?: number;
  sleepHr?: number;
  focusArea: HealthPillar;
  adjustmentReason: string;
}

export interface WeeklyAssessmentData {
  performance: WeeklyPerformance;
  consistency: ConsistencyMetrics;
  assessment: ProgressionAssessment;
  currentTargets: WeeklyTargets;
  nextWeekTargets?: WeeklyTargets;
}

export interface WeeklyPerformanceHistory {
  id: string;
  userId: string;
  weekNumber: number;
  phaseNumber: number;
  startDate: string;
  endDate: string;
  stepsAchievementAvg: number;
  waterAchievementAvg: number;
  sleepAchievementAvg: number;
  moodAchievementAvg: number;
  overallAchievementAvg: number;
  consistencyDays: number;
  totalTrackingDays: number;
  progressionRecommendation: ProgressionRecommendation;
  userDecision?: UserDecision;
  decisionReasoning: string[];
  targetsAtAssessment: any;
  strongestPillar: HealthPillar;
  weakestPillar: HealthPillar;
  assessedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Enums and Union Types
export type HealthPillar = 'steps' | 'water' | 'sleep' | 'mood';

export type PerformanceGrade = 'mastery' | 'progress' | 'struggle';

export type ProgressionRecommendation = 'advance' | 'extend' | 'reset';

export type UserDecision = 'accepted' | 'override_advance' | 'coach_consultation';

// Weekly Targets (imported from existing types)
export interface WeeklyTargets {
  steps: number;
  waterOz: number;
  sleepHr: number;
  week?: number;
  phase?: number;
  focus?: string;
}

// Assessment Trigger Types
export interface AssessmentTrigger {
  type: 'scheduled' | 'manual' | 'app_launch';
  scheduledFor?: Date;
  triggeredAt: Date;
  userId: string;
  weekNumber: number;
}

export interface AssessmentNotification {
  id: string;
  userId: string;
  weekNumber: number;
  scheduledFor: Date;
  title: string;
  message: string;
  delivered: boolean;
  deliveredAt?: Date;
}
