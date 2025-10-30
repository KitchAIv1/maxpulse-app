// useWeeklyPerformance Hook
// Single responsibility: Fetch and format weekly performance data for UI

import { useState, useCallback, useEffect } from 'react';
import { WeeklyPerformance, PillarPerformance, HealthPillar } from '../../types/assessment';
import { WeeklyPerformanceCalculator } from '../../services/assessment/WeeklyPerformanceCalculator';

interface UseWeeklyPerformanceReturn {
  performance: WeeklyPerformance | null;
  isLoading: boolean;
  error: string | null;
  fetchPerformance: (userId: string, weekNumber: number, startDate: string, endDate: string) => Promise<void>;
  getPillarPerformance: (pillar: HealthPillar) => PillarPerformance | null;
  getPerformanceGrade: () => string;
  getPerformanceColor: () => string;
  getConsistencyMessage: () => string;
}

export const useWeeklyPerformance = (): UseWeeklyPerformanceReturn => {
  const [performance, setPerformance] = useState<WeeklyPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch weekly performance data
   */
  const fetchPerformance = useCallback(async (
    userId: string,
    weekNumber: number,
    startDate: string,
    endDate: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await WeeklyPerformanceCalculator.calculateWeekPerformance(
        userId,
        weekNumber,
        startDate,
        endDate
      );

      if (result) {
        setPerformance(result);
      } else {
        setError('No performance data available for this week');
      }
    } catch (err) {
      console.error('Error fetching weekly performance:', err);
      setError(err instanceof Error ? err.message : 'Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get performance data for a specific pillar
   */
  const getPillarPerformance = useCallback((pillar: HealthPillar): PillarPerformance | null => {
    if (!performance) return null;
    return performance.pillarBreakdown.find(p => p.pillar === pillar) || null;
  }, [performance]);

  /**
   * Get human-readable performance grade
   */
  const getPerformanceGrade = useCallback((): string => {
    if (!performance) return 'No Data';
    
    switch (performance.overallGrade) {
      case 'mastery':
        return 'Excellent';
      case 'progress':
        return 'Good Progress';
      case 'struggle':
        return 'Needs Attention';
      default:
        return 'Unknown';
    }
  }, [performance]);

  /**
   * Get color for performance grade
   */
  const getPerformanceColor = useCallback((): string => {
    if (!performance) return '#6B7280'; // Gray
    
    switch (performance.overallGrade) {
      case 'mastery':
        return '#10B981'; // Green
      case 'progress':
        return '#F59E0B'; // Amber
      case 'struggle':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  }, [performance]);

  /**
   * Get consistency message
   */
  const getConsistencyMessage = useCallback((): string => {
    if (!performance) return 'No data available';
    
    const { consistencyDays, totalTrackingDays } = performance;
    const rate = totalTrackingDays > 0 ? (consistencyDays / totalTrackingDays) * 100 : 0;
    
    if (rate >= 80) {
      return `Excellent consistency: ${consistencyDays}/${totalTrackingDays} days`;
    } else if (rate >= 60) {
      return `Good consistency: ${consistencyDays}/${totalTrackingDays} days`;
    } else if (rate >= 40) {
      return `Moderate consistency: ${consistencyDays}/${totalTrackingDays} days`;
    } else {
      return `Low consistency: ${consistencyDays}/${totalTrackingDays} days`;
    }
  }, [performance]);

  return {
    performance,
    isLoading,
    error,
    fetchPerformance,
    getPillarPerformance,
    getPerformanceGrade,
    getPerformanceColor,
    getConsistencyMessage,
  };
};
