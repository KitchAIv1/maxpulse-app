// Welcome Screen Error Handling Service
// Comprehensive error handling, logging, and recovery mechanisms

import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ErrorLog {
  id: string;
  timestamp: number;
  type: 'video_load' | 'animation' | 'network' | 'memory' | 'unknown';
  message: string;
  stack?: string;
  deviceInfo: {
    platform: string;
    version: string;
    isExpoGo: boolean;
  };
  context: {
    userId?: string;
    sessionId: string;
    retryCount: number;
  };
}

interface RecoveryStrategy {
  type: 'retry' | 'fallback' | 'skip' | 'alert';
  maxAttempts: number;
  delay: number;
  fallbackAction?: () => void;
}

class WelcomeScreenErrorService {
  private static instance: WelcomeScreenErrorService;
  private errorLogs: ErrorLog[] = [];
  private sessionId: string;
  private recoveryStrategies: Map<string, RecoveryStrategy>;

  private constructor() {
    this.sessionId = Date.now().toString();
    this.initializeRecoveryStrategies();
  }

  static getInstance(): WelcomeScreenErrorService {
    if (!WelcomeScreenErrorService.instance) {
      WelcomeScreenErrorService.instance = new WelcomeScreenErrorService();
    }
    return WelcomeScreenErrorService.instance;
  }

  private initializeRecoveryStrategies(): void {
    this.recoveryStrategies = new Map([
      ['video_load', {
        type: 'retry',
        maxAttempts: 3,
        delay: 1000,
        fallbackAction: () => this.triggerFallbackMode(),
      }],
      ['animation', {
        type: 'retry',
        maxAttempts: 2,
        delay: 500,
      }],
      ['network', {
        type: 'fallback',
        maxAttempts: 1,
        delay: 0,
        fallbackAction: () => this.enableOfflineMode(),
      }],
      ['memory', {
        type: 'skip',
        maxAttempts: 1,
        delay: 0,
        fallbackAction: () => this.skipWelcomeScreen(),
      }],
    ]);
  }

  // Error logging and categorization
  async logError(
    error: Error | string, 
    type: ErrorLog['type'] = 'unknown',
    context: Partial<ErrorLog['context']> = {}
  ): Promise<string> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const errorLog: ErrorLog = {
      id: errorId,
      timestamp: Date.now(),
      type,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      deviceInfo: {
        platform: Platform.OS,
        version: Platform.Version.toString(),
        isExpoGo: __DEV__ && !Platform.constants.systemName, // Rough detection
      },
      context: {
        sessionId: this.sessionId,
        retryCount: 0,
        ...context,
      },
    };

    this.errorLogs.push(errorLog);
    await this.persistError(errorLog);
    
    console.error(`🎬 Error [${errorId}]:`, errorLog);
    
    // Trigger recovery strategy
    await this.handleRecovery(errorLog);
    
