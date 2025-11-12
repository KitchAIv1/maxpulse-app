// Streak Service
// Calculates Life Score streaks and milestone information
// Single responsibility: Streak calculation logic

import { supabase } from '../supabase';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  nextMilestone: number;
  nextMilestoneBonus: number;
  daysUntilMilestone: number;
}

/**
 * Milestone definitions (days -> bonus points)
 */
const MILESTONES = [
  { days: 7, bonus: 50 },
  { days: 14, bonus: 100 },
  { days: 21, bonus: 150 },
  { days: 30, bonus: 200 },
  { days: 60, bonus: 300 },
  { days: 90, bonus: 500 },
];

/**
 * Life Score threshold to count as a "good day" for streaks
 * Using 50% as threshold (user met at least half their targets)
 */
const LIFE_SCORE_THRESHOLD = 50;

class StreakService {
  private static instance: StreakService;

  private constructor() {}

  static getInstance(): StreakService {
    if (!StreakService.instance) {
      StreakService.instance = new StreakService();
    }
    return StreakService.instance;
  }

  /**
   * Calculate Life Score from daily metrics
   */
  private calculateLifeScore(metric: any): number {
    const stepsPct = metric.steps_target > 0 ? metric.steps_actual / metric.steps_target : 0;
    const waterPct = metric.water_oz_target > 0 ? metric.water_oz_actual / metric.water_oz_target : 0;
    const sleepPct = metric.sleep_hr_target > 0 ? metric.sleep_hr_actual / metric.sleep_hr_target : 0;
    const moodPct = metric.mood_checkins_target > 0 ? metric.mood_checkins_actual / metric.mood_checkins_target : 0;

    const average = (stepsPct + waterPct + sleepPct + moodPct) / 4;
    return Math.min(100, average * 100);
  }

  /**
   * Get streak data for a user
   */
  async getStreakData(userId: string): Promise<StreakData> {
    try {
      console.log('🔥 [StreakService] Calculating streak data for user:', userId);

      // Query daily_metrics for past 90 days (to find longest streak)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
      const startDateStr = startDate.toISOString().split('T')[0];

      const { data: metrics, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDateStr)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        console.error('❌ [StreakService] Database error:', error);
        return this.getDefaultStreakData();
      }

      if (!metrics || metrics.length === 0) {
        console.log('⚠️ [StreakService] No metrics found');
        return this.getDefaultStreakData();
      }

      console.log(`📊 [StreakService] Found ${metrics.length} days of metrics`);

      // Calculate Life Score for each day and check if it meets threshold
      const dailyScores = metrics.map(metric => ({
        date: metric.date,
        lifeScore: this.calculateLifeScore(metric),
        metThreshold: this.calculateLifeScore(metric) >= LIFE_SCORE_THRESHOLD,
      }));

      // Calculate current streak (from most recent day)
      let currentStreak = 0;
      for (const day of dailyScores) {
        if (day.metThreshold) {
          currentStreak++;
        } else {
          break; // Streak broken
        }
      }

      // Calculate longest streak (scanning all days)
      let longestStreak = 0;
      let tempStreak = 0;
      for (const day of dailyScores.reverse()) {
        if (day.metThreshold) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      console.log(`🔥 [StreakService] Current streak: ${currentStreak} days`);
      console.log(`🏆 [StreakService] Longest streak: ${longestStreak} days`);

      // Find next milestone
      const nextMilestone = this.getNextMilestone(currentStreak);
      const nextMilestoneBonus = this.getMilestoneBonus(nextMilestone);
      // If user just hit a milestone, show next one (daysUntilMilestone = 0 means they hit it today)
      const daysUntilMilestone = Math.max(0, nextMilestone - currentStreak);

      console.log(`🎯 [StreakService] Next milestone: ${nextMilestone} days (${daysUntilMilestone} days away)`);
      console.log(`💰 [StreakService] Bonus: ${nextMilestoneBonus} points`);

      return {
        currentStreak,
        longestStreak,
        nextMilestone,
        nextMilestoneBonus,
        daysUntilMilestone,
      };
    } catch (error) {
      console.error('❌ [StreakService] Error calculating streak:', error);
      return this.getDefaultStreakData();
    }
  }

  /**
   * Get next milestone after current streak
   */
  private getNextMilestone(currentStreak: number): number {
    for (const milestone of MILESTONES) {
      if (currentStreak < milestone.days) {
        return milestone.days;
      }
    }
    // If user has passed all milestones, return the last one + 30
    return MILESTONES[MILESTONES.length - 1].days + 30;
  }

  /**
   * Get bonus points for a milestone
   */
  private getMilestoneBonus(milestoneDays: number): number {
    const milestone = MILESTONES.find(m => m.days === milestoneDays);
    return milestone ? milestone.bonus : 50; // Default 50 if not found
  }

  /**
   * Get default streak data (no streaks yet)
   */
  private getDefaultStreakData(): StreakData {
    return {
      currentStreak: 0,
      longestStreak: 0,
      nextMilestone: 7,
      nextMilestoneBonus: 50,
      daysUntilMilestone: 7,
    };
  }
}

export default StreakService;

