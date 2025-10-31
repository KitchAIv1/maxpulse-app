// User Consent Manager
// Manages user consent preferences for product recommendations and health data
// Follows .cursorrules: <200 lines, single responsibility

import { supabase } from '../supabase';
import { UserConsentPreferences, UpdateUserConsent } from '../../types/health';

class UserConsentManager {
  private static instance: UserConsentManager;
  private consentCache: Map<string, UserConsentPreferences> = new Map();

  private constructor() {}

  public static getInstance(): UserConsentManager {
    if (!UserConsentManager.instance) {
      UserConsentManager.instance = new UserConsentManager();
    }
    return UserConsentManager.instance;
  }

  /**
   * Get user consent preferences
   */
  public async getUserConsent(userId: string): Promise<UserConsentPreferences | null> {
    // Check cache first
    if (this.consentCache.has(userId)) {
      return this.consentCache.get(userId)!;
    }

    try {
      const { data, error } = await supabase
        .from('user_consent_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No consent record exists, create default
          return await this.createDefaultConsent(userId);
        }
        throw error;
      }

      // Cache the result
      if (data) {
        this.consentCache.set(userId, data);
      }

      return data;
    } catch (error) {
      console.error('Error fetching user consent:', error);
      return null;
    }
  }

  /**
   * Create default consent preferences for new user
   */
  private async createDefaultConsent(userId: string): Promise<UserConsentPreferences | null> {
    try {
      const defaultConsent = {
        user_id: userId,
        product_recommendations_enabled: false,
        data_sharing_enabled: false,
        ai_analysis_enabled: true,
        health_data_retention_days: 365,
        marketing_consent: false,
        research_consent: false,
        third_party_sharing: false,
        consent_version: '1.0',
      };

      const { data, error } = await supabase
        .from('user_consent_preferences')
        .insert(defaultConsent)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        this.consentCache.set(userId, data);
      }

      return data;
    } catch (error) {
      console.error('Error creating default consent:', error);
      return null;
    }
  }

  /**
   * Update user consent preferences
   */
  public async updateConsent(
    userId: string,
    updates: UpdateUserConsent
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_consent_preferences')
        .update({
          ...updates,
          consent_updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Clear cache to force refresh
      this.consentCache.delete(userId);

      return true;
    } catch (error) {
      console.error('Error updating consent:', error);
      return false;
    }
  }

  /**
   * Check if user has consented to product recommendations
   */
  public async hasProductRecommendationConsent(userId: string): Promise<boolean> {
    const consent = await this.getUserConsent(userId);
    return consent?.product_recommendations_enabled ?? false;
  }

  /**
   * Enable product recommendations for user
   */
  public async enableProductRecommendations(userId: string): Promise<boolean> {
    return await this.updateConsent(userId, {
      product_recommendations_enabled: true,
    });
  }

  /**
   * Disable product recommendations for user
   */
  public async disableProductRecommendations(userId: string): Promise<boolean> {
    return await this.updateConsent(userId, {
      product_recommendations_enabled: false,
    });
  }

  /**
   * Check if user has consented to AI analysis
   */
  public async hasAIAnalysisConsent(userId: string): Promise<boolean> {
    const consent = await this.getUserConsent(userId);
    return consent?.ai_analysis_enabled ?? true; // Default to true
  }

  /**
   * Log consent action for audit trail
   */
  public async logConsentAction(
    userId: string,
    action: 'given' | 'revoked' | 'updated',
    consentType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase.from('health_data_audit_log').insert({
        user_id: userId,
        action_type: 'update',
        table_name: 'user_consent_preferences',
        record_id: userId,
        action_details: {
          action,
          consent_type: consentType,
          timestamp: new Date().toISOString(),
          ...metadata,
        },
      });
    } catch (error) {
      console.error('Error logging consent action:', error);
    }
  }

  /**
   * Get consent summary for display
   */
  public async getConsentSummary(userId: string): Promise<{
    productRecommendations: boolean;
    aiAnalysis: boolean;
    dataSharing: boolean;
    marketing: boolean;
  } | null> {
    const consent = await this.getUserConsent(userId);
    if (!consent) return null;

    return {
      productRecommendations: consent.product_recommendations_enabled,
      aiAnalysis: consent.ai_analysis_enabled,
      dataSharing: consent.data_sharing_enabled,
      marketing: consent.marketing_consent,
    };
  }

  /**
   * Clear consent cache (useful for logout)
   */
  public clearCache(userId?: string): void {
    if (userId) {
      this.consentCache.delete(userId);
    } else {
      this.consentCache.clear();
    }
  }
}

export default UserConsentManager;

