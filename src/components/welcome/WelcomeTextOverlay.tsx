// Welcome Text Overlay Component
// Animated text overlay for welcome screen

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
// Using inline styles instead of theme for this component

interface WelcomeTextOverlayProps {
  userName: string;
  textFadeAnim: Animated.Value;
  showTagline?: boolean;
}

export const WelcomeTextOverlay: React.FC<WelcomeTextOverlayProps> = ({
  userName,
  textFadeAnim,
  showTagline = false,
}) => {
  return (
    <Animated.View style={[styles.textOverlay, { opacity: textFadeAnim }]}>
      <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
      {showTagline && (
        <Text style={styles.taglineText}>Your wellness journey begins now</Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  textOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  taglineText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

