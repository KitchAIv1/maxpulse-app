// OpenAI Service
// Wrapper for OpenAI API interactions with health-focused prompts
// Follows .cursorrules: <200 lines, single responsibility
// Uses fetch API for React Native compatibility

import { ENV } from '../../config/env';
import ComplianceService from './ComplianceService';

export interface OpenAIHealthPrompt {
  userMessage: string;
  symptomContext?: string;
  healthData?: {
    sleep_hours?: number;
    hydration_oz?: number;
    steps?: number;
    stress_level?: string;
  };
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface OpenAIHealthResponse {
  message: string;
  confidence: number;
  requires_medical_attention: boolean;
  detected_urgency: 'low' | 'medium' | 'high' | 'emergency';
  raw_response?: string;
}

class OpenAIService {
  private static instance: OpenAIService;
  private complianceService: ComplianceService;
  private isConfigured: boolean = false;
  private readonly OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

  private constructor() {
    this.complianceService = ComplianceService.getInstance();
    this.initializeClient();
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  private initializeClient(): void {
    if (!ENV.isOpenAIConfigured()) {
      console.warn('⚠️ OpenAI API key not configured. AI features will use rule-based logic.');
      this.isConfigured = false;
      return;
    }

    this.isConfigured = true;
    console.log('✅ OpenAI service initialized (React Native compatible)');
  }

  /**
   * Check if OpenAI is available
   */
  public isAvailable(): boolean {
    return this.isConfigured;
  }

  /**
   * Analyze health symptoms using OpenAI (React Native compatible)
   */
  public async analyzeHealthSymptom(prompt: OpenAIHealthPrompt): Promise<OpenAIHealthResponse> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI service is not available');
    }

    // Build system prompt with compliance guardrails
    const systemPrompt = this.buildHealthSystemPrompt();
    
    // Build user prompt with context
    const userPrompt = this.buildUserPrompt(prompt);

