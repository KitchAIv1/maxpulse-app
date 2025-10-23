// App with Authentication Component
// Manages authentication state and routes between auth and main app

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContainer } from '../screens/auth';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { useAuthManager } from '../hooks/useAuthManager';
import { UserProfileFromActivation } from '../types';

interface AppWithAuthProps {
  children: React.ReactNode;
}

export const AppWithAuth: React.FC<AppWithAuthProps> = ({ children }) => {
  // Development flag - set to false for production (only show welcome once after auth)
  const ALWAYS_SHOW_WELCOME = false;

  // Authentication management
  const { isAuthenticated, user, showWelcome, handleAuthComplete, setShowWelcome } = useAuthManager(ALWAYS_SHOW_WELCOME);

  // Handle authentication completion
  const handleAuthCompleteWrapper = async (authenticatedUser: any, profile?: UserProfileFromActivation) => {
    await handleAuthComplete(authenticatedUser, profile);
  };

  // Debug current state
  console.log('🔍 AppWithAuth render state:', { 
    isAuthenticated, 
    showWelcome,
    hasUser: !!user,
    ALWAYS_SHOW_WELCOME 
  });

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

  // Handle welcome screen completion
  const handleWelcomeComplete = () => {
    console.log('🎬 Welcome screen fade completed, showing dashboard');
    setShowWelcome(false);
  };

  // Get user display name for welcome screen
  const getUserDisplayName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(' ')[0]; // First name only
    }
    if (user?.email) {
      return user.email.split('@')[0]; // Email username
    }
    return 'Friend'; // Fallback
  };

  // Not authenticated - show auth screens
  if (!isAuthenticated) {
    return <AuthContainer onAuthComplete={handleAuthCompleteWrapper} />;
  }

  // Authenticated but showing welcome screen
  if (showWelcome) {
    console.log('🎬 Rendering WelcomeScreen with dashboard behind for user:', getUserDisplayName());
    return (
      <View style={styles.layeredContainer}>
        {/* Dashboard layer (behind welcome screen) */}
        <View style={styles.dashboardLayer}>
          {children}
        </View>
        
        {/* Welcome screen layer (on top) */}
        <View style={styles.welcomeLayer}>
          <WelcomeScreen 
            userName={getUserDisplayName()}
            onComplete={handleWelcomeComplete}
          />
        </View>
      </View>
    );
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
  layeredContainer: {
    flex: 1,
  },
  dashboardLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  welcomeLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
});
