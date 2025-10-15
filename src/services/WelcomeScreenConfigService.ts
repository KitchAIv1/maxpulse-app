// Welcome Screen Configuration Service
// Manages different configurations for user types, A/B testing, and feature flags

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface UserProfile {
  id: string;
  type: 'new' | 'returning' | 'premium' | 'trial' | 'admin';
  signupDate: string;
  lastLoginDate: string;
  loginCount: number;
  preferences: {
    skipAnimations: boolean;
    reducedMotion: boolean;
    dataUsageMode: 'full' | 'reduced' | 'minimal';
  };
}

interface WelcomeVariant {
  id: string;
  name: string;
  enabled: boolean;
  weight: number; // For A/B testing distribution
  config: {
    showVideo: boolean;
    videoPath?: string;
    videoDuration: number;
    fadeOutDuration: number;
    showWelcomeText: boolean;
    welcomeMessage: string;
    showOnEveryLogin: boolean;
    showOnFirstLogin: boolean;
    backgroundColor: string;
    textColor: string;
    logoSize: 'small' | 'medium' | 'large';
    animationStyle: 'fade' | 'slide' | 'zoom' | 'none';
  };
  targeting: {
    userTypes: UserProfile['type'][];
    platforms: ('ios' | 'android')[];
    minAppVersion?: string;
    maxLoginCount?: number;
    deviceCapabilities: {
      requiresHighPerformance: boolean;
      requiresVideo: boolean;
      minMemoryMB: number;
    };
  };
}

interface FeatureFlags {
  welcomeScreenEnabled: boolean;
  videoPlaybackEnabled: boolean;
  animationsEnabled: boolean;
  analyticsEnabled: boolean;
  abTestingEnabled: boolean;
  accessibilityMode: boolean;
  debugMode: boolean;
}

class WelcomeScreenConfigService {
  private static instance: WelcomeScreenConfigService;
  private variants: WelcomeVariant[] = [];
  private featureFlags: FeatureFlags;
  private currentVariant: WelcomeVariant | null = null;
  private userProfile: UserProfile | null = null;

  private constructor() {
    this.initializeDefaultVariants();
    this.initializeFeatureFlags();
  }

  static getInstance(): WelcomeScreenConfigService {
    if (!WelcomeScreenConfigService.instance) {
      WelcomeScreenConfigService.instance = new WelcomeScreenConfigService();
    }
    return WelcomeScreenConfigService.instance;
  }

  private initializeDefaultVariants(): void {
    this.variants = [
      {
        id: 'default_video',
        name: 'Default Video Welcome',
        enabled: true,
        weight: 50,
        config: {
          showVideo: true,
          videoPath: '../../assets/videos/welcome.mp4',
          videoDuration: 3000,
          fadeOutDuration: 1000,
          showWelcomeText: true,
          welcomeMessage: 'Welcome, {userName}!',
          showOnEveryLogin: false,
          showOnFirstLogin: true,
          backgroundColor: '#000000',
          textColor: '#ffffff',
          logoSize: 'medium',
          animationStyle: 'fade',
        },
        targeting: {
          userTypes: ['new', 'returning', 'premium'],
          platforms: ['ios', 'android'],
          deviceCapabilities: {
            requiresHighPerformance: true,
            requiresVideo: true,
            minMemoryMB: 512,
          },
        },
      },
      {
        id: 'minimal_fallback',
        name: 'Minimal Fallback Welcome',
        enabled: true,
        weight: 30,
        config: {
          showVideo: false,
          videoDuration: 2000,
          fadeOutDuration: 500,
          showWelcomeText: true,
          welcomeMessage: 'Welcome back, {userName}!',
          showOnEveryLogin: false,
          showOnFirstLogin: true,
          backgroundColor: '#1a1a1a',
          textColor: '#ffffff',
          logoSize: 'small',
          animationStyle: 'fade',
        },
        targeting: {
          userTypes: ['trial', 'returning'],
          platforms: ['ios', 'android'],
          deviceCapabilities: {
            requiresHighPerformance: false,
            requiresVideo: false,
            minMemoryMB: 256,
          },
        },
      },
      {
        id: 'premium_enhanced',
        name: 'Premium Enhanced Welcome',
        enabled: true,
        weight: 20,
        config: {
          showVideo: true,
          videoPath: '../../assets/videos/welcome_premium.mp4',
          videoDuration: 4000,
          fadeOutDuration: 1500,
          showWelcomeText: true,
          welcomeMessage: 'Welcome back, Premium Member!',
          showOnEveryLogin: true,
          showOnFirstLogin: true,
          backgroundColor: '#000000',
          textColor: '#ffd700',
          logoSize: 'large',
          animationStyle: 'zoom',
        },
        targeting: {
          userTypes: ['premium'],
          platforms: ['ios', 'android'],
          deviceCapabilities: {
            requiresHighPerformance: true,
            requiresVideo: true,
            minMemoryMB: 1024,
          },
        },
      },
    ];
  }

