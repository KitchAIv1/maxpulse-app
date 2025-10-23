// Step Tracking Manager Component
// Handles step tracking initialization and integration with UI

import React, { useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { useStepTrackingStore, useStepProgress, useStepTrackingStatus } from '../stores/stepTrackingStore';
import { useAppStore } from '../stores/appStore';
import StepTrackingService from '../services/StepTrackingService';

interface StepTrackingManagerProps {
  children: React.ReactNode;
}

export const StepTrackingManager: React.FC<StepTrackingManagerProps> = ({ children }) => {
  const {
    initializeTracking,
    requestPermissions,
    startTracking,
    syncSteps,
    clearError,
  } = useStepTrackingStore();

  const { user, updateSteps, selectedDate } = useAppStore();
  const { steps, target } = useStepProgress();
  const { status, permissions, isTracking, lastError, isAvailable, canStart } = useStepTrackingStatus();
  
  const stepTrackingService = StepTrackingService.getInstance();

  // Set user ID when user is available
  useEffect(() => {
    if (user?.id) {
      stepTrackingService.setUserId(user.id);
    }
  }, [user?.id, stepTrackingService]);

  // Initialize step tracking on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing step tracking...');
        
        // Initialize with custom config
        await initializeTracking({
          liveUpdateInterval: 2000, // 2 seconds
          dailyCutoffHour: 22, // 10 PM
          enableLiveUpdates: true,
          enableBackgroundTracking: true,
        });

        console.log('Step tracking initialized successfully');
      } catch (error) {
        console.error('Failed to initialize step tracking:', error);
      }
    };

    initialize();
  }, [initializeTracking]);

  // Sync steps with main app store (including cached data)
  useEffect(() => {
    // Always sync steps, even if 0 (to clear stale data)
    // But prioritize non-zero values to avoid overwriting real data with zeros
    if (steps >= 0) {
      console.log(`🔄 Syncing steps to main app store: ${steps}`);
      updateSteps(steps);
    }
  }, [steps, updateSteps]);

  // Handle permission requests
  const handleRequestPermissions = useCallback(async () => {
    try {
      await requestPermissions();
      console.log('✅ Permissions granted');
    } catch (error) {
      console.error('⚠️ Permission request failed:', error);
      // Silently fail - don't block the app with alerts
      // User can still use other features
    }
  }, [requestPermissions]);

  // Auto-request permissions and start tracking automatically after sign-in
  useEffect(() => {
    if (!user?.id) return; // Only proceed if user is signed in

    const autoInitializeTracking = async () => {
      try {
        // Check if permissions are needed
        let needsPermissions = false;
        
        if (Platform.OS === 'ios') {
          needsPermissions = permissions.motion === 'not-determined';
        } else if (Platform.OS === 'android') {
          needsPermissions = permissions.activityRecognition === 'not-determined';
        }

        // Request permissions if needed
        if (needsPermissions) {
          console.log('🔐 Requesting step tracking permissions automatically...');
          await handleRequestPermissions();
        }

        // Auto-start tracking if not already tracking
        if (canStart && !isTracking) {
          console.log('🏃 Auto-starting step tracking (background mode)...');
          await startTracking();
          console.log('✅ Step tracking started automatically in background');
        }
      } catch (error) {
        console.warn('⚠️ Auto-initialization failed (non-critical):', error);
        // Don't block the app if step tracking fails
      }
    };

    // Start tracking automatically after a short delay (to avoid overwhelming on first launch)
    const timer = setTimeout(autoInitializeTracking, 1500);
    return () => clearTimeout(timer);
  }, [user?.id, permissions, canStart, isTracking, handleRequestPermissions, startTracking]);

  // Handle daily reset when date changes
  useEffect(() => {
    const checkForNewDay = async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastResetDate = await import('@react-native-async-storage/async-storage')
        .then(AsyncStorage => AsyncStorage.default.getItem('@lastStepResetDate'))
        .catch(() => null);

      if (lastResetDate !== today) {
        console.log('🆕 New day detected, resetting step tracking');
        await stepTrackingService.resetForNewDay();
        
        // Save the reset date
        import('@react-native-async-storage/async-storage')
          .then(AsyncStorage => AsyncStorage.default.setItem('@lastStepResetDate', today))
          .catch(console.warn);
      }
    };

    checkForNewDay();
  }, [selectedDate, stepTrackingService]);

  // Periodic sync with health platform
  useEffect(() => {
    if (!isAvailable) return;

    const syncInterval = setInterval(async () => {
      try {
        await syncSteps();
      } catch (error) {
        console.error('Periodic sync failed:', error);
      }
    }, 5 * 60 * 1000); // Sync every 5 minutes

    return () => clearInterval(syncInterval);
  }, [isAvailable, syncSteps]);

  // Handle errors
  useEffect(() => {
    if (lastError) {
      console.error('Step tracking error:', lastError);
      
      // Auto-clear error after 10 seconds
      const timer = setTimeout(() => {
        clearError();
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [lastError, clearError]);

  // Log status changes for debugging
  useEffect(() => {
    console.log('Step tracking status:', {
      isAvailable,
      isTracking,
      canStart,
      steps,
      target,
      permissions: Platform.OS === 'ios' 
        ? { motion: permissions.motion, healthKit: permissions.healthKit }
        : { activityRecognition: permissions.activityRecognition, googleFit: permissions.googleFit }
    });
  }, [isAvailable, isTracking, canStart, steps, target, permissions]);

  return <>{children}</>;
};

export default StepTrackingManager;
