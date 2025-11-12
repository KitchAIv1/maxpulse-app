// useAchievements Hook
// Fetches and manages achievement data with progress calculation
// Single responsibility: Achievement data fetching and state management

import { useState, useEffect, useCallback } from 'react';
import AchievementEngine, { AchievementRule, BadgeProgress } from '../../services/achievements/AchievementEngine';
import { supabase } from '../../services/supabase';

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'hydration' | 'sleep' | 'steps' | 'balanced';
  earned: boolean;
  progress: number;
  currentValue?: number;
  targetValue?: number;
}

interface UseAchievementsResult {
  badges: AchievementBadge[];
  isLoading: boolean;
  error: string | null;
  refreshAchievements: () => Promise<void>;
}

export const useAchievements = (userId: string | undefined): UseAchievementsResult => {
  const [badges, setBadges] = useState<AchievementBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const engine = AchievementEngine.getInstance();

  /**
   * Fetch all achievements with progress
   */
  const fetchAchievements = useCallback(async () => {
    if (!userId) {
      setBadges([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get all achievement rules
      const rules = engine.getAllRules();

      // Calculate progress for each badge
      const progressPromises = rules.map((rule) =>
        engine.calculateBadgeProgress(userId, rule)
      );

      const progressResults = await Promise.all(progressPromises);

      // Combine rules with progress
      const achievementBadges: AchievementBadge[] = rules.map((rule, index) => {
        const progress = progressResults[index];
        return {
          id: rule.id,
          name: rule.name,
          description: rule.description,
          icon: rule.icon,
          category: rule.category,
          earned: progress.earned,
          progress: progress.progress,
          currentValue: progress.currentValue,
          targetValue: progress.targetValue,
        };
      });

      setBadges(achievementBadges);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError(err instanceof Error ? err.message : 'Failed to load achievements');
      setBadges([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, engine]);

  /**
   * Refresh achievements
   */
  const refreshAchievements = useCallback(async () => {
    await fetchAchievements();
  }, [fetchAchievements]);

  // Fetch on mount and when userId changes
  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    badges,
    isLoading,
    error,
    refreshAchievements,
  };
};

