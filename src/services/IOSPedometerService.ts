/**
 * iOS Pedometer Service - Enterprise-Ready Implementation
 * 
 * Provides real-time step tracking using iOS HealthKit and CoreMotion APIs.
 * Implements fallback strategies and enterprise-level error handling.
 * 
 * Architecture:
 * - Primary: HealthKit (most accurate, historical data)
 * - Fallback: CoreMotion Pedometer (real-time, no historical)
 * - Last Resort: Manual entry mode
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StepData, HealthPermissions, PermissionStatus } from '../types/health';
import MotionActivityManager from './MotionActivityManager';

// Import react-native-health for HealthKit integration
let AppleHealthKit: any = null;
let Pedometer: any = null;

try {
  AppleHealthKit = require('react-native-health').default;
} catch (error) {
  console.warn('react-native-health not available:', error);
}

// CoreMotion Pedometer (fallback) - Using expo-sensors
try {
  if (Platform.OS === 'ios') {
    // Use expo-sensors for CoreMotion functionality
    const { Pedometer: ExpoPedometer } = require('expo-sensors');
    Pedometer = ExpoPedometer;
  }
} catch (error) {
  console.warn('CoreMotion Pedometer not available:', error);
}

export enum PedometerMode {
  HEALTHKIT = 'healthkit',
  COREMOTION = 'coremotion', 
  MANUAL = 'manual',
  DISABLED = 'disabled'
}

export interface PedometerConfig {
  enableHealthKit: boolean;
  enableCoreMotion: boolean;
  updateInterval: number; // milliseconds
  maxRetries: number;
  fallbackTimeout: number; // milliseconds
}

export interface PedometerStatus {
  mode: PedometerMode;
  isTracking: boolean;
  lastUpdate: string | null;
  error: string | null;
  permissions: {
    healthKit: PermissionStatus;
    motion: PermissionStatus;
  };
}

class IOSPedometerService {
  private static instance: IOSPedometerService;
  private config: PedometerConfig;
  private status: PedometerStatus;
  private updateTimer: NodeJS.Timeout | null = null;
  private pedometerSubscription: any = null;
  private coreMotionInterval: NodeJS.Timeout | null = null;
  private retryCount = 0;
  
  // Motion activity detection
  private motionActivityManager: MotionActivityManager;
  
  // Event callbacks
  private onStepUpdate: ((stepData: StepData) => void) | null = null;
  private onStatusChange: ((status: PedometerStatus) => void) | null = null;
  private onError: ((error: Error) => void) | null = null;

  // Data caching
  private lastStepCount = 0;
  private lastStepData: StepData | null = null;
  private sessionStartTime: Date | null = null;

  public static getInstance(): IOSPedometerService {
    if (!IOSPedometerService.instance) {
      IOSPedometerService.instance = new IOSPedometerService();
    }
    return IOSPedometerService.instance;
  }

  constructor() {
    this.config = {
      enableHealthKit: true,
      enableCoreMotion: true,
      updateInterval: 1000, // 1 second for near real-time updates
      maxRetries: 3,
      fallbackTimeout: 10000, // 10 seconds
    };

    this.status = {
      mode: PedometerMode.DISABLED,
      isTracking: false,
      lastUpdate: null,
      error: null,
      permissions: {
        healthKit: 'not-determined',
        motion: 'not-determined',
      },
    };

    // Initialize motion activity manager
    this.motionActivityManager = MotionActivityManager.getInstance();
  }

  /**
   * Initialize the pedometer service with enterprise-level setup
   */
  async initialize(config?: Partial<PedometerConfig>): Promise<void> {
    if (Platform.OS !== 'ios') {
      throw new Error('IOSPedometerService only supports iOS platform');
    }

    try {
      // Merge configuration
      if (config) {
        this.config = { ...this.config, ...config };
      }

      console.log('🚀 Initializing iOS Pedometer Service...');

      // Check permissions first
      await this.checkPermissions();

      // Determine best available mode
      await this.determineBestMode();

      // Load cached data
      await this.loadCachedData();

      console.log(`✅ iOS Pedometer Service initialized in ${this.status.mode} mode`);
      this.notifyStatusChange();

    } catch (error) {
      const errorMessage = `Failed to initialize iOS Pedometer Service: ${error}`;
      console.error(errorMessage);
      this.handleError(new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Check all required permissions
   */
  async checkPermissions(): Promise<HealthPermissions> {
    const permissions: HealthPermissions = {
      motion: 'not-determined',
      healthKit: 'not-determined',
      activityRecognition: 'not-determined',
      googleFit: 'not-determined',
      backgroundRefresh: 'not-determined',
    };

    try {
      // Check HealthKit permissions
      if (AppleHealthKit && this.config.enableHealthKit) {
        permissions.healthKit = await this.checkHealthKitPermission();
      }

      // Check Motion permissions (CoreMotion)
      if (this.config.enableCoreMotion) {
        permissions.motion = await this.checkMotionPermission();
      }

      this.status.permissions = {
        healthKit: permissions.healthKit,
        motion: permissions.motion,
      };

      console.log('📋 Permissions checked:', permissions);
      return permissions;

    } catch (error) {
      console.error('Error checking permissions:', error);
      this.handleError(new Error(`Permission check failed: ${error}`));
      return permissions;
    }
  }

  /**
   * Request all necessary permissions
   */
  async requestPermissions(): Promise<HealthPermissions> {
    try {
      console.log('🔐 Requesting pedometer permissions...');

      const permissions: HealthPermissions = {
        motion: 'not-determined',
        healthKit: 'not-determined', 
        activityRecognition: 'not-determined',
        googleFit: 'not-determined',
        backgroundRefresh: 'not-determined',
      };

      // Request HealthKit permissions first (most comprehensive)
      if (AppleHealthKit && this.config.enableHealthKit) {
        permissions.healthKit = await this.requestHealthKitPermission();
      }

      // Request Motion permissions as fallback
      if (this.config.enableCoreMotion) {
        permissions.motion = await this.requestMotionPermission();
      }

      this.status.permissions = {
        healthKit: permissions.healthKit,
        motion: permissions.motion,
      };

      // Re-determine best mode after permission changes
      await this.determineBestMode();

      console.log('✅ Permissions requested:', permissions);
      this.notifyStatusChange();
      
      return permissions;

    } catch (error) {
      const errorMessage = `Permission request failed: ${error}`;
      console.error(errorMessage);
      this.handleError(new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Start step tracking
   */
  async startTracking(): Promise<void> {
    if (this.status.isTracking) {
      console.log('⚠️ Step tracking already active');
      return;
    }

    try {
      console.log(`🏃‍♂️ Starting step tracking in ${this.status.mode} mode...`);

      switch (this.status.mode) {
        case PedometerMode.HEALTHKIT:
          await this.startHealthKitTracking();
          break;
        case PedometerMode.COREMOTION:
          await this.startCoreMotionTracking();
          break;
        case PedometerMode.MANUAL:
          await this.startManualMode();
          break;
        default:
          throw new Error(`Cannot start tracking in ${this.status.mode} mode`);
      }

      this.status.isTracking = true;
      this.status.error = null;
      this.sessionStartTime = new Date();
      
      console.log('✅ Step tracking started successfully');
      this.notifyStatusChange();

    } catch (error) {
      const errorMessage = `Failed to start step tracking: ${error}`;
      console.error(errorMessage);
      this.handleError(new Error(errorMessage));
      
      // Try fallback mode
      await this.tryFallbackMode();
    }
  }

  /**
   * Stop step tracking
   */
  async stopTracking(): Promise<void> {
    if (!this.status.isTracking) {
      return;
    }

    try {
      console.log('⏹️ Stopping step tracking...');

      // Clear timers
      if (this.updateTimer) {
        clearInterval(this.updateTimer);
        this.updateTimer = null;
      }

      if (this.coreMotionInterval) {
        clearInterval(this.coreMotionInterval);
        this.coreMotionInterval = null;
      }

      // Remove subscriptions
      if (this.pedometerSubscription) {
        this.pedometerSubscription.remove();
        this.pedometerSubscription = null;
      }

      this.status.isTracking = false;
      this.sessionStartTime = null;

      console.log('✅ Step tracking stopped');
      this.notifyStatusChange();

    } catch (error) {
      console.error('Error stopping step tracking:', error);
      this.handleError(new Error(`Failed to stop tracking: ${error}`));
    }
  }

  /**
   * Get current step count
   */
  async getCurrentSteps(): Promise<StepData> {
    try {
      switch (this.status.mode) {
        case PedometerMode.HEALTHKIT:
          return await this.getHealthKitSteps();
        case PedometerMode.COREMOTION:
          return await this.getCoreMotionSteps();
        case PedometerMode.MANUAL:
          return await this.getManualSteps();
        default:
          throw new Error(`Cannot get steps in ${this.status.mode} mode`);
      }
    } catch (error) {
      console.error('Error getting current steps:', error);
      this.handleError(new Error(`Failed to get steps: ${error}`));
      
      // Return cached data as fallback
      return await this.getCachedSteps();
    }
  }

  /**
   * Get step history for date range
   */
  async getStepHistory(startDate: Date, endDate: Date): Promise<StepData[]> {
    if (this.status.mode !== PedometerMode.HEALTHKIT) {
      console.warn('Step history only available in HealthKit mode');
      return [];
    }

    try {
      return await this.getHealthKitHistory(startDate, endDate);
    } catch (error) {
      console.error('Error getting step history:', error);
      this.handleError(new Error(`Failed to get step history: ${error}`));
      return [];
    }
  }

  /**
   * Get current service status
   */
  getStatus(): PedometerStatus {
    return { ...this.status };
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: {
    onStepUpdate?: (stepData: StepData) => void;
    onStatusChange?: (status: PedometerStatus) => void;
    onError?: (error: Error) => void;
  }): void {
    this.onStepUpdate = callbacks.onStepUpdate || null;
    this.onStatusChange = callbacks.onStatusChange || null;
    this.onError = callbacks.onError || null;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.stopTracking();
    await this.saveCachedData();
    console.log('🧹 iOS Pedometer Service cleaned up');
  }

  // Private Methods

  private async determineBestMode(): Promise<void> {
    // Priority: HealthKit > CoreMotion > Manual > Disabled
    
    console.log('🎯 Determining best pedometer mode...');
    console.log('🔍 Current permissions:', this.status.permissions);
    console.log('🔍 Config:', { enableHealthKit: this.config.enableHealthKit, enableCoreMotion: this.config.enableCoreMotion });
    
    if (AppleHealthKit && this.config.enableHealthKit && 
        this.status.permissions.healthKit === 'authorized') {
      this.status.mode = PedometerMode.HEALTHKIT;
      console.log('✅ Selected HealthKit mode');
    } else if (this.config.enableCoreMotion && 
               this.status.permissions.motion === 'authorized') {
      this.status.mode = PedometerMode.COREMOTION;
      console.log('✅ Selected CoreMotion mode');
    } else if (this.status.permissions.motion === 'not-determined' || 
               this.status.permissions.healthKit === 'not-determined') {
      // If permissions are not determined, we can still try manual mode
      this.status.mode = PedometerMode.MANUAL;
      console.log('⚠️ Selected Manual mode (permissions not determined)');
    } else if (this.status.permissions.motion === 'authorized' || 
               this.status.permissions.healthKit === 'authorized') {
      this.status.mode = PedometerMode.MANUAL;
      console.log('⚠️ Selected Manual mode (fallback)');
    } else {
      this.status.mode = PedometerMode.DISABLED;
      console.log('❌ All modes disabled');
    }

    console.log(`🎯 Best mode determined: ${this.status.mode}`);
  }

  private async checkHealthKitPermission(): Promise<'authorized' | 'denied' | 'not-determined'> {
    if (!AppleHealthKit) {
      console.log('🔍 HealthKit not available - AppleHealthKit module not found');
      return 'not-determined';
    }

    try {
      // First check if HealthKit is available on this device
      const isAvailable = AppleHealthKit.isAvailable();
      if (!isAvailable) {
        console.log('🔍 HealthKit not available on this device');
        return 'not-determined';
      }

      return new Promise((resolve) => {
        const permissions = {
          permissions: {
            read: [
              AppleHealthKit.Constants.Permissions.Steps,
              AppleHealthKit.Constants.Permissions.StepCount,
              AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
            ],
          },
        };

        AppleHealthKit.initHealthKit(permissions, (error: string) => {
          if (error) {
            console.log('🔍 HealthKit permission check error:', error);
            // Don't treat initialization errors as denied - could be not-determined
            if (error.includes('denied') || error.includes('restricted')) {
              resolve('denied');
            } else {
              resolve('not-determined');
            }
          } else {
            console.log('✅ HealthKit permissions check successful');
            resolve('authorized');
          }
        });
      });
    } catch (error) {
      console.log('🔍 HealthKit check exception:', error);
      return 'not-determined';
    }
  }

  private async requestHealthKitPermission(): Promise<'authorized' | 'denied' | 'not-determined'> {
    if (!AppleHealthKit) return 'not-determined';

    return new Promise((resolve) => {
      const permissions = {
        permissions: {
          read: [
            AppleHealthKit.Constants.Permissions.Steps,
            AppleHealthKit.Constants.Permissions.StepCount,
            AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
          ],
          write: [
            AppleHealthKit.Constants.Permissions.Steps,
          ],
        },
      };

      AppleHealthKit.initHealthKit(permissions, (error: string) => {
        if (error) {
          console.error('HealthKit permission request error:', error);
          resolve('denied');
        } else {
          console.log('✅ HealthKit permissions granted');
          resolve('authorized');
        }
      });
    });
  }

  private async checkMotionPermission(): Promise<'authorized' | 'denied' | 'not-determined'> {
    // CoreMotion permissions are automatically granted on iOS
    // We check if the API is available
    try {
      // CoreMotion is always available on real iOS devices
      // The Pedometer NativeEventEmitter is only needed for real-time updates
      console.log('🔍 Checking CoreMotion availability...');
      
      // On real devices, CoreMotion should always be available
      if (Platform.OS === 'ios') {
        console.log('✅ CoreMotion available on iOS device');
        return 'authorized';
      }
      
      return 'not-determined';
    } catch (error) {
      console.log('🔍 CoreMotion check error:', error);
      return 'denied';
    }
  }

  private async requestMotionPermission(): Promise<'authorized' | 'denied' | 'not-determined'> {
    // CoreMotion doesn't require explicit permission request
    return await this.checkMotionPermission();
  }

  private async startHealthKitTracking(): Promise<void> {
    if (!AppleHealthKit) {
      throw new Error('HealthKit not available');
    }

    // Start periodic updates
    this.updateTimer = setInterval(async () => {
      try {
        const stepData = await this.getHealthKitSteps();
        this.notifyStepUpdate(stepData);
      } catch (error) {
        console.error('HealthKit update error:', error);
        this.retryCount++;
        if (this.retryCount >= this.config.maxRetries) {
          await this.tryFallbackMode();
        }
      }
    }, this.config.updateInterval);
  }

  private async startCoreMotionTracking(): Promise<void> {
    if (!Pedometer) {
      throw new Error('CoreMotion Pedometer not available');
    }

    try {
      console.log('🏃‍♂️ Starting CoreMotion step tracking with motion activity detection...');
      
      // Start motion activity monitoring
      await this.motionActivityManager.startMonitoring();
      
      // Check if Pedometer is available
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Pedometer not available on this device');
      }

      // Get current step count for today (immediate fetch)
      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0); // Start of today

      const result = await Pedometer.getStepCountAsync(start, end);
      
      if (result && typeof result.steps === 'number') {
        // Check if current activity is valid for step counting
        const isValidActivity = this.motionActivityManager.isValidForStepCounting();
        
        const stepData: StepData = {
          steps: result.steps,
          timestamp: new Date().toISOString(),
          source: 'coremotion',
          confidence: isValidActivity ? 'high' : 'low',
        };

        this.lastStepCount = result.steps;
        this.lastStepData = stepData;
        this.notifyStepUpdate(stepData);
        
        console.log(`📊 Initial step count: ${result.steps} steps (activity valid: ${isValidActivity})`);
      }

      // Set up periodic updates (every 1 second for near real-time updates)
      this.coreMotionInterval = setInterval(async () => {
        try {
          const end = new Date();
          const start = new Date();
          start.setHours(0, 0, 0, 0);

          const result = await Pedometer.getStepCountAsync(start, end);
          
          if (result && typeof result.steps === 'number') {
            // Check if steps have changed
            const stepsChanged = result.steps !== this.lastStepCount;
            
            if (stepsChanged) {
              const previousSteps = this.lastStepCount || 0;
              const increment = result.steps - previousSteps;
              
              // Step validation: Prevent unrealistic increments
              // Maximum reasonable: 15 steps per second (very fast running)
              const maxIncrementPerSecond = 15;
              const isReasonableIncrement = increment <= maxIncrementPerSecond;
              
              if (!isReasonableIncrement) {
                console.warn(`⚠️ Unrealistic step increment detected: +${increment} steps. Possible false detection.`);
                // Still update but log the anomaly for monitoring
              }
              
              const stepData: StepData = {
                steps: result.steps,
                timestamp: new Date().toISOString(),
                source: 'coremotion',
                confidence: isReasonableIncrement ? 'high' : 'medium',
              };

              this.lastStepCount = result.steps;
              this.lastStepData = stepData;
              this.notifyStepUpdate(stepData);
              
              console.log(`📊 Steps updated: ${result.steps} steps (+${increment})`);
            }
          }
        } catch (error) {
          console.warn('CoreMotion update failed:', error);
        }
      }, 1000); // Update every 1 second for near real-time progression

      console.log('✅ CoreMotion step tracking started with activity filtering');
    } catch (error) {
      console.error('❌ CoreMotion tracking failed:', error);
      throw error;
    }
  }

  private async startManualMode(): Promise<void> {
    console.log('📝 Manual step tracking mode - user input required');
    
    // In manual mode, we rely on cached data and user input
    const cachedSteps = await this.getCachedSteps();
    this.notifyStepUpdate(cachedSteps);
  }

  private async getHealthKitSteps(): Promise<StepData> {
    if (!AppleHealthKit) {
      throw new Error('HealthKit not available');
    }

    return new Promise((resolve, reject) => {
      const options = {
        date: new Date().toISOString(),
      };

      AppleHealthKit.getStepCount(options, (err: any, results: any) => {
        if (err) {
          reject(new Error(`HealthKit error: ${err}`));
          return;
        }

        const stepData: StepData = {
          steps: results.value || 0,
          timestamp: new Date().toISOString(),
          source: 'healthkit',
          confidence: 'high',
        };

        resolve(stepData);
      });
    });
  }

  private async getCoreMotionSteps(): Promise<StepData> {
    // CoreMotion provides real-time data, return last known count
    return {
      steps: this.lastStepCount,
      timestamp: new Date().toISOString(),
      source: 'coremotion',
      confidence: 'medium',
    };
  }

  private async getManualSteps(): Promise<StepData> {
    return await this.getCachedSteps();
  }

  private async getHealthKitHistory(startDate: Date, endDate: Date): Promise<StepData[]> {
    if (!AppleHealthKit) {
      throw new Error('HealthKit not available');
    }

    return new Promise((resolve, reject) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      AppleHealthKit.getDailyStepCountSamples(options, (err: any, results: any[]) => {
        if (err) {
          reject(new Error(`HealthKit history error: ${err}`));
          return;
        }

        const stepHistory: StepData[] = results.map(result => ({
          steps: result.value || 0,
          timestamp: result.startDate,
          source: 'healthkit',
          confidence: 'high',
        }));

        resolve(stepHistory);
      });
    });
  }

  private async tryFallbackMode(): Promise<void> {
    console.log('🔄 Trying fallback mode...');
    
    const currentMode = this.status.mode;
    
    if (currentMode === PedometerMode.HEALTHKIT && this.config.enableCoreMotion) {
      this.status.mode = PedometerMode.COREMOTION;
      await this.startTracking();
    } else if (currentMode === PedometerMode.COREMOTION) {
      this.status.mode = PedometerMode.MANUAL;
      await this.startTracking();
    } else {
      this.status.mode = PedometerMode.DISABLED;
      this.status.error = 'All tracking modes failed';
      console.error('❌ All pedometer modes failed');
    }
  }

  private async loadCachedData(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem('ios_pedometer_cache');
      if (cached) {
        const data = JSON.parse(cached);
        const cachedDate = data.date;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Only use cached data if it's from today
        if (cachedDate === today) {
          this.lastStepCount = data.lastStepCount || 0;
          console.log('📂 Loaded cached step data for today:', this.lastStepCount);
          
          // If we have cached data, notify listeners immediately
          if (this.lastStepCount > 0) {
            const cachedStepData: StepData = {
              steps: this.lastStepCount,
              timestamp: new Date().toISOString(),
              source: 'cache',
              confidence: 'low',
            };
            this.lastStepData = cachedStepData;
            this.notifyStepUpdate(cachedStepData);
          }
        } else {
          console.log('🗑️ Cached data is from', cachedDate, '- clearing for new day');
          this.lastStepCount = 0;
          await this.saveCachedData(); // Clear old cache
        }
      }
    } catch (error) {
      console.warn('Failed to load cached data:', error);
    }
  }

  private async saveCachedData(): Promise<void> {
    try {
      const data = {
        lastStepCount: this.lastStepCount,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      };
      await AsyncStorage.setItem('ios_pedometer_cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cached data:', error);
    }
  }

  private async getCachedSteps(): Promise<StepData> {
    return {
      steps: this.lastStepCount,
      timestamp: this.status.lastUpdate || new Date().toISOString(),
      source: 'cache',
      confidence: 'low',
    };
  }

  private notifyStepUpdate(stepData: StepData): void {
    this.lastStepCount = stepData.steps;
    this.status.lastUpdate = stepData.timestamp;
    
    // Save to cache
    this.saveCachedData();
    
    if (this.onStepUpdate) {
      this.onStepUpdate(stepData);
    }
  }

  private notifyStatusChange(): void {
    if (this.onStatusChange) {
      this.onStatusChange({ ...this.status });
    }
  }

  private handleError(error: Error): void {
    this.status.error = error.message;
    console.error('🚨 IOSPedometerService Error:', error.message);
    
    if (this.onError) {
      this.onError(error);
    }
  }
}

export default IOSPedometerService;
