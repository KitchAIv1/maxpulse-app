// useNotificationInitialization Hook
// Optional: Request notification permissions on first app launch
// Single responsibility: One-time notification permission request

import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../../services/NotificationService';

interface UseNotificationInitializationOptions {
  /**
   * Request permission automatically on mount
   * Default: false (let user enable via toggle)
   */
  autoRequest?: boolean;
  
  /**
   * Only request if user hasn't been asked before
   * Default: true
   */
  onlyIfNotAsked?: boolean;
}

/**
 * Hook to optionally request notification permissions on app initialization
 * Use this if you want to proactively request permissions (e.g., on first launch)
 * Otherwise, users can enable via Profile > Preferences toggle
 */
export const useNotificationInitialization = (
  options: UseNotificationInitializationOptions = {}
) => {
  const { autoRequest = false, onlyIfNotAsked = true } = options;
  const hasRequested = useRef(false);
  const ASKED_KEY = '@notification_permission_asked';

  useEffect(() => {
    if (!autoRequest || hasRequested.current) return;

    const initializeNotifications = async () => {
      try {
        // Check if we've asked before
        if (onlyIfNotAsked) {
          const hasAsked = await AsyncStorage.getItem(ASKED_KEY);
          if (hasAsked === 'true') {
            console.log('📱 Notification permission already asked before, skipping auto-request');
            return;
          }
        }

        // Check current status
        const service = NotificationService.getInstance();
        const status = await service.checkPermissionStatus();

        // Only request if undetermined
        if (status.status === 'undetermined') {
          console.log('🔔 Auto-requesting notification permissions on initialization...');
          const granted = await service.requestPermission();
          
          // Mark as asked
          await AsyncStorage.setItem(ASKED_KEY, 'true');
          
          if (granted) {
            console.log('✅ Notification permissions granted on initialization');
          } else {
            console.log('ℹ️ Notification permissions not granted, user can enable later');
          }
        } else {
          // Already determined, mark as asked
          await AsyncStorage.setItem(ASKED_KEY, 'true');
        }

        hasRequested.current = true;
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
        // Don't block app initialization if this fails
      }
    };

    initializeNotifications();
  }, [autoRequest, onlyIfNotAsked]);
};