    return errorId;
  }

  // Recovery mechanisms
  private async handleRecovery(errorLog: ErrorLog): Promise<void> {
    const strategy = this.recoveryStrategies.get(errorLog.type);
    if (!strategy) {
      console.warn(`🎬 Recovery: No strategy found for error type: ${errorLog.type}`);
      return;
    }

    switch (strategy.type) {
      case 'retry':
        await this.executeRetryStrategy(errorLog, strategy);
        break;
      case 'fallback':
        await this.executeFallbackStrategy(errorLog, strategy);
        break;
      case 'skip':
        await this.executeSkipStrategy(errorLog, strategy);
        break;
      case 'alert':
        await this.executeAlertStrategy(errorLog, strategy);
        break;
    }
  }

  private async executeRetryStrategy(errorLog: ErrorLog, strategy: RecoveryStrategy): Promise<void> {
    if (errorLog.context.retryCount < strategy.maxAttempts) {
      console.log(`🎬 Recovery: Retrying in ${strategy.delay}ms (attempt ${errorLog.context.retryCount + 1}/${strategy.maxAttempts})`);
      
      setTimeout(() => {
        // Increment retry count
        errorLog.context.retryCount++;
        // The actual retry logic would be handled by the calling component
      }, strategy.delay);
    } else {
      console.log('🎬 Recovery: Max retries reached, executing fallback');
      strategy.fallbackAction?.();
    }
  }

  private async executeFallbackStrategy(errorLog: ErrorLog, strategy: RecoveryStrategy): Promise<void> {
    console.log('🎬 Recovery: Executing fallback strategy');
    strategy.fallbackAction?.();
  }

  private async executeSkipStrategy(errorLog: ErrorLog, strategy: RecoveryStrategy): Promise<void> {
    console.log('🎬 Recovery: Skipping welcome screen due to error');
    strategy.fallbackAction?.();
  }

  private async executeAlertStrategy(errorLog: ErrorLog, strategy: RecoveryStrategy): Promise<void> {
    Alert.alert(
      'Welcome Screen Error',
      'There was an issue loading the welcome screen. The app will continue normally.',
      [{ text: 'OK', onPress: () => strategy.fallbackAction?.() }]
    );
  }

  // Fallback actions
  private triggerFallbackMode(): void {
    console.log('🎬 Fallback: Switching to animated fallback mode');
    // This would be handled by the WelcomeScreen component
  }

  private enableOfflineMode(): void {
    console.log('🎬 Fallback: Enabling offline mode');
    // Skip network-dependent features
  }

  private skipWelcomeScreen(): void {
    console.log('🎬 Fallback: Skipping welcome screen entirely');
    // This would be handled by the AppWithAuth component
  }

  // Error persistence and analytics
  private async persistError(errorLog: ErrorLog): Promise<void> {
    try {
      const key = `@welcomeScreen_error_${errorLog.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(errorLog));
    } catch (error) {
      console.error('🎬 Error: Failed to persist error log', error);
    }
  }

  async getErrorHistory(limit: number = 50): Promise<ErrorLog[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const errorKeys = keys
        .filter(key => key.startsWith('@welcomeScreen_error_'))
        .sort()
        .slice(-limit);
      
      const errorData = await AsyncStorage.multiGet(errorKeys);
      return errorData
        .map(([_, value]) => value ? JSON.parse(value) : null)
        .filter(Boolean)
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('🎬 Error: Failed to get error history', error);
      return [];
    }
  }

  // Health monitoring
  async getErrorRate(timeWindow: number = 24 * 60 * 60 * 1000): Promise<number> {
    const cutoff = Date.now() - timeWindow;
    const recentErrors = this.errorLogs.filter(log => log.timestamp > cutoff);
    return recentErrors.length;
  }

  async isHealthy(): Promise<boolean> {
    const errorRate = await this.getErrorRate();
    const criticalErrors = this.errorLogs.filter(log => 
      log.type === 'memory' || log.context.retryCount >= 3
    );
    
    return errorRate < 10 && criticalErrors.length === 0;
  }

  // Circuit breaker pattern
  private circuitBreakerState: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly failureThreshold: number = 5;
  private readonly recoveryTimeout: number = 60000; // 1 minute

  shouldAllowWelcomeScreen(): boolean {
    const now = Date.now();
    
    switch (this.circuitBreakerState) {
      case 'closed':
        return true;
      
      case 'open':
        if (now - this.lastFailureTime > this.recoveryTimeout) {
          this.circuitBreakerState = 'half-open';
          console.log('🎬 Circuit Breaker: Moving to half-open state');
          return true;
        }
        return false;
      
      case 'half-open':
        return true;
      
      default:
        return false;
    }
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.circuitBreakerState = 'open';
      console.log('🎬 Circuit Breaker: Opening circuit due to failures');
    }
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.circuitBreakerState = 'closed';
    console.log('🎬 Circuit Breaker: Closing circuit after success');
  }

  // Cleanup
  async cleanup(): Promise<void> {
    // Clean up old error logs (keep last 100)
    try {
      const keys = await AsyncStorage.getAllKeys();
      const errorKeys = keys
        .filter(key => key.startsWith('@welcomeScreen_error_'))
        .sort()
        .slice(0, -100); // Remove all but last 100
      
      if (errorKeys.length > 0) {
        await AsyncStorage.multiRemove(errorKeys);
        console.log(`🎬 Cleanup: Removed ${errorKeys.length} old error logs`);
      }
    } catch (error) {
      console.error('🎬 Cleanup: Failed to clean up error logs', error);
    }
  }

  // Getters
  getSessionId(): string {
    return this.sessionId;
  }

  getCircuitBreakerState(): string {
    return this.circuitBreakerState;
  }
}

export default WelcomeScreenErrorService;
export type { ErrorLog, RecoveryStrategy };
