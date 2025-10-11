// MaxPulse Activation Code Types
// Based on actual Supabase database schema

// Activation Code Database Record
export interface ActivationCode {
  id: string;
  code: string;
  distributor_id: string | null;
  session_id: string;
  customer_name: string;
  customer_email: string;
  onboarding_data: OnboardingData;
  purchase_id: string | null;
  plan_type: string | null;
  purchase_amount: number | null;
  status: 'pending' | 'activated' | 'expired';
  activated_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// Comprehensive Onboarding Data Structure
export interface OnboardingData {
  demographics: Demographics;
  personalizedTargets: PersonalizedTargets;
  transformationRoadmap: TransformationRoadmap;
  medical: MedicalInfo;
  mentalHealth: MentalHealthInfo;
  v2Analysis: V2Analysis;
  assessment: AssessmentInfo;
  metadata: MetadataInfo;
}

export interface Demographics {
  age: number;
  bmi: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
}

export interface PersonalizedTargets {
  bmi: {
    target: number;
    current: number;
    category: string;
  };
  sleep: {
    currentHours: number;
    deficitHours: number;
    targetMaxHours: number;
    targetMinHours: number;
  };
  steps: {
    targetDaily: number;
    currentDaily: number;
    deficitSteps: number;
  };
  weight: {
    excessKg: number;
    currentKg: number;
    deficitKg: number;
    targetMaxKg: number;
    targetMinKg: number;
    isUnderweight: boolean;
  };
  exercise: {
    deficitMinutes: number;
    targetMinutesWeekly: number;
    currentMinutesWeekly: number;
  };
  hydration: {
    targetLiters: number;
    currentLiters: number;
    glassesNeeded: number;
    deficitPercentage: number;
  };
}

export interface TransformationRoadmap {
  phases: TransformationPhase[];
  successFactors: string[];
  overallTimeline: string;
}

export interface TransformationPhase {
  name: string;
  focus: string[];
  phase: number;
  weeks: string;
  actions: PhaseAction[];
  expectedResults: string[];
  weeklyMilestones: WeeklyMilestone[];
}

export interface PhaseAction {
  action: string;
  how: string;
  why: string;
  tracking: string;
}

export interface WeeklyMilestone {
  week: number;
  focus: string;
  expectedChanges: string[];
}

export interface MedicalInfo {
  allergies: string[];
  conditions: string[];
  medications: string[];
}

export interface MentalHealthInfo {
  energy: string;
  stress: string;
  burnout: string;
  mindfulness: string;
  socialSupport: string;
}

export interface V2Analysis {
  hardTruth: string;
  riskAnalysis: RiskAnalysis;
  priorityActions: string[];
  ninetyDayProjection: NinetyDayProjection;
}

export interface RiskAnalysis {
  diabetesRisk: number;
  riskCategory: string;
  mentalHealthRisk: number;
  overallRiskLevel: string;
  cardiovascularRisk: number;
  primaryRiskFactors: RiskFactor[];
  metabolicSyndromeRisk: number;
}

export interface RiskFactor {
  name: string;
  severity: string;
  description: string;
  riskPercentage: number;
  compoundFactors: string[];
}

export interface NinetyDayProjection {
  bmi: ProjectionMetric;
  sleep: ProjectionMetric;
  weight: ProjectionMetric;
  milestones: ProjectionMilestone[];
  energyLevel: ProjectionMetric;
  healthScore: ProjectionMetric;
  dailyLifeImprovements: string[];
}

export interface ProjectionMetric {
  change: number;
  current: number;
  projected: number;
}

export interface ProjectionMilestone {
  week: number;
  description: string;
}

export interface AssessmentInfo {
  type: string;
  responses: AssessmentResponses;
  completedAt: string;
}

export interface AssessmentResponses {
  status: string;
  started_at: string;
  total_steps: number;
  created_from: string;
  customer_name: string;
  customer_email: string;
  distributor_id: string;
  assessment_type: string;
}

export interface MetadataInfo {
  dataVersion: string;
  generatedAt: string;
  distributorCode: string;
  assessmentSessionId: string;
}

// API Response Types
export interface ActivationCodeValidationResult {
  isValid: boolean;
  isExpired: boolean;
  isUsed: boolean;
  activationCode?: ActivationCode;
  error?: string;
}

export interface ActivationCodeConsumptionResult {
  success: boolean;
  activationCode?: ActivationCode;
  error?: string;
}

// User Profile Creation from Activation Data
export interface UserProfileFromActivation {
  email: string;
  name: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  bmi: number;
  medical_conditions: string[];
  medical_allergies: string[];
  medical_medications: string[];
  mental_health_data: MentalHealthInfo;
  activation_code_id: string;
  distributor_id: string | null;
  session_id: string;
  plan_type: string | null;
}

// Dynamic Targets from Activation Data
export interface DynamicTargets {
  steps: number;
  waterOz: number; // Converted from liters
  sleepHr: number; // Average of min/max
  weeklyTargets?: WeeklyTargets;
}

export interface WeeklyTargets {
  currentWeek: number;
  phase: number;
  phaseName: string;
  weeklyFocus: string;
  expectedChanges: string[];
  actions: PhaseAction[];
}

// Plan Progress Tracking
export interface PlanProgress {
  user_id: string;
  current_week: number;
  current_phase: number;
  start_date: string;
  milestones_achieved: number[];
  weekly_scores: WeeklyScore[];
  adaptation_notes?: string;
}

export interface WeeklyScore {
  week: number;
  steps_avg: number;
  hydration_avg: number;
  sleep_avg: number;
  life_score_avg: number;
  goals_met_count: number;
}
