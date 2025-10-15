// Step Tracking Store
// Zustand store for managing step tracking state

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  StepData,
  DailyStepSummary,
  StepTrackingState,
  HealthPermissions,
  StepTrackingStatus,
  StepTrackingConfig,
} from '../types/health';
import StepTrackingService from '../services/StepTrackingService';
import { getTodayDate } from '../utils';

interface StepTrackingStore extends StepTrackingState {
  // Actions
  initializeTracking: (config?: Partial<StepTrackingConfig>) => Promise<void>;
  requestPermissions: () => Promise<void>;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
  syncSteps: () => Promise<void>;
  updateSteps: (stepData: StepData) => void;
  updateDailySummary: (summary: DailyStepSummary) => void;
  setPermissions: (permissions: HealthPermissions) => void;
  setTrackingStatus: (status: StepTrackingStatus) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  updateTarget: (newTarget: number) => void;
  reset: () => void;
  
  // Computed getters
  getTodayPercentage: () => number;
  getStepsRemaining: () => number;
  isTrackingAvailable: () => boolean;
  canStartTracking: () => boolean;
}

const initialState: StepTrackingState = {
  // Current day data
  todaySteps: 0,
  todayTarget: 10000, // Will be synced with app store personalized targets
  lastUpdate: null,
  
  // Live tracking
  isTracking: false,
  liveSteps: 0,
  
  // Historical data
  dailySummaries: [],
  
  // Permissions & status
  permissions: {
    motion: 'not-determined',
    healthKit: 'not-determined',
    activityRecognition: 'not-determined',
    googleFit: 'not-determined',
    backgroundRefresh: 'not-determined',
  },
  trackingStatus: {
    isAvailable: false,
    isAuthorized: false,
    isTracking: false,
    lastError: null,
    supportedFeatures: [],
  },
  
  // Error handling
  lastError: null,
  
  // Background sync
  lastSyncTime: null,
  pendingSyncSteps: 0,
};

