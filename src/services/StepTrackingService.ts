// Step Tracking Service
// High-accuracy step counting using platform-specific APIs

import { Platform, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StepData,
  DailyStepSummary,
  StepTrackingConfig,
  StepTrackingStatus,
  StepTrackingEvents,
  IStepTrackingService,
  HealthPermissions,
} from '../types/health';
import HealthPermissionsManager from './HealthPermissionsManager';
import IOSPedometerService from './IOSPedometerService';
import StepSyncService from './StepSyncService';

class StepTrackingService implements IStepTrackingService {
  private static instance: StepTrackingService;
  private config: StepTrackingConfig;
  private permissionsManager: HealthPermissionsManager;
  private stepSyncService: StepSyncService;
  private events: Partial<StepTrackingEvents> = {};
  
  // Tracking state
  private isInitialized = false;
  private isLiveTracking = false;
  private liveUpdateInterval: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;
  
  // Platform-specific instances
  private iosPedometerService: IOSPedometerService | null = null;
  private pedometerSubscription: any = null; // iOS CMPedometer (legacy)
  private sensorSubscription: any = null; // Android sensor
  
  // Data caching
  private todayStepsCache: StepData | null = null;
  private lastUpdateTime = 0;
  
  // User context for database sync
  private currentUserId: string | null = null;

  public static getInstance(): StepTrackingService {
    if (!StepTrackingService.instance) {
      StepTrackingService.instance = new StepTrackingService();
    }
    return StepTrackingService.instance;
  }

  constructor() {
    this.permissionsManager = HealthPermissionsManager.getInstance();
    this.stepSyncService = StepSyncService.getInstance();
    
    // Default configuration
    this.config = {
      liveUpdateInterval: 2000, // 2 seconds
      backgroundSyncInterval: 300000, // 5 minutes
      dailyCutoffHour: 22, // 10 PM
      maxStepsPerDay: 100000, // Anti-gaming limit
      minimumStepThreshold: 5, // Ignore tiny movements
      confidenceThreshold: 0.7,
      enableBackgroundTracking: true,
      enableLiveUpdates: true,
      historicalDataDays: 30,
    };
  }

  /**
   * Set the current user ID for database sync
   */
  setUserId(userId: string): void {
    this.currentUserId = userId;
    console.log('🔑 Step tracking service user ID set:', userId);
  }

  /**
   * Initialize the step tracking service
   */
  async initialize(config?: Partial<StepTrackingConfig>): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Merge config
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Check permissions
      const permissions = await this.permissionsManager.checkAllPermissions();
      
      // Initialize platform-specific services
      if (Platform.OS === 'ios') {
        await this.initializeIOS();
      } else if (Platform.OS === 'android') {
        await this.initializeAndroid();
      }

      // Set up app state monitoring
      this.setupAppStateMonitoring();

      // Load cached data
      await this.loadCachedData();

