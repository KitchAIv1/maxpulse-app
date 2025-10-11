// App Store Selectors
// Custom hooks for computed values from app store

import { useAppStore } from '../stores/appStore';

export const useLifeScore = () => {
  const { currentState, targets, moodCheckInFrequency } = useAppStore();
  const stepsPct = currentState.steps / targets.steps;
  const waterPct = currentState.waterOz / targets.waterOz;
  const sleepPct = currentState.sleepHr / targets.sleepHr;
  const moodCheckInPct = moodCheckInFrequency.total_checkins / moodCheckInFrequency.target_checkins;
  
  // Import computeLifeScore here to avoid circular dependency
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
  const s = clamp01(stepsPct);
  const w = clamp01(waterPct);
  const sl = clamp01(sleepPct);
  const m = clamp01(moodCheckInPct);
  const score = s * 0.25 + w * 0.25 + sl * 0.25 + m * 0.25;
  
  return {
    score: Math.round(score * 100),
    stepsPct,
    waterPct,
    sleepPct,
    moodCheckInPct,
  };
};

export const useNextBestAction = () => {
  const { score, stepsPct, waterPct, sleepPct, moodCheckInPct } = useLifeScore();
  
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
    {
      key: 'Mood Check-In' as const,
      pct: moodCheckInPct,
      tip: 'Take a moment to reflect on your emotional state.',
    },
  ];

  return actions.sort((a, b) => a.pct - b.pct)[0];
};
