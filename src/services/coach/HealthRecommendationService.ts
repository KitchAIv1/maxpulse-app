// Health Recommendation Service
// Generates natural and medical lifestyle recommendations based on symptom analysis
// Follows .cursorrules: <200 lines, single responsibility

import { 
  HealthRecommendation, 
  CreateHealthRecommendation,
  AISymptomAnalysis,
  RecommendationType,
  RecommendationPriority 
} from '../../types/health';
import ComplianceService from './ComplianceService';

interface RecommendationInput {
  symptomAnalysis: AISymptomAnalysis;
  symptomDescription: string;
  healthContext?: {
    sleep_hours?: number;
    hydration_oz?: number;
    steps?: number;
  };
  userId: string;
  conversationId?: string;
  symptomReportId?: string;
}

class HealthRecommendationService {
  private static instance: HealthRecommendationService;
  private complianceService: ComplianceService;

  private constructor() {
    this.complianceService = ComplianceService.getInstance();
  }

  public static getInstance(): HealthRecommendationService {
    if (!HealthRecommendationService.instance) {
      HealthRecommendationService.instance = new HealthRecommendationService();
    }
    return HealthRecommendationService.instance;
  }

  /**
   * Generate comprehensive health recommendations
   */
  public async generateRecommendations(
    input: RecommendationInput
  ): Promise<CreateHealthRecommendation[]> {
    const recommendations: CreateHealthRecommendation[] = [];

    // Check if medical referral is needed
    if (input.symptomAnalysis.requires_professional_evaluation) {
      recommendations.push(this.createMedicalReferralRecommendation(input));
    }

    // Generate lifestyle recommendations
    const lifestyleRecs = this.generateLifestyleRecommendations(input);
    recommendations.push(...lifestyleRecs);

    // Generate natural remedies
    const naturalRecs = this.generateNaturalRemedies(input);
    recommendations.push(...naturalRecs);

    // Validate all recommendations for compliance
    const validatedRecs = recommendations.filter(rec => {
      const validation = this.complianceService.validateRecommendation(
        rec.recommendation_text,
        rec.recommendation_type
      );
      return validation.valid;
    });

    return validatedRecs;
  }

  /**
   * Create medical referral recommendation
   */
  private createMedicalReferralRecommendation(
    input: RecommendationInput
  ): CreateHealthRecommendation {
    return {
      user_id: input.userId,
      conversation_id: input.conversationId,
      symptom_report_id: input.symptomReportId,
      recommendation_type: 'medical_referral',
      recommendation_text: 'Based on your symptoms, we recommend consulting with a licensed healthcare provider for proper evaluation and diagnosis.',
      reasoning: input.symptomAnalysis.red_flags.length > 0
        ? `Red flags detected: ${input.symptomAnalysis.red_flags.join(', ')}`
        : 'Symptom severity requires professional medical evaluation',
      confidence_score: 0.95,
      priority: 'urgent',
      evidence_based: true,
      compliance_region: ['USA', 'UAE'],
    };
  }

  /**
   * Generate lifestyle recommendations
   */
  private generateLifestyleRecommendations(
    input: RecommendationInput
  ): CreateHealthRecommendation[] {
    const recommendations: CreateHealthRecommendation[] = [];
    const correlation = input.symptomAnalysis.correlation_with_health_data;

    // Sleep recommendations
    if (correlation?.sleep_deficit) {
      recommendations.push({
        user_id: input.userId,
        conversation_id: input.conversationId,
        symptom_report_id: input.symptomReportId,
        recommendation_type: 'sleep_hygiene',
        recommendation_text: 'Prioritize getting 7-9 hours of quality sleep. Establish a consistent bedtime routine and avoid screens 1 hour before bed.',
        reasoning: 'Your recent sleep data shows insufficient rest, which can contribute to fatigue and other symptoms',
        confidence_score: 0.85,
        priority: 'high',
        evidence_based: true,
        sources: ['CDC Sleep Guidelines', 'National Sleep Foundation'],
        compliance_region: ['USA', 'UAE'],
      });
    }

    // Hydration recommendations
    if (correlation?.hydration_low) {
      recommendations.push({
        user_id: input.userId,
        conversation_id: input.conversationId,
        symptom_report_id: input.symptomReportId,
        recommendation_type: 'lifestyle',
        recommendation_text: 'Increase water intake to at least 64oz per day. Dehydration can cause headaches, fatigue, and difficulty concentrating.',
        reasoning: 'Your hydration levels are below optimal, which may be contributing to your symptoms',
        confidence_score: 0.80,
        priority: 'medium',
        evidence_based: true,
        compliance_region: ['USA', 'UAE'],
      });
    }

    // Activity recommendations
    if (correlation?.activity_level_change) {
      recommendations.push({
        user_id: input.userId,
        conversation_id: input.conversationId,
        symptom_report_id: input.symptomReportId,
        recommendation_type: 'exercise',
        recommendation_text: 'Incorporate gentle movement like a 10-15 minute walk. Physical activity can help improve energy and mood.',
        reasoning: 'Your activity levels have been lower than usual, which may impact energy and wellbeing',
        confidence_score: 0.75,
        priority: 'medium',
        evidence_based: true,
        compliance_region: ['USA', 'UAE'],
      });
    }

    return recommendations;
  }

  /**
   * Generate natural remedy recommendations
   */
  private generateNaturalRemedies(
    input: RecommendationInput
  ): CreateHealthRecommendation[] {
    const recommendations: CreateHealthRecommendation[] = [];
    const desc = input.symptomDescription.toLowerCase();

    // Stress management
    if (desc.includes('stress') || desc.includes('anxious')) {
      recommendations.push({
        user_id: input.userId,
        conversation_id: input.conversationId,
        symptom_report_id: input.symptomReportId,
        recommendation_type: 'behavioral',
        recommendation_text: 'Practice deep breathing exercises or meditation for 5-10 minutes daily. Consider gentle yoga or progressive muscle relaxation.',
        reasoning: 'Stress management techniques can help reduce anxiety and improve overall wellbeing',
        confidence_score: 0.80,
        priority: 'medium',
        evidence_based: true,
        sources: ['American Psychological Association'],
        compliance_region: ['USA', 'UAE'],
      });
    }

    // Headache relief
    if (desc.includes('headache')) {
      recommendations.push({
        user_id: input.userId,
        conversation_id: input.conversationId,
        symptom_report_id: input.symptomReportId,
        recommendation_type: 'natural',
        recommendation_text: 'Apply a cold compress to your forehead, rest in a dark quiet room, and ensure adequate hydration. Consider reducing screen time.',
        reasoning: 'Natural headache relief methods can help manage mild to moderate headaches',
        confidence_score: 0.75,
        priority: 'medium',
        evidence_based: true,
        contraindications: ['Seek immediate care if headache is severe or accompanied by neurological symptoms'],
        compliance_region: ['USA', 'UAE'],
      });
    }

    return recommendations;
  }

  /**
   * Prioritize recommendations by urgency
   */
  public prioritizeRecommendations(
    recommendations: CreateHealthRecommendation[]
  ): CreateHealthRecommendation[] {
    const priorityOrder: Record<RecommendationPriority, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    return recommendations.sort((a, b) => {
      const aPriority = priorityOrder[a.priority || 'low'];
      const bPriority = priorityOrder[b.priority || 'low'];
      return aPriority - bPriority;
    });
  }
}

export default HealthRecommendationService;

