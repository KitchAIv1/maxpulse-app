// Welcome Screen Component
// Full-screen video welcome with 3-second auto-fade to dashboard

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import Video from 'react-native-video';
import { theme } from '../utils/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface WelcomeScreenProps {
  userName?: string;
  onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  userName = 'Welcome',
  onComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const dashboardFadeAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    // Show welcome text after 1 second
    const textTimer = setTimeout(() => {
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1000);

    // Start fade out at 3 seconds
    const fadeTimer = setTimeout(() => {
      setShowDashboard(true);
      
      // Fade out video and fade in dashboard simultaneously
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(dashboardFadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 3000);

    // Complete transition at 4 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [fadeAnim, dashboardFadeAnim, textFadeAnim, onComplete]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={true} />
      
      {/* Full-screen video */}
      <Animated.View style={[styles.videoContainer, { opacity: fadeAnim }]}>
        <Video
          source={require('../../assets/videos/welcome.mp4')}
          style={styles.video}
          resizeMode="cover"
          repeat={false}
          muted={true}
          paused={false}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          onError={(error) => {
            console.error('Video playback error:', error);
            // Fallback: immediately show dashboard if video fails
            onComplete();
          }}
        />
        
        {/* Welcome text overlay */}
        <Animated.View style={[styles.textOverlay, { opacity: textFadeAnim }]}>
          <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
        </Animated.View>
      </Animated.View>

      {/* Dashboard preview (fades in behind video) */}
      {showDashboard && (
        <Animated.View style={[styles.dashboardPreview, { opacity: dashboardFadeAnim }]}>
          <View style={styles.dashboardPlaceholder}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>MaxPulse</Text>
            </View>
            <Text style={styles.dashboardText}>Your wellness journey continues...</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    zIndex: 2,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  dashboardPreview: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: theme.colors.background,
    zIndex: 1,
  },
  dashboardPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  logoContainer: {
    marginBottom: theme.spacing.xl,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  dashboardText: {
    fontSize: theme.typography.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