  private initializeFeatureFlags(): void {
    this.featureFlags = {
      welcomeScreenEnabled: true,
      videoPlaybackEnabled: !__DEV__, // Disabled in Expo Go
      animationsEnabled: true,
      analyticsEnabled: true,
      abTestingEnabled: false, // Enable for production A/B testing
      accessibilityMode: false,
      debugMode: __DEV__,
    };
  }

  // Configuration loading and selection
  async loadConfiguration(userProfile: UserProfile): Promise<WelcomeVariant | null> {
    this.userProfile = userProfile;
    
    // Load remote config if available
    await this.loadRemoteConfig();
    
    // Check feature flags
    if (!this.featureFlags.welcomeScreenEnabled) {
      console.log('🎬 Config: Welcome screen disabled by feature flag');
      return null;
    }

    // Select appropriate variant
    const variant = await this.selectVariant(userProfile);
    this.currentVariant = variant;
    
    if (variant) {
      console.log(`🎬 Config: Selected variant "${variant.name}" for user type "${userProfile.type}"`);
      await this.trackVariantSelection(variant, userProfile);
    }

    return variant;
  }

  private async selectVariant(userProfile: UserProfile): Promise<WelcomeVariant | null> {
    // Filter variants based on targeting criteria
    const eligibleVariants = this.variants.filter(variant => 
      this.isVariantEligible(variant, userProfile)
    );

    if (eligibleVariants.length === 0) {
      console.log('🎬 Config: No eligible variants found');
      return null;
    }

    // A/B testing selection
    if (this.featureFlags.abTestingEnabled) {
      return this.selectVariantByWeight(eligibleVariants, userProfile);
    }

    // Default selection (highest priority)
    return eligibleVariants[0];
  }

  private isVariantEligible(variant: WelcomeVariant, userProfile: UserProfile): boolean {
    // Check if variant is enabled
    if (!variant.enabled) return false;

    // Check user type targeting
    if (!variant.targeting.userTypes.includes(userProfile.type)) return false;

    // Check platform targeting
    if (!variant.targeting.platforms.includes(Platform.OS as 'ios' | 'android')) return false;

    // Check login count constraints
    if (variant.targeting.maxLoginCount && userProfile.loginCount > variant.targeting.maxLoginCount) {
      return false;
    }

    // Check device capabilities
    if (variant.targeting.deviceCapabilities.requiresVideo && !this.featureFlags.videoPlaybackEnabled) {
      return false;
    }

    // Check user preferences
    if (userProfile.preferences.skipAnimations && variant.config.animationStyle !== 'none') {
      return false;
    }

    if (userProfile.preferences.dataUsageMode === 'minimal' && variant.config.showVideo) {
      return false;
    }

    return true;
  }

