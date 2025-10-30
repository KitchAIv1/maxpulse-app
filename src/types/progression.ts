// Progression Types
// TypeScript interfaces for progression decisions and execution

export interface ProgressionDecision {
  type: ProgressionRecommendation;
  weekNumber: number;
  phaseNumber: number;
  userId: string;
  reasoning: string[];
  confidence: number;
  modifications?: TargetModifications;
  executedAt?: Date;
  executedBy: 'user' | 'system';
}

export interface WeekAdvancement {
  fromWeek: number;
  toWeek: number;
  fromPhase: number;
  toPhase: number;
  newTargets: WeeklyTargets;
  advancementReason: string;
  executedAt: Date;
}

export interface WeekExtension {
  weekNumber: number;
  phaseNumber: number;
  extensionCount: number;
  modifiedTargets?: WeeklyTargets;
  focusArea: HealthPillar;
  extensionReason: string;
  maxExtensionsReached: boolean;
  executedAt: Date;
}

export interface WeekReset {
  fromWeek: number;
  toWeek: number;
  fromPhase: number;
  toPhase: number;
  resetTargets: WeeklyTargets;
  resetReason: string;
  supportRecommendations: string[];
  executedAt: Date;
}

export interface ProgressionExecutionResult {
  success: boolean;
  type: ProgressionRecommendation;
  newWeek: number;
  newPhase: number;
  newTargets: WeeklyTargets;
  message: string;
  error?: string;
}

export interface ProgressionHistory {
  userId: string;
  decisions: ProgressionDecision[];
  advancements: WeekAdvancement[];
  extensions: WeekExtension[];
  resets: WeekReset[];
  currentWeek: number;
  currentPhase: number;
  totalExtensions: number;
  completionPrediction: number; // 0-100% likelihood of completing 90 days
}

export interface TargetModificationRule {
  condition: string;
  pillar: HealthPillar;
  adjustmentType: 'reduce' | 'maintain' | 'increase';
  adjustmentPercent: number;
  maxAdjustment: number;
  reason: string;
}

export interface ProgressionValidation {
  isValid: boolean;
  canAdvance: boolean;
  canExtend: boolean;
  canReset: boolean;
  blockers: string[];
  warnings: string[];
  recommendations: string[];
}

// Re-export types from assessment.ts to avoid circular imports
export type ProgressionRecommendation = 'advance' | 'extend' | 'reset';
export type HealthPillar = 'steps' | 'water' | 'sleep' | 'mood';

export interface WeeklyTargets {
  steps: number;
  waterOz: number;
  sleepHr: number;
  week?: number;
  phase?: number;
  focus?: string;
}

export interface TargetModifications {
  steps?: number;
  waterOz?: number;
  sleepHr?: number;
  focusArea: HealthPillar;
  adjustmentReason: string;
}
