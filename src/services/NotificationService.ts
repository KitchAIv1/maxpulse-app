// Notification Service
// Single responsibility: Manage iOS/Android notification permissions
// Reusable service for notification permission handling

import * as Notifications from 'expo-notifications';
import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined' | 'blocked';

interface NotificationPermissionState {
  status: NotificationPermissionStatus;
  canAskAgain: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private permissionCache: NotificationPermissionState | null = null;
  private readonly CACHE_KEY = '@notification_permission_cache';
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Check current notification permission status
   * @param forceRefresh - If true, bypass cache and fetch fresh status
   */
  async checkPermissionStatus(forceRefresh: boolean = false): Promise<NotificationPermissionState> {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh && this.permissionCache) {
        const cachedData = await AsyncStorage.getItem(this.CACHE_KEY);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const cacheAge = Date.now() - (parsed.timestamp || 0);
          if (cacheAge < this.CACHE_TTL) {
            return {
              status: parsed.status,
              canAskAgain: parsed.canAskAgain,
            };
          }
        }
      }

      // Fetch fresh status from system
      const { status, canAskAgain } = await Notifications.getPermissionsAsync();

      const permissionState: NotificationPermissionState = {
        status: this.mapExpoStatusToAppStatus(status),
        canAskAgain: canAskAgain ?? false,
      };

      // Cache the result
      this.permissionCache = permissionState;
      await AsyncStorage.setItem(
        this.CACHE_KEY,
        JSON.stringify({ ...permissionState, timestamp: Date.now() })
      );

      return permissionState;
    } catch (error) {
      console.error('❌ Error checking notification permissions:', error);
      return {
        status: 'undetermined',
        canAskAgain: true,
      };
    }
  }

  /**
   * Request notification permissions
   * Returns true if granted, false otherwise
   */
  async requestPermission(): Promise<boolean> {
    try {
      // Clear cache BEFORE checking to ensure fresh status
      this.clearCache();

      // Check current status first (without cache)
      const currentStatus = await this.checkPermissionStatus();

      // If already granted, return true
      if (currentStatus.status === 'granted') {
        return true;
      }

      // If blocked/denied and can't ask again, guide user to settings
      if ((currentStatus.status === 'denied' || currentStatus.status === 'blocked') && !currentStatus.canAskAgain) {
        this.showSettingsAlert();
        return false;
      }

      // Request permission
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: false,
        },
      });

      const granted = status === 'granted' || status === 'provisional';

      // Clear cache immediately after request to force fresh check
      this.clearCache();

      return granted;
    } catch (error) {
      console.error('❌ Error requesting notification permissions:', error);
      // Clear cache on error too
      this.clearCache();
      return false;
    }
  }

  /**
   * Open device settings for notification configuration
   */
  async openSettings(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('❌ Error opening settings:', error);
      Alert.alert(
        'Settings',
        'Please go to Settings > MaxPulse > Notifications to enable notifications.',
      );
    }
  }

  /**
   * Show alert guiding user to settings if permission is blocked
   */
  private showSettingsAlert(): void {
    Alert.alert(
      'Notifications Disabled',
      'To enable notifications, please go to Settings > MaxPulse > Notifications and turn on Allow Notifications.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => this.openSettings(),
        },
      ],
    );
  }

  /**
   * Map Expo notification status to app status
   */
  private mapExpoStatusToAppStatus(
    expoStatus: Notifications.PermissionStatus
  ): NotificationPermissionStatus {
    switch (expoStatus) {
      case Notifications.PermissionStatus.GRANTED:
        return 'granted';
      case Notifications.PermissionStatus.DENIED:
        return 'denied';
      case Notifications.PermissionStatus.UNDETERMINED:
        return 'undetermined';
      default:
        return 'undetermined';
    }
  }

  /**
   * Check if notifications are enabled (granted)
   */
  async isEnabled(): Promise<boolean> {
    const status = await this.checkPermissionStatus();
    return status.status === 'granted';
  }

  /**
   * Clear permission cache (useful after permission changes)
   */
  clearCache(): void {
    this.permissionCache = null;
    AsyncStorage.removeItem(this.CACHE_KEY).catch(() => {
      // Ignore errors
    });
  }
}

export default NotificationService;

