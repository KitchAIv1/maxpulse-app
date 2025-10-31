// App Store Selectors
// Custom hooks for computed values from app store

import { useEffect } from 'react';
import { useAppStore } from '../stores/appStore';

export const useLifeScore = (databaseTargets?: { steps: number; waterOz: number; sleepHr: number }) => {
  const user = useAppStore(s => s.user);
  const currentState = useAppStore(s => s.currentState);
  const targets = useAppStore(s => s.targets);
  const moodCheckInFrequency = useAppStore(s => s.moodCheckInFrequency);
  const assessmentBasedLifeScore = useAppStore(s => s.assessmentBasedLifeScore);
  const lastRefresh = useAppStore(s => s.lastLifeScoreRefresh);
  const refreshLifeScore = useAppStore(s => s.refreshLifeScore);
  
  // Use database targets if provided, otherwise fall back to app store targets
  const activeTargets = databaseTargets || targets;
  
  const stepsPct = currentState.steps / activeTargets.steps;
  const waterPct = currentState.waterOz / activeTargets.waterOz;
  const sleepPct = currentState.sleepHr / activeTargets.sleepHr;
  const moodCheckInPct = moodCheckInFrequency.total_checkins / moodCheckInFrequency.target_checkins;
  
  // Fetch assessment-based Life Score on mount if not cached
  useEffect(() => {
    if (user && !assessmentBasedLifeScore && !lastRefresh) {
      console.log('📊 Initializing Life Score on mount');
      refreshLifeScore();
    }
  }, [user?.id]); // Only when userId changes, NOT on every render
  
  // Use assessment-based score if available, otherwise fallback to current calculation
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
  const fallbackScore = Math.round(
    (clamp01(stepsPct) * 0.25 + 
     clamp01(waterPct) * 0.25 + 
     clamp01(sleepPct) * 0.25 + 
     clamp01(moodCheckInPct) * 0.25) * 100
  );
  
  return {
    score: assessmentBasedLifeScore ?? fallbackScore,
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
