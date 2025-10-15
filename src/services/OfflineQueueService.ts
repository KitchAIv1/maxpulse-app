// Offline Queue Service
// Handles queuing operations when offline and syncing when online

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export interface QueuedOperation {
  id: string;
  type: 'hydration' | 'sleep' | 'mood' | 'steps';
  operation: 'insert' | 'update' | 'upsert';
  data: any;
  timestamp: string;
  retryCount: number;
  userId: string;
}

export interface QueueConfig {
  maxRetries: number;
  retryDelayMs: number;
  maxQueueSize: number;
}

class OfflineQueueService {
  private static instance: OfflineQueueService;
  private readonly QUEUE_KEY = 'offline_queue';
  private readonly config: QueueConfig = {
    maxRetries: 3,
    retryDelayMs: 1000,
    maxQueueSize: 100,
  };

  public static getInstance(): OfflineQueueService {
    if (!OfflineQueueService.instance) {
      OfflineQueueService.instance = new OfflineQueueService();
    }
    return OfflineQueueService.instance;
  }

  async queueOperation(operation: Omit<QueuedOperation, 'id' | 'retryCount'>): Promise<void> {
    try {
      const queue = await this.getQueue();
      
      // Check queue size limit
      if (queue.length >= this.config.maxQueueSize) {
        console.warn('Queue size limit reached, removing oldest operation');
        queue.shift();
      }

      const queuedOp: QueuedOperation = {
        ...operation,
        id: this.generateId(),
        retryCount: 0,
      };

      queue.push(queuedOp);
      await this.saveQueue(queue);
      
      console.log(`Queued ${operation.type} operation for offline sync`);
    } catch (error) {
      console.error('Failed to queue operation:', error);
    }
  }

  async processQueue(): Promise<void> {
    try {
      const queue = await this.getQueue();
      if (queue.length === 0) return;

      console.log(`Processing ${queue.length} queued operations`);
      
      const failedOperations: QueuedOperation[] = [];
      
      for (const operation of queue) {
        const success = await this.executeOperation(operation);
        
        if (!success) {
          operation.retryCount++;
          if (operation.retryCount < this.config.maxRetries) {
            failedOperations.push(operation);
          } else {
            console.error(`Operation ${operation.id} failed after ${this.config.maxRetries} retries`);
          }
        }
      }

      await this.saveQueue(failedOperations);
    } catch (error) {
      console.error('Failed to process queue:', error);
    }
  }

  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.QUEUE_KEY);
    } catch (error) {
      console.error('Failed to clear queue:', error);
    }
  }

  async getQueueSize(): Promise<number> {
    try {
      const queue = await this.getQueue();
      return queue.length;
    } catch (error) {
      console.error('Failed to get queue size:', error);
      return 0;
    }
  }

  private async executeOperation(operation: QueuedOperation): Promise<boolean> {
    try {
      switch (operation.type) {
        case 'hydration':
          return await this.executeHydrationOperation(operation);
        case 'sleep':
          return await this.executeSleepOperation(operation);
        case 'mood':
          return await this.executeMoodOperation(operation);
        case 'steps':
          return await this.executeStepsOperation(operation);
        default:
          console.error(`Unknown operation type: ${operation.type}`);
          return false;
      }
    } catch (error) {
      console.error(`Failed to execute ${operation.type} operation:`, error);
      return false;
    }
  }

  private async executeHydrationOperation(operation: QueuedOperation): Promise<boolean> {
    const { data, error } = await supabase
      .from('hydration_logs')
      .insert(operation.data);
    
    return !error;
  }

  private async executeSleepOperation(operation: QueuedOperation): Promise<boolean> {
    const { data, error } = await supabase
      .from('sleep_sessions')
      .insert(operation.data);
    
    return !error;
  }

  private async executeMoodOperation(operation: QueuedOperation): Promise<boolean> {
    const { data, error } = await supabase
      .from('mood_checkins')
      .insert(operation.data);
    
    if (error) {
      return false;
    }

    // Also update daily_metrics mood count after successful mood check-in insert
    try {
      const healthService = (await import('./HealthDataService')).default.getInstance();
      await healthService.updateMoodCheckInCount(operation.userId);
    } catch (updateError) {
      console.warn('⚠️ Offline mood sync: Failed to update daily metrics count:', updateError);
      // Don't fail the entire operation - mood check-in was still logged
    }
    
    return true;
  }

  private async executeStepsOperation(operation: QueuedOperation): Promise<boolean> {
    const { data, error } = await supabase
      .from('pedometer_snapshots')
      .insert(operation.data);
    
    return !error;
  }

  private async getQueue(): Promise<QueuedOperation[]> {
    try {
      const queueData = await AsyncStorage.getItem(this.QUEUE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Failed to get queue:', error);
      return [];
    }
  }

  private async saveQueue(queue: QueuedOperation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save queue:', error);
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default OfflineQueueService;