export const useStepTrackingStore = create<StepTrackingStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    /**
     * Initialize step tracking service
     */
    initializeTracking: async (config) => {
      try {
        const service = StepTrackingService.getInstance();
        
        // Set up event listeners
        service.on('onStepsUpdated', (stepData) => {
          get().updateSteps(stepData);
        });
        
        service.on('onPermissionChanged', (permissions) => {
          get().setPermissions(permissions);
        });
        
        service.on('onTrackingStatusChanged', (status) => {
          get().setTrackingStatus(status);
        });
        
        service.on('onError', (error) => {
          get().setError(error.message);
        });

        // Initialize the service
        await service.initialize(config);
        
        // Check initial permissions and status
        const permissions = await service.checkPermissions();
        const status = await service.getTrackingStatus();
        
        set({
          permissions,
          trackingStatus: status,
        });

        // Load today's steps
        const todaySteps = await service.getTodaySteps();
        get().updateSteps(todaySteps);

        console.log('Step tracking store initialized');
      } catch (error) {
        console.error('Failed to initialize step tracking:', error);
        set({
          lastError: error instanceof Error ? error.message : 'Initialization failed',
        });
      }
    },

    /**
     * Request all necessary permissions
     */
    requestPermissions: async () => {
      try {
        set({ lastError: null });
        
        const service = StepTrackingService.getInstance();
        const permissions = await service.requestPermissions();
        
        set({ permissions });
        
        // Update tracking status after permission changes
        const status = await service.getTrackingStatus();
        set({ trackingStatus: status });
        
        console.log('Permissions updated:', permissions);
      } catch (error) {
        console.error('Failed to request permissions:', error);
        set({
          lastError: error instanceof Error ? error.message : 'Permission request failed',
        });
      }
    },

    /**
     * Start live step tracking
     */
    startTracking: async () => {
      try {
        set({ lastError: null });
        
        const service = StepTrackingService.getInstance();
        await service.startLiveTracking();
        
        set({ isTracking: true });
        
        // Update tracking status
        const status = await service.getTrackingStatus();
        set({ trackingStatus: status });
        
        console.log('Step tracking started');
      } catch (error) {
        console.error('Failed to start tracking:', error);
        set({
          lastError: error instanceof Error ? error.message : 'Failed to start tracking',
          isTracking: false,
        });
      }
    },

    /**
     * Stop live step tracking
     */
    stopTracking: async () => {
      try {
        const service = StepTrackingService.getInstance();
        await service.stopLiveTracking();
        
        set({ isTracking: false });
        
        // Update tracking status
        const status = await service.getTrackingStatus();
        set({ trackingStatus: status });
        
        console.log('Step tracking stopped');
      } catch (error) {
        console.error('Failed to stop tracking:', error);
        set({
          lastError: error instanceof Error ? error.message : 'Failed to stop tracking',
        });
      }
    },

    /**
     * Sync steps with health platform
     */
    syncSteps: async () => {
      try {
        set({ lastError: null });
        
        const service = StepTrackingService.getInstance();
        await service.syncWithHealthPlatform();
        
        // Get updated step data
        const todaySteps = await service.getTodaySteps();
        get().updateSteps(todaySteps);
        
        set({ lastSyncTime: new Date().toISOString() });
        
        console.log('Steps synced successfully');
      } catch (error) {
        console.error('Failed to sync steps:', error);
        set({
          lastError: error instanceof Error ? error.message : 'Sync failed',
        });
      }
    },

    /**
     * Update step data
     */
    updateSteps: (stepData) => {
      const state = get();
      
      set({
        todaySteps: stepData.steps,
        liveSteps: stepData.steps,
        lastUpdate: stepData.timestamp,
        lastError: null, // Clear any previous errors on successful update
      });

      // Update daily summary
      const today = getTodayDate();
      const existingSummaryIndex = state.dailySummaries.findIndex(
        summary => summary.date === today
      );

      const updatedSummary: DailyStepSummary = {
        date: today,
        totalSteps: stepData.steps,
        target: state.todayTarget,
        percentage: stepData.steps / state.todayTarget,
        lastUpdated: stepData.timestamp,
        sources: [{
          source: stepData.source,
          steps: stepData.steps,
          startTime: today + 'T00:00:00.000Z',
          endTime: stepData.timestamp,
          isActive: true,
        }],
      };

      if (existingSummaryIndex >= 0) {
        // Update existing summary
        const updatedSummaries = [...state.dailySummaries];
        updatedSummaries[existingSummaryIndex] = updatedSummary;
        set({ dailySummaries: updatedSummaries });
      } else {
        // Add new summary
        set({
          dailySummaries: [updatedSummary, ...state.dailySummaries],
        });
      }
    },

    /**
     * Update daily summary
     */
    updateDailySummary: (summary) => {
      const state = get();
      const existingIndex = state.dailySummaries.findIndex(
        s => s.date === summary.date
      );

      if (existingIndex >= 0) {
        const updated = [...state.dailySummaries];
        updated[existingIndex] = summary;
        set({ dailySummaries: updated });
      } else {
        set({
          dailySummaries: [summary, ...state.dailySummaries],
        });
      }
    },

    /**
     * Set permissions
     */
    setPermissions: (permissions) => {
      set({ permissions });
    },

    /**
     * Set tracking status
     */
    setTrackingStatus: (status) => {
      set({ trackingStatus: status });
    },

    /**
     * Set error
     */
    setError: (error) => {
      set({ lastError: error });
    },

    /**
     * Clear error
     */
    clearError: () => {
      set({ lastError: null });
    },

    /**
     * Update step target
     */
    updateTarget: (newTarget) => {
      // Validate target to prevent undefined corruption
      const validTarget = typeof newTarget === 'number' && !isNaN(newTarget) && newTarget > 0 ? newTarget : 10000;
      console.log('🎯 Updating step target from', get().todayTarget, 'to', validTarget);
      set({ todayTarget: validTarget });
    },

    /**
     * Reset store to initial state
     */
    reset: () => {
      set(initialState);
    },

    // Computed getters
    getTodayPercentage: () => {
      const state = get();
      return state.todayTarget > 0 ? state.todaySteps / state.todayTarget : 0;
    },

    getStepsRemaining: () => {
      const state = get();
      return Math.max(0, state.todayTarget - state.todaySteps);
    },

    isTrackingAvailable: () => {
      const state = get();
      return state.trackingStatus.isAvailable && state.trackingStatus.isAuthorized;
    },

    canStartTracking: () => {
      const state = get();
      return (
        state.trackingStatus.isAvailable &&
        state.trackingStatus.isAuthorized &&
        !state.isTracking
      );
    },
  }))
);

// Selectors for computed values
export const useStepProgress = () => {
  const { todaySteps, todayTarget, getTodayPercentage, getStepsRemaining } = useStepTrackingStore();
  
  return {
    steps: todaySteps,
    target: todayTarget,
    percentage: getTodayPercentage(),
    remaining: getStepsRemaining(),
    isComplete: todaySteps >= todayTarget,
  };
};

export const useStepTrackingStatus = () => {
  const { 
    trackingStatus, 
    permissions, 
    isTracking, 
    lastError,
    isTrackingAvailable,
    canStartTracking 
  } = useStepTrackingStore();
  
  return {
    status: trackingStatus,
    permissions,
    isTracking,
    lastError,
    isAvailable: isTrackingAvailable(),
    canStart: canStartTracking(),
  };
};

export const useStepHistory = () => {
  const { dailySummaries, lastSyncTime } = useStepTrackingStore();
  
  return {
    summaries: dailySummaries,
    lastSync: lastSyncTime,
    hasData: dailySummaries.length > 0,
  };
};
