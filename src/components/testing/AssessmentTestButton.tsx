/**
 * Assessment Test Button Component
 * Allows manual testing of assessment caching without waiting for Sunday
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { runAssessmentCachingTest } from '../../tests/AssessmentCachingTest';
import { theme } from '../../utils/theme';

interface AssessmentTestButtonProps {
  userId: string;
}

export const AssessmentTestButton: React.FC<AssessmentTestButtonProps> = ({ userId }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testOutput, setTestOutput] = useState<string[]>([]);

  const runTests = async () => {
    setIsRunning(true);
    setTestOutput([]);
    setShowResults(true);

    // Capture console.log output
    const originalLog = console.log;
    const logs: string[] = [];

    console.log = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(message);
      originalLog(...args);
    };

    try {
      await runAssessmentCachingTest(userId);
      setTestOutput(logs);
    } catch (error) {
      logs.push(`❌ Test failed: ${error}`);
      setTestOutput(logs);
    } finally {
      console.log = originalLog;
      setIsRunning(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.testButton}
        onPress={runTests}
        disabled={isRunning}
      >
        <Text style={styles.testButtonText}>
          {isRunning ? '🧪 Running Tests...' : '🧪 Test Assessment Caching'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showResults}
        animationType="slide"
        onRequestClose={() => setShowResults(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Assessment Caching Test Results</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowResults(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.resultsContainer}>
            {testOutput.map((line, index) => (
              <Text key={index} style={styles.resultLine}>
                {line}
              </Text>
            ))}
            {testOutput.length === 0 && (
              <Text style={styles.emptyText}>Running tests...</Text>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  testButton: {
    backgroundColor: '#FF9800',
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.base,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.semibold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: theme.typography.large,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  closeButton: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
  },
  closeButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.semibold,
  },
  resultsContainer: {
    flex: 1,
    padding: theme.spacing.base,
  },
  resultLine: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: theme.typography.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});

