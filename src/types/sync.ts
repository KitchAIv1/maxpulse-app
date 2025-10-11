// Sync Types
// Type definitions for data synchronization operations

export interface SyncOperation {
  id: string;
  type: 'hydration' | 'sleep' | 'mood' | 'steps' | 'daily_metrics';
  operation: 'insert' | 'update' | 'upsert' | 'delete';
  data: any;
  timestamp: string;
  userId: string;
  retryCount: number;
  maxRetries: number;
}

export interface SyncResult {
  success: boolean;
  operationId: string;
  error?: string;
  timestamp: string;
}

export interface SyncBatch {
  operations: SyncOperation[];
  batchId: string;
  timestamp: string;
  userId: string;
}

export interface SyncMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageLatency: number;
  lastSyncTime: string | null;
}

export interface NetworkStatus {
  isConnected: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown' | 'none';
  isInternetReachable: boolean | null;
}

export interface SyncConfiguration {
  batchSize: number;
  retryDelayMs: number;
  maxRetries: number;
  timeoutMs: number;
  enableCompression: boolean;
  priorityQueue: boolean;
}

export type SyncPriority = 'low' | 'normal' | 'high' | 'critical';

export interface PrioritizedSyncOperation extends SyncOperation {
  priority: SyncPriority;
  dependencies?: string[]; // Operation IDs this depends on
}

export interface SyncConflict {
  operationId: string;
  conflictType: 'version' | 'data' | 'constraint';
  localData: any;
  serverData: any;
  resolution: 'local' | 'server' | 'merge' | 'manual';
}

export interface SyncEvent {
  type: 'sync_started' | 'sync_completed' | 'sync_failed' | 'conflict_detected' | 'network_changed';
  timestamp: string;
  data?: any;
}

export type SyncEventListener = (event: SyncEvent) => void;
