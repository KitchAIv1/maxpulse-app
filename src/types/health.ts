// Health & Step Tracking Types
// Comprehensive type definitions for health data and step tracking

export interface StepData {
  steps: number;
  timestamp: string; // ISO timestamp
  source: 'pedometer' | 'healthkit' | 'googlefit' | 'sensor' | 'coremotion' | 'cache';
  confidence?: 'low' | 'medium' | 'high';
  distance?: number;
  error?: string;
}

export interface DailyStepSummary {
  date: string; // YYYY-MM-DD
  totalSteps: number;
  target: number;
  percentage: number;
  lastUpdated: string; // ISO timestamp
  sources: StepDataSource[];
}

export interface StepDataSource {
  source: 'pedometer' | 'healthkit' | 'googlefit' | 'sensor';
  steps: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface StepTrackingState {
  // Current day data
  todaySteps: number;
  todayTarget: number;
  lastUpdate: string | null;
  
  // Live tracking
  isTracking: boolean;
  liveSteps: number; // Real-time updates
  
  // Historical data
  dailySummaries: DailyStepSummary[];
  
  // Permissions & status
  permissions: HealthPermissions;
  trackingStatus: StepTrackingStatus;
  
  // Error handling
  lastError: string | null;
  
  // Background sync
  lastSyncTime: string | null;
  pendingSyncSteps: number;
}

export interface HealthPermissions {
  // iOS
  motion: PermissionStatus;
  healthKit: PermissionStatus;
  
  // Android
  activityRecognition: PermissionStatus;
  googleFit: PermissionStatus;
  
  // Cross-platform
  backgroundRefresh: PermissionStatus;
}

export type PermissionStatus = 
  | 'not-determined' 
  | 'denied' 
  | 'authorized' 
  | 'restricted' 
  | 'provisional';

export interface StepTrackingStatus {
  isAvailable: boolean;
  isAuthorized: boolean;
  isTracking: boolean;
  lastUpdate?: string;
  lastError: string | null;
  supportedFeatures: StepTrackingFeature[];
}

export type StepTrackingFeature = 
  | 'live-counting'
  | 'historical-data'
  | 'background-sync'
  | 'distance-tracking'
  | 'floors-climbed';

// iOS Core Motion Types
export interface CMPedometerData {
  startDate: Date;
  endDate: Date;
  numberOfSteps: number;
  distance?: number;
  floorsAscended?: number;
  floorsDescended?: number;
  currentPace?: number;
  currentCadence?: number;
}

// Android Sensor Types
export interface AndroidStepSensorData {
  steps: number;
  timestamp: number;
  accuracy: number;
  sensorType: 'step_counter' | 'step_detector';
}

// Google Fit Types
export interface GoogleFitStepData {
  dataSourceId: string;
  steps: number;
  startTime: string;
  endTime: string;
  originDataSourceId?: string;
}

// HealthKit Types
export interface HealthKitStepData {
  value: number;
  startDate: string;
  endDate: string;
  sourceRevision: {
    source: {
      name: string;
      bundleIdentifier: string;
    };
    version?: string;
  };
}

// Configuration
export interface StepTrackingConfig {
  // Update intervals
  liveUpdateInterval: number; // milliseconds
  backgroundSyncInterval: number; // milliseconds
  
  // Behavioral guardrails
  dailyCutoffHour: number; // 22 = 10 PM
  maxStepsPerDay: number; // Anti-gaming limit
  
  // Accuracy settings
  minimumStepThreshold: number; // Ignore tiny movements
  confidenceThreshold: number; // Minimum confidence for counting
  
  // Battery optimization
  enableBackgroundTracking: boolean;
  enableLiveUpdates: boolean;
  
  // Data retention
  historicalDataDays: number; // How many days to keep locally
}

// Events for step tracking
export interface StepTrackingEvents {
  onStepsUpdated: (data: StepData) => void;
  onDailySummaryUpdated: (summary: DailyStepSummary) => void;
  onPermissionChanged: (permissions: HealthPermissions) => void;
  onTrackingStatusChanged: (status: StepTrackingStatus) => void;
  onError: (error: StepTrackingError) => void;
}

export interface StepTrackingError {
  code: string;
  message: string;
  platform: 'ios' | 'android' | 'cross-platform';
  recoverable: boolean;
  timestamp: string;
}

// Service interface
export interface IStepTrackingService {
  // Initialization
  initialize(config: StepTrackingConfig): Promise<void>;
  
  // Permissions
  requestPermissions(): Promise<HealthPermissions>;
  checkPermissions(): Promise<HealthPermissions>;
  
  // Live tracking
  startLiveTracking(): Promise<void>;
  stopLiveTracking(): Promise<void>;
  
  // Data retrieval
  getTodaySteps(): Promise<StepData>;
  getStepsForDate(date: string): Promise<DailyStepSummary>;
  getStepsForDateRange(startDate: string, endDate: string): Promise<DailyStepSummary[]>;
  
  // Background sync
  syncWithHealthPlatform(): Promise<void>;
  
  // Status
  getTrackingStatus(): Promise<StepTrackingStatus>;
  
  // Cleanup
  cleanup(): Promise<void>;
}
