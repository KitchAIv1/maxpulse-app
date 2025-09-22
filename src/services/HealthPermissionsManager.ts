// Health Permissions Manager
// Handles iOS HealthKit and Android permissions for step tracking

import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { HealthPermissions, PermissionStatus } from '../types/health';

class HealthPermissionsManager {
  private static instance: HealthPermissionsManager;

  public static getInstance(): HealthPermissionsManager {
    if (!HealthPermissionsManager.instance) {
      HealthPermissionsManager.instance = new HealthPermissionsManager();
    }
    return HealthPermissionsManager.instance;
  }

  /**
   * Map Expo permission status to our internal status
   */
  private mapPermissionStatus(status: any): PermissionStatus {
    if (!status) return 'not-determined';
    
    switch (status.status) {
      case 'granted':
        return 'authorized';
      case 'denied':
        return 'denied';
      case 'undetermined':
        return 'not-determined';
      default:
        return 'not-determined';
    }
  }

  /**
   * Check all health-related permissions
   */
  async checkAllPermissions(): Promise<HealthPermissions> {
    const permissions: HealthPermissions = {
      motion: 'not-determined',
      healthKit: 'not-determined',
      activityRecognition: 'not-determined',
      googleFit: 'not-determined',
      backgroundRefresh: 'not-determined',
    };

    try {
      if (Platform.OS === 'ios') {
        // For Expo Go, we'll simulate permission checks
        // In a real dev build, these would be actual permission checks
        permissions.motion = 'authorized'; // Assume granted for Expo Go
        permissions.healthKit = await this.checkHealthKitPermission();
        permissions.backgroundRefresh = 'authorized';
      } else if (Platform.OS === 'android') {
        // For Expo Go, simulate Android permissions
        permissions.activityRecognition = 'authorized'; // Assume granted for Expo Go
        permissions.googleFit = await this.checkGoogleFitPermission();
        permissions.backgroundRefresh = 'authorized';
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }

    return permissions;
  }

  /**
   * Request all necessary permissions
   */
  async requestAllPermissions(): Promise<HealthPermissions> {
    const permissions: HealthPermissions = {
      motion: 'not-determined',
      healthKit: 'not-determined',
      activityRecognition: 'not-determined',
      googleFit: 'not-determined',
      backgroundRefresh: 'not-determined',
    };

    try {
      if (Platform.OS === 'ios') {
        // For Expo Go, simulate permission requests
        permissions.motion = 'authorized';
        permissions.healthKit = await this.requestHealthKitPermission();
        permissions.backgroundRefresh = 'authorized';
      } else if (Platform.OS === 'android') {
        // For Expo Go, simulate permission requests
        permissions.activityRecognition = 'authorized';
        permissions.googleFit = await this.requestGoogleFitPermission();
        permissions.backgroundRefresh = 'authorized';
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }

    return permissions;
  }

  /**
   * Check HealthKit permission status (iOS only)
   */
  private async checkHealthKitPermission(): Promise<PermissionStatus> {
    if (Platform.OS !== 'ios') return 'not-determined';

    try {
      // For Expo Go, react-native-health is not available
      // In a real dev build, this would check actual HealthKit permissions
      console.log('HealthKit check skipped - not available in Expo Go');
      return 'not-determined'; // Simulate not determined for Expo Go
    } catch (error) {
      console.error('Error checking HealthKit permission:', error);
      return 'not-determined';
    }
  }

  /**
   * Request HealthKit permissions (iOS only)
   */
  private async requestHealthKitPermission(): Promise<PermissionStatus> {
    if (Platform.OS !== 'ios') return 'not-determined';

    try {
      // For Expo Go, react-native-health is not available
      // In a real dev build, this would request actual HealthKit permissions
      console.log('HealthKit request skipped - not available in Expo Go');
      return 'authorized'; // Simulate authorized for Expo Go testing
    } catch (error) {
      console.error('Error requesting HealthKit permission:', error);
      return 'denied';
    }
  }

  /**
   * Check Google Fit permission status (Android only)
   */
  private async checkGoogleFitPermission(): Promise<PermissionStatus> {
    if (Platform.OS !== 'android') return 'not-determined';

    try {
      // For Expo Go, react-native-google-fit is not available
      // In a real dev build, this would check actual Google Fit permissions
      console.log('Google Fit check skipped - not available in Expo Go');
      return 'not-determined'; // Simulate not determined for Expo Go
    } catch (error) {
      console.error('Error checking Google Fit permission:', error);
      return 'not-determined';
    }
  }

  /**
   * Request Google Fit permissions (Android only)
   */
  private async requestGoogleFitPermission(): Promise<PermissionStatus> {
    if (Platform.OS !== 'android') return 'not-determined';

    try {
      // For Expo Go, react-native-google-fit is not available
      // In a real dev build, this would request actual Google Fit permissions
      console.log('Google Fit request skipped - not available in Expo Go');
      return 'authorized'; // Simulate authorized for Expo Go testing
    } catch (error) {
      console.error('Error requesting Google Fit permission:', error);
      return 'denied';
    }
  }

  /**
   * Check if step tracking is available on this device
   */
  async isStepTrackingAvailable(): Promise<boolean> {
    try {
      // For Expo Go, simulate step tracking availability
      // In a real dev build, this would check actual hardware/API availability
      console.log('Step tracking availability check - simulated for Expo Go');
      return true; // Always available in simulation mode
    } catch (error) {
      console.error('Error checking step tracking availability:', error);
      return false;
    }
  }

  /**
   * Get user-friendly permission status message
   */
  getPermissionStatusMessage(permissions: HealthPermissions): string {
    if (Platform.OS === 'ios') {
      if (permissions.motion === 'denied') {
        return 'Motion permission is required for step tracking. Please enable it in Settings.';
      }
      if (permissions.healthKit === 'denied') {
        return 'HealthKit access is needed for accurate step counting. Please enable it in Settings.';
      }
      if (permissions.motion === 'authorized' && permissions.healthKit === 'authorized') {
        return 'All permissions granted. Step tracking is active.';
      }
    } else if (Platform.OS === 'android') {
      if (permissions.activityRecognition === 'denied') {
        return 'Activity recognition permission is required for step tracking. Please enable it in Settings.';
      }
      if (permissions.activityRecognition === 'authorized') {
        return 'Step tracking is active.';
      }
    }
    
    return 'Some permissions are needed for step tracking.';
  }

  /**
   * Open device settings for the app
   */
  async openAppSettings(): Promise<void> {
    try {
      // For Expo Go, we can't open settings directly
      console.log('Please enable permissions in device Settings > TriHabit');
    } catch (error) {
      console.error('Error opening app settings:', error);
    }
  }
}

export default HealthPermissionsManager;
