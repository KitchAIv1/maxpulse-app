// useWeeklyAssessment Hook
// Single responsibility: Manage weekly assessment state and UI logic

import { useState, useCallback, useEffect } from 'react';
import { WeeklyAssessmentData } from '../../types/assessment';
import { WeeklyAssessmentOrchestrator } from '../../services/assessment/WeeklyAssessmentOrchestrator';
import { AssessmentTrigger } from '../../services/scheduling/AssessmentTrigger';

interface UseWeeklyAssessmentReturn {
  assessmentData: WeeklyAssessmentData | null;
  isLoading: boolean;
  error: string | null;
  isVisible: boolean;
  showAssessment: () => void;
  hideAssessment: () => void;
  conductAssessment: (userId: string, weekNumber?: number, forceReassessment?: boolean) => Promise<void>;
  refreshAssessment: () => Promise<void>;
}

export const useWeeklyAssessment = (userId?: string): UseWeeklyAssessmentReturn => {
  const [assessmentData, setAssessmentData] = useState<WeeklyAssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Conduct weekly assessment
   */
  const conductAssessment = useCallback(async (
    targetUserId: string,
    weekNumber?: number,
    forceReassessment: boolean = false
  ) => {
    if (!targetUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      let result: WeeklyAssessmentData | null = null;

      if (weekNumber) {
        // Specific week assessment
        result = await WeeklyAssessmentOrchestrator.conductWeeklyAssessment(
          targetUserId,
          weekNumber,
          forceReassessment
        );
      } else {
        // Auto-triggered assessment
        const triggerResult = await AssessmentTrigger.checkAndTriggerAssessment(targetUserId);
        result = triggerResult.assessmentData || null;
        
        if (!triggerResult.triggered && triggerResult.error) {
          setError(triggerResult.error);
        }
      }

      if (result) {
        setAssessmentData(result);
        setIsVisible(true);
      } else {
        setError('Failed to conduct assessment');
      }
    } catch (err) {
      console.error('Error conducting assessment:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh current assessment
   */
  const refreshAssessment = useCallback(async () => {
    if (!userId || !assessmentData) return;
    
    await conductAssessment(userId, assessmentData.performance.week, true);
  }, [userId, assessmentData, conductAssessment]);

  /**
   * Show assessment modal
   */
  const showAssessment = useCallback(() => {
    setIsVisible(true);
  }, []);

  /**
   * Hide assessment modal
   */
  const hideAssessment = useCallback(() => {
    setIsVisible(false);
    setError(null);
  }, []);

  /**
   * Auto-check for assessment on user change
   */
  useEffect(() => {
    if (!userId) return;

    const checkForAssessment = async () => {
      try {
        const status = await AssessmentTrigger.getAssessmentStatus(userId);
        
        // Auto-show if assessment is overdue
        if (status.hasActiveAssessment && status.isOverdue) {
          await conductAssessment(userId);
        }
      } catch (error) {
        console.error('Error checking assessment status:', error);
      }
    };

    // Small delay to avoid immediate trigger on mount
    const timer = setTimeout(checkForAssessment, 2000);
    return () => clearTimeout(timer);
  }, [userId, conductAssessment]);

  return {
    assessmentData,
    isLoading,
    error,
    isVisible,
    showAssessment,
    hideAssessment,
    conductAssessment,
    refreshAssessment,
  };
};
