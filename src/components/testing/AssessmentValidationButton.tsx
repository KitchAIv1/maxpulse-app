/**
 * Assessment Validation Button Component
 * Allows manual testing of weekly assessment data accuracy and standards compliance
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { runWeeklyAssessmentValidation } from '../../tests/WeeklyAssessmentDataValidation';
import { theme } from '../../utils/theme';

interface AssessmentValidationButtonProps {
  userId: string;
}

export const AssessmentValidationButton: React.FC<AssessmentValidationButtonProps> = ({ userId }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testOutput, setTestOutput] = useState<string[]>([]);

  const runValidation = async () => {
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
      await runWeeklyAssessmentValidation(userId);
      setTestOutput(logs);
    } catch (error) {
      logs.push(`❌ Validation failed: ${error}`);
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
        onPress={runValidation}
        disabled={isRunning}
      >
        <Text style={styles.testButtonText}>
          {isRunning ? '🔬 Running Validation...' : '🔬 Validate Assessment Data'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showResults}
        animationType="slide"
        onRequestClose={() => setShowResults(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Assessment Data Validation</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowResults(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.resultsContainer}>
            {testOutput.map((line, index) => (
              <Text 
                key={index} 
                style={[
                  styles.resultLine,
                  line.includes('❌') && styles.errorLine,
                  line.includes('⚠️') && styles.warningLine,
                  line.includes('✅') && styles.successLine,
                  (line.includes('===') || line.includes('---')) && styles.separatorLine,
                ]}
              >
                {line}
              </Text>
            ))}
            {testOutput.length === 0 && (
              <Text style={styles.emptyText}>Running validation tests...</Text>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  testButton: {
    backgroundColor: '#9C27B0',
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
  errorLine: {
    color: '#D32F2F',
    fontWeight: '600',
  },
  warningLine: {
    color: '#F57C00',
    fontWeight: '600',
  },
  successLine: {
    color: '#388E3C',
  },
  separatorLine: {
    color: '#757575',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: theme.typography.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});

