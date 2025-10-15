// Welcome Screen Performance Service
// Handles performance optimization, caching, and resource management

import AsyncStorage from '@react-native-async-storage/async-storage';

interface PerformanceMetrics {
  videoLoadTime: number;
  animationStartTime: number;
  animationEndTime: number;
  totalDuration: number;
  memoryUsage?: number;
  errorCount: number;
}

interface WelcomeConfig {
  enabled: boolean;
  videoPath: string;
  duration: number;
  fadeOutDuration: number;
  showOnEveryLogin: boolean;
  showOnFirstLogin: boolean;
  maxRetries: number;
  fallbackEnabled: boolean;
}

class WelcomeScreenPerformanceService {
  private static instance: WelcomeScreenPerformanceService;
  private metrics: PerformanceMetrics;
  private config: WelcomeConfig;
  private startTime: number = 0;
  private retryCount: number = 0;

  private constructor() {
    this.metrics = {
      videoLoadTime: 0,
      animationStartTime: 0,
      animationEndTime: 0,
      totalDuration: 0,
      errorCount: 0,
    };

    this.config = {
      enabled: true,
      videoPath: '../../assets/videos/welcome.mp4',
      duration: 3000,
      fadeOutDuration: 1000,
      showOnEveryLogin: __DEV__, // Only in development
      showOnFirstLogin: true,
      maxRetries: 2,
      fallbackEnabled: true,
    };
  }

  static getInstance(): WelcomeScreenPerformanceService {
    if (!WelcomeScreenPerformanceService.instance) {
      WelcomeScreenPerformanceService.instance = new WelcomeScreenPerformanceService();
    }
    return WelcomeScreenPerformanceService.instance;
  }

  // Performance tracking
  startTracking(): void {
    this.startTime = Date.now();
    this.metrics.animationStartTime = this.startTime;
    console.log('🎬 Performance: Welcome screen tracking started');
  }

  recordVideoLoad(): void {
    const loadTime = Date.now() - this.startTime;
    this.metrics.videoLoadTime = loadTime;
    console.log(`🎬 Performance: Video loaded in ${loadTime}ms`);
  }

  recordAnimationComplete(): void {
    this.metrics.animationEndTime = Date.now();
    this.metrics.totalDuration = this.metrics.animationEndTime - this.metrics.animationStartTime;
    console.log(`🎬 Performance: Total duration ${this.metrics.totalDuration}ms`);
    this.saveMetrics();
  }

  recordError(error: Error): void {
    this.metrics.errorCount++;
    console.error('🎬 Performance: Error recorded', error);
    this.saveMetrics();
  }

  // Configuration management
  async loadConfig(): Promise<WelcomeConfig> {
    try {
      const stored = await AsyncStorage.getItem('@welcomeScreen_config');
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('🎬 Config: Failed to load config, using defaults');
    }
    return this.config;
  }

  async updateConfig(updates: Partial<WelcomeConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };
    try {
      await AsyncStorage.setItem('@welcomeScreen_config', JSON.stringify(this.config));
      console.log('🎬 Config: Updated successfully');
    } catch (error) {
      console.error('🎬 Config: Failed to save config', error);
    }
  }

  // Retry logic
  shouldRetry(): boolean {
    return this.retryCount < this.config.maxRetries;
  }

  incrementRetry(): void {
    this.retryCount++;
    console.log(`🎬 Retry: Attempt ${this.retryCount}/${this.config.maxRetries}`);
  }

  resetRetry(): void {
    this.retryCount = 0;
  }

  // Memory management
  async checkMemoryUsage(): Promise<void> {
    // In a real app, you'd use a native module to check memory
    // For now, we'll simulate memory awareness
    const simulatedMemoryUsage = Math.random() * 100;
    this.metrics.memoryUsage = simulatedMemoryUsage;
    
    if (simulatedMemoryUsage > 80) {
      console.warn('🎬 Memory: High memory usage detected, considering fallback');
      await this.updateConfig({ fallbackEnabled: true });
    }
  }

  // Analytics
  private async saveMetrics(): Promise<void> {
    try {
      const key = `@welcomeScreen_metrics_${new Date().toISOString().split('T')[0]}`;
      await AsyncStorage.setItem(key, JSON.stringify(this.metrics));
    } catch (error) {
      console.error('🎬 Analytics: Failed to save metrics', error);
    }
  }

  async getAnalytics(): Promise<PerformanceMetrics[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const metricsKeys = keys.filter(key => key.startsWith('@welcomeScreen_metrics_'));
      const metricsData = await AsyncStorage.multiGet(metricsKeys);
      
      return metricsData
        .map(([_, value]) => value ? JSON.parse(value) : null)
        .filter(Boolean);
    } catch (error) {
      console.error('🎬 Analytics: Failed to get analytics', error);
      return [];
    }
  }

  // Health checks
  async performHealthCheck(): Promise<boolean> {
    try {
      await this.checkMemoryUsage();
      const recentMetrics = await this.getAnalytics();
      
      // Check error rate
      const recentErrors = recentMetrics.slice(-10);
      const errorRate = recentErrors.reduce((sum, m) => sum + m.errorCount, 0) / recentErrors.length;
      
      if (errorRate > 0.3) { // 30% error rate threshold
        console.warn('🎬 Health: High error rate detected, disabling welcome screen');
        await this.updateConfig({ enabled: false });
        return false;
      }

      return true;
    } catch (error) {
      console.error('🎬 Health: Health check failed', error);
      return false;
    }
  }

  // Cleanup
  cleanup(): void {
    this.resetRetry();
    console.log('🎬 Performance: Cleanup completed');
  }

  // Getters
  getConfig(): WelcomeConfig {
    return { ...this.config };
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

export default WelcomeScreenPerformanceService;
export type { WelcomeConfig, PerformanceMetrics };
