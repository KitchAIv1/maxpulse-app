// useAssessmentScheduler Hook
// Single responsibility: Handle assessment timing and scheduling UI logic

import { useState, useCallback, useEffect } from 'react';
import { WeeklyScheduler } from '../../services/scheduling/WeeklyScheduler';
import { AssessmentTrigger } from '../../services/scheduling/AssessmentTrigger';

interface AssessmentScheduleInfo {
  currentWeek: number;
  needsAssessment: boolean;
  daysSinceWeekStart: number;
  isOverdue: boolean;
  nextAssessmentDate: Date | null;
  timeUntilNext: {
    days: number;
    hours: number;
    minutes: number;
  };
}

interface UseAssessmentSchedulerReturn {
  scheduleInfo: AssessmentScheduleInfo | null;
  isLoading: boolean;
  error: string | null;
  checkSchedule: (userId: string) => Promise<void>;
  shouldShowReminder: boolean;
  reminderMessage: string;
  reminderUrgency: 'low' | 'medium' | 'high';
  dismissReminder: () => void;
  refreshSchedule: () => Promise<void>;
}

export const useAssessmentScheduler = (userId?: string): UseAssessmentSchedulerReturn => {
  const [scheduleInfo, setScheduleInfo] = useState<AssessmentScheduleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldShowReminder, setShouldShowReminder] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderUrgency, setReminderUrgency] = useState<'low' | 'medium' | 'high'>('low');

  /**
   * Check assessment schedule for user
   */
  const checkSchedule = useCallback(async (targetUserId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if assessment is needed
      const assessmentCheck = await WeeklyScheduler.checkForWeeklyAssessment(targetUserId);
      
      // Get time until next assessment
      const timeUntilNext = WeeklyScheduler.getTimeUntilNextAssessment();
      
      // Get assessment status
      const status = await AssessmentTrigger.getAssessmentStatus(targetUserId);

      const info: AssessmentScheduleInfo = {
        currentWeek: assessmentCheck.weekNumber || status.weekNumber || 1,
        needsAssessment: assessmentCheck.needsAssessment,
        daysSinceWeekStart: assessmentCheck.daysSinceWeekStart || 0,
        isOverdue: status.isOverdue || false,
        nextAssessmentDate: status.nextAssessmentDate || null,
        timeUntilNext: {
          days: timeUntilNext.days,
          hours: timeUntilNext.hours,
          minutes: timeUntilNext.minutes,
        },
      };

      setScheduleInfo(info);

      // Check if should show reminder
      const reminderCheck = await AssessmentTrigger.shouldShowAssessmentReminder(targetUserId);
      setShouldShowReminder(reminderCheck.shouldShow);
      setReminderMessage(reminderCheck.message || '');
      setReminderUrgency(reminderCheck.urgency);

    } catch (err) {
      console.error('Error checking assessment schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to check schedule');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh schedule information
   */
  const refreshSchedule = useCallback(async () => {
    if (!userId) return;
    await checkSchedule(userId);
  }, [userId, checkSchedule]);

  /**
   * Dismiss assessment reminder
   */
  const dismissReminder = useCallback(() => {
    setShouldShowReminder(false);
    setReminderMessage('');
    
    if (userId) {
      AssessmentTrigger.dismissAssessmentReminder(userId);
    }
  }, [userId]);

  /**
   * Auto-check schedule when user changes
   */
  useEffect(() => {
    if (!userId) return;

    checkSchedule(userId);
  }, [userId, checkSchedule]);

  /**
   * Periodic schedule refresh (every 5 minutes)
   */
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      checkSchedule(userId);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [userId, checkSchedule]);

  return {
    scheduleInfo,
    isLoading,
    error,
    checkSchedule,
    shouldShowReminder,
    reminderMessage,
    reminderUrgency,
    dismissReminder,
    refreshSchedule,
  };
};
