// Auth Container Component
// Manages authentication flow between login, signup, and profile confirmation

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { LoginScreen } from './LoginScreen';
import { SignupScreen } from './SignupScreen';
import { ProfileConfirmationScreen } from './ProfileConfirmationScreen';
import { ActivationCode, UserProfileFromActivation } from '../../types';

interface AuthContainerProps {
  onAuthComplete: (user: any, profile?: UserProfileFromActivation) => void;
}

type AuthFlow = 'login' | 'signup' | 'profile-confirmation';

export const AuthContainer: React.FC<AuthContainerProps> = ({ onAuthComplete }) => {
  const [currentFlow, setCurrentFlow] = useState<AuthFlow>('signup');
  const [authData, setAuthData] = useState<{
    user: any;
    activationCode?: ActivationCode;
  } | null>(null);

  const handleLoginSuccess = (user: any) => {
    // For existing users, complete auth without profile setup
    onAuthComplete(user);
  };

  const handleSignupSuccess = (user: any, activationCode: ActivationCode) => {
    // Store auth data and move to profile confirmation
    setAuthData({ user, activationCode });
    setCurrentFlow('profile-confirmation');
  };

  const handleProfileConfirmed = (profile: UserProfileFromActivation) => {
    // Complete auth with profile data
    if (authData?.user) {
      onAuthComplete(authData.user, profile);
    }
  };

  const handleBackToSignup = () => {
    setCurrentFlow('signup');
    setAuthData(null);
  };

  const renderCurrentScreen = () => {
    switch (currentFlow) {
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onSwitchToSignup={() => setCurrentFlow('signup')}
          />
        );
      
      case 'signup':
        return (
          <SignupScreen
            onSignupSuccess={handleSignupSuccess}
            onSwitchToLogin={() => setCurrentFlow('login')}
          />
        );
      
      case 'profile-confirmation':
        if (!authData?.user || !authData?.activationCode) {
          // Fallback to signup if data is missing
          setCurrentFlow('signup');
          return null;
        }
        return (
          <ProfileConfirmationScreen
            user={authData.user}
            activationCode={authData.activationCode}
            onProfileConfirmed={handleProfileConfirmed}
            onBack={handleBackToSignup}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#7f1d1d" translucent={true} />
      {renderCurrentScreen()}
    </>
  );
};
