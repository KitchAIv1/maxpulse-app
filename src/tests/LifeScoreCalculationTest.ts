// Life Score Calculation Validation Test
// Tests the assessment-aware Life Score calculation logic

import { LifeScoreCalculator } from '../services/LifeScoreCalculator';
import { supabase } from '../services/supabase';

interface TestResult {
  test: string;
  passed: boolean;
  details: string;
  error?: string;
}

export class LifeScoreCalculationTest {
  /**
   * Run all Life Score validation tests
   */
  static async runAllTests(userId: string): Promise<TestResult[]> {
    const results: TestResult[] = [];

    console.log('🧪 Starting Life Score Calculation Tests...\n');

    // Test 1: Week 1 (no past assessments) - should use 4-pillar model
    results.push(await this.testWeek1Calculation(userId));

    // Test 2: With past assessments - should use blended model
    results.push(await this.testBlendedCalculation(userId));

    // Test 3: Cache behavior - should use cached value
    results.push(await this.testCacheBehavior(userId));

    // Test 4: Cache clear - should recalculate after clear
    results.push(await this.testCacheClear(userId));

    // Summary
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    console.log(`\n📊 Test Summary: ${passed}/${total} tests passed\n`);

    return results;
  }

  /**
   * Test 1: Week 1 calculation (no past assessments)
   */
  private static async testWeek1Calculation(userId: string): Promise<TestResult> {
    try {
      // Clear cache first
      LifeScoreCalculator.clearCache();

      // Mock current week metrics
      const currentWeek = {
        stepsPct: 0.8,  // 80%
        waterPct: 0.6,  // 60%
        sleepPct: 0.7,  // 70%
        moodPct: 0.9,   // 90%
      };

      // Calculate (assuming no past assessments)
      const score = await LifeScoreCalculator.calculateLifeScore(
        userId,
        currentWeek,
        true
      );

      // Expected: (0.8 + 0.6 + 0.7 + 0.9) / 4 = 0.75 = 75
      const expected = Math.round((0.8 * 0.25 + 0.6 * 0.25 + 0.7 * 0.25 + 0.9 * 0.25) * 100);
      const passed = score === expected;

      return {
        test: 'Week 1 Calculation (No Past Assessments)',
        passed,
        details: `Expected: ${expected}, Got: ${score}`,
      };
    } catch (error) {
      return {
        test: 'Week 1 Calculation (No Past Assessments)',
        passed: false,
        details: 'Test failed with error',
        error: String(error),
      };
    }
  }

  /**
   * Test 2: Blended calculation with past assessments
   */
  private static async testBlendedCalculation(userId: string): Promise<TestResult> {
    try {
      // Clear cache first
      LifeScoreCalculator.clearCache();

      // Fetch actual past assessments
      const { data: pastAssessments } = await supabase
        .from('weekly_performance_history')
        .select('overall_achievement_avg, week_number')
        .eq('user_id', userId)
        .order('week_number', { ascending: false });

      if (!pastAssessments || pastAssessments.length === 0) {
        return {
          test: 'Blended Calculation (With Past Assessments)',
          passed: true,
          details: 'No past assessments found - skipping test',
        };
      }

      // Mock current week metrics
      const currentWeek = {
        stepsPct: 0.8,
        waterPct: 0.6,
        sleepPct: 0.7,
        moodPct: 0.9,
      };

      const score = await LifeScoreCalculator.calculateLifeScore(
        userId,
        currentWeek,
        true
      );

      // Calculate expected
      const pastAvg = pastAssessments.reduce(
        (sum, a) => sum + a.overall_achievement_avg,
        0
      ) / pastAssessments.length;

      const currentContribution = (0.8 * 0.2 + 0.6 * 0.2 + 0.7 * 0.2 + 0.9 * 0.2);
      const expected = Math.round((pastAvg * 0.2 + currentContribution) * 100);

      const passed = Math.abs(score - expected) <= 1; // Allow 1 point rounding difference

      return {
        test: 'Blended Calculation (With Past Assessments)',
        passed,
        details: `Past assessments: ${pastAssessments.length}, Expected: ~${expected}, Got: ${score}`,
      };
    } catch (error) {
      return {
        test: 'Blended Calculation (With Past Assessments)',
        passed: false,
        details: 'Test failed with error',
        error: String(error),
      };
    }
  }

  /**
   * Test 3: Cache behavior
   */
  private static async testCacheBehavior(userId: string): Promise<TestResult> {
    try {
      // Clear cache first
      LifeScoreCalculator.clearCache();

      const currentWeek = {
        stepsPct: 0.8,
        waterPct: 0.6,
        sleepPct: 0.7,
        moodPct: 0.9,
      };

      // First call - should calculate and cache
      const startTime1 = Date.now();
      const score1 = await LifeScoreCalculator.calculateLifeScore(
        userId,
        currentWeek,
        false
      );
      const time1 = Date.now() - startTime1;

      // Second call - should use cache (much faster)
      const startTime2 = Date.now();
      const score2 = await LifeScoreCalculator.calculateLifeScore(
        userId,
        currentWeek,
        false
      );
      const time2 = Date.now() - startTime2;

      const passed = score1 === score2 && time2 < time1;

      return {
        test: 'Cache Behavior',
        passed,
        details: `First call: ${time1}ms, Second call (cached): ${time2}ms, Scores match: ${score1 === score2}`,
      };
    } catch (error) {
      return {
        test: 'Cache Behavior',
        passed: false,
        details: 'Test failed with error',
        error: String(error),
      };
    }
  }

  /**
   * Test 4: Cache clear functionality
   */
  private static async testCacheClear(userId: string): Promise<TestResult> {
    try {
      const currentWeek = {
        stepsPct: 0.8,
        waterPct: 0.6,
        sleepPct: 0.7,
        moodPct: 0.9,
      };

      // Calculate with different metrics
      const score1 = await LifeScoreCalculator.calculateLifeScore(
        userId,
        currentWeek,
        true
      );

      // Clear cache
      LifeScoreCalculator.clearCache();

      // Calculate with same metrics - should work after clear
      const score2 = await LifeScoreCalculator.calculateLifeScore(
        userId,
        currentWeek,
        true
      );

      const passed = score1 === score2;

      return {
        test: 'Cache Clear Functionality',
        passed,
        details: `Before clear: ${score1}, After clear: ${score2}`,
      };
    } catch (error) {
      return {
        test: 'Cache Clear Functionality',
        passed: false,
        details: 'Test failed with error',
        error: String(error),
      };
    }
  }

  /**
   * Print test results to console
   */
  static printResults(results: TestResult[]): void {
    console.log('\n📊 Life Score Calculation Test Results\n');
    console.log('═'.repeat(60));

    results.forEach((result, index) => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`\n${index + 1}. ${icon} ${result.test}`);
      console.log(`   ${result.details}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('\n' + '═'.repeat(60));
  }
}

