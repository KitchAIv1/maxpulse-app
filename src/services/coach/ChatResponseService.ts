// Chat Response Service
// Orchestrates AI coach responses using modular health services
// Follows .cursorrules: <200 lines, single responsibility

import { CoachResponse, HealthContextData } from '../../types/coach';
import { AISymptomAnalysis } from '../../types/health';
import ComplianceService from './ComplianceService';
import SymptomAnalysisEngine from './SymptomAnalysisEngine';
import HealthRecommendationService from './HealthRecommendationService';
import UserConsentManager from './UserConsentManager';

class ChatResponseService {
  private static instance: ChatResponseService;
  private complianceService: ComplianceService;
  private symptomEngine: SymptomAnalysisEngine;
  private recommendationService: HealthRecommendationService;
  private consentManager: UserConsentManager;

  private constructor() {
    this.complianceService = ComplianceService.getInstance();
    this.symptomEngine = SymptomAnalysisEngine.getInstance();
    this.recommendationService = HealthRecommendationService.getInstance();
    this.consentManager = UserConsentManager.getInstance();
  }

  public static getInstance(): ChatResponseService {
    if (!ChatResponseService.instance) {
      ChatResponseService.instance = new ChatResponseService();
    }
    return ChatResponseService.instance;
  }

  /**
   * Generate health-focused AI response
   */
  public async generateHealthResponse(
    userMessage: string,
    healthContext: HealthContextData,
    userId: string
  ): Promise<CoachResponse> {
    // Check for emergency keywords first
    if (this.complianceService.checkForEmergency(userMessage)) {
      return this.generateEmergencyResponse();
    }

    // Detect if message contains symptoms
    if (this.isSymptomRelated(userMessage)) {
      return await this.handleSymptomMessage(userMessage, healthContext, userId);
    }

    // Default supportive response
    return this.generateSupportiveResponse(userMessage, healthContext);
  }

  /**
   * Generate emergency response
   */
  private generateEmergencyResponse(): CoachResponse {
    return {
      message: this.complianceService.getEmergencyResponseMessage('USA'),
      messageType: 'insight',
      quickActions: [],
    };
  }

  /**
   * Handle symptom-related messages
   */
  private async handleSymptomMessage(
    userMessage: string,
    healthContext: HealthContextData,
    userId: string
  ): Promise<CoachResponse> {
    try {
      // Analyze symptoms
      const analysis = await this.symptomEngine.analyzeSymptom({
        symptomDescription: userMessage,
        symptomType: this.detectSymptomType(userMessage),
        healthContext: {
          sleep_hours: healthContext.sleep?.current,
          hydration_oz: healthContext.hydration?.current,
          steps: healthContext.steps?.current,
        },
      });

      // Generate recommendations
      const recommendations = await this.recommendationService.generateRecommendations({
        symptomAnalysis: analysis,
        symptomDescription: userMessage,
        healthContext: {
          sleep_hours: healthContext.sleep?.current,
          hydration_oz: healthContext.hydration?.current,
          steps: healthContext.steps?.current,
        },
        userId,
      });

      // Build response message
      const message = this.buildSymptomResponseMessage(analysis, recommendations);

      // Check product recommendation consent
      const hasConsent = await this.consentManager.hasProductRecommendationConsent(userId);

      return {
        message,
        contextData: healthContext,
        messageType: analysis.urgency_level === 'high' || analysis.urgency_level === 'emergency' 
          ? 'insight' 
          : 'suggestion',
        quickActions: [
          { id: 'more_details', label: 'Tell me more', action: 'wellness_check', icon: 'chatbubble-outline' },
          { id: 'track_symptoms', label: 'Track this', action: 'symptom_log', icon: 'bookmark-outline' },
        ],
      };
    } catch (error) {
      console.error('Error handling symptom message:', error);
      return this.generateFallbackResponse();
    }
  }

  /**
   * Build response message from analysis and recommendations
   */
  private buildSymptomResponseMessage(
    analysis: AISymptomAnalysis,
    recommendations: any[]
  ): string {
    let message = '💙 Thank you for sharing. ';

    // Add severity assessment
    if (analysis.severity_assessment === 'severe' || analysis.severity_assessment === 'critical') {
      message += 'Based on what you\'ve described, I recommend consulting with a healthcare provider. ';
    } else {
      message += 'I hear what you\'re experiencing. ';
    }

    // Add possible causes
    if (analysis.possible_causes.length > 0) {
      message += '\n\n**Possible factors:**\n';
      analysis.possible_causes.slice(0, 3).forEach(cause => {
        message += `• ${cause}\n`;
      });
    }

    // Add top recommendations
    if (recommendations.length > 0) {
      message += '\n\n**Suggestions that may help:**\n';
      recommendations.slice(0, 3).forEach(rec => {
        message += `• ${rec.recommendation_text}\n`;
      });
    }

    // Add disclaimer
    message += '\n\n' + this.complianceService.getRequiredDisclaimers('lifestyle', ['USA'])[0].text;

    return message;
  }

  /**
   * Detect symptom type from message
   */
  private detectSymptomType(message: string): any {
    const lower = message.toLowerCase();
    if (lower.includes('pain') || lower.includes('hurt') || lower.includes('ache')) return 'pain';
    if (lower.includes('tired') || lower.includes('fatigue') || lower.includes('energy')) return 'energy';
    if (lower.includes('sleep') || lower.includes('insomnia')) return 'sleep';
    if (lower.includes('stomach') || lower.includes('nausea') || lower.includes('digestive')) return 'digestive';
    if (lower.includes('breath') || lower.includes('cough')) return 'respiratory';
    if (lower.includes('stress') || lower.includes('anxious') || lower.includes('mood')) return 'mental';
    return 'other';
  }

  /**
   * Check if message is symptom-related
   */
  private isSymptomRelated(message: string): boolean {
    const symptomKeywords = [
      'pain', 'hurt', 'ache', 'tired', 'fatigue', 'sick', 'feel', 'symptom',
      'headache', 'nausea', 'dizzy', 'weak', 'sore', 'uncomfortable',
      'sleep', 'insomnia', 'stress', 'anxious', 'worried', 'depressed'
    ];
    
    const lower = message.toLowerCase();
    return symptomKeywords.some(keyword => lower.includes(keyword));
  }

  /**
   * Generate supportive response for non-symptom messages
   */
  private generateSupportiveResponse(
    userMessage: string,
    healthContext: HealthContextData
  ): CoachResponse {
    return {
      message: "I'm here to help with your health concerns. Feel free to share any symptoms or health questions you have. How are you feeling today?",
      contextData: healthContext,
      messageType: 'text',
      quickActions: [
        { id: 'wellness_check', label: 'Wellness Check', action: 'wellness_check', icon: 'medical-outline' },
        { id: 'describe_symptoms', label: 'Describe symptoms', action: 'symptom_log', icon: 'fitness-outline' },
      ],
    };
  }

  /**
   * Generate fallback response on error
   */
  private generateFallbackResponse(): CoachResponse {
    return {
      message: "I'm having trouble processing that right now. Could you try describing your symptoms again, or let me know if you need immediate medical attention?",
      messageType: 'text',
      quickActions: [
        { id: 'try_again', label: 'Try again', action: 'wellness_check', icon: 'refresh-outline' },
      ],
    };
  }
}

export default ChatResponseService;

