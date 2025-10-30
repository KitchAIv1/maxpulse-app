// Assessment Trigger Service
// Single responsibility: Trigger assessment events and manage assessment state

import { WeeklyScheduler } from './WeeklyScheduler';
import { WeeklyAssessmentOrchestrator } from '../assessment/WeeklyAssessmentOrchestrator';
import { AssessmentTrigger as AssessmentTriggerType, WeeklyAssessmentData } from '../../types/assessment';

export class AssessmentTrigger {
  /**
   * Check and trigger assessment if needed
   */
  static async checkAndTriggerAssessment(userId: string): Promise<{
    triggered: boolean;
    assessmentData?: WeeklyAssessmentData;
    reason?: string;
    error?: string;
  }> {
    try {
      // Check if assessment is needed
      const assessmentCheck = await WeeklyScheduler.checkForWeeklyAssessment(userId);
      
      if (!assessmentCheck.needsAssessment) {
        return {
          triggered: false,
          reason: assessmentCheck.reason || 'No assessment needed at this time',
        };
      }

      // Trigger assessment
      const assessmentData = await WeeklyAssessmentOrchestrator.conductWeeklyAssessment(
        userId,
        assessmentCheck.weekNumber!
      );

      if (!assessmentData) {
        return {
          triggered: false,
          error: 'Failed to conduct weekly assessment',
        };
      }

      // Record trigger event
      await this.recordTriggerEvent(userId, 'scheduled', assessmentCheck.weekNumber!);

      return {
        triggered: true,
        assessmentData,
        reason: assessmentCheck.reason,
      };
    } catch (error) {
      console.error('Error checking and triggering assessment:', error);
      return {
        triggered: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Manually trigger assessment (user-initiated)
   */
  static async manuallyTriggerAssessment(userId: string, weekNumber?: number): Promise<{
    success: boolean;
    assessmentData?: WeeklyAssessmentData;
    error?: string;
  }> {
    try {
      // If no week number provided, get current week
      let targetWeek = weekNumber;
      if (!targetWeek) {
        const { data } = await import('../supabase').then(m => m.supabase
          .from('plan_progress')
          .select('current_week')
          .eq('user_id', userId)
          .single()
        );
        targetWeek = data?.current_week || 1;
      }

      // Conduct assessment
      const assessmentData = await WeeklyAssessmentOrchestrator.conductWeeklyAssessment(
        userId,
        targetWeek,
        true // Force reassessment
      );

      if (!assessmentData) {
        return {
          success: false,
          error: 'Failed to conduct manual assessment',
        };
      }

      // Record trigger event
      await this.recordTriggerEvent(userId, 'manual', targetWeek);

      return {
        success: true,
        assessmentData,
      };
    } catch (error) {
      console.error('Error manually triggering assessment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Trigger assessment on app launch if needed
   */
  static async triggerOnAppLaunch(userId: string): Promise<{
    shouldShowAssessment: boolean;
    assessmentData?: WeeklyAssessmentData;
    reason?: string;
  }> {
    try {
      // Check if assessment is overdue
      const assessmentCheck = await WeeklyScheduler.checkForWeeklyAssessment(userId);
      
      if (!assessmentCheck.needsAssessment) {
        return { shouldShowAssessment: false };
      }

      // Only show on app launch if assessment is overdue (not just scheduled)
      const isOverdue = assessmentCheck.daysSinceWeekStart && assessmentCheck.daysSinceWeekStart > 7;
      
      if (!isOverdue) {
        return { 
          shouldShowAssessment: false,
          reason: 'Assessment scheduled but not overdue',
        };
      }

      // Conduct assessment
      const assessmentData = await WeeklyAssessmentOrchestrator.conductWeeklyAssessment(
        userId,
        assessmentCheck.weekNumber!
      );

      if (!assessmentData) {
        return { shouldShowAssessment: false };
      }

      // Record trigger event
      await this.recordTriggerEvent(userId, 'app_launch', assessmentCheck.weekNumber!);

      return {
        shouldShowAssessment: true,
        assessmentData,
        reason: 'Assessment overdue - triggered on app launch',
      };
    } catch (error) {
      console.error('Error triggering assessment on app launch:', error);
      return { shouldShowAssessment: false };
    }
  }

  /**
   * Get assessment trigger status for UI
   */
  static async getAssessmentStatus(userId: string): Promise<{
    hasActiveAssessment: boolean;
    weekNumber?: number;
    daysUntilNext?: number;
    isOverdue?: boolean;
    nextAssessmentDate?: Date;
  }> {
    try {
      const assessmentCheck = await WeeklyScheduler.checkForWeeklyAssessment(userId);
      const timeUntilNext = WeeklyScheduler.getTimeUntilNextAssessment();
      
      return {
        hasActiveAssessment: assessmentCheck.needsAssessment,
        weekNumber: assessmentCheck.weekNumber,
        daysUntilNext: timeUntilNext.days,
        isOverdue: assessmentCheck.daysSinceWeekStart ? assessmentCheck.daysSinceWeekStart > 7 : false,
        nextAssessmentDate: timeUntilNext.nextAssessmentDate,
      };
    } catch (error) {
      console.error('Error getting assessment status:', error);
      return { hasActiveAssessment: false };
    }
  }

  /**
   * Record trigger event for analytics
   */
  private static async recordTriggerEvent(
    userId: string,
    triggerType: 'scheduled' | 'manual' | 'app_launch',
    weekNumber: number
  ): Promise<void> {
    try {
      const trigger: AssessmentTriggerType = {
        type: triggerType,
        triggeredAt: new Date(),
        userId,
        weekNumber,
      };

      // For MVP, we'll just log this
      // In production, this could be stored in a triggers table for analytics
      console.log('Assessment triggered:', trigger);
    } catch (error) {
      console.error('Error recording trigger event:', error);
    }
  }

  /**
   * Check if user should be reminded about assessment
   */
  static shouldShowAssessmentReminder(userId: string): Promise<{
    shouldShow: boolean;
    message?: string;
    urgency: 'low' | 'medium' | 'high';
  }> {
    return new Promise(async (resolve) => {
      try {
        const assessmentCheck = await WeeklyScheduler.checkForWeeklyAssessment(userId);
        
        if (!assessmentCheck.needsAssessment) {
          resolve({ shouldShow: false, urgency: 'low' });
          return;
        }

        const daysSinceStart = assessmentCheck.daysSinceWeekStart || 0;
        let message = '';
        let urgency: 'low' | 'medium' | 'high' = 'low';

        if (daysSinceStart >= 10) {
          message = 'Your weekly assessment is overdue. Complete it now to stay on track.';
          urgency = 'high';
        } else if (daysSinceStart >= 7) {
          message = 'Time for your weekly progress review!';
          urgency = 'medium';
        } else if (WeeklyScheduler.isAssessmentTime()) {
          message = 'Ready for your weekly assessment?';
          urgency = 'medium';
        }

        resolve({
          shouldShow: message.length > 0,
          message,
          urgency,
        });
      } catch (error) {
        console.error('Error checking assessment reminder:', error);
        resolve({ shouldShow: false, urgency: 'low' });
      }
    });
  }

  /**
   * Dismiss assessment reminder (user chose to skip for now)
   */
  static async dismissAssessmentReminder(userId: string): Promise<void> {
    try {
      // For MVP, we'll just log this
      // In production, this could set a "snoozed until" timestamp
      console.log(`Assessment reminder dismissed for user ${userId}`);
    } catch (error) {
      console.error('Error dismissing assessment reminder:', error);
    }
  }

  /**
   * Get assessment trigger history for debugging
   */
  static async getTriggerHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      // For MVP, return empty array
      // In production, this would query a triggers table
      return [];
    } catch (error) {
      console.error('Error getting trigger history:', error);
      return [];
    }
  }

  /**
   * Main trigger assessment flow (used by App.tsx)
   */
  static async triggerAssessmentFlow(userId: string): Promise<void> {
    try {
      console.log('🔄 Triggering assessment flow for user:', userId);
      
      // Check if assessment is needed and trigger if so
      const result = await this.checkAndTriggerAssessment(userId);
      
      if (result.triggered) {
        console.log('✅ Assessment flow triggered:', result.reason);
      } else {
        console.log('ℹ️ Assessment flow not triggered:', result.reason);
      }
      
    } catch (error) {
      console.error('Error in assessment flow trigger:', error);
      // Don't throw - this is called from App.tsx and shouldn't crash the app
    }
  }
}
