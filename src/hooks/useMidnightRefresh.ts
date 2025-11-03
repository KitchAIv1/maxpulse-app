import { useEffect } from 'react';
import { getTodayDate } from '../utils';

/**
 * Hook to automatically refresh the app at midnight (date change)
 * Calculates time until next midnight and sets a timer to trigger a refresh
 * Auto-renews for the next day after firing
 */
export const useMidnightRefresh = (onMidnight: () => void) => {
  useEffect(() => {
    const setupMidnightTimer = () => {
      // 🧪 TESTING MODE: Fire in 10 seconds instead of waiting for midnight
      const TEST_MODE = false;
      const TEST_DELAY_MS = 10000; // 10 seconds
      
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0); // Set to midnight of next day
      
      const msUntilMidnight = TEST_MODE ? TEST_DELAY_MS : tomorrow.getTime() - now.getTime();
      
      if (TEST_MODE) {
        console.log(`🧪 TEST MODE: Midnight timer will fire in ${TEST_DELAY_MS / 1000} seconds`);
      } else {
        console.log(`⏰ Midnight timer set. Refreshing in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);
      }
      
      const timerId = setTimeout(() => {
        console.log('🌅 Midnight detected! Refreshing app for new day...');
        onMidnight();
        
        // Recursively set up timer for next midnight
        setupMidnightTimer();
      }, msUntilMidnight);
      
      return timerId;
    };
    
    const timerId = setupMidnightTimer();
    
    // Cleanup on unmount
    return () => {
      if (timerId) {
        clearTimeout(timerId);
        console.log('⏰ Midnight timer cleaned up');
      }
    };
  }, [onMidnight]);
};

