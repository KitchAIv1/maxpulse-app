// Profile Screen Component
// Displays current user profile and backend data for verification

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useAppStore } from '../stores/appStore';
import { supabase, authService } from '../services/supabase';
import { DailyMetrics, UserProfileFromActivation } from '../types';
import { formatSleepDuration } from '../utils';
import DatabaseInitializer from '../services/DatabaseInitializer';
import TargetManager from '../services/TargetManager';
import { theme } from '../utils/theme';
import { calAiCard } from '../utils/calAiStyles';

interface ProfileScreenProps {
  onBack?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const { user, targets, currentState } = useAppStore();
  const [profileData, setProfileData] = useState<UserProfileFromActivation | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics | null>(null);
  const [planProgress, setPlanProgress] = useState<any>(null);
  const [personalizedTargets, setPersonalizedTargets] = useState<{
    steps: number;
    waterOz: number;
    sleepHr: number;
    source: 'personalized' | 'default';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Load user profile from app_user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('app_user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
      } else {
        setProfileData(profile);
        
        // Load personalized targets directly from activation code
        if (profile.activation_code_id) {
          const targets = await TargetManager.getUserTargets(profile.activation_code_id);
          setPersonalizedTargets(targets);
          console.log('🎯 Loaded personalized targets:', targets);
        }
      }

      // Load today's daily metrics
      const today = new Date().toISOString().split('T')[0];
      const { data: metrics, error: metricsError } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (metricsError && metricsError.code !== 'PGRST116') {
        console.error('Error loading daily metrics:', metricsError);
      } else {
        setDailyMetrics(metrics);
      }

      // Load plan progress
      const { data: progress, error: progressError } = await supabase
        .from('plan_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Error loading plan progress:', progressError);
      } else {
        setPlanProgress(progress);
      }

    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      // AppWithAuth will handle the state change
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <View style={styles.gradient}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile & Data</Text>
          <Text style={styles.subtitle}>Backend data verification</Text>
        </View>

        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Information</Text>
          <View style={styles.dataCard}>
            <Text style={styles.dataLabel}>User ID</Text>
            <Text style={styles.dataValue}>{user?.id || 'Not loaded'}</Text>
          </View>
          <View style={styles.dataCard}>
            <Text style={styles.dataLabel}>Display Name</Text>
            <Text style={styles.dataValue}>{user?.display_name || 'Not set'}</Text>
          </View>
        </View>

        {/* Profile Data from Database */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Data (app_user_profiles)</Text>
          {profileData ? (
            <>
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>Name</Text>
                <Text style={styles.dataValue}>{profileData.name}</Text>
              </View>
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>Age</Text>
                <Text style={styles.dataValue}>{profileData.age}</Text>
              </View>
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>BMI</Text>
                <Text style={styles.dataValue}>{profileData.bmi}</Text>
              </View>
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>Activation Code ID</Text>
                <Text style={styles.dataValue}>{profileData.activation_code_id}</Text>
              </View>
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>Plan Type</Text>
                <Text style={styles.dataValue}>{profileData.plan_type || 'Not set'}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.noData}>
              {isLoading ? 'Loading...' : 'No profile data found'}
            </Text>
          )}
        </View>

