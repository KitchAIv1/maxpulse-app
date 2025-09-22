// TriRings Component for TriHabit
// Three concentric rings showing Steps, Hydration, and Sleep progress
// with Life Score in the center

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Filter, FeGaussianBlur, FeMerge, FeMergeNode } from 'react-native-svg';
import { computeLifeScore, ringDasharray } from '../../utils';

interface TriRingsProps {
  stepsPct: number;
  waterPct: number;
  sleepPct: number;
  onLifeScorePress?: () => void;
}

export const TriRings: React.FC<TriRingsProps> = ({
  stepsPct,
  waterPct,
  sleepPct,
  onLifeScorePress,
}) => {
  const size = 320; // Increased from 260 to 320
  const center = size / 2;
  
  const rings = [
    { r: 140, pct: stepsPct, color: '#ffffff' }, // Steps (outer) - white
    { r: 115, pct: waterPct, color: '#00ff88' },   // Hydration (middle) - neon green
    { r: 85, pct: sleepPct, color: '#3b82f6' },   // Sleep (inner) - blue (reduced from 90 to give more center space)
  ];

  const lifeScore = useMemo(
    () => computeLifeScore(stepsPct, waterPct, sleepPct),
    [stepsPct, waterPct, sleepPct]
  );

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <Filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <FeGaussianBlur stdDeviation="6" result="coloredBlur" />
            <FeMerge>
              <FeMergeNode in="coloredBlur" />
              <FeMergeNode in="SourceGraphic" />
            </FeMerge>
          </Filter>
        </Defs>

        {/* Background rings */}
        {rings.map((ring, index) => (
          <Circle
            key={`bg-${index}`}
            cx={center}
            cy={center}
            r={ring.r}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={10}
            fill="none"
          />
        ))}

        {/* Progress rings (rotated to start at top) */}
        {rings.map((ring, index) => (
          <Circle
            key={`fg-${index}`}
            cx={center}
            cy={center}
            r={ring.r}
            stroke={ring.color}
            strokeWidth={10}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={ringDasharray(ring.pct, ring.r)}
            filter="url(#glow)"
            transform={`rotate(-90 ${center} ${center})`}
          />
        ))}
      </Svg>

      {/* Center content - Clickable */}
      <TouchableOpacity 
        style={styles.centerContent}
        onPress={onLifeScorePress}
        activeOpacity={0.8}
        disabled={!onLifeScorePress}
      >
        <Text style={styles.lifeScoreLabel}>Life Score</Text>
        <Text style={styles.lifeScoreValue}>{lifeScore}</Text>
        <Text style={styles.lifeScoreDescription}>
          Personalized from steps • water • sleep
        </Text>
        {onLifeScorePress && (
          <Text style={styles.tapHint}>Tap for insights</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lifeScoreLabel: {
    fontSize: 12, // Reduced back to 12 to prevent overlap
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4, // Reduced to 4
  },
  lifeScoreValue: {
    fontSize: 52, // Reduced from 56 to 52
    fontWeight: '600',
    color: 'white',
    lineHeight: 56, // Reduced from 60
    marginBottom: 4, // Reduced to 4
  },
  lifeScoreDescription: {
    fontSize: 9, // Further reduced from 11 to 9 to prevent overlap
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    maxWidth: 120, // Further reduced from 140 to 120
    lineHeight: 12, // Further reduced line height
  },
  tapHint: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
});
