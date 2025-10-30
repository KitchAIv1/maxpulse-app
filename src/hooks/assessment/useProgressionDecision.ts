// useProgressionDecision Hook
// Single responsibility: Handle user progression choices and execution

import { useState, useCallback } from 'react';
import { ProgressionDecision, ProgressionExecutionResult } from '../../types/progression';
import { WeeklyAssessmentData, ProgressionRecommendation } from '../../types/assessment';
import { ProgressionExecutor } from '../../services/progression/ProgressionExecutor';

interface UseProgressionDecisionReturn {
  isExecuting: boolean;
  executionResult: ProgressionExecutionResult | null;
  error: string | null;
  executeDecision: (decision: ProgressionDecision, assessmentData: WeeklyAssessmentData) => Promise<void>;
  createDecision: (
    type: ProgressionRecommendation,
    userId: string,
    weekNumber: number,
    phaseNumber: number,
    reasoning: string[]
  ) => ProgressionDecision;
  clearResult: () => void;
}

export const useProgressionDecision = (): UseProgressionDecisionReturn => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ProgressionExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Execute a progression decision
   */
  const executeDecision = useCallback(async (
    decision: ProgressionDecision,
    assessmentData: WeeklyAssessmentData
  ) => {
    setIsExecuting(true);
    setError(null);
    setExecutionResult(null);

    try {
      const result = await ProgressionExecutor.executeProgression(
        decision.userId,
        decision,
        assessmentData
      );

      setExecutionResult(result);

      if (!result.success) {
        setError(result.error || 'Failed to execute progression decision');
      }
    } catch (err) {
      console.error('Error executing progression decision:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsExecuting(false);
    }
  }, []);

  /**
   * Create a progression decision object
   */
  const createDecision = useCallback((
    type: ProgressionRecommendation,
    userId: string,
    weekNumber: number,
    phaseNumber: number,
    reasoning: string[]
  ): ProgressionDecision => {
    return {
      type,
      weekNumber,
      phaseNumber,
      userId,
      reasoning,
      confidence: 100, // User decision is always 100% confident
      executedBy: 'user',
    };
  }, []);

  /**
   * Clear execution result
   */
  const clearResult = useCallback(() => {
    setExecutionResult(null);
    setError(null);
  }, []);

  return {
    isExecuting,
    executionResult,
    error,
    executeDecision,
    createDecision,
    clearResult,
  };
};
