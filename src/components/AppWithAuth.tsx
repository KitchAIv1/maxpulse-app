// App with Authentication Component
// Manages authentication state and routes between auth and main app

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContainer } from '../screens/auth';
import { authService, planService, activationService, supabase } from '../services/supabase';
import { useAppStore } from '../stores/appStore';
import { UserProfileFromActivation } from '../types';

interface AppWithAuthProps {
  children: React.ReactNode;
}

export const AppWithAuth: React.FC<AppWithAuthProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading
  const [user, setUser] = useState<any>(null);
  const { setUser: setStoreUser, initializeTargets } = useAppStore();

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

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

      // Load user's dynamic targets from their plan
      await loadUserTargets(currentUser.id);
      
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  };

  const loadUserTargets = async (userId: string) => {
    try {
      // Try to get current week targets from the plan service
      const dynamicTargets = await planService.getCurrentWeekTargets(userId);
      
      if (dynamicTargets) {
        // Initialize app store with dynamic targets
        initializeTargets({
          steps: dynamicTargets.steps,
          waterOz: dynamicTargets.waterOz,
          sleepHr: dynamicTargets.sleepHr,
        });
      } else {
        // Fallback to default targets if no plan data available
        initializeTargets();
      }
    } catch (error) {
      console.error('Error loading user targets:', error);
      // Fallback to default targets
      initializeTargets();
    }
  };

  const handleAuthComplete = async (authenticatedUser: any, profile?: UserProfileFromActivation) => {
    try {
      setUser(authenticatedUser);
      setStoreUser({
        id: authenticatedUser.id,
        created_at: authenticatedUser.created_at,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        display_name: profile?.name || authenticatedUser.email,
      });

      // If this is a new user with profile data, set up their targets and save profile
      if (profile) {
        // Try to save the profile to the database now that user is authenticated
        try {
          const { error } = await supabase
            .from('app_user_profiles')
            .upsert({
              user_id: authenticatedUser.id,
              email: profile.email,
              name: profile.name,
              age: profile.age,
              gender: profile.gender,
              height_cm: profile.height_cm,
              weight_kg: profile.weight_kg,
              bmi: profile.bmi,
              medical_conditions: profile.medical_conditions,
              medical_allergies: profile.medical_allergies,
              medical_medications: profile.medical_medications,
              mental_health_data: profile.mental_health_data,
              activation_code_id: profile.activation_code_id,
              distributor_id: profile.distributor_id,
              session_id: profile.session_id,
              plan_type: profile.plan_type,
            }, { onConflict: 'user_id' });

          if (error) {
            console.error('Error saving profile after auth:', error);
          } else {
            console.log('Profile saved successfully after authentication');
          }
        } catch (profileError) {
          console.error('Failed to save profile after auth:', profileError);
        }

        // For new users, extract targets from their activation code
        const activationCode = await activationService.getActivationCodeData(profile.activation_code_id);
        if (activationCode) {
          const dynamicTargets = activationService.extractDynamicTargets(activationCode);
          initializeTargets({
            steps: dynamicTargets.steps,
            waterOz: dynamicTargets.waterOz,
            sleepHr: dynamicTargets.sleepHr,
          });
        } else {
          initializeTargets();
        }
      } else {
        // For existing users, load their current targets
        await loadUserTargets(authenticatedUser.id);
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error completing authentication:', error);
      // Still proceed with authentication but use default targets
      setIsAuthenticated(true);
      initializeTargets();
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setStoreUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <LinearGradient
        colors={['#7f1d1d', '#991b1b', '#1f2937']}
        style={styles.loadingContainer}
      >
        <Text style={styles.loadingText}>MaxPulse</Text>
        <Text style={styles.loadingSubtext}>Loading your health journey...</Text>
      </LinearGradient>
    );
  }

  // Not authenticated - show auth screens
  if (!isAuthenticated) {
    return <AuthContainer onAuthComplete={handleAuthComplete} />;
  }

  // Authenticated - show main app
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },
  loadingSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
});
