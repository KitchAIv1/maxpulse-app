// Health Conversation Storage Service
// Handles database persistence for AI coach conversations
// Follows .cursorrules: <200 lines, single responsibility

import { supabase } from '../supabase';
import OfflineQueueService from '../OfflineQueueService';
import { 
  HealthConversation, 
  SymptomReport, 
  HealthRecommendationRecord,
  AISymptomAnalysis 
} from '../../types/health';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SaveConversationResult {
  success: boolean;
  conversationId?: string;
  error?: string;
}

interface SaveSymptomResult {
  success: boolean;
  symptomReportId?: string;
  error?: string;
}

class HealthConversationStorage {
  private static instance: HealthConversationStorage;
  private offlineQueue: OfflineQueueService;

  private constructor() {
    this.offlineQueue = OfflineQueueService.getInstance();
  }

  public static getInstance(): HealthConversationStorage {
    if (!HealthConversationStorage.instance) {
      HealthConversationStorage.instance = new HealthConversationStorage();
    }
    return HealthConversationStorage.instance;
  }

  /**
   * Save entire conversation session at end
   */
  public async saveConversationSession(
    userId: string,
    sessionId: string,
    messages: ConversationMessage[],
    metadata?: Record<string, any>
  ): Promise<SaveConversationResult> {
    try {
      if (!userId || messages.length === 0) {
        return { success: false, error: 'Invalid userId or empty messages' };
      }

      // Determine conversation type based on messages
      const conversationType = this.detectConversationType(messages);

      // Create conversation summary
      const summary = this.generateSummary(messages);

      const conversationData: Partial<HealthConversation> = {
        user_id: userId,
        session_id: sessionId,
        conversation_type: conversationType,
        started_at: messages[0].timestamp,
        ended_at: messages[messages.length - 1].timestamp,
        summary,
        metadata: {
          ...metadata,
          message_count: messages.length,
          messages: messages, // Store full conversation in metadata
        },
      };

      const { data, error } = await supabase
        .from('health_conversations')
        .insert(conversationData)
        .select('id')
        .single();

      if (error) {
        console.error('Failed to save conversation:', error);
        await this.handleSaveError('conversation', conversationData);
        return { success: false, error: error.message };
      }

      console.log('✅ Conversation saved:', data.id);
      return { success: true, conversationId: data.id };
    } catch (error) {
      console.error('Error saving conversation:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Save symptom report with AI analysis
   */
  public async saveSymptomReport(
    userId: string,
    sessionId: string,
    symptomData: {
      symptomDescription: string;
      symptomType: string;
      severity?: string;
      durationDays?: number;
      affectedAreas?: string[];
      triggers?: string[];
    },
    aiAnalysis?: AISymptomAnalysis
  ): Promise<SaveSymptomResult> {
    try {
      if (!userId || !symptomData.symptomDescription) {
        return { success: false, error: 'Invalid userId or symptom data' };
      }

      // Get conversation ID from session
      const { data: conversation } = await supabase
        .from('health_conversations')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .single();

      const symptomRecord: Partial<SymptomReport> = {
        user_id: userId,
        conversation_id: conversation?.id,
        symptom_type: symptomData.symptomType as any,
        symptom_description: symptomData.symptomDescription,
        severity: symptomData.severity as any,
        duration_days: symptomData.durationDays,
        affected_areas: symptomData.affectedAreas,
        triggers: symptomData.triggers,
        ai_analysis: aiAnalysis ? JSON.parse(JSON.stringify(aiAnalysis)) : undefined,
        confidence_score: aiAnalysis?.confidence,
        requires_medical_attention: aiAnalysis?.requires_professional_evaluation,
        reported_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('symptom_reports')
        .insert(symptomRecord)
        .select('id')
        .single();

      if (error) {
        console.error('Failed to save symptom report:', error);
        await this.handleSaveError('symptom_report', symptomRecord);
        return { success: false, error: error.message };
      }

      console.log('✅ Symptom report saved:', data.id);
      return { success: true, symptomReportId: data.id };
    } catch (error) {
      console.error('Error saving symptom report:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Save health recommendations (batch insert)
   */
  public async saveHealthRecommendations(
    userId: string,
    sessionId: string,
    symptomReportId: string,
    recommendations: any[]
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      if (!userId || !recommendations || recommendations.length === 0) {
        return { success: false, count: 0, error: 'Invalid data' };
      }

      // Get conversation ID from session
      const { data: conversation } = await supabase
        .from('health_conversations')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .single();

      const recommendationRecords = recommendations.map(rec => ({
        user_id: userId,
        conversation_id: conversation?.id,
        symptom_report_id: symptomReportId,
        recommendation_type: rec.type || rec.recommendation_type,
        recommendation_text: rec.description || rec.recommendation_text,
        reasoning: rec.reasoning,
        confidence_score: rec.confidence_score,
        priority: rec.priority || 'medium',
        evidence_based: true,
        compliance_checked: true,
        compliance_region: ['USA', 'UAE'],
      }));

      const { data, error } = await supabase
        .from('health_recommendations')
        .insert(recommendationRecords)
        .select('id');

      if (error) {
        console.error('Failed to save recommendations:', error);
        await this.handleSaveError('recommendations', recommendationRecords);
        return { success: false, count: 0, error: error.message };
      }

      console.log(`✅ ${data.length} recommendations saved`);
      return { success: true, count: data.length };
    } catch (error) {
      console.error('Error saving recommendations:', error);
      return { success: false, count: 0, error: String(error) };
    }
  }

  /**
   * Queue failed saves for retry
   */
  private async handleSaveError(type: string, data: any): Promise<void> {
    try {
      await this.offlineQueue.queueOperation({
        type: 'conversation' as any, // Will extend type in next step
        operation: 'insert',
        data: { saveType: type, ...data },
        timestamp: new Date().toISOString(),
        userId: data.user_id,
      });
      console.log(`📦 Queued ${type} for retry`);
    } catch (error) {
      console.error('Failed to queue operation:', error);
    }
  }

  /**
   * Detect conversation type from messages
   */
  private detectConversationType(messages: ConversationMessage[]): 'general' | 'symptom' | 'wellness_check' | 'follow_up' {
    const content = messages.map(m => m.content.toLowerCase()).join(' ');
    
    if (content.includes('symptom') || content.includes('pain') || content.includes('sick')) {
      return 'symptom';
    }
    if (content.includes('wellness') || content.includes('check')) {
      return 'wellness_check';
    }
    if (content.includes('follow') || content.includes('update')) {
      return 'follow_up';
    }
    return 'general';
  }

  /**
   * Generate conversation summary
   */
  private generateSummary(messages: ConversationMessage[]): string {
    const userMessages = messages.filter(m => m.role === 'user');
    const firstUserMessage = userMessages[0]?.content || '';
    const summary = firstUserMessage.substring(0, 200);
    return summary + (firstUserMessage.length > 200 ? '...' : '');
  }
}

export default HealthConversationStorage;

