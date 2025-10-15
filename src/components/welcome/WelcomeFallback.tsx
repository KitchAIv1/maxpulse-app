// Welcome Fallback Component
// Animated gradient background with pulsing logo for when video fails

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WelcomeFallbackProps {
  pulseAnim: Animated.Value;
}

export const WelcomeFallback: React.FC<WelcomeFallbackProps> = ({
  pulseAnim,
}) => {
  return (
    <LinearGradient
      colors={['#7f1d1d', '#991b1b', '#1f2937']}
      style={styles.fallbackBackground}
    >
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.logoText}>MaxPulse</Text>
        <Text style={styles.logoSubtext}>Health & Wellness</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fallbackBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoSubtext: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

