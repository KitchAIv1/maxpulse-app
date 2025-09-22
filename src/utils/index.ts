// TriHabit Utility Functions
// Core algorithms and helpers from PRD

/**
 * Clamp a number between 0 and 1
 */
export const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));

/**
 * Compute Life Score from step, water, and sleep percentages
 * Uses weights from PRD: steps 33%, water 34%, sleep 33%
 */
export function computeLifeScore(
  stepsPct: number,
  waterPct: number,
  sleepPct: number
): number {
  const s = clamp01(stepsPct);
  const w = clamp01(waterPct);
  const sl = clamp01(sleepPct);
  const raw = s * 0.33 + w * 0.34 + sl * 0.33;
  return Math.round(raw * 100);
}

/**
 * Helper to compute strokeDasharray for a circular progress ring
 * Used for React Native SVG circles
 */
export function ringDasharray(percent: number, r: number): string {
  const clamped = clamp01(percent);
  const C = 2 * Math.PI * r;
  return `${C * clamped} ${C * (1 - clamped)}`;
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return formatDate(new Date());
}

/**
 * Check if it's past the cutoff hour for points (anti-gaming)
 */
export function isPastCutoff(cutoffHour: number): boolean {
  const now = new Date();
  return now.getHours() >= cutoffHour;
}

/**
 * Calculate points for a metric based on percentage and config
 */
export function calculatePoints(
  percentage: number,
  maxPoints: number,
  cutoffHour?: number
): number {
  if (cutoffHour && isPastCutoff(cutoffHour)) {
    return 0;
  }
  
  const clamped = clamp01(percentage);
  return Math.round(clamped * maxPoints);
}

/**
 * Calculate sleep points based on tiers from config
 */
export function calculateSleepPoints(
  percentage: number,
  tiers: Array<[number, number, number]>
): number {
  for (const [min, max, points] of tiers) {
    if (percentage >= min && percentage <= max) {
      return points;
    }
  }
  return 0;
}

/**
 * Determine next best action based on current percentages
 */
export function getNextBestAction(
  stepsPct: number,
  waterPct: number,
  sleepPct: number
): { key: 'Steps' | 'Hydration' | 'Sleep'; pct: number; tip: string } {
  const actions = [
    {
      key: 'Steps' as const,
      pct: stepsPct,
      tip: 'Take a 10‑min brisk walk (~1k steps).',
    },
    {
      key: 'Hydration' as const,
      pct: waterPct,
      tip: 'Drink a glass of water now (8oz).',
    },
    {
      key: 'Sleep' as const,
      pct: sleepPct,
      tip: 'Plan a wind‑down alarm 30 min earlier tonight.',
    },
  ];

  // Return the action with the lowest percentage (most needed)
  return actions.sort((a, b) => a.pct - b.pct)[0];
}

/**
 * Generate personalized targets based on user profile
 * This is a simplified version - in production would use more sophisticated logic
 */
export function generateTargets(profile?: {
  age?: number;
  weight?: number;
  height?: number;
  activityLevel?: 'low' | 'moderate' | 'high';
  climate?: 'cold' | 'moderate' | 'hot';
}): { steps: number; waterOz: number; sleepHr: number } {
  // Default targets from PRD
  let steps = 8000;
  let waterOz = 80;
  let sleepHr = 8;

  if (profile) {
    // Adjust based on activity level
    if (profile.activityLevel === 'high') {
      steps = Math.min(12000, steps + 2000);
    } else if (profile.activityLevel === 'low') {
      steps = Math.max(6000, steps - 1000);
    }

    // Adjust water based on weight and climate
    if (profile.weight) {
      waterOz = Math.round(profile.weight * 0.5); // 0.5 oz per pound baseline
      if (profile.climate === 'hot') {
        waterOz += 16; // Extra 16oz for hot climate
      }
    }

    // Adjust sleep based on age
    if (profile.age) {
      if (profile.age < 25) {
        sleepHr = 8.5;
      } else if (profile.age > 65) {
        sleepHr = 7.5;
      }
    }
  }

  return { steps, waterOz, sleepHr };
}

/**
 * Format time duration in hours to human readable string
 */
export function formatSleepDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  if (m === 0) {
    return `${h}h`;
  }
  return `${h}h ${m}m`;
}

/**
 * Calculate streak status based on daily completion rates
 */
export function calculateStreak(
  dailyCompletions: Array<{ date: string; completed: boolean }>,
  threshold: number = 0.5
): { current: number; longest: number } {
  let current = 0;
  let longest = 0;
  let temp = 0;

  // Sort by date descending (most recent first)
  const sorted = dailyCompletions.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate current streak from most recent day
  for (const day of sorted) {
    if (day.completed) {
      current++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  for (const day of sorted.reverse()) {
    if (day.completed) {
      temp++;
      longest = Math.max(longest, temp);
    } else {
      temp = 0;
    }
  }

  return { current, longest };
}
