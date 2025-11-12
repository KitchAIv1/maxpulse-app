// useNotifications Hook
// Single responsibility: React hook for notification permission management
// Reusable hook for components that need notification state

import { useState, useEffect, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import NotificationService, { NotificationPermissionStatus } from '../../services/NotificationService';

interface UseNotificationsReturn {
  permissionStatus: NotificationPermissionStatus;
  isEnabled: boolean;
  canAskAgain: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  openSettings: () => Promise<void>;
  refreshPermission: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('undetermined');
  const [isEnabled, setIsEnabled] = useState(false);
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const service = NotificationService.getInstance();

  /**
   * Refresh permission status from system
   * @param forceRefresh - If true, bypass cache and fetch fresh status
   */
  const refreshPermission = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const state = await service.checkPermissionStatus(forceRefresh);
      const newIsEnabled = state.status === 'granted';
      
      // Update all state synchronously to ensure consistent state
      setPermissionStatus(state.status);
      setIsEnabled(newIsEnabled);
      setCanAskAgain(state.canAskAgain);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check notification permissions';
      setError(errorMessage);
      console.error('❌ Error refreshing notification permissions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  /**
   * Request notification permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const granted = await service.requestPermission();
      
      // Small delay to ensure iOS has updated the permission status
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Refresh status after request (force refresh to bypass cache)
      await refreshPermission(true);
      
      return granted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request notification permissions';
      setError(errorMessage);
      console.error('❌ Error requesting notification permissions:', err);
      // Still refresh even on error to get current state
      await refreshPermission();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [service, refreshPermission]);

  /**
   * Open device settings
   */
  const openSettings = useCallback(async () => {
    try {
      await service.openSettings();
      // Refresh permission after returning from settings (with delay and force refresh)
      // Use longer delay to ensure user has time to change settings
      setTimeout(() => {
        refreshPermission(true); // Force refresh to bypass cache
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open settings';
      setError(errorMessage);
      console.error('❌ Error opening settings:', err);
    }
  }, [service, refreshPermission]);

  /**
   * Initialize permission status on mount
   */
  useEffect(() => {
    refreshPermission();
  }, [refreshPermission]);

  /**
   * Refresh permission when app comes to foreground
   * (User might have changed settings while app was in background)
   */
  useEffect(() => {
    if (Platform.OS !== 'ios') return; // iOS only

    let appState = AppState.currentState;
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // Only refresh if app is transitioning from background/inactive to active
      // This prevents unnecessary refreshes on initial mount
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // Force refresh to bypass cache when returning from Settings
        // Use longer delay to ensure Settings changes have fully propagated
        setTimeout(() => {
          refreshPermission(true);
        }, 300);
      }
      appState = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [refreshPermission]);

  return {
    permissionStatus,
    isEnabled,
    canAskAgain,
    isLoading,
    error,
    requestPermission,
    openSettings,
    refreshPermission,
  };
};