        {/* Personalized Targets (Source of Truth) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalized Targets ({personalizedTargets?.source || 'loading'})</Text>
          <Text style={styles.sectionSubtitle}>Direct from activation code</Text>
          {personalizedTargets ? (
            <>
              <View style={styles.targetCard}>
                <Text style={styles.targetIcon}>🚶‍♂️</Text>
                <View style={styles.targetInfo}>
                  <Text style={styles.targetLabel}>Steps Target</Text>
                  <Text style={styles.targetValue}>{personalizedTargets.steps.toLocaleString()}</Text>
                  <Text style={styles.targetCurrent}>UI Shows: {targets.steps.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.targetCard}>
                <Text style={styles.targetIcon}>💧</Text>
                <View style={styles.targetInfo}>
                  <Text style={styles.targetLabel}>Hydration Target</Text>
                  <Text style={styles.targetValue}>{personalizedTargets.waterOz} oz</Text>
                  <Text style={styles.targetCurrent}>UI Shows: {targets.waterOz} oz</Text>
                </View>
              </View>
              <View style={styles.targetCard}>
                <Text style={styles.targetIcon}>😴</Text>
                <View style={styles.targetInfo}>
                  <Text style={styles.targetLabel}>Sleep Target</Text>
                  <Text style={styles.targetValue}>{personalizedTargets.sleepHr}h</Text>
                  <Text style={styles.targetCurrent}>UI Shows: {targets.sleepHr}h</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.noData}>
              {isLoading ? 'Loading personalized targets...' : 'No activation code found'}
            </Text>
          )}
        </View>

        {/* Database Status (Simplified) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Database Status</Text>
          <Text style={styles.sectionSubtitle}>Connection and sync status</Text>
          {dailyMetrics ? (
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>✅ Database Connected</Text>
              <Text style={styles.dataValue}>Daily metrics record found</Text>
            </View>
          ) : (
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>⚠️ Database Status</Text>
              <Text style={styles.dataValue}>
                {isLoading ? 'Checking connection...' : 'No daily metrics - may need initialization'}
              </Text>
            </View>
          )}
        </View>


        {/* 90-Day Plan Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>90-Day Plan Progress</Text>
          {planProgress ? (
            <>
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>Current Week</Text>
                <Text style={styles.dataValue}>Week {planProgress.current_week}</Text>
              </View>
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>Current Phase</Text>
                <Text style={styles.dataValue}>Phase {planProgress.current_phase}</Text>
              </View>
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>Weekly Scores</Text>
                <Text style={styles.dataValue}>
                  {JSON.stringify(planProgress.weekly_scores, null, 2)}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.noData}>
              {isLoading ? 'Loading...' : 'No plan progress found'}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>Refresh Data</Text>
          </TouchableOpacity>
          
          {personalizedTargets && personalizedTargets.source === 'personalized' && (
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={async () => {
                if (personalizedTargets) {
                  console.log('🎯 Applying personalized targets to UI:', personalizedTargets);
                  const { initializeTargets } = useAppStore.getState();
                  await initializeTargets({
                    steps: personalizedTargets.steps,
                    waterOz: personalizedTargets.waterOz,
                    sleepHr: personalizedTargets.sleepHr,
                  });
                  console.log('✅ Targets applied successfully!');
                }
              }}
            >
              <Text style={styles.applyButtonText}>Apply Personalized Targets to UI</Text>
            </TouchableOpacity>
          )}
          
          {profileData && !dailyMetrics && (
            <TouchableOpacity 
              style={styles.initButton} 
              onPress={async () => {
                if (user && profileData) {
                  console.log('Manual database initialization...');
                  const success = await DatabaseInitializer.initializeUserData(
                    user.id, 
                    profileData.activation_code_id
                  );
                  if (success) {
                    await handleRefresh();
                  }
                }
              }}
            >
              <Text style={styles.initButtonText}>Initialize Database</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: 50,
    paddingBottom: 100,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.xxlarge,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.typography.regular,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  dataCard: {
    ...calAiCard.base,
    marginBottom: theme.spacing.xsmall,
  },
  dataLabel: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontWeight: theme.typography.weights.medium,
  },
  dataValue: {
    fontSize: theme.typography.regular,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
  },
  targetCard: {
    ...calAiCard.base,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetIcon: {
    fontSize: 24,
    marginRight: theme.spacing.base,
  },
  targetInfo: {
    flex: 1,
  },
  targetLabel: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  targetValue: {
    fontSize: theme.typography.medium,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.bold,
    marginBottom: 2,
  },
  targetCurrent: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textTertiary,
  },
  comparisonCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xsmall,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  comparisonLabel: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: theme.typography.small,
    color: theme.colors.textPrimary,
    fontFamily: 'monospace',
  },
  noData: {
    fontSize: theme.typography.small,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: theme.spacing.md,
  },
  refreshButton: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.base,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  refreshButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.semibold,
  },
  initButton: {
    backgroundColor: theme.colors.success + '20',
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.base,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  initButtonText: {
    color: theme.colors.success,
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.semibold,
  },
  applyButton: {
    backgroundColor: theme.colors.secondary + '20',
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.base,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  applyButtonText: {
    color: theme.colors.secondary,
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.semibold,
  },
  signOutButton: {
    backgroundColor: theme.colors.error + '20',
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  signOutButtonText: {
    color: theme.colors.error,
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.semibold,
  },
  bottomSpacer: {
    height: theme.spacing.md,
  },
});

export default ProfileScreen;
