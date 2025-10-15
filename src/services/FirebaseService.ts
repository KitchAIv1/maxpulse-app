// Firebase Service
// Centralized Firebase Analytics, Performance, and Crashlytics wrapper
// Gracefully handles missing configuration

import { Platform } from 'react-native';

// Dynamic imports to handle missing Firebase config gracefully
let analytics: any = null;
let perf: any = null;
let crashlytics: any = null;
let isFirebaseAvailable = false;

// Initialize Firebase modules
const initializeFirebase = async () => {
  try {
    // Try to import Firebase modules
    const firebaseApp = await import('@react-native-firebase/app');
    
    // Check if Firebase is properly configured
    if (firebaseApp.default().apps.length === 0) {
      console.warn('🔥 Firebase: No apps configured. Please add GoogleService-Info.plist (iOS) or google-services.json (Android)');
      return false;
    }

    // Import analytics
    try {
      const analyticsModule = await import('@react-native-firebase/analytics');
      analytics = analyticsModule.default();
      console.log('🔥 Firebase Analytics initialized');
    } catch (error) {
      console.warn('🔥 Firebase Analytics not available:', error);
    }

    // Import performance monitoring
    try {
      const perfModule = await import('@react-native-firebase/perf');
      perf = perfModule.default();
      console.log('🔥 Firebase Performance Monitoring initialized');
    } catch (error) {
      console.warn('🔥 Firebase Performance Monitoring not available:', error);
    }

    // Import crashlytics
    try {
      const crashlyticsModule = await import('@react-native-firebase/crashlytics');
      crashlytics = crashlyticsModule.default();
      console.log('🔥 Firebase Crashlytics initialized');
    } catch (error) {
      console.warn('🔥 Firebase Crashlytics not available:', error);
    }

    isFirebaseAvailable = true;
    return true;
  } catch (error) {
    console.warn('🔥 Firebase: Not configured. Analytics will use fallback mode.', error);
    return false;
  }
};

// Initialize on module load
initializeFirebase();

/**
 * Firebase Analytics Service
 * Provides analytics tracking with graceful fallback
 */
class FirebaseService {
  private static instance: FirebaseService;
  private isEnabled: boolean = true;
  private eventQueue: Array<{ name: string; params?: any }> = [];

  private constructor() {
    this.checkAvailability();
  }

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  private async checkAvailability() {
    if (!isFirebaseAvailable) {
      console.log('🔥 Firebase: Running in fallback mode. Events will be logged only.');
      console.log('📖 To enable Firebase, see: docs/FIREBASE_SETUP.md');
    }
  }

  // ========================================
  // ANALYTICS METHODS
  // ========================================

