// Step Tracking Manager Component
// Handles step tracking initialization and integration with UI

import React, { useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { useStepTrackingStore, useStepProgress, useStepTrackingStatus } from '../stores/stepTrackingStore';
import { useAppStore } from '../stores/appStore';

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

  const { updateSteps } = useAppStore();
  const { steps, target } = useStepProgress();
  const { status, permissions, isTracking, lastError, isAvailable, canStart } = useStepTrackingStatus();

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

  // Sync steps with main app store
  useEffect(() => {
    if (steps > 0) {
      updateSteps(steps);
    }
  }, [steps, updateSteps]);

  // Handle permission requests
  const handleRequestPermissions = useCallback(async () => {
    try {
      await requestPermissions();
      
      // After permissions are granted, try to start tracking
      if (canStart) {
        await startTracking();
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      Alert.alert(
        'Permission Required',
        'Step tracking requires motion permissions to work properly. Please enable them in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {
            // Open app settings - would need react-native-permissions openSettings
          }},
        ]
      );
    }
  }, [requestPermissions, canStart, startTracking]);

  // Auto-request permissions if not determined
  useEffect(() => {
    const autoRequestPermissions = async () => {
      if (Platform.OS === 'ios') {
        if (permissions.motion === 'not-determined') {
          await handleRequestPermissions();
        }
      } else if (Platform.OS === 'android') {
        if (permissions.activityRecognition === 'not-determined') {
          await handleRequestPermissions();
        }
      }
    };

    // Delay auto-request to avoid overwhelming user on first launch
    const timer = setTimeout(autoRequestPermissions, 2000);
    return () => clearTimeout(timer);
  }, [permissions, handleRequestPermissions]);

  // Auto-start tracking when permissions are available
  useEffect(() => {
    const autoStartTracking = async () => {
      if (canStart && !isTracking) {
        try {
          await startTracking();
          console.log('Auto-started step tracking');
        } catch (error) {
          console.error('Auto-start tracking failed:', error);
        }
      }
    };

    autoStartTracking();
  }, [canStart, isTracking, startTracking]);

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
