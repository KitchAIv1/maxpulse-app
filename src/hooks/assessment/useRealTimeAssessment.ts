// Real-Time Assessment Hook
// Single responsibility: Fetch and manage real user assessment data

import { useState, useEffect, useCallback } from 'react';
import { WeeklyAssessmentOrchestrator } from '../../services/assessment/WeeklyAssessmentOrchestrator';
import { WeeklyAssessmentData } from '../../types/assessment';

interface UseRealTimeAssessmentReturn {
  assessmentData: WeeklyAssessmentData | null;
  isLoading: boolean;
  error: string | null;
  refreshAssessment: () => Promise<void>;
  hasData: boolean;
}

interface UseRealTimeAssessmentOptions {
  autoFetch?: boolean;
}

export const useRealTimeAssessment = (
  userId?: string,
  weekNumber?: number,
  options: UseRealTimeAssessmentOptions = { autoFetch: true }
): UseRealTimeAssessmentReturn => {
  const [assessmentData, setAssessmentData] = useState<WeeklyAssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessment = useCallback(async () => {
    if (!userId) {
      setError('No user ID provided');
      return;
    }

    // Default to current week if not specified
    const targetWeek = weekNumber || await getCurrentWeek(userId);

    setIsLoading(true);
    setError(null);

    try {
      console.log(`📊 Fetching real assessment data for user ${userId}, week ${targetWeek}`);

      const data = await WeeklyAssessmentOrchestrator.conductWeeklyAssessment(
        userId,
        targetWeek,
        false // Use cached assessment if available (changed from true)
      );

      if (data) {
        console.log('✅ Real assessment data loaded:', data);
        setAssessmentData(data);
      } else {
        setError('No assessment data available for this week');
        console.warn('⚠️ No assessment data returned');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load assessment';
      console.error('❌ Error loading assessment:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId, weekNumber]);

  // Auto-fetch on mount and when dependencies change (only if autoFetch is enabled)
  useEffect(() => {
    if (userId && options.autoFetch !== false) {
      fetchAssessment();
    }
  }, [userId, weekNumber, fetchAssessment, options.autoFetch]);

  return {
    assessmentData,
    isLoading,
    error,
    refreshAssessment: fetchAssessment,
    hasData: assessmentData !== null,
  };
};

/**
 * Get current week number for user based on plan start date
 */
async function getCurrentWeek(userId: string): Promise<number> {
  try {
    const { supabase } = await import('../../services/supabase');
    
    const { data, error } = await supabase
      .from('plan_progress')
      .select('current_week')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.warn('Could not get current week, defaulting to 1');
      return 1;
    }

    return data.current_week || 1;
  } catch (error) {
    console.error('Error getting current week:', error);
    return 1;
  }
}

