// Sync Manager
// Coordinates all data synchronization operations

import * as Network from 'expo-network';
import { AppState, AppStateStatus } from 'react-native';
import HealthDataService from './HealthDataService';
import OfflineQueueService from './OfflineQueueService';

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: string | null;
  pendingOperations: number;
  isSyncing: boolean;
}

export interface SyncConfig {
  autoSyncInterval: number; // milliseconds
  backgroundSyncEnabled: boolean;
  syncOnAppForeground: boolean;
  syncOnNetworkReconnect: boolean;
}

class SyncManager {
  private static instance: SyncManager;
  private healthDataService: HealthDataService;
  private offlineQueue: OfflineQueueService;
  private syncInterval: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;
  
  private status: SyncStatus = {
    isOnline: true,
    lastSyncTime: null,
    pendingOperations: 0,
    isSyncing: false,
  };

  private config: SyncConfig = {
    autoSyncInterval: 300000, // 5 minutes
    backgroundSyncEnabled: true,
    syncOnAppForeground: true,
    syncOnNetworkReconnect: true,
  };

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  constructor() {
    this.healthDataService = HealthDataService.getInstance();
    this.offlineQueue = OfflineQueueService.getInstance();
  }

  async initialize(): Promise<void> {
    try {
      // Check initial network status
      const netState = await Network.getNetworkStateAsync();
      this.status.isOnline = netState.isConnected ?? false;

      // Set up app state monitoring
      this.setupAppStateMonitoring();
      
      // Start auto-sync if online
      if (this.status.isOnline) {
        this.startAutoSync();
      }

      console.log('SyncManager initialized');
    } catch (error) {
      console.error('Failed to initialize SyncManager:', error);
    }
  }

  async manualSync(): Promise<boolean> {
    if (this.status.isSyncing) {
      console.log('Sync already in progress');
      return false;
    }

    if (!this.status.isOnline) {
      console.log('Cannot sync while offline');
      return false;
    }

    return await this.performSync();
  }

  async performSync(): Promise<boolean> {
    try {
      this.status.isSyncing = true;
      
      console.log('Starting data synchronization...');
      
      // Update pending operations count
      this.status.pendingOperations = await this.offlineQueue.getQueueSize();
      
      if (this.status.pendingOperations > 0) {
        console.log(`Syncing ${this.status.pendingOperations} pending operations`);
        await this.healthDataService.syncPendingData();
      }

      // Update status
      this.status.lastSyncTime = new Date().toISOString();
      this.status.pendingOperations = await this.offlineQueue.getQueueSize();
      
      console.log('Data synchronization completed');
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    } finally {
      this.status.isSyncing = false;
    }
  }

  getStatus(): SyncStatus {
    return { ...this.status };
  }

  updateConfig(newConfig: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart auto-sync with new interval if changed
    if (newConfig.autoSyncInterval) {
      this.stopAutoSync();
      if (this.status.isOnline) {
        this.startAutoSync();
      }
    }
  }

  destroy(): void {
    this.stopAutoSync();
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }

  private async checkNetworkStatus(): Promise<void> {
    try {
      const netState = await Network.getNetworkStateAsync();
      const wasOnline = this.status.isOnline;
      this.status.isOnline = netState.isConnected ?? false;
      
      if (!wasOnline && this.status.isOnline) {
        // Just came back online
        if (this.config.syncOnNetworkReconnect) {
          console.log('Network reconnected, triggering sync...');
          this.performSync();
        }
        this.startAutoSync();
      } else if (wasOnline && !this.status.isOnline) {
        // Just went offline
        this.stopAutoSync();
      }
    } catch (error) {
      console.error('Failed to check network status:', error);
    }
  }

  private setupAppStateMonitoring(): void {
    this.appStateSubscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Check network status when app becomes active
        await this.checkNetworkStatus();
        
        if (this.config.syncOnAppForeground && this.status.isOnline) {
          console.log('App became active, triggering sync...');
          this.performSync();
        }
      }
    });
  }

  private startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    if (this.config.backgroundSyncEnabled) {
      this.syncInterval = setInterval(() => {
        if (this.status.isOnline && !this.status.isSyncing) {
          this.performSync();
        }
      }, this.config.autoSyncInterval);
      
      console.log(`Auto-sync started with ${this.config.autoSyncInterval}ms interval`);
    }
  }

  private stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync stopped');
    }
  }
}

export default SyncManager;
