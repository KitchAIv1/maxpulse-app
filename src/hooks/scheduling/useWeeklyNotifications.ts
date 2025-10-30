// useWeeklyNotifications Hook
// Single responsibility: Manage weekly notification state and UI logic

import { useState, useCallback, useEffect } from 'react';
import { WeeklyScheduler } from '../../services/scheduling/WeeklyScheduler';

interface NotificationState {
  isEnabled: boolean;
  nextNotificationDate: Date | null;
  notificationTime: string; // "20:00" format
  daysOfWeek: number[]; // [0] for Sunday
}

interface UseWeeklyNotificationsReturn {
  notificationState: NotificationState;
  isLoading: boolean;
  error: string | null;
  enableNotifications: () => Promise<void>;
  disableNotifications: () => Promise<void>;
  updateNotificationTime: (time: string) => Promise<void>;
  getNotificationPreview: () => string;
  isNotificationTime: () => boolean;
}

export const useWeeklyNotifications = (userId?: string): UseWeeklyNotificationsReturn => {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    isEnabled: true, // Default enabled for MVP
    nextNotificationDate: null,
    notificationTime: '20:00', // 8 PM default
    daysOfWeek: [0], // Sunday only
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Enable weekly notifications
   */
  const enableNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For MVP, just update local state
      // In production, this would register with a notification service
      setNotificationState(prev => ({ ...prev, isEnabled: true }));
      
      // Calculate next notification date
      const nextSunday = WeeklyScheduler.getTimeUntilNextAssessment().nextAssessmentDate;
      setNotificationState(prev => ({ ...prev, nextNotificationDate: nextSunday }));

    } catch (err) {
      console.error('Error enabling notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Disable weekly notifications
   */
  const disableNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For MVP, just update local state
      // In production, this would unregister from notification service
      setNotificationState(prev => ({ 
        ...prev, 
        isEnabled: false,
        nextNotificationDate: null 
      }));

    } catch (err) {
      console.error('Error disabling notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to disable notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update notification time
   */
  const updateNotificationTime = useCallback(async (time: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(time)) {
        throw new Error('Invalid time format. Use HH:MM format.');
      }

      setNotificationState(prev => ({ ...prev, notificationTime: time }));

      // Recalculate next notification date with new time
      if (notificationState.isEnabled) {
        const [hours, minutes] = time.split(':').map(Number);
        const nextSunday = new Date();
        const daysUntilSunday = (7 - nextSunday.getDay()) % 7;
        
        if (nextSunday.getDay() === 0 && 
            (nextSunday.getHours() > hours || 
             (nextSunday.getHours() === hours && nextSunday.getMinutes() >= minutes))) {
          // It's Sunday but past the notification time, go to next Sunday
          nextSunday.setDate(nextSunday.getDate() + 7);
        } else if (daysUntilSunday === 0) {
          // It's Sunday but before notification time
          nextSunday.setDate(nextSunday.getDate());
        } else {
          nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
        }
        
        nextSunday.setHours(hours, minutes, 0, 0);
        setNotificationState(prev => ({ ...prev, nextNotificationDate: nextSunday }));
      }

    } catch (err) {
      console.error('Error updating notification time:', err);
      setError(err instanceof Error ? err.message : 'Failed to update notification time');
    } finally {
      setIsLoading(false);
    }
  }, [notificationState.isEnabled]);

  /**
   * Get notification preview message
   */
  const getNotificationPreview = useCallback((): string => {
    if (!notificationState.isEnabled) {
      return 'Notifications are disabled';
    }

    const time = notificationState.notificationTime;
    const [hours, minutes] = time.split(':').map(Number);
    const timeString = new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return `Weekly assessment reminder every Sunday at ${timeString}`;
  }, [notificationState]);

  /**
   * Check if it's currently notification time
   */
  const isNotificationTime = useCallback((): boolean => {
    if (!notificationState.isEnabled) return false;

    const now = new Date();
    const [hours, minutes] = notificationState.notificationTime.split(':').map(Number);
    
    return (
      now.getDay() === 0 && // Sunday
      now.getHours() === hours &&
      now.getMinutes() === minutes
    );
  }, [notificationState]);

  /**
   * Initialize notification state
   */
  useEffect(() => {
    if (!userId) return;

    // For MVP, use default settings
    // In production, this would load user preferences
    const initializeNotifications = async () => {
      try {
        const nextSunday = WeeklyScheduler.getTimeUntilNextAssessment().nextAssessmentDate;
        setNotificationState(prev => ({ ...prev, nextNotificationDate: nextSunday }));
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, [userId]);

  return {
    notificationState,
    isLoading,
    error,
    enableNotifications,
    disableNotifications,
    updateNotificationTime,
    getNotificationPreview,
    isNotificationTime,
  };
};
