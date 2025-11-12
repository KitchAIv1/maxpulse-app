// Streak Data Hook
// Fetches and manages Life Score streak data
// Single responsibility: Streak data state management

import { useState, useEffect, useCallback } from 'react';
import StreakService, { StreakData } from '../../services/streaks/StreakService';

export const useStreakData = (userId: string | undefined) => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    nextMilestone: 7,
    nextMilestoneBonus: 50,
    daysUntilMilestone: 7,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreakData = useCallback(async () => {
    if (!userId) {
      setStreakData({
        currentStreak: 0,
        longestStreak: 0,
        nextMilestone: 7,
        nextMilestoneBonus: 50,
        daysUntilMilestone: 7,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const service = StreakService.getInstance();
      const data = await service.getStreakData(userId);
      setStreakData(data);
    } catch (err) {
      console.error('Failed to fetch streak data:', err);
      setError('Failed to load streak data.');
      setStreakData({
        currentStreak: 0,
        longestStreak: 0,
        nextMilestone: 7,
        nextMilestoneBonus: 50,
        daysUntilMilestone: 7,
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStreakData();
  }, [fetchStreakData]);

  return {
    streakData,
    isLoading,
    error,
    refetch: fetchStreakData,
  };
};

