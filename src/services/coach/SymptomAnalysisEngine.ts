// Symptom Analysis Engine
// Hybrid rule-based + AI analysis for health symptom processing
// Follows .cursorrules: <200 lines, single responsibility

import { 
  SymptomReport, 
  AISymptomAnalysis, 
  SymptomSeverity,
  SymptomType 
} from '../../types/health';
import ComplianceService from './ComplianceService';
import OpenAIService from './OpenAIService';

interface AnalysisInput {
  symptomDescription: string;
  symptomType: SymptomType;
  duration_days?: number;
  healthContext?: {
    sleep_hours?: number;
    hydration_oz?: number;
    steps?: number;
    stress_level?: string;
  };
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

class SymptomAnalysisEngine {
  private static instance: SymptomAnalysisEngine;
  private complianceService: ComplianceService;
  private openAIService: OpenAIService;

  // Rule-based severity indicators
  private readonly severityIndicators = {
    critical: ['severe', 'unbearable', 'worst', 'emergency', 'can\'t breathe', 'chest pain'],
    severe: ['intense', 'very painful', 'debilitating', 'constant', 'worsening'],
    moderate: ['uncomfortable', 'persistent', 'noticeable', 'affecting daily'],
    mild: ['slight', 'minor', 'occasional', 'manageable', 'mild']
  };

  private constructor() {
    this.complianceService = ComplianceService.getInstance();
    this.openAIService = OpenAIService.getInstance();
  }

  public static getInstance(): SymptomAnalysisEngine {
    if (!SymptomAnalysisEngine.instance) {
      SymptomAnalysisEngine.instance = new SymptomAnalysisEngine();
    }
    return SymptomAnalysisEngine.instance;
  }

  /**
   * Analyze symptoms using hybrid approach (rule-based + AI)
   */
  public async analyzeSymptom(input: AnalysisInput): Promise<AISymptomAnalysis> {
    // Rule-based analysis first
    const ruleBasedAnalysis = this.performRuleBasedAnalysis(input);
    
    // Check for emergency
    const isEmergency = this.complianceService.checkForEmergency(input.symptomDescription);
    
    // Correlate with health data
    const healthCorrelation = this.correlateWithHealthData(input);

    // For MVP, use rule-based analysis
    // In production, this would call OpenAI API for deeper analysis
    const aiEnhancedAnalysis = await this.enhanceWithAI(input, ruleBasedAnalysis);

    return {
      ...aiEnhancedAnalysis,
      correlation_with_health_data: healthCorrelation,
      requires_professional_evaluation: 
        isEmergency || 
        ruleBasedAnalysis.severity_assessment === 'severe' ||
        ruleBasedAnalysis.severity_assessment === 'critical',
      emergency_warning: isEmergency 
        ? this.complianceService.getEmergencyResponseMessage('USA')
        : undefined,
    };
  }

  /**
   * Rule-based symptom analysis
   */
  private performRuleBasedAnalysis(input: AnalysisInput): AISymptomAnalysis {
    const severity = this.assessSeverity(input.symptomDescription);
    const urgency = this.assessUrgency(severity, input.duration_days);
    const possibleCauses = this.identifyPossibleCauses(input);
    const redFlags = this.identifyRedFlags(input.symptomDescription);

    return {
      severity_assessment: severity,
      urgency_level: urgency,
      possible_causes: possibleCauses,
      red_flags: redFlags,
      confidence: this.calculateConfidence(input),
      requires_professional_evaluation: severity === 'severe' || severity === 'critical',
    };
  }

  /**
   * Assess symptom severity using keyword matching
   */
  private assessSeverity(description: string): SymptomSeverity {
    const lower = description.toLowerCase();
    
    if (this.severityIndicators.critical.some(word => lower.includes(word))) {
      return 'critical';
    }
    if (this.severityIndicators.severe.some(word => lower.includes(word))) {
      return 'severe';
    }
    if (this.severityIndicators.moderate.some(word => lower.includes(word))) {
      return 'moderate';
    }
    return 'mild';
  }

  /**
   * Assess urgency based on severity and duration
   */
  private assessUrgency(
    severity: SymptomSeverity, 
    duration_days?: number
  ): 'low' | 'medium' | 'high' | 'emergency' {
    if (severity === 'critical') return 'emergency';
    if (severity === 'severe') return 'high';
    if (severity === 'moderate' && duration_days && duration_days > 7) return 'high';
    if (severity === 'moderate') return 'medium';
    return 'low';
  }

