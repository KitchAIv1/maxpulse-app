// Weekly Assessment Test Hook
// Single responsibility: Provide testing utilities for weekly assessment flow

import { useState, useCallback } from 'react';
import { WeeklyAssessmentFlowTest } from '../../tests/WeeklyAssessmentFlowTest';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: Date;
}

interface UseWeeklyAssessmentTestReturn {
  testResults: TestResult[];
  isRunning: boolean;
  runCompleteFlowTest: (userId: string) => Promise<void>;
  runAssessmentTriggerTest: (userId: string) => Promise<void>;
  runTargetOperationsTest: (userId: string) => Promise<void>;
  runAllTests: (userId: string) => Promise<void>;
  clearResults: () => void;
}

export const useWeeklyAssessmentTest = (): UseWeeklyAssessmentTestReturn => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = useCallback((result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  }, []);

  const runCompleteFlowTest = useCallback(async (userId: string) => {
    if (!userId) {
      addTestResult({
        success: false,
        message: 'No user ID provided',
        timestamp: new Date(),
      });
      return;
    }

    setIsRunning(true);
    try {
      const result = await WeeklyAssessmentFlowTest.testCompleteFlow(userId);
      addTestResult({
        success: result.success,
        message: result.success 
          ? `Complete flow test passed (${result.results.length} steps)` 
          : `Complete flow test failed: ${result.errors.join(', ')}`,
        details: result,
        timestamp: new Date(),
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: `Complete flow test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      });
    } finally {
      setIsRunning(false);
    }
  }, [addTestResult]);

  const runAssessmentTriggerTest = useCallback(async (userId: string) => {
    if (!userId) {
      addTestResult({
        success: false,
        message: 'No user ID provided',
        timestamp: new Date(),
      });
      return;
    }

    setIsRunning(true);
    try {
      const result = await WeeklyAssessmentFlowTest.testAssessmentTrigger(userId);
      addTestResult({
        success: result.success,
        message: result.success 
          ? 'Assessment trigger test passed' 
          : `Assessment trigger test failed: ${result.error}`,
        details: result,
        timestamp: new Date(),
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: `Assessment trigger test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      });
    } finally {
      setIsRunning(false);
    }
  }, [addTestResult]);

  const runTargetOperationsTest = useCallback(async (userId: string) => {
    if (!userId) {
      addTestResult({
        success: false,
        message: 'No user ID provided',
        timestamp: new Date(),
      });
      return;
    }

    setIsRunning(true);
    try {
      const result = await WeeklyAssessmentFlowTest.testTargetOperations(userId);
      addTestResult({
        success: result.success,
        message: result.success 
          ? `Target operations test passed (${result.operations.length} operations)` 
          : `Target operations test failed: ${result.errors.join(', ')}`,
        details: result,
        timestamp: new Date(),
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: `Target operations test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      });
    } finally {
      setIsRunning(false);
    }
  }, [addTestResult]);

  const runAllTests = useCallback(async (userId: string) => {
    if (!userId) {
      addTestResult({
        success: false,
        message: 'No user ID provided',
        timestamp: new Date(),
      });
      return;
    }

    setIsRunning(true);
    try {
      const result = await WeeklyAssessmentFlowTest.runAllTests(userId);
      addTestResult({
        success: result.success,
        message: `All tests completed: ${result.summary.passedTests}/${result.summary.totalTests} passed`,
        details: result,
        timestamp: new Date(),
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: `All tests error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      });
    } finally {
      setIsRunning(false);
    }
  }, [addTestResult]);

  const clearResults = useCallback(() => {
    setTestResults([]);
  }, []);

  return {
    testResults,
    isRunning,
    runCompleteFlowTest,
    runAssessmentTriggerTest,
    runTargetOperationsTest,
    runAllTests,
    clearResults,
  };
};
