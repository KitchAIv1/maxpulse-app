// TriRings Component for TriHabit
// Three concentric rings showing Steps, Hydration, and Sleep progress
// with Life Score in the center

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Filter, FeGaussianBlur, FeMerge, FeMergeNode } from 'react-native-svg';
import { computeLifeScore, ringDasharray } from '../../utils';

interface TriRingsProps {
  stepsPct: number;
  waterPct: number;
  sleepPct: number;
}

export const TriRings: React.FC<TriRingsProps> = ({
  stepsPct,
  waterPct,
  sleepPct,
}) => {
  const size = 260;
  const center = size / 2;
  
  const rings = [
    { r: 110, pct: stepsPct, color: '#ffffff' }, // Steps (outer)
    { r: 90, pct: waterPct, color: '#A3E635' },   // Hydration (middle) - lime-400
    { r: 70, pct: sleepPct, color: '#22D3EE' },   // Sleep (inner) - cyan-400
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

      {/* Center content */}
      <View style={styles.centerContent}>
        <Text style={styles.lifeScoreLabel}>Life Score</Text>
        <Text style={styles.lifeScoreValue}>{lifeScore}</Text>
        <Text style={styles.lifeScoreDescription}>
          Personalized from steps • water • sleep
        </Text>
      </View>
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
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  lifeScoreValue: {
    fontSize: 48,
    fontWeight: '600',
    color: 'white',
    lineHeight: 52,
    marginBottom: 4,
  },
  lifeScoreDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    maxWidth: 140,
  },
});
