// Welcome Screen Component
// Full-screen video welcome with 3-second auto-fade to dashboard

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, StatusBar, Animated } from 'react-native';
import { WelcomeVideo, WelcomeFallback, WelcomeTextOverlay } from '../components/welcome';
import FirebaseService from '../services/FirebaseService';

interface WelcomeScreenProps {
  userName?: string;
  onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  userName = 'Welcome',
  onComplete,
}) => {
  console.log('🎬 WelcomeScreen rendered for user:', userName, '(Production build - video enabled)');
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const dashboardFadeAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [videoError, setVideoError] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  
  // Firebase Analytics
  const firebase = FirebaseService.getInstance();
  const viewStartTime = useRef(Date.now());
  const videoLoadStartTime = useRef(Date.now());
  const performanceTrace = useRef<any>(null);

  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation | null = null;
    
    // 🔥 Track welcome screen view
    const initializeTracking = async () => {
      await firebase.trackWelcomeScreenView(userName, false); // TODO: detect if first time
      await firebase.logScreenView('WelcomeScreen', 'WelcomeScreen');
      
      // Start performance trace
      performanceTrace.current = await firebase.startTrace('welcome_screen_display');
    };
    initializeTracking();
    
    // If using fallback, start pulsing animation
    if (videoError) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
    }

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
      console.log('🎬 Starting video fade out animation');
      const animationStartTime = Date.now();
      
      // Fade out video layer to reveal dashboard behind it
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        console.log('🎬 Video fade animation completed');
        
        // 🔥 Track animation performance
        const animationDuration = Date.now() - animationStartTime;
        firebase.trackAnimationPerformance('crossfade', animationDuration, true);
      });
    }, 3000);

    // Complete transition at 4 seconds (after fade completes)
    const completeTimer = setTimeout(() => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
      console.log('🎬 WelcomeScreen calling onComplete');
      
      // 🔥 Track completion
      const timeSpent = Date.now() - viewStartTime.current;
      firebase.trackWelcomeScreenComplete(timeSpent);
      
      // Stop performance trace
      if (performanceTrace.current) {
        performanceTrace.current.putMetric('time_to_complete', timeSpent);
        performanceTrace.current.stop();
      }
      
      onComplete();
    }, 4000);

    return () => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [fadeAnim, textFadeAnim, pulseAnim, onComplete, videoError, firebase, userName]);

  const handleVideoError = (error: any) => {
    console.error('🎬 Video playback error, falling back to animated welcome:', error);
    setVideoError(true);
    
    // 🔥 Track video error
    const loadTime = Date.now() - videoLoadStartTime.current;
    firebase.trackVideoPlayback(false, loadTime, error?.message || 'Unknown error');
    firebase.trackWelcomeScreenError('video_playback_failed', error?.message || 'Unknown error');
  };

  const handleVideoLoad = () => {
    console.log('🎬 Video loaded successfully');
    
    // 🔥 Track successful video load
    const loadTime = Date.now() - videoLoadStartTime.current;
    firebase.trackVideoPlayback(true, loadTime);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar hidden />
      
      {/* Video or Fallback Background */}
      <View style={styles.backgroundContainer}>
        {!videoError ? (
          <WelcomeVideo 
            onError={handleVideoError}
            onLoad={handleVideoLoad}
          />
        ) : (
          <WelcomeFallback pulseAnim={pulseAnim} />
        )}
        
        <WelcomeTextOverlay 
          userName={userName}
          textFadeAnim={textFadeAnim}
          showTagline={videoError}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Transparent to allow crossfade
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    backgroundColor: '#000000', // Black background for video/fallback
  },
});