  /**
   * Identify possible causes based on symptom type and description
   */
  private identifyPossibleCauses(input: AnalysisInput): string[] {
    const causes: string[] = [];
    const lower = input.symptomDescription.toLowerCase();

    // Common symptom-cause mappings
    if (input.symptomType === 'energy' && lower.includes('tired')) {
      causes.push('Insufficient sleep', 'Dehydration', 'Poor nutrition', 'Stress');
    }
    if (input.symptomType === 'sleep' && lower.includes('insomnia')) {
      causes.push('Stress or anxiety', 'Irregular sleep schedule', 'Caffeine intake', 'Screen time before bed');
    }
    if (input.symptomType === 'pain' && lower.includes('headache')) {
      causes.push('Dehydration', 'Eye strain', 'Stress', 'Poor posture', 'Lack of sleep');
    }
    if (input.symptomType === 'digestive') {
      causes.push('Dietary factors', 'Stress', 'Food intolerance', 'Dehydration');
    }

    return causes.length > 0 ? causes : ['Multiple factors may contribute', 'Consult healthcare provider for diagnosis'];
  }

  /**
   * Identify red flags requiring immediate attention
   */
  private identifyRedFlags(description: string): string[] {
    const redFlags: string[] = [];
    const lower = description.toLowerCase();

    const criticalIndicators = [
      { keyword: 'chest pain', flag: 'Chest pain may indicate cardiac emergency' },
      { keyword: 'difficulty breathing', flag: 'Breathing difficulty requires immediate evaluation' },
      { keyword: 'severe bleeding', flag: 'Severe bleeding is a medical emergency' },
      { keyword: 'suicidal', flag: 'Mental health crisis - seek immediate help' },
      { keyword: 'confusion', flag: 'Confusion may indicate serious condition' },
    ];

    criticalIndicators.forEach(({ keyword, flag }) => {
      if (lower.includes(keyword)) {
        redFlags.push(flag);
      }
    });

    return redFlags;
  }

  /**
   * Correlate symptoms with health data
   */
  private correlateWithHealthData(input: AnalysisInput) {
    const context = input.healthContext;
    if (!context) return undefined;

    return {
      sleep_deficit: context.sleep_hours ? context.sleep_hours < 6 : false,
      hydration_low: context.hydration_oz ? context.hydration_oz < 40 : false,
      activity_level_change: context.steps ? context.steps < 3000 : false,
      stress_indicators: context.stress_level === 'high',
    };
  }

  /**
   * Calculate confidence score based on available data
   */
  private calculateConfidence(input: AnalysisInput): number {
    let confidence = 0.6; // Base confidence for rule-based analysis
    
    if (input.duration_days) confidence += 0.1;
    if (input.healthContext) confidence += 0.15;
    if (input.symptomDescription.length > 50) confidence += 0.1;
    
    return Math.min(confidence, 0.95); // Cap at 0.95 for rule-based
  }

  /**
   * Enhance analysis with AI (OpenAI API integration)
   * Hybrid approach: Use rule-based as fallback, OpenAI for deeper insights
   */
  private async enhanceWithAI(
    input: AnalysisInput,
    ruleBasedAnalysis: AISymptomAnalysis
  ): Promise<AISymptomAnalysis> {
    // If OpenAI is not available, return rule-based analysis
    if (!this.openAIService.isAvailable()) {
      console.log('OpenAI not available, using rule-based analysis');
      return {
        ...ruleBasedAnalysis,
        detected_conditions: this.detectConditions(input.symptomDescription),
      };
    }

    try {
      // Call OpenAI for enhanced analysis with conversation history
      const aiResponse = await this.openAIService.analyzeHealthSymptom({
        userMessage: input.symptomDescription,
        symptomContext: `Symptom type: ${input.symptomType}, Duration: ${input.duration_days || 'unknown'} days`,
        healthData: input.healthContext,
        conversationHistory: input.conversationHistory || [],
      });

      // Merge AI insights with rule-based analysis
      return {
        ...ruleBasedAnalysis,
        confidence: aiResponse.confidence,
        detected_conditions: this.detectConditions(input.symptomDescription),
        requires_professional_evaluation: aiResponse.requires_medical_attention,
        urgency_level: aiResponse.detected_urgency,
        ai_raw_response: aiResponse.raw_response,
      };
    } catch (error) {
      console.error('OpenAI enhancement failed, falling back to rule-based:', error);
      // Fallback to rule-based analysis
      return {
        ...ruleBasedAnalysis,
        detected_conditions: this.detectConditions(input.symptomDescription),
      };
    }
  }

  /**
   * Detect potential conditions (simplified for MVP)
   */
  private detectConditions(description: string): string[] {
    const conditions: string[] = [];
    const lower = description.toLowerCase();

    if (lower.includes('fatigue') || lower.includes('tired')) {
      conditions.push('General fatigue');
    }
    if (lower.includes('headache')) {
      conditions.push('Tension headache');
    }
    if (lower.includes('insomnia') || lower.includes('can\'t sleep')) {
      conditions.push('Sleep disturbance');
    }

    return conditions;
  }
}

export default SymptomAnalysisEngine;

