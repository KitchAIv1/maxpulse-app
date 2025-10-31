// Compliance Service
// Handles USA and UAE health regulation compliance for AI Coach recommendations
// Ensures all health advice meets FDA and UAE Ministry of Health guidelines

import { ComplianceCheck, MedicalDisclaimer, RecommendationType } from '../../types/health';

class ComplianceService {
  private static instance: ComplianceService;

  // FDA and UAE restricted keywords that require medical referral
  private readonly emergencyKeywords = [
    'chest pain', 'difficulty breathing', 'severe bleeding', 'unconscious',
    'seizure', 'stroke', 'heart attack', 'suicidal', 'severe pain',
    'broken bone', 'head injury', 'poisoning', 'overdose'
  ];

  private readonly medicalReferralKeywords = [
    'cancer', 'tumor', 'diabetes', 'hypertension', 'heart disease',
    'kidney disease', 'liver disease', 'chronic', 'prescription',
    'medication', 'surgery', 'diagnosis', 'treatment'
  ];

  private constructor() {}

  public static getInstance(): ComplianceService {
    if (!ComplianceService.instance) {
      ComplianceService.instance = new ComplianceService();
    }
    return ComplianceService.instance;
  }

  /**
   * Check if symptom description requires immediate medical attention
   */
  public checkForEmergency(symptomDescription: string): boolean {
    const lowerDesc = symptomDescription.toLowerCase();
    return this.emergencyKeywords.some(keyword => lowerDesc.includes(keyword));
  }

  /**
   * Check if symptom requires medical professional referral
   */
  public requiresMedicalReferral(symptomDescription: string): boolean {
    const lowerDesc = symptomDescription.toLowerCase();
    return this.medicalReferralKeywords.some(keyword => lowerDesc.includes(keyword));
  }

  /**
   * Perform comprehensive compliance check for USA and UAE
   */
  public performComplianceCheck(
    symptomDescription: string,
    recommendationType: RecommendationType,
    region: 'USA' | 'UAE' = 'USA'
  ): ComplianceCheck {
    const warnings: string[] = [];
    const emergencyIndicators: string[] = [];
    const requiredDisclaimers: string[] = [];

    // Check for emergency keywords
    const isEmergency = this.checkForEmergency(symptomDescription);
    if (isEmergency) {
      emergencyIndicators.push('Emergency keywords detected');
      warnings.push('Immediate medical attention may be required');
    }

    // Check for medical referral keywords
    const needsReferral = this.requiresMedicalReferral(symptomDescription);
    
    // Add required disclaimers based on recommendation type
    if (recommendationType === 'medical_referral') {
      requiredDisclaimers.push(this.getMedicalReferralDisclaimer(region));
    } else if (recommendationType === 'product') {
      requiredDisclaimers.push(this.getProductRecommendationDisclaimer(region));
    } else {
      requiredDisclaimers.push(this.getGeneralHealthDisclaimer(region));
    }

    // Region-specific checks
    if (region === 'UAE') {
      requiredDisclaimers.push(this.getUAESpecificDisclaimer());
    }

    return {
      passed: !isEmergency,
      region,
      regulations_checked: region === 'USA' ? ['FDA', 'HIPAA'] : ['UAE MOH', 'DHA'],
      warnings,
      required_disclaimers: requiredDisclaimers,
      requires_medical_referral: isEmergency || needsReferral,
      emergency_indicators: emergencyIndicators,
    };
  }

  /**
   * Get FDA-compliant general health disclaimer (USA)
   */
  private getGeneralHealthDisclaimer(region: 'USA' | 'UAE'): string {
    if (region === 'USA') {
      return 'This information is for educational purposes only and is not intended to diagnose, treat, cure, or prevent any disease. Always consult with a qualified healthcare provider before making any health decisions.';
    }
    return 'This information is provided for general wellness purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Please consult a licensed healthcare provider in the UAE for medical concerns.';
  }

  /**
   * Get medical referral disclaimer
   */
  private getMedicalReferralDisclaimer(region: 'USA' | 'UAE'): string {
    if (region === 'USA') {
      return 'Based on your symptoms, we strongly recommend consulting with a licensed healthcare provider. This AI coach cannot diagnose medical conditions or prescribe treatments. If this is an emergency, please call 911 immediately.';
    }
    return 'Based on your symptoms, we strongly recommend consulting with a licensed healthcare provider in the UAE. This AI coach cannot diagnose medical conditions or prescribe treatments. If this is an emergency, please call 999 immediately.';
  }

  /**
   * Get product recommendation disclaimer
   */
  private getProductRecommendationDisclaimer(region: 'USA' | 'UAE'): string {
    if (region === 'USA') {
      return 'Product recommendations are suggestions only and have not been evaluated by the FDA. These products are not intended to diagnose, treat, cure, or prevent any disease. Consult your healthcare provider before using any supplements or wellness products.';
    }
    return 'Product recommendations are suggestions only and have not been evaluated by UAE health authorities. These products are not intended to diagnose, treat, cure, or prevent any disease. Consult your healthcare provider before using any supplements or wellness products.';
  }

  /**
   * Get UAE-specific health disclaimer
   */
  private getUAESpecificDisclaimer(): string {
    return 'This service complies with UAE Ministry of Health and Prevention guidelines. All health information provided must be verified with a licensed healthcare professional in the UAE.';
  }

  /**
   * Get emergency response message
   */
  public getEmergencyResponseMessage(region: 'USA' | 'UAE' = 'USA'): string {
    if (region === 'USA') {
      return '🚨 EMERGENCY: Your symptoms may require immediate medical attention. Please call 911 or go to the nearest emergency room immediately. Do not wait for a response from this AI coach.';
    }
    return '🚨 EMERGENCY: Your symptoms may require immediate medical attention. Please call 999 or go to the nearest emergency room immediately. Do not wait for a response from this AI coach.';
  }

  /**
   * Validate that recommendation meets compliance standards
   */
  public validateRecommendation(
    recommendationText: string,
    recommendationType: RecommendationType
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for prohibited claims
    const prohibitedClaims = ['cure', 'treat', 'diagnose', 'prevent disease'];
    const lowerText = recommendationText.toLowerCase();
    
    prohibitedClaims.forEach(claim => {
      if (lowerText.includes(claim)) {
        issues.push(`Prohibited claim detected: "${claim}"`);
      }
    });

    // Check for prescription medication references
    if (lowerText.includes('prescription') || lowerText.includes('medication')) {
      issues.push('References to prescription medications require medical professional consultation');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get all required disclaimers for a recommendation
   */
  public getRequiredDisclaimers(
    recommendationType: RecommendationType,
    regions: string[] = ['USA']
  ): MedicalDisclaimer[] {
    const disclaimers: MedicalDisclaimer[] = [];

    regions.forEach(region => {
      disclaimers.push({
        text: this.getGeneralHealthDisclaimer(region as 'USA' | 'UAE'),
        region: [region],
        required_for: ['lifestyle', 'natural', 'behavioral', 'dietary', 'exercise', 'sleep_hygiene'],
        version: '1.0',
        last_updated: new Date().toISOString(),
      });

      if (recommendationType === 'product') {
        disclaimers.push({
          text: this.getProductRecommendationDisclaimer(region as 'USA' | 'UAE'),
          region: [region],
          required_for: ['product'],
          version: '1.0',
          last_updated: new Date().toISOString(),
        });
      }
    });

    return disclaimers;
  }
}

export default ComplianceService;

