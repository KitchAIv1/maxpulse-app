// Achievement Engine Service
// Calculates badge progress and checks achievement eligibility
// Single responsibility: Achievement calculation logic

import { supabase } from '../supabase';
import HealthDataService from '../HealthDataService';

export interface BadgeProgress {
  badgeId: string;
  earned: boolean;
  progress: number; // 0-1
  currentValue?: number;
  targetValue?: number;
}

export interface AchievementRule {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'hydration' | 'sleep' | 'steps' | 'balanced';
  type: 'streak' | 'single_day' | 'total_days' | 'life_score_streak';
  metric?: 'hydration' | 'sleep' | 'steps' | 'all_targets' | 'life_score';
  threshold: number; // Days, value, or percentage
  period?: number; // Lookback period in days
}

// Predefined achievement rules (can be moved to database later)
const ACHIEVEMENT_RULES: AchievementRule[] = [
  {
    id: 'hydration_week',
    name: 'Hydration Hero',
    description: 'Hit hydration target 7 days in a row',
    icon: 'water',
    category: 'hydration',
    type: 'streak',
    metric: 'hydration',
    threshold: 7,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Get 8+ hours of sleep for 5 nights',
    icon: 'moon',
    category: 'sleep',
    type: 'streak',
    metric: 'sleep',
    threshold: 5,
  },
  {
    id: 'step_master',
    name: 'Step Master',
    description: 'Reach 10,000 steps in a single day',
    icon: 'footsteps',
    category: 'steps',
    type: 'single_day',
    metric: 'steps',
    threshold: 10000,
  },
  {
    id: 'balanced_life',
    name: 'Balanced Life',
    description: 'Hit all targets in one day',
    icon: 'checkmark-circle',
    category: 'balanced',
    type: 'single_day',
    metric: 'all_targets',
    threshold: 1,
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Maintain 80%+ Life Score for 14 days',
    icon: 'trophy',
    category: 'balanced',
    type: 'life_score_streak',
    metric: 'life_score',
    threshold: 14,
  },
  {
    id: 'wellness_warrior',
    name: 'Wellness Warrior',
    description: 'Complete 30 days of tracking',
    icon: 'shield',
    category: 'balanced',
    type: 'total_days',
    metric: 'all_targets',
    threshold: 30,
  },
];

class AchievementEngine {
  private static instance: AchievementEngine;
  private healthService: HealthDataService;

  private constructor() {
    this.healthService = HealthDataService.getInstance();
  }

  static getInstance(): AchievementEngine {
    if (!AchievementEngine.instance) {
      AchievementEngine.instance = new AchievementEngine();
    }
    return AchievementEngine.instance;
  }

  /**
   * Get all available achievement rules
   */
  getAllRules(): AchievementRule[] {
    return ACHIEVEMENT_RULES;
  }

  /**
   * Calculate progress for a specific badge
   */
  async calculateBadgeProgress(
    userId: string,
    rule: AchievementRule
  ): Promise<BadgeProgress> {
    console.log(`🎯 [AchievementEngine] Calculating progress for: ${rule.id} (${rule.name})`);
    
    try {
      // Check if already earned
      const earned = await this.isBadgeEarned(userId, rule.id);
      if (earned) {
        console.log(`✅ [AchievementEngine] ${rule.id} already earned in database`);
        return {
          badgeId: rule.id,
          earned: true,
          progress: 1,
        };
      }

      // Calculate progress based on rule type
      let progress = 0;
      let currentValue = 0;
      let targetValue = rule.threshold;

      switch (rule.type) {
        case 'streak':
          progress = await this.calculateStreakProgress(userId, rule);
          currentValue = Math.round(progress * rule.threshold);
          break;
        case 'single_day':
          progress = await this.calculateSingleDayProgress(userId, rule);
          currentValue = progress >= 1 ? rule.threshold : 0;
          break;
        case 'total_days':
          progress = await this.calculateTotalDaysProgress(userId, rule);
          currentValue = Math.round(progress * rule.threshold);
          break;
        case 'life_score_streak':
          progress = await this.calculateLifeScoreStreakProgress(userId, rule);
          currentValue = Math.round(progress * rule.threshold);
          break;
      }

      const finalProgress = Math.max(0, Math.min(1, progress));
      const isEarned = finalProgress >= 1;
      
      console.log(`📊 [AchievementEngine] ${rule.id} Results:`);
      console.log(`   - Type: ${rule.type}`);
      console.log(`   - Current Value: ${currentValue}`);
      console.log(`   - Target Value: ${targetValue}`);
      console.log(`   - Progress: ${finalProgress.toFixed(4)} (${(finalProgress * 100).toFixed(2)}%)`);
      console.log(`   - Status: ${isEarned ? '✅ EARNED' : currentValue > 0 ? '🔄 IN_PROGRESS' : '🔒 LOCKED'}`);

      return {
        badgeId: rule.id,
        earned: isEarned,
        progress: finalProgress,
        currentValue,
        targetValue,
      };
    } catch (error) {
      console.error(`❌ [AchievementEngine] Error calculating progress for ${rule.id}:`, error);
      return {
        badgeId: rule.id,
        earned: false,
        progress: 0,
      };
    }
  }