  private selectVariantByWeight(variants: WelcomeVariant[], userProfile: UserProfile): WelcomeVariant {
    // Deterministic selection based on user ID for consistent A/B testing
    const userHash = this.hashUserId(userProfile.id);
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    const threshold = (userHash % totalWeight);
    
    let currentWeight = 0;
    for (const variant of variants) {
      currentWeight += variant.weight;
      if (threshold < currentWeight) {
        return variant;
      }
    }
    
    return variants[0]; // Fallback
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Remote configuration
  private async loadRemoteConfig(): Promise<void> {
    try {
      // In production, this would fetch from your backend
      const cachedConfig = await AsyncStorage.getItem('@welcomeScreen_remoteConfig');
      if (cachedConfig) {
        const remoteConfig = JSON.parse(cachedConfig);
        this.mergeRemoteConfig(remoteConfig);
      }
    } catch (error) {
      console.error('🎬 Config: Failed to load remote config', error);
    }
  }

  private mergeRemoteConfig(remoteConfig: any): void {
    // Merge feature flags
    if (remoteConfig.featureFlags) {
      this.featureFlags = { ...this.featureFlags, ...remoteConfig.featureFlags };
    }

    // Update variants
    if (remoteConfig.variants) {
      remoteConfig.variants.forEach((remoteVariant: any) => {
        const existingIndex = this.variants.findIndex(v => v.id === remoteVariant.id);
        if (existingIndex >= 0) {
          this.variants[existingIndex] = { ...this.variants[existingIndex], ...remoteVariant };
        } else {
          this.variants.push(remoteVariant);
        }
      });
    }
  }

  // Analytics and tracking
  private async trackVariantSelection(variant: WelcomeVariant, userProfile: UserProfile): Promise<void> {
    if (!this.featureFlags.analyticsEnabled) return;

    const event = {
      type: 'welcome_screen_variant_selected',
      timestamp: Date.now(),
      variantId: variant.id,
      variantName: variant.name,
      userId: userProfile.id,
      userType: userProfile.type,
      platform: Platform.OS,
    };

    try {
      await AsyncStorage.setItem(
        `@welcomeScreen_analytics_${Date.now()}`,
        JSON.stringify(event)
      );
    } catch (error) {
      console.error('🎬 Config: Failed to track variant selection', error);
    }
  }

  // Dynamic configuration updates
  async updateVariant(variantId: string, updates: Partial<WelcomeVariant>): Promise<void> {
    const index = this.variants.findIndex(v => v.id === variantId);
    if (index >= 0) {
      this.variants[index] = { ...this.variants[index], ...updates };
      await this.persistConfiguration();
      console.log(`🎬 Config: Updated variant ${variantId}`);
    }
  }

  async updateFeatureFlag(flag: keyof FeatureFlags, value: boolean): Promise<void> {
    this.featureFlags[flag] = value;
    await this.persistConfiguration();
    console.log(`🎬 Config: Updated feature flag ${flag} to ${value}`);
  }

  private async persistConfiguration(): Promise<void> {
    try {
      const config = {
        variants: this.variants,
        featureFlags: this.featureFlags,
        lastUpdated: Date.now(),
      };
      await AsyncStorage.setItem('@welcomeScreen_config', JSON.stringify(config));
    } catch (error) {
      console.error('🎬 Config: Failed to persist configuration', error);
    }
  }

  // Getters
  getCurrentVariant(): WelcomeVariant | null {
    return this.currentVariant;
  }

  getFeatureFlags(): FeatureFlags {
    return { ...this.featureFlags };
  }

  getAllVariants(): WelcomeVariant[] {
    return [...this.variants];
  }

  isFeatureEnabled(flag: keyof FeatureFlags): boolean {
    return this.featureFlags[flag];
  }

  // Utility methods
  shouldShowWelcomeScreen(userProfile: UserProfile): boolean {
    if (!this.currentVariant) return false;
    
    const config = this.currentVariant.config;
    
    // Check if it's first login
    if (userProfile.loginCount === 1 && config.showOnFirstLogin) {
      return true;
    }
    
    // Check if it should show on every login
    if (config.showOnEveryLogin) {
      return true;
    }
    
    return false;
  }

  getPersonalizedMessage(userName: string): string {
    if (!this.currentVariant) return `Welcome, ${userName}!`;
    
    return this.currentVariant.config.welcomeMessage.replace('{userName}', userName);
  }
}

export default WelcomeScreenConfigService;
export type { UserProfile, WelcomeVariant, FeatureFlags };
