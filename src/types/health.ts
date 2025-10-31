// Health Conversations & Symptom Tracking Types
// TypeScript definitions for AI Coach health-focused features

// ============================================
// Health Conversation Types
// ============================================
export interface HealthConversation {
  id: string;
  user_id: string;
  session_id: string;
  started_at: string;
  ended_at?: string;
  conversation_type: 'general' | 'symptom' | 'wellness_check' | 'follow_up';
  summary?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateHealthConversation {
  user_id: string;
  session_id: string;
  conversation_type?: HealthConversation['conversation_type'];
  metadata?: Record<string, any>;
}

// ============================================
// Symptom Report Types
// ============================================
export type SymptomType = 
  | 'physical' 
  | 'mental' 
  | 'emotional' 
  | 'sleep' 
  | 'energy' 
  | 'pain' 
  | 'digestive' 
  | 'respiratory' 
  | 'other';

export type SymptomSeverity = 'mild' | 'moderate' | 'severe' | 'critical';
export type SymptomFrequency = 'constant' | 'intermittent' | 'occasional' | 'rare';

export interface SymptomReport {
  id: string;
  user_id: string;
  conversation_id?: string;
  symptom_type: SymptomType;
  symptom_description: string;
  severity?: SymptomSeverity;
  duration_days?: number;
  duration_description?: string;
  affected_areas?: string[];
  triggers?: string[];
  relieving_factors?: string[];
  associated_symptoms?: string[];
  frequency?: SymptomFrequency;
  onset_date?: string;
  reported_at: string;
  health_context?: Record<string, any>;
  ai_analysis?: AISymptomAnalysis;
  confidence_score?: number;
  requires_medical_attention: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSymptomReport {
  user_id: string;
  conversation_id?: string;
  symptom_type: SymptomType;
  symptom_description: string;
  severity?: SymptomSeverity;
  duration_days?: number;
  duration_description?: string;
  affected_areas?: string[];
  triggers?: string[];
  relieving_factors?: string[];
  associated_symptoms?: string[];
  frequency?: SymptomFrequency;
  onset_date?: string;
  health_context?: Record<string, any>;
}

export interface AISymptomAnalysis {
  detected_conditions?: string[];
  severity_assessment: SymptomSeverity;
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
  possible_causes: string[];
  red_flags: string[];
  correlation_with_health_data?: {
    sleep_deficit?: boolean;
    hydration_low?: boolean;
    activity_level_change?: boolean;
    stress_indicators?: boolean;
  };
  confidence: number;
  requires_professional_evaluation: boolean;
  emergency_warning?: string;
}

// ============================================
// Health Recommendation Types
// ============================================
export type RecommendationType = 
  | 'lifestyle' 
  | 'natural' 
  | 'medical_referral' 
  | 'product' 
  | 'behavioral' 
  | 'dietary' 
  | 'exercise' 
  | 'sleep_hygiene';

export type RecommendationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface HealthRecommendation {
  id: string;
  user_id: string;
  conversation_id?: string;
  symptom_report_id?: string;
  recommendation_type: RecommendationType;
  recommendation_text: string;
  reasoning?: string;
  confidence_score?: number;
  priority?: RecommendationPriority;
  evidence_based: boolean;
  sources?: string[];
  contraindications?: string[];
  expected_timeline?: string;
  compliance_checked: boolean;
  compliance_region: string[];
  disclaimer_shown: boolean;
  user_acknowledged: boolean;
  acknowledged_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHealthRecommendation {
  user_id: string;
  conversation_id?: string;
  symptom_report_id?: string;
  recommendation_type: RecommendationType;
  recommendation_text: string;
  reasoning?: string;
  confidence_score?: number;
  priority?: RecommendationPriority;
  evidence_based?: boolean;
  sources?: string[];
  contraindications?: string[];
  expected_timeline?: string;
  compliance_region?: string[];
}

// ============================================
// Product Recommendation Types
// ============================================
export type ProductType = 
  | 'supplement' 
  | 'wellness_device' 
  | 'fitness_equipment' 
  | 'sleep_aid' 
  | 'nutrition' 
  | 'therapy_tool' 
  | 'other';

export interface ProductRecommendation {
  id: string;
  user_id: string;
  conversation_id?: string;
  health_recommendation_id?: string;
  product_name: string;
  product_type: ProductType;
  product_description?: string;
  product_category?: string;
  product_image_url?: string;
  product_link?: string;
  price_range?: string;
  confidence_score?: number;
  reasoning?: string;
  benefits?: string[];
  user_consent_required: boolean;
  user_consent_given: boolean;
  consent_given_at?: string;
  shown_to_user: boolean;
  shown_at?: string;
  user_clicked: boolean;
  clicked_at?: string;
  user_purchased: boolean;
  purchased_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRecommendation {
  user_id: string;
  conversation_id?: string;
  health_recommendation_id?: string;
  product_name: string;
  product_type: ProductType;
  product_description?: string;
  product_category?: string;
  product_image_url?: string;
  product_link?: string;
  price_range?: string;
  confidence_score?: number;
  reasoning?: string;
  benefits?: string[];
}

// ============================================
// User Consent Types
// ============================================
export interface UserConsentPreferences {
  id: string;
  user_id: string;
  product_recommendations_enabled: boolean;
  data_sharing_enabled: boolean;
  ai_analysis_enabled: boolean;
  health_data_retention_days: number;
  marketing_consent: boolean;
  research_consent: boolean;
  third_party_sharing: boolean;
  consent_version: string;
  consent_given_at?: string;
  consent_updated_at?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserConsent {
  product_recommendations_enabled?: boolean;
  data_sharing_enabled?: boolean;
  ai_analysis_enabled?: boolean;
  health_data_retention_days?: number;
  marketing_consent?: boolean;
  research_consent?: boolean;
  third_party_sharing?: boolean;
}

// ============================================
// Audit Log Types
// ============================================
export type AuditActionType = 'create' | 'read' | 'update' | 'delete' | 'export' | 'share';

export interface HealthDataAuditLog {
  id: string;
  user_id: string;
  action_type: AuditActionType;
  table_name: string;
  record_id: string;
  action_details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  performed_at: string;
  created_at: string;
}

// ============================================
// Compliance Types
// ============================================
export interface ComplianceCheck {
  passed: boolean;
  region: 'USA' | 'UAE';
  regulations_checked: string[];
  warnings: string[];
  required_disclaimers: string[];
  requires_medical_referral: boolean;
  emergency_indicators: string[];
}

export interface MedicalDisclaimer {
  text: string;
  region: string[];
  required_for: RecommendationType[];
  version: string;
  last_updated: string;
}
