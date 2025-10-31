// Life Score Test Button Component
// UI component to trigger Life Score calculation validation tests

import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { LifeScoreCalculationTest } from '../../tests/LifeScoreCalculationTest';
import { theme } from '../../utils/theme';

interface LifeScoreTestButtonProps {
  userId: string;
}

export const LifeScoreTestButton: React.FC<LifeScoreTestButtonProps> = ({ userId }) => {
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    if (isRunning) return;

    setIsRunning(true);
    console.log('🧪 Running Life Score tests...');

    try {
      const results = await LifeScoreCalculationTest.runAllTests(userId);
      LifeScoreCalculationTest.printResults(results);

      const passed = results.filter(r => r.passed).length;
      const total = results.length;
      
      Alert.alert(
        'Life Score Tests Complete',
        `${passed}/${total} tests passed\n\nCheck console for details`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Test error:', error);
      Alert.alert('Test Error', String(error));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, isRunning && styles.buttonDisabled]}
      onPress={runTests}
      disabled={isRunning}
    >
      <Text style={styles.buttonText}>
        {isRunning ? '⏳ Running Tests...' : '🧪 Test Life Score'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
  },
});