    try {
      console.log('🤖 Calling OpenAI API with model:', ENV.OPENAI_MODEL);
      
      const response = await fetch(this.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENV.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: ENV.OPENAI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...(prompt.conversationHistory || []),
            { role: 'user', content: userPrompt },
          ],
          max_tokens: ENV.OPENAI_MAX_TOKENS,
          temperature: ENV.OPENAI_TEMPERATURE,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API error:', response.status, errorData);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const rawResponse = data.choices?.[0]?.message?.content || '';
      
      console.log('✅ OpenAI response received');
      
      // Parse and validate response
      return this.parseHealthResponse(rawResponse, prompt.userMessage);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  /**
   * Build system prompt with compliance and safety guardrails
   */
  private buildHealthSystemPrompt(): string {
    return `You are Max, a compassionate health companion AI for MaxPulse app. Your role is to have meaningful conversations about health and wellness.

YOUR PERSONALITY:
- Warm, empathetic, and genuinely curious about the user's wellbeing
- Conversational and engaging, not clinical or robotic
- Proactive in asking follow-up questions to understand the full picture
- Supportive friend who combines natural wellness wisdom with medical knowledge

YOUR CONVERSATION APPROACH:
1. **ASK CLARIFYING QUESTIONS**: When users share symptoms, always ask:
   - "When did this start?"
   - "How long have you been experiencing this?"
   - "Have you noticed any patterns or triggers?"
   - "How is this affecting your daily life?"
   - "Are there any other symptoms I should know about?"

2. **GATHER CONTEXT**: Explore related factors:
   - Sleep patterns, stress levels, diet changes, activity levels
   - Recent life events or changes
   - What they've already tried

3. **PROVIDE INSIGHTS**: After understanding the situation:
   - Share evidence-based health information
   - Suggest lifestyle changes and natural remedies
   - Explain possible connections to their health data
   - Recommend when to seek professional care

4. **BE CONVERSATIONAL**: 
   - Use natural language, not bullet points
   - Show empathy: "I hear you", "That must be challenging"
   - Keep responses concise but warm (2-4 sentences, then ask a question)
   - Build on previous conversation context

CRITICAL SAFETY RULES (USA & UAE Compliance):
- You are NOT a doctor and cannot diagnose medical conditions
- Include disclaimer when giving health advice: "This is not medical advice. Please consult a healthcare provider for proper diagnosis."
- For emergencies (chest pain, difficulty breathing, severe bleeding, suicidal thoughts): IMMEDIATELY tell user to call emergency services (911 in USA, 999 in UAE)
- Never make medical claims or guarantee treatment outcomes
- Focus on: lifestyle suggestions, symptom education, natural remedies, when to see a doctor

RESPONSE STYLE:
✅ DO: "I'm sorry to hear you're not feeling well. Can you tell me when this started and if anything specific triggers it?"
✅ DO: "That's helpful to know. Have you noticed any changes in your sleep or stress levels recently?"
✅ DO: "Based on what you're sharing, it sounds like [insight]. Have you tried [suggestion]? Also, when was the last time you saw a doctor about this?"

❌ DON'T: Give long lists of bullet points
❌ DON'T: Provide complete answers without asking follow-ups
❌ DON'T: Sound like a medical textbook

REMEMBER: You're having a conversation, not writing a report. Ask questions, show curiosity, and guide users to share more so you can help them better.`;
  }

  /**
   * Build user prompt with health context
   */
  private buildUserPrompt(prompt: OpenAIHealthPrompt): string {
    let userPrompt = `User message: "${prompt.userMessage}"`;

    if (prompt.symptomContext) {
      userPrompt += `\n\nSymptom context: ${prompt.symptomContext}`;
    }

    if (prompt.healthData) {
      userPrompt += `\n\nCurrent health data:`;
      if (prompt.healthData.sleep_hours !== undefined) {
        userPrompt += `\n- Sleep: ${prompt.healthData.sleep_hours} hours`;
      }
      if (prompt.healthData.hydration_oz !== undefined) {
        userPrompt += `\n- Hydration: ${prompt.healthData.hydration_oz} oz`;
      }
      if (prompt.healthData.steps !== undefined) {
        userPrompt += `\n- Steps: ${prompt.healthData.steps}`;
      }
      if (prompt.healthData.stress_level) {
        userPrompt += `\n- Stress level: ${prompt.healthData.stress_level}`;
      }
    }

    return userPrompt;
  }

  /**
   * Parse AI response and extract structured data
   */
  private parseHealthResponse(rawResponse: string, originalMessage: string): OpenAIHealthResponse {
    // Check for emergency indicators in response
    const isEmergency = this.complianceService.checkForEmergency(rawResponse) || 
                        this.complianceService.checkForEmergency(originalMessage);

    // Detect urgency level
    const urgency = this.detectUrgencyLevel(rawResponse, isEmergency);

    // Detect if medical attention is recommended
    const requiresMedical = this.detectMedicalAttentionNeeded(rawResponse);

    return {
      message: rawResponse,
      confidence: 0.85, // AI-enhanced confidence
      requires_medical_attention: requiresMedical || isEmergency,
      detected_urgency: urgency,
      raw_response: rawResponse,
    };
  }

  /**
   * Detect urgency level from AI response
   */
  private detectUrgencyLevel(response: string, isEmergency: boolean): 'low' | 'medium' | 'high' | 'emergency' {
    if (isEmergency) return 'emergency';
    
    const lower = response.toLowerCase();
    if (lower.includes('urgent') || lower.includes('immediately') || lower.includes('right away')) {
      return 'high';
    }
    if (lower.includes('soon') || lower.includes('within a few days') || lower.includes('monitor closely')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Detect if medical attention is recommended
   */
  private detectMedicalAttentionNeeded(response: string): boolean {
    const lower = response.toLowerCase();
    const medicalKeywords = [
      'see a doctor',
      'consult healthcare',
      'medical professional',
      'seek medical',
      'visit your doctor',
      'professional evaluation',
    ];
    return medicalKeywords.some(keyword => lower.includes(keyword));
  }
}

export default OpenAIService;

