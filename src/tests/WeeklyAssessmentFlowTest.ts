// Weekly Assessment Flow Test
// Tests the complete flow from assessment trigger to target updates

import { WeeklyAssessmentOrchestrator } from '../services/assessment/WeeklyAssessmentOrchestrator';
import { AutoProgressionService } from '../services/progression/AutoProgressionService';
import { TargetManager } from '../services/TargetManager';
import { WeeklyScheduler } from '../services/scheduling/WeeklyScheduler';
import { AssessmentTrigger } from '../services/scheduling/AssessmentTrigger';
import { ProgressionDecision } from '../types/progression';

export class WeeklyAssessmentFlowTest {
  /**
   * Test the complete weekly assessment flow
   */
  static async testCompleteFlow(userId: string): Promise<{
    success: boolean;
    results: any[];
    errors: string[];
  }> {
    const results: any[] = [];
    const errors: string[] = [];

    try {
      console.log('🧪 Starting Weekly Assessment Flow Test for user:', userId);

      // Step 1: Check if assessment is needed
      console.log('📅 Step 1: Checking assessment eligibility...');
      const needsAssessment = await WeeklyScheduler.checkForWeeklyAssessment(userId);
      results.push({ step: 1, needsAssessment });

      if (!needsAssessment) {
        console.log('ℹ️ No assessment needed at this time');
        return { success: true, results, errors };
      }

      // Step 2: Run weekly assessment
      console.log('📊 Step 2: Running weekly assessment...');
      const assessmentResult = await WeeklyAssessmentOrchestrator.conductWeeklyAssessment(userId, 1);
      results.push({ step: 2, assessment: assessmentResult });

      // Step 3: Test progression decision execution
      console.log('🎯 Step 3: Testing progression decision execution...');
      const mockDecision: ProgressionDecision = {
        type: assessmentResult.assessment.recommendation,
        weekNumber: assessmentResult.performance.week,
        phaseNumber: assessmentResult.performance.phase,
        userId,
        reasoning: assessmentResult.assessment.reasoning,
        confidence: assessmentResult.assessment.confidence,
        modifications: assessmentResult.assessment.modifications,
        executedBy: 'user',
      };

      await AutoProgressionService.executeProgressionDecision(mockDecision);
      results.push({ step: 3, decision: mockDecision });

      // Step 4: Verify target refresh
      console.log('🔄 Step 4: Testing target refresh...');
      const targetRefresh = await TargetManager.refreshTargetsAfterProgression(userId);
      results.push({ step: 4, targetRefresh });

      // Step 5: Get progression history
      console.log('📈 Step 5: Checking progression history...');
      const history = await AutoProgressionService.getProgressionHistory(userId, 5);
      results.push({ step: 5, historyCount: history.length });

      // Step 6: Get progression stats
      console.log('📊 Step 6: Getting progression statistics...');
      const stats = await AutoProgressionService.getProgressionStats(userId);
      results.push({ step: 6, stats });

      console.log('✅ Weekly Assessment Flow Test completed successfully');
      return { success: true, results, errors };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Weekly Assessment Flow Test failed:', errorMessage);
      errors.push(errorMessage);
      return { success: false, results, errors };
    }
  }

  /**
   * Test assessment trigger system
   */
  static async testAssessmentTrigger(userId: string): Promise<{
    success: boolean;
    triggered: boolean;
    error?: string;
  }> {
    try {
      console.log('🔔 Testing assessment trigger for user:', userId);

      await AssessmentTrigger.triggerAssessmentFlow(userId);

      console.log('✅ Assessment trigger test completed');
      return { success: true, triggered: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Assessment trigger test failed:', errorMessage);
      return { success: false, triggered: false, error: errorMessage };
    }
  }

  /**
   * Test target validation and modification
   */
  static async testTargetOperations(userId: string): Promise<{
    success: boolean;
    operations: any[];
    errors: string[];
  }> {
    const operations: any[] = [];
    const errors: string[] = [];

    try {
      console.log('🎯 Testing target operations for user:', userId);

      // Test getting current targets
      const currentTargets = await TargetManager.getCurrentWeekTargets(userId);
      operations.push({ operation: 'getCurrentTargets', result: currentTargets });

      // Test target validation
      const validation = TargetManager.validateTargets({
        steps: 15000,
        waterOz: 120,
        sleepHr: 8,
      });
      operations.push({ operation: 'validateTargets', result: validation });

      // Test target modifications
      const modifications = await TargetManager.applyTargetModifications(userId, {
        steps: 8000,
        focusArea: 'steps',
        adjustmentReason: 'Test modification',
      });
      operations.push({ operation: 'applyModifications', result: modifications });

      // Test reset to V2 Engine
      const reset = await TargetManager.resetToV2EngineTargets(userId);
      operations.push({ operation: 'resetToV2Engine', result: reset });

      console.log('✅ Target operations test completed');
      return { success: true, operations, errors };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Target operations test failed:', errorMessage);
      errors.push(errorMessage);
      return { success: false, operations, errors };
    }
  }

  /**
   * Test weekly scheduler functionality
   */
  static async testWeeklyScheduler(userId: string): Promise<{
    success: boolean;
    schedulerResults: any[];
    errors: string[];
  }> {
    const schedulerResults: any[] = [];
    const errors: string[] = [];

    try {
      console.log('📅 Testing weekly scheduler for user:', userId);

      // Test assessment check
      const needsAssessment = await WeeklyScheduler.checkForWeeklyAssessment(userId);
      schedulerResults.push({ test: 'checkForWeeklyAssessment', result: needsAssessment });

      // Test time calculations
      const timeUntilNext = WeeklyScheduler.getTimeUntilNextAssessment();
      schedulerResults.push({ test: 'getTimeUntilNextAssessment', result: timeUntilNext });

      // Test week completion check
      const isWeekComplete = await WeeklyScheduler.isWeekComplete(userId, 1);
      schedulerResults.push({ test: 'isWeekComplete', result: isWeekComplete });

      console.log('✅ Weekly scheduler test completed');
      return { success: true, schedulerResults, errors };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Weekly scheduler test failed:', errorMessage);
      errors.push(errorMessage);
      return { success: false, schedulerResults, errors };
    }
  }

  /**
   * Run all tests
   */
  static async runAllTests(userId: string): Promise<{
    success: boolean;
    testResults: {
      completeFlow: any;
      assessmentTrigger: any;
      targetOperations: any;
      weeklyScheduler: any;
    };
    summary: {
      totalTests: number;
      passedTests: number;
      failedTests: number;
    };
  }> {
    console.log('🧪 Running all Weekly Assessment Flow Tests...');

    const testResults = {
      completeFlow: await this.testCompleteFlow(userId),
      assessmentTrigger: await this.testAssessmentTrigger(userId),
      targetOperations: await this.testTargetOperations(userId),
      weeklyScheduler: await this.testWeeklyScheduler(userId),
    };

    const passedTests = Object.values(testResults).filter(result => result.success).length;
    const totalTests = Object.keys(testResults).length;
    const failedTests = totalTests - passedTests;

    const summary = {
      totalTests,
      passedTests,
      failedTests,
    };

    console.log('📊 Test Summary:', summary);

    return {
      success: failedTests === 0,
      testResults,
      summary,
    };
  }
}