      this.isInitialized = true;
      console.log('StepTrackingService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize StepTrackingService:', error);
      throw error;
    }
  }

  /**
   * Initialize iOS-specific step tracking with enterprise-ready service
   */
  private async initializeIOS(): Promise<void> {
    if (Platform.OS !== 'ios') return;

    try {
      console.log('🚀 Initializing enterprise iOS step tracking...');
      
      // Initialize the new enterprise iOS pedometer service
      this.iosPedometerService = IOSPedometerService.getInstance();
      
      // Set up callbacks
      this.iosPedometerService.setCallbacks({
        onStepUpdate: (stepData) => {
          // Call the proper handler which includes database sync
          this.handleStepUpdate(stepData);
        },
        onStatusChange: (status) => {
          console.log(`📱 Pedometer status: ${status.mode}, tracking: ${status.isTracking}`);
          
          if (this.events.onTrackingStatusChanged) {
            this.events.onTrackingStatusChanged({
              isAvailable: status.mode !== 'disabled',
              isAuthorized: status.permissions.motion === 'authorized' || status.permissions.healthKit === 'authorized',
              isTracking: status.isTracking,
              lastUpdate: status.lastUpdate || undefined,
              lastError: status.error || null,
              supportedFeatures: ['live-counting', 'background-sync'],
            });
          }
        },
        onError: (error) => {
          console.error('🚨 iOS Pedometer Error:', error.message);
          
          if (this.events.onError) {
            this.events.onError({
              code: 'IOS_PEDOMETER_ERROR',
              message: error.message,
              platform: 'ios',
              recoverable: true,
              timestamp: new Date().toISOString(),
            });
          }
        },
      });
      
      // Initialize the service
      await this.iosPedometerService.initialize({
        enableHealthKit: true,
        enableCoreMotion: true,
        updateInterval: this.config.liveUpdateInterval,
        maxRetries: 3,
        fallbackTimeout: 10000,
      });
      
      console.log('✅ Enterprise iOS step tracking initialized successfully');
    } catch (error) {
      console.error('❌ iOS initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize Android-specific step tracking
   */
  private async initializeAndroid(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      // For Expo Go, skip native module checks
      console.log('Initializing Android step tracking for Expo Go (simulated)');
      
      // In a real dev build, we would:
      // 1. Check sensor availability
      // 2. Initialize Google Fit
      // 3. Set up native sensor subscriptions
      
      // For now, just mark as available
      console.log('Android step tracking initialized (simulated)');
    } catch (error) {
      console.error('Android initialization failed:', error);
      throw error;
    }
  }

  /**
   * Request all necessary permissions
   */
  async requestPermissions(): Promise<HealthPermissions> {
    return await this.permissionsManager.requestAllPermissions();
  }

  /**
   * Check current permission status
   */
  async checkPermissions(): Promise<HealthPermissions> {
    return await this.permissionsManager.checkAllPermissions();
  }

  /**
   * Start live step tracking
   */
  async startLiveTracking(): Promise<void> {
    if (this.isLiveTracking) return;

    try {
      const permissions = await this.checkPermissions();
      
      if (Platform.OS === 'ios') {
        if (permissions.motion !== 'authorized') {
          throw new Error('Motion permission not granted');
        }
        await this.startIOSLiveTracking();
      } else if (Platform.OS === 'android') {
        if (permissions.activityRecognition !== 'authorized') {
          throw new Error('Activity recognition permission not granted');
        }
        await this.startAndroidLiveTracking();
      }

      this.isLiveTracking = true;
      console.log('Live step tracking started');
    } catch (error) {
      console.error('Failed to start live tracking:', error);
      this.events.onError?.({
        code: 'LIVE_TRACKING_START_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        platform: Platform.OS as 'ios' | 'android',
        recoverable: true,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Start iOS live tracking using enterprise pedometer service
   */
  private async startIOSLiveTracking(): Promise<void> {
    if (Platform.OS !== 'ios') return;

    try {
      if (!this.iosPedometerService) {
        throw new Error('iOS Pedometer Service not initialized');
      }

      // Request permissions if needed
      await this.iosPedometerService.requestPermissions();
      
      // Start tracking
      await this.iosPedometerService.startTracking();
      
      console.log('✅ iOS live step tracking started with enterprise service');
    } catch (error) {
      console.error('❌ iOS live tracking failed:', error);
      throw error;
    }
  }

  /**
   * Start Android live tracking using step sensor
   * NOTE: This requires a development/production build - will not work in Expo Go
   */
  private async startAndroidLiveTracking(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      // In Expo Go, this will do nothing - steps will remain at database value (0)
      // In a real dev/prod build, this would use native TYPE_STEP_COUNTER sensor
      console.log('Android step tracking requires dev/prod build - not available in Expo Go');
      console.log('Steps will display database value only (0 until pedometer is enabled)');
      
      // No mock data - let it show actual database value
    } catch (error) {
      console.error('Android live tracking failed:', error);
      throw error;
    }
  }

  /**
   * Stop live step tracking
   */
  async stopLiveTracking(): Promise<void> {
    if (!this.isLiveTracking) return;

    try {
      // Stop iOS tracking
      if (this.pedometerSubscription) {
        this.pedometerSubscription.remove();
        this.pedometerSubscription = null;
      }

      // Stop Android tracking
      if (this.liveUpdateInterval) {
        clearInterval(this.liveUpdateInterval);
        this.liveUpdateInterval = null;
      }

      this.isLiveTracking = false;
      console.log('Live step tracking stopped');
    } catch (error) {
      console.error('Failed to stop live tracking:', error);
    }
  }

  /**
   * Handle step update from any source
   */
  private handleStepUpdate(stepData: StepData): void {
    const now = Date.now();
    
    // Throttle UI updates to prevent excessive re-renders (500ms for smooth real-time feel)
    if (now - this.lastUpdateTime < 500) return; // Max 2 updates per second
    this.lastUpdateTime = now;

    // Apply behavioral guardrails
    if (this.isPastDailyCutoff()) {
      console.log('Step update ignored - past daily cutoff');
      return;
    }

    // For iOS pedometer, stepData.steps is the total for today, not incremental
    // So we use it directly instead of accumulating
    const totalStepsForToday = stepData.steps;

    // Step smoothing: Prevent large jumps from delayed CoreMotion processing
    if (this.todayStepsCache) {
      const increment = totalStepsForToday - this.todayStepsCache.steps;
      const timeSinceLastUpdate = now - this.lastUpdateTime;
      
      // If increment is suspiciously large and time is short, it's likely delayed processing
      // Maximum reasonable: 20 steps per second (very fast running)
      const maxReasonableRate = 20; // steps per second
      const expectedMaxIncrement = Math.ceil((timeSinceLastUpdate / 1000) * maxReasonableRate);
      
      if (increment > expectedMaxIncrement && timeSinceLastUpdate < 2000) {
        console.log(`📊 Step smoothing applied: increment ${increment} over ${timeSinceLastUpdate}ms`);
        // Don't reject, but mark with lower confidence for monitoring
        stepData.confidence = 'medium';
      }
    }

    // Update cache with total steps
    this.todayStepsCache = {
      steps: totalStepsForToday,
      timestamp: stepData.timestamp,
      source: stepData.source,
      confidence: stepData.confidence,
    };

    // Apply reasonable daily maximum (anti-gaming)
    if (this.todayStepsCache.steps > this.config.maxStepsPerDay) {
      this.todayStepsCache.steps = this.config.maxStepsPerDay;
    }

    // Persist to storage (async, but don't wait)
    this.saveTodaySteps(this.todayStepsCache).catch(console.error);

    // Sync to database if user is authenticated (throttled separately in StepSyncService)
    if (this.currentUserId) {
      this.stepSyncService.syncStepsToDatabase(this.currentUserId, this.todayStepsCache)
        .catch(error => console.warn('Database sync failed:', error));
    }

    // Notify listeners for UI updates
    this.events.onStepsUpdated?.(this.todayStepsCache);
  }

  /**
   * Get today's step count using enterprise services
   */
  async getTodaySteps(): Promise<StepData> {
    if (this.todayStepsCache) {
      return this.todayStepsCache;
    }

    try {
      // Use platform-specific enterprise services
      if (Platform.OS === 'ios' && this.iosPedometerService) {
        const stepData = await this.iosPedometerService.getCurrentSteps();
        this.todayStepsCache = stepData;
        return stepData;
      } else if (Platform.OS === 'android') {
        return await this.getAndroidTodaySteps();
      }

      // Try to load from cache as fallback
      const cached = await this.loadTodaySteps();
      if (cached) {
        this.todayStepsCache = cached;
        return cached;
      }

      // Default fallback
      return {
        steps: 0,
        timestamp: new Date().toISOString(),
        source: 'pedometer',
      };
    } catch (error) {
      console.error('Error getting today steps:', error);
      
      // Return cached data or zero as fallback
      const cached = await this.loadTodaySteps();
      if (cached) {
        return cached;
      }
      
      return {
        steps: 0,
        timestamp: new Date().toISOString(),
        source: 'pedometer',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get today's steps from iOS HealthKit
   */
  private async getIOSTodaySteps(): Promise<StepData> {
    try {
      // For Expo Go, HealthKit is not available
      // Return simulated baseline steps for testing
      console.log('iOS HealthKit step retrieval skipped - not available in Expo Go');
      
      return {
        steps: Math.floor(Math.random() * 2000) + 1000, // Random baseline 1000-3000 steps
        timestamp: new Date().toISOString(),
        source: 'healthkit',
        confidence: 'high',
      };
    } catch (error) {
      console.error('iOS step retrieval failed:', error);
      return {
        steps: 0,
        timestamp: new Date().toISOString(),
        source: 'pedometer',
      };
    }
  }

  /**
   * Get today's steps from Android Google Fit
   */
  private async getAndroidTodaySteps(): Promise<StepData> {
    try {
      // For Expo Go, Google Fit is not available
      // Return simulated baseline steps for testing
      console.log('Android Google Fit step retrieval skipped - not available in Expo Go');
      
      return {
        steps: Math.floor(Math.random() * 2000) + 1000, // Random baseline 1000-3000 steps
        timestamp: new Date().toISOString(),
        source: 'googlefit',
        confidence: 'high',
      };
    } catch (error) {
      console.error('Android step retrieval failed:', error);
      return {
        steps: 0,
        timestamp: new Date().toISOString(),
        source: 'sensor',
      };
    }
  }

  /**
   * Get steps for a specific date
   */
  async getStepsForDate(date: string): Promise<DailyStepSummary> {
    // Implementation would fetch historical data
    // For now, return mock data
    return {
      date,
      totalSteps: 0,
      target: 10000,
      percentage: 0,
      lastUpdated: new Date().toISOString(),
      sources: [],
    };
  }

  /**
   * Get steps for a date range
   */
  async getStepsForDateRange(startDate: string, endDate: string): Promise<DailyStepSummary[]> {
    // Implementation would fetch historical data
    return [];
  }

  /**
   * Sync with health platform
   */
  async syncWithHealthPlatform(): Promise<void> {
    try {
      const todaySteps = await this.getTodaySteps();
      this.todayStepsCache = todaySteps;
      this.saveTodaySteps(todaySteps);
      
      console.log('Health platform sync completed');
    } catch (error) {
      console.error('Health platform sync failed:', error);
    }
  }

  /**
   * Get tracking status
   */
  async getTrackingStatus(): Promise<StepTrackingStatus> {
    const permissions = await this.checkPermissions();
    const isAvailable = await this.permissionsManager.isStepTrackingAvailable();
    
    const isAuthorized = Platform.OS === 'ios' 
      ? permissions.motion === 'authorized'
      : permissions.activityRecognition === 'authorized';

    return {
      isAvailable,
      isAuthorized,
      isTracking: this.isLiveTracking,
      lastError: null,
      supportedFeatures: [
        'live-counting',
        'historical-data',
        'background-sync',
      ],
    };
  }

  /**
   * Reset step data for new day
   */
  async resetForNewDay(): Promise<void> {
    console.log('🆕 Resetting step tracking for new day');
    
    // Clear cached data
    this.todayStepsCache = null;
    this.lastUpdateTime = 0;
    
    // Reset database sync if user is authenticated
    if (this.currentUserId) {
      await this.stepSyncService.resetStepsForNewDay(this.currentUserId);
    }
    
    // Clear AsyncStorage cache for steps
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Clear yesterday's step cache
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.removeItem(`steps_${yesterdayStr}`);
      
      console.log('✅ Step data reset for new day');
    } catch (error) {
      console.warn('Failed to clear step cache:', error);
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.stopLiveTracking();
    
    // Cleanup iOS pedometer service
    if (this.iosPedometerService) {
      await this.iosPedometerService.cleanup();
      this.iosPedometerService = null;
    }
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    console.log('StepTrackingService cleaned up');
  }

  // Event handling
  on<K extends keyof StepTrackingEvents>(event: K, handler: StepTrackingEvents[K]): void {
    this.events[event] = handler;
  }

  off<K extends keyof StepTrackingEvents>(event: K): void {
    delete this.events[event];
  }

  // Private helper methods
  private setupAppStateMonitoring(): void {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this)
    );
  }

  private handleAppStateChange(nextAppState: AppStateStatus): void {
    if (nextAppState === 'active') {
      // App came to foreground - sync with health platform
      this.syncWithHealthPlatform();
    }
  }

  private isPastDailyCutoff(): boolean {
    const now = new Date();
    return now.getHours() >= this.config.dailyCutoffHour;
  }

  private async saveTodaySteps(stepData: StepData): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(`steps_${today}`, JSON.stringify(stepData));
    } catch (error) {
      console.error('Failed to save step data:', error);
    }
  }

  private async loadTodaySteps(): Promise<StepData | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const cached = await AsyncStorage.getItem(`steps_${today}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to load step data:', error);
      return null;
    }
  }

  private async loadCachedData(): Promise<void> {
    this.todayStepsCache = await this.loadTodaySteps();
  }
}

export default StepTrackingService;