  /**
   * Check if badge is already earned
   */
  private async isBadgeEarned(userId: string, badgeId: string): Promise<boolean> {
    try {
      // Get badge ID from database
      const { data: badge } = await supabase
        .from('badges')
        .select('id')
        .eq('name', badgeId)
        .single();

      if (!badge) return false;

      const { data } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', badge.id)
        .single();

      return !!data;
    } catch {
      return false;
    }
  }

  /**
   * Calculate streak progress (e.g., 7 days hydration in a row)
   */
  private async calculateStreakProgress(
    userId: string,
    rule: AchievementRule
  ): Promise<number> {
    const period = rule.period || 30; // Default 30-day lookback
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    const startDateStr = startDate.toISOString().split('T')[0];

    console.log(`📊 [AchievementEngine] Streak calculation for ${rule.id}:`);
    console.log(`   - Period: ${period} days`);
    console.log(`   - Date range: ${startDateStr} to ${endDate}`);
    console.log(`   - Metric: ${rule.metric}`);
    console.log(`   - Threshold: ${rule.threshold} days`);
    if (rule.id === 'early_bird') {
      console.log(`   - ⚠️ Using fixed 8-hour threshold (not user's target)`);
    }

    try {
      // Query metrics from database
      const { data: metrics, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDateStr)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        console.error(`❌ [AchievementEngine] Database error:`, error);
        return 0;
      }

      if (!metrics || metrics.length === 0) {
        console.log(`⚠️ [AchievementEngine] No metrics found in date range`);
        return 0;
      }

      console.log(`   - Metrics found: ${metrics.length} days`);

      let currentStreak = 0;
      let maxStreak = 0;
      const streakDetails: Array<{ date: string; met: boolean }> = [];

      // Metrics are already sorted descending by date
      for (const metric of metrics) {
        const metTarget = this.checkMetricTarget(metric, rule.metric!, rule);
        streakDetails.push({ date: metric.date, met: metTarget });
        
        if (metTarget) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }

      const progress = Math.min(1, maxStreak / rule.threshold);
      
      console.log(`   - Max streak: ${maxStreak} days`);
      console.log(`   - Progress: ${progress.toFixed(4)} (${maxStreak}/${rule.threshold})`);
      console.log(`   - Recent streak details (last 7 days):`, 
        streakDetails.slice(0, 7).map(s => `${s.date}: ${s.met ? '✅' : '❌'}`).join(', '));

      return progress;
    } catch (error) {
      console.error('❌ [AchievementEngine] Error calculating streak progress:', error);
      return 0;
    }
  }

  /**
   * Calculate single day achievement progress
   */
  private async calculateSingleDayProgress(
    userId: string,
    rule: AchievementRule
  ): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    console.log(`📊 [AchievementEngine] Single day calculation for ${rule.id}:`);
    console.log(`   - Date: ${today}`);
    console.log(`   - Metric: ${rule.metric}`);
    console.log(`   - Threshold: ${rule.threshold}`);

    try {
      if (rule.metric === 'all_targets') {
        // Check if user hit all targets today
        const metrics = await this.healthService.getMetricsByDate(userId, today);
        
        if (!metrics) {
          console.log(`⚠️ [AchievementEngine] No metrics found for today`);
          return 0;
        }

        const stepsMet = metrics.steps_actual >= metrics.steps_target;
        const waterMet = metrics.water_oz_actual >= metrics.water_oz_target;
        const sleepMet = metrics.sleep_hr_actual >= metrics.sleep_hr_target;
        const moodMet = metrics.mood_checkins_actual >= metrics.mood_checkins_target;

        console.log(`   - Steps: ${metrics.steps_actual}/${metrics.steps_target} ${stepsMet ? '✅' : '❌'}`);
        console.log(`   - Water: ${metrics.water_oz_actual}/${metrics.water_oz_target} ${waterMet ? '✅' : '❌'}`);
        console.log(`   - Sleep: ${metrics.sleep_hr_actual}/${metrics.sleep_hr_target} ${sleepMet ? '✅' : '❌'}`);
        console.log(`   - Mood: ${metrics.mood_checkins_actual}/${metrics.mood_checkins_target} ${moodMet ? '✅' : '❌'}`);

        const allMet = stepsMet && waterMet && sleepMet && moodMet;
        console.log(`   - All targets met: ${allMet ? '✅' : '❌'}`);
        
        return allMet ? 1 : 0;
      } else {
        // Check specific metric threshold
        const metrics = await this.healthService.getMetricsByDate(userId, today);
        
        if (!metrics) {
          console.log(`⚠️ [AchievementEngine] No metrics found for today`);
          return 0;
        }

        const value = this.getMetricValue(metrics, rule.metric!);
        const progress = value >= rule.threshold ? 1 : value / rule.threshold;
        
        console.log(`   - Value: ${value}`);
        console.log(`   - Progress: ${progress.toFixed(4)} (${value >= rule.threshold ? 'EARNED' : `${value}/${rule.threshold}`})`);
        
        return progress;
      }
    } catch (error) {
      console.error('❌ [AchievementEngine] Error calculating single day progress:', error);
      return 0;
    }
  }

  /**
   * Calculate total days progress
   */
  private async calculateTotalDaysProgress(
    userId: string,
    rule: AchievementRule
  ): Promise<number> {
    console.log(`📊 [AchievementEngine] Total days calculation for ${rule.id}:`);
    console.log(`   - Threshold: ${rule.threshold} days`);

    try {
      const { data, error } = await supabase
        .from('daily_metrics')
        .select('date')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error(`❌ [AchievementEngine] Database error:`, error);
        return 0;
      }

      if (!data) {
        console.log(`⚠️ [AchievementEngine] No metrics found`);
        return 0;
      }

      const totalDays = new Set(data.map((m) => m.date)).size;
      const progress = Math.min(1, totalDays / rule.threshold);
      
      console.log(`   - Total unique days: ${totalDays}`);
      console.log(`   - Progress: ${progress.toFixed(4)} (${totalDays}/${rule.threshold})`);
      
      return progress;
    } catch (error) {
      console.error('❌ [AchievementEngine] Error calculating total days progress:', error);
      return 0;
    }
  }

  /**
   * Calculate Life Score streak progress
   */
  private async calculateLifeScoreStreakProgress(
    userId: string,
    rule: AchievementRule
  ): Promise<number> {
    const period = rule.period || 30;
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    const startDateStr = startDate.toISOString().split('T')[0];

    console.log(`📊 [AchievementEngine] Life Score streak calculation for ${rule.id}:`);
    console.log(`   - Period: ${period} days`);
    console.log(`   - Date range: ${startDateStr} to ${endDate}`);
    console.log(`   - Threshold: ${rule.threshold} days at 80%+ Life Score`);

    try {
      // Query metrics from database
      const { data: metrics, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDateStr)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        console.error(`❌ [AchievementEngine] Database error:`, error);
        return 0;
      }

      if (!metrics || metrics.length === 0) {
        console.log(`⚠️ [AchievementEngine] No metrics found in date range`);
        return 0;
      }

      console.log(`   - Metrics found: ${metrics.length} days`);

      let currentStreak = 0;
      let maxStreak = 0;
      const lifeScoreDetails: Array<{ date: string; score: number; met: boolean }> = [];

      // Metrics are already sorted descending by date
      for (const metric of metrics) {
        const lifeScore = this.calculateLifeScore(metric);
        const metThreshold = lifeScore >= 80;
        lifeScoreDetails.push({ date: metric.date, score: lifeScore, met: metThreshold });
        
        if (metThreshold) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }

      const progress = Math.min(1, maxStreak / rule.threshold);
      
      console.log(`   - Max streak: ${maxStreak} days`);
      console.log(`   - Progress: ${progress.toFixed(4)} (${maxStreak}/${rule.threshold})`);
      console.log(`   - Recent Life Scores (last 7 days):`, 
        lifeScoreDetails.slice(0, 7).map(s => 
          `${s.date}: ${s.score.toFixed(1)}% ${s.met ? '✅' : '❌'}`
        ).join(', '));

      return progress;
    } catch (error) {
      console.error('❌ [AchievementEngine] Error calculating Life Score streak:', error);
      return 0;
    }
  }

  /**
   * Check if metric met target
   * Note: Early Bird uses fixed 8-hour threshold, not user's target
   */
  private checkMetricTarget(metric: any, metricType: string, rule?: AchievementRule): boolean {
    switch (metricType) {
      case 'hydration':
        return metric.water_oz_actual >= metric.water_oz_target;
      case 'sleep':
        // Early Bird achievement requires fixed 8+ hours, not user's target
        if (rule?.id === 'early_bird') {
          return metric.sleep_hr_actual >= 8.0;
        }
        return metric.sleep_hr_actual >= metric.sleep_hr_target;
      case 'steps':
        return metric.steps_actual >= metric.steps_target;
      default:
        return false;
    }
  }

  /**
   * Get metric value
   */
  private getMetricValue(metric: any, metricType: string): number {
    switch (metricType) {
      case 'hydration':
        return metric.water_oz_actual || 0;
      case 'sleep':
        return metric.sleep_hr_actual || 0;
      case 'steps':
        return metric.steps_actual || 0;
      default:
        return 0;
    }
  }

  /**
   * Calculate Life Score from metrics
   */
  private calculateLifeScore(metric: any): number {
    const stepsPct = metric.steps_target > 0 ? metric.steps_actual / metric.steps_target : 0;
    const waterPct = metric.water_oz_target > 0 ? metric.water_oz_actual / metric.water_oz_target : 0;
    const sleepPct = metric.sleep_hr_target > 0 ? metric.sleep_hr_actual / metric.sleep_hr_target : 0;
    const moodPct = metric.mood_checkins_target > 0 ? metric.mood_checkins_actual / metric.mood_checkins_target : 0;

    const average = (stepsPct + waterPct + sleepPct + moodPct) / 4;
    return Math.min(100, average * 100);
  }
}

export default AchievementEngine;

