// Mood Check-In Modal Types
// Focused types for the mood check-in modal component

import { MoodLevel, MoodCheckIn } from './index';

export interface MoodCheckInModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (checkIn: Omit<MoodCheckIn, 'id' | 'user_id' | 'timestamp'>) => void;
  healthContext?: {
    sleepHours?: number;
    hydrationOz?: number;
    stepsCount?: number;
  };
}

export interface MoodOption {
  level: MoodLevel;
  label: string;
  emoji: string;
  description: string;
}

export interface ContextualPrompt {
  id: string;
  question: string;
  context: string;
  suggestion?: string;
}
