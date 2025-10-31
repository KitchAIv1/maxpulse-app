// Authentication Manager Hook
// Handles all authentication logic, user data loading, and service initialization

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, supabase } from '../services/supabase';
import { useAppStore } from '../stores/appStore';
import { UserProfileFromActivation } from '../types';
import { getTodayDate } from '../utils';
import SyncManager from '../services/SyncManager';
import TargetManager from '../services/TargetManager';
import DailyMetricsUpdater from '../services/DailyMetricsUpdater';
import NetworkService from '../services/NetworkService';
import HealthDataService from '../services/HealthDataService';

export interface AuthState {
  isAuthenticated: boolean | null;
  user: any;
  showWelcome: boolean;
}

export interface AuthActions {
  handleAuthComplete: (authenticatedUser: any, profile?: UserProfileFromActivation) => Promise<void>;
  setShowWelcome: (show: boolean) => void;
}

export const useAuthManager = (alwaysShowWelcome: boolean = false) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const { setUser: setStoreUser, initializeTargets, loadTodayData } = useAppStore();

  // Load user targets from their plan
  const loadUserTargets = async (userId: string) => {
    try {
      console.log('🎯 V2 Engine: Loading current week targets for user:', userId);
      const targets = await TargetManager.getCurrentWeekTargets(userId);
      console.log('✅ V2 Engine loaded targets:', targets);
      
      // Set targets in store (pass as object, not individual parameters)
      await initializeTargets({
        steps: targets.steps,
        waterOz: targets.waterOz,
        sleepHr: targets.sleepHr
      });
      console.log('🎯 Dashboard now shows V2 Engine targets:', targets);

      // ✅ CRITICAL FIX: Backfill mood check-in counts for historical data
      try {
        const { default: HealthDataService } = await import('../services/HealthDataService');
        const healthService = HealthDataService.getInstance();
        const updatedCount = await healthService.backfillMoodCheckInCounts(userId);
        if (updatedCount > 0) {
          console.log(`🔄 Backfilled mood check-in counts for ${updatedCount} dates`);
        }
      } catch (backfillError) {
        console.warn('⚠️ Failed to backfill mood check-in counts:', backfillError);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load V2 Engine targets, using defaults:', error);
      await initializeTargets();
    }
  };

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      const { user: currentUser, error } = await authService.getCurrentUser();
      
      if (error || !currentUser) {
        setIsAuthenticated(false);
        return;
      }

      setUser(currentUser);
      setStoreUser({
        id: currentUser.id,
        created_at: currentUser.created_at,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        display_name: currentUser.user_metadata?.name || currentUser.email,
      });

      // Parallelize independent operations for faster load time
      await Promise.all([
        loadUserTargets(currentUser.id),
        loadTodayData(),
      ]);
      
      // Fix any existing daily_metrics rows with wrong targets (run once per day, deferred)
      setTimeout(async () => {
        try {
          const today = getTodayDate();
          const lastAuditDate = await AsyncStorage.getItem('@last_metrics_audit_date');
          
          // Only run audit once per day
          if (lastAuditDate !== today) {
            console.log('🔧 Running daily_metrics audit and fix...');
            const result = await DailyMetricsUpdater.auditAndFix(currentUser.id);
            if (result.success) {
              console.log(`✅ Daily metrics fixed: ${result.rowsUpdated} updated, ${result.rowsCreated} ensured`);
              await AsyncStorage.setItem('@last_metrics_audit_date', today);
            }
          } else {
            console.log('✅ Daily metrics audit already completed today, skipping');
          }
        } catch (error) {
          console.warn('⚠️ Daily metrics fix failed (non-critical):', error);
        }
      }, 5000); // Increased delay to 5s to ensure app is fully loaded
      
      if (alwaysShowWelcome) {
        console.log('🎬 Setting showWelcome to true (checkAuthStatus)');
        setShowWelcome(true);
      }
      
      setIsAuthenticated(true);
      
      // Initialize services
      setTimeout(async () => {
        try {
          await SyncManager.getInstance().initialize();
          console.log('✅ Background sync initialized');
          
          await NetworkService.getInstance().initialize();
          console.log('✅ Network service initialized');
          
          await HealthDataService.getInstance().syncPendingData();
          console.log('✅ Processed queued operations');
        } catch (error) {
          console.warn('⚠️ Service initialization failed (non-critical):', error);
        }
      }, 100);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  };

  // Handle authentication completion
  const handleAuthComplete = async (authenticatedUser: any, profile?: UserProfileFromActivation) => {
    try {
      setUser(authenticatedUser);
      setStoreUser({
        id: authenticatedUser.id,
        created_at: authenticatedUser.created_at,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        display_name: authenticatedUser.user_metadata?.name || authenticatedUser.email,
      });

      if (profile) {
        await initializeTargets({
          steps: profile.steps_target,
          waterOz: profile.water_target,
          sleepHr: profile.sleep_target
        });
      } else {
        await loadUserTargets(authenticatedUser.id);
      }

      if (alwaysShowWelcome || profile) {
        console.log('🎬 Setting showWelcome to true (handleAuthComplete)', { alwaysShowWelcome, hasProfile: !!profile });
        setShowWelcome(true);
      }
      
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error completing authentication:', error);
      setIsAuthenticated(true);
    }
  };

  // Set up auth listener
  useEffect(() => {
    checkAuthStatus();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.id || 'no user');
        
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUser(null);
          setShowWelcome(false);
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setStoreUser({
            id: session.user.id,
            created_at: session.user.created_at,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
            display_name: session.user.user_metadata?.name || session.user.email,
          });
          
          // Parallelize independent operations for faster load time
          await Promise.all([
            loadUserTargets(session.user.id),
            loadTodayData(),
          ]);
          
          // Only show welcome if not already authenticated (prevents multiple triggers)
          if (alwaysShowWelcome && !isAuthenticated) {
            console.log('🎬 Setting showWelcome to true (auth state change)');
            setShowWelcome(true);
          }
          
          setIsAuthenticated(true);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [alwaysShowWelcome]);

  return {
    // State
    isAuthenticated,
    user,
    showWelcome,
    // Actions
    handleAuthComplete,
    setShowWelcome,
  };
};

