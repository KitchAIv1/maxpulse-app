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
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../stores/appStore';
import { supabase, authService } from '../services/supabase';
import { DailyMetrics, UserProfileFromActivation } from '../types';
import { formatSleepDuration } from '../utils';
import DatabaseInitializer from '../services/DatabaseInitializer';
import TargetManager from '../services/TargetManager';

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
    <LinearGradient
      colors={['#7f1d1d', '#991b1b', '#1f2937']}
      style={styles.gradient}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="white"
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

        {/* Daily Metrics from Database */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Metrics (Database Status)</Text>
          <Text style={styles.sectionSubtitle}>Database record status</Text>
          {dailyMetrics ? (
            <>
              <View style={styles.targetCard}>
                <Text style={styles.targetIcon}>🚶‍♂️</Text>
                <View style={styles.targetInfo}>
                  <Text style={styles.targetLabel}>Steps Target</Text>
                  <Text style={styles.targetValue}>{dailyMetrics.steps_target.toLocaleString()}</Text>
                  <Text style={styles.targetCurrent}>Current: {dailyMetrics.steps_actual.toLocaleString()}</Text>
                </View>
              </View>
              
              <View style={styles.targetCard}>
                <Text style={styles.targetIcon}>💧</Text>
                <View style={styles.targetInfo}>
                  <Text style={styles.targetLabel}>Hydration Target</Text>
                  <Text style={styles.targetValue}>{dailyMetrics.water_oz_target} oz</Text>
                  <Text style={styles.targetCurrent}>Current: {dailyMetrics.water_oz_actual} oz</Text>
                </View>
              </View>
              
              <View style={styles.targetCard}>
                <Text style={styles.targetIcon}>😴</Text>
                <View style={styles.targetInfo}>
                  <Text style={styles.targetLabel}>Sleep Target</Text>
                  <Text style={styles.targetValue}>{dailyMetrics.sleep_hr_target}h</Text>
                  <Text style={styles.targetCurrent}>Current: {formatSleepDuration(dailyMetrics.sleep_hr_actual)}</Text>
                </View>
              </View>
              
              <View style={styles.targetCard}>
                <Text style={styles.targetIcon}>🧠</Text>
                <View style={styles.targetInfo}>
                  <Text style={styles.targetLabel}>Mood Check-ins Target</Text>
                  <Text style={styles.targetValue}>{dailyMetrics.mood_checkins_target}/week</Text>
                  <Text style={styles.targetCurrent}>Current: {dailyMetrics.mood_checkins_actual}</Text>
                </View>
              </View>
              
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>Life Score (Database Calculated)</Text>
                <Text style={styles.dataValue}>{dailyMetrics.life_score}%</Text>
              </View>
            </>
          ) : (
            <Text style={styles.noData}>
              {isLoading ? 'Loading...' : 'No daily metrics found - database may not be initialized'}
            </Text>
          )}
        </View>

        {/* App Store State Comparison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Store State (Current UI)</Text>
          <Text style={styles.sectionSubtitle}>What the dashboard is currently using</Text>
          
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonLabel}>Steps Target</Text>
            <Text style={styles.comparisonValue}>
              DB: {dailyMetrics?.steps_target || 'N/A'} | UI: {targets.steps}
            </Text>
          </View>
          
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonLabel}>Hydration Target</Text>
            <Text style={styles.comparisonValue}>
              DB: {dailyMetrics?.water_oz_target || 'N/A'} oz | UI: {targets.waterOz} oz
            </Text>
          </View>
          
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonLabel}>Sleep Target</Text>
            <Text style={styles.comparisonValue}>
              DB: {dailyMetrics?.sleep_hr_target || 'N/A'}h | UI: {targets.sleepHr}h
            </Text>
          </View>
          
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonLabel}>Current State</Text>
            <Text style={styles.comparisonValue}>
              Steps: {currentState.steps} | Water: {currentState.waterOz}oz | Sleep: {formatSleepDuration(currentState.sleepHr)}
            </Text>
          </View>
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  dataCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dataLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  targetCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  targetInfo: {
    flex: 1,
  },
  targetLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  targetValue: {
    fontSize: 18,
    color: 'white',
    fontWeight: '700',
    marginBottom: 2,
  },
  targetCurrent: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  comparisonCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  comparisonLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'monospace',
  },
  noData: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  refreshButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  initButton: {
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  initButtonText: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: 'rgba(59,130,246,0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  applyButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: 'rgba(220,38,38,0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.3)',
  },
  signOutButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default ProfileScreen;