  /**
   * Log a custom event
   */
  async logEvent(eventName: string, params?: Record<string, any>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      if (analytics) {
        await analytics.logEvent(eventName, params);
        console.log(`🔥 Analytics: ${eventName}`, params);
      } else {
        // Fallback: console log
        console.log(`📊 Analytics (Fallback): ${eventName}`, params);
        this.eventQueue.push({ name: eventName, params });
      }
    } catch (error) {
      console.error('🔥 Analytics: Failed to log event', eventName, error);
    }
  }

  /**
   * Log screen view
   */
  async logScreenView(screenName: string, screenClass?: string): Promise<void> {
    if (!this.isEnabled) return;

    try {
      if (analytics) {
        await analytics.logScreenView({
          screen_name: screenName,
          screen_class: screenClass || screenName,
        });
        console.log(`🔥 Screen View: ${screenName}`);
      } else {
        console.log(`📊 Screen View (Fallback): ${screenName}`);
      }
    } catch (error) {
      console.error('🔥 Analytics: Failed to log screen view', error);
    }
  }

  /**
   * Set user property
   */
  async setUserProperty(name: string, value: string): Promise<void> {
    if (!this.isEnabled) return;

    try {
      if (analytics) {
        await analytics.setUserProperty(name, value);
        console.log(`🔥 User Property: ${name} = ${value}`);
      } else {
        console.log(`📊 User Property (Fallback): ${name} = ${value}`);
      }
    } catch (error) {
      console.error('🔥 Analytics: Failed to set user property', error);
    }
  }

  /**
   * Set user ID
   */
  async setUserId(userId: string | null): Promise<void> {
    if (!this.isEnabled) return;

    try {
      if (analytics) {
        await analytics.setUserId(userId);
        console.log(`🔥 User ID: ${userId}`);
      } else {
        console.log(`📊 User ID (Fallback): ${userId}`);
      }
    } catch (error) {
      console.error('🔥 Analytics: Failed to set user ID', error);
    }
  }

  // ========================================
  // PERFORMANCE MONITORING METHODS
  // ========================================

  /**
   * Start a performance trace
   */
  async startTrace(traceName: string): Promise<any> {
    try {
      if (perf) {
        const trace = await perf.startTrace(traceName);
        console.log(`🔥 Performance Trace Started: ${traceName}`);
        return trace;
      } else {
        // Fallback: return mock trace
        const startTime = Date.now();
        console.log(`📊 Performance Trace (Fallback) Started: ${traceName}`);
        return {
          stop: () => {
            const duration = Date.now() - startTime;
            console.log(`📊 Performance Trace (Fallback) Stopped: ${traceName} - ${duration}ms`);
          },
          putMetric: (metricName: string, value: number) => {
            console.log(`📊 Trace Metric (Fallback): ${metricName} = ${value}`);
          },
          putAttribute: (attribute: string, value: string) => {
            console.log(`📊 Trace Attribute (Fallback): ${attribute} = ${value}`);
          },
        };
      }
    } catch (error) {
      console.error('🔥 Performance: Failed to start trace', error);
      return null;
    }
  }

  /**
   * Record a network request (automatic in Firebase)
   */
  async recordNetworkRequest(url: string, method: string, duration: number, statusCode: number): Promise<void> {
    try {
      if (perf) {
        // Firebase automatically tracks network requests
        // This is for custom logging
        console.log(`🔥 Network Request: ${method} ${url} - ${statusCode} (${duration}ms)`);
      } else {
        console.log(`📊 Network Request (Fallback): ${method} ${url} - ${statusCode} (${duration}ms)`);
      }
    } catch (error) {
      console.error('🔥 Performance: Failed to record network request', error);
    }
  }

  // ========================================
  // CRASHLYTICS METHODS
  // ========================================

  /**
   * Log an error
   */
  async recordError(error: Error, context?: string): Promise<void> {
    try {
      if (crashlytics) {
        if (context) {
          await crashlytics.log(`Context: ${context}`);
        }
        await crashlytics.recordError(error);
        console.log('🔥 Crashlytics: Error recorded', error.message);
      } else {
        console.error('📊 Error (Fallback):', context, error);
      }
    } catch (err) {
      console.error('🔥 Crashlytics: Failed to record error', err);
    }
  }

  /**
   * Log a message (breadcrumb)
   */
  async log(message: string): Promise<void> {
    try {
      if (crashlytics) {
        await crashlytics.log(message);
      } else {
        console.log(`📊 Breadcrumb (Fallback): ${message}`);
      }
    } catch (error) {
      console.error('🔥 Crashlytics: Failed to log message', error);
    }
  }

  /**
   * Set custom attributes
   */
  async setAttribute(key: string, value: string): Promise<void> {
    try {
      if (crashlytics) {
        await crashlytics.setAttribute(key, value);
        console.log(`🔥 Crashlytics Attribute: ${key} = ${value}`);
      } else {
        console.log(`📊 Attribute (Fallback): ${key} = ${value}`);
      }
    } catch (error) {
      console.error('🔥 Crashlytics: Failed to set attribute', error);
    }
  }

  /**
   * Force crash (testing only)
   */
  async testCrash(): Promise<void> {
    if (crashlytics && __DEV__) {
      console.warn('🔥 Crashlytics: Forcing crash for testing');
      crashlytics.crash();
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Enable/disable analytics collection
   */
  async setAnalyticsCollectionEnabled(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    try {
      if (analytics) {
        await analytics.setAnalyticsCollectionEnabled(enabled);
        console.log(`🔥 Analytics Collection: ${enabled ? 'Enabled' : 'Disabled'}`);
      }
    } catch (error) {
      console.error('🔥 Analytics: Failed to set collection enabled', error);
    }
  }

  /**
   * Check if Firebase is available
   */
  isAvailable(): boolean {
    return isFirebaseAvailable;
  }

  /**
   * Get queued events (fallback mode)
   */
  getQueuedEvents(): Array<{ name: string; params?: any }> {
    return this.eventQueue;
  }

  /**
   * Clear event queue
   */
  clearQueue(): void {
    this.eventQueue = [];
  }

  // ========================================
  // WELCOME SCREEN SPECIFIC METHODS
  // ========================================

  /**
   * Track welcome screen view
   */
  async trackWelcomeScreenView(userName: string, isFirstTime: boolean): Promise<void> {
    await this.logEvent('welcome_screen_viewed', {
      user_name: userName,
      is_first_time: isFirstTime,
      platform: Platform.OS,
      timestamp: Date.now(),
    });
  }

  /**
   * Track video playback
   */
  async trackVideoPlayback(success: boolean, loadTime: number, errorMessage?: string): Promise<void> {
    await this.logEvent('welcome_video_playback', {
      success,
      load_time_ms: loadTime,
      error_message: errorMessage || 'none',
      platform: Platform.OS,
    });
  }

  /**
   * Track animation performance
   */
  async trackAnimationPerformance(animationType: string, duration: number, smooth: boolean): Promise<void> {
    await this.logEvent('welcome_animation_performance', {
      animation_type: animationType,
      duration_ms: duration,
      smooth,
      platform: Platform.OS,
    });
  }

  /**
   * Track welcome screen completion
   */
  async trackWelcomeScreenComplete(timeSpent: number): Promise<void> {
    await this.logEvent('welcome_screen_completed', {
      time_spent_ms: timeSpent,
      platform: Platform.OS,
    });
  }

  /**
   * Track welcome screen error
   */
  async trackWelcomeScreenError(errorType: string, errorMessage: string): Promise<void> {
    await this.logEvent('welcome_screen_error', {
      error_type: errorType,
      error_message: errorMessage,
      platform: Platform.OS,
    });

    // Also record in Crashlytics
    const error = new Error(`Welcome Screen Error: ${errorType} - ${errorMessage}`);
    await this.recordError(error, 'WelcomeScreen');
  }
}

export default FirebaseService;

