// Welcome Transition Hook
// Handles crossfade animation between welcome screen and dashboard

import { useRef, useState } from 'react';
import { Animated } from 'react-native';

export interface TransitionState {
  isTransitioning: boolean;
  welcomeOpacity: Animated.Value;
  dashboardOpacity: Animated.Value;
}

export interface TransitionActions {
  startTransition: (onComplete: () => void) => void;
  resetOpacityValues: () => void;
}

export const useWelcomeTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const welcomeOpacity = useRef(new Animated.Value(1)).current;
  const dashboardOpacity = useRef(new Animated.Value(0)).current;

  // Reset opacity values for fresh animation
  const resetOpacityValues = () => {
    welcomeOpacity.setValue(1);
    dashboardOpacity.setValue(0);
  };

  // Start crossfade transition
  const startTransition = (onComplete: () => void) => {
    console.log('🎬 Welcome screen completed, starting crossfade transition');
    setIsTransitioning(true);
    
    // Crossfade: welcome fades out while dashboard fades in
    Animated.parallel([
      Animated.timing(welcomeOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(dashboardOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After animation completes, clean up
      console.log('🎬 Crossfade animation completed, cleaning up');
      setIsTransitioning(false);
      onComplete();
    });
  };

  return {
    // State
    isTransitioning,
    welcomeOpacity,
    dashboardOpacity,
    // Actions
    startTransition,
    resetOpacityValues,
  };
};

