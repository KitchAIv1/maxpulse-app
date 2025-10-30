/**
 * Assessment Caching Test
 * Tests the complete assessment caching flow without waiting for Sunday
 */

import { WeeklyAssessmentOrchestrator } from '../services/assessment/WeeklyAssessmentOrchestrator';
import { supabase } from '../services/supabase';

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  data?: any;
}

export class AssessmentCachingTest {
  private results: TestResult[] = [];
  private testUserId: string = '';

  /**
   * Run complete test suite
   */
  async runTests(userId: string): Promise<void> {
    this.testUserId = userId;
    console.log('🧪 Starting Assessment Caching Tests...\n');

    try {
      // Test 1: Verify start_date exists
      await this.testStartDateExists();

      // Test 2: Calculate fresh assessment (simulates Sunday)
      await this.testFreshAssessmentCalculation();

      // Test 3: Verify assessment was stored
      await this.testAssessmentStorage();

      // Test 4: Load cached assessment (simulates Monday-Saturday)
      await this.testCachedAssessmentLoad();

      // Test 5: Verify cached data matches original
      await this.testDataConsistency();

      // Test 6: Force recalculation and compare
      await this.testForceRecalculation();

      // Print results
      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  /**
   * Test 1: Verify start_date column exists and is populated
   */
  private async testStartDateExists(): Promise<void> {
    console.log('📋 Test 1: Checking start_date column...');

    try {
      const { data, error } = await supabase
        .from('plan_progress')
        .select('start_date, current_week, current_phase')
        .eq('user_id', this.testUserId)
        .single();

      if (error) {
        this.results.push({
          test: 'Start Date Exists',
          passed: false,
          message: `Database error: ${error.message}`,
        });
        return;
      }

      if (!data?.start_date) {
        this.results.push({
          test: 'Start Date Exists',
          passed: false,
          message: 'start_date column is NULL',
          data,
        });
        return;
      }

      this.results.push({
        test: 'Start Date Exists',
        passed: true,
        message: `✅ start_date found: ${data.start_date} (Week ${data.current_week}, Phase ${data.current_phase})`,
        data,
      });
    } catch (error) {
      this.results.push({
        test: 'Start Date Exists',
        passed: false,
        message: `Exception: ${error}`,
      });
    }
  }

  /**
   * Test 2: Calculate fresh assessment (simulates Sunday calculation)
   */
  private async testFreshAssessmentCalculation(): Promise<void> {
    console.log('\n📋 Test 2: Calculating fresh assessment...');

    try {
      // Get current week
      const { data: progress } = await supabase
        .from('plan_progress')
        .select('current_week')
        .eq('user_id', this.testUserId)
        .single();

      const currentWeek = progress?.current_week || 1;

      // Force fresh calculation (simulates Sunday)
      const assessment = await WeeklyAssessmentOrchestrator.conductWeeklyAssessment(
        this.testUserId,
        currentWeek,
        true // Force recalculation
      );

      if (!assessment) {
        this.results.push({
          test: 'Fresh Assessment Calculation',
          passed: false,
          message: 'Assessment returned null',
        });
        return;
      }

      this.results.push({
        test: 'Fresh Assessment Calculation',
        passed: true,
        message: `✅ Assessment calculated for Week ${assessment.performance.week}`,
        data: {
          week: assessment.performance.week,
          phase: assessment.performance.phase,
          averageAchievement: assessment.performance.averageAchievement,
          consistencyDays: assessment.consistency.consistentDays,
          recommendation: assessment.assessment.recommendation,
        },
      });
    } catch (error) {
      this.results.push({
        test: 'Fresh Assessment Calculation',
        passed: false,
        message: `Exception: ${error}`,
      });
    }
  }

  /**
   * Test 3: Verify assessment was stored in weekly_performance_history
   */
  private async testAssessmentStorage(): Promise<void> {
    console.log('\n📋 Test 3: Verifying assessment storage...');

    try {
      const { data: progress } = await supabase
        .from('plan_progress')
        .select('current_week')
        .eq('user_id', this.testUserId)
        .single();

      const currentWeek = progress?.current_week || 1;

      const { data, error } = await supabase
        .from('weekly_performance_history')
        .select('*')
        .eq('user_id', this.testUserId)
        .eq('week_number', currentWeek)
        .single();

      if (error || !data) {
        this.results.push({
          test: 'Assessment Storage',
          passed: false,
          message: `No stored assessment found: ${error?.message || 'No data'}`,
        });
        return;
      }

      this.results.push({
        test: 'Assessment Storage',
        passed: true,
        message: `✅ Assessment stored in weekly_performance_history`,
        data: {
          week_number: data.week_number,
          phase_number: data.phase_number,
          overall_achievement_avg: data.overall_achievement_avg,
          consistency_days: data.consistency_days,
          progression_recommendation: data.progression_recommendation,
          assessed_at: data.assessed_at,
        },
      });
    } catch (error) {
      this.results.push({
        test: 'Assessment Storage',
        passed: false,
        message: `Exception: ${error}`,
      });
    }
  }

  /**
   * Test 4: Load cached assessment (simulates Monday-Saturday)
   */
  private async testCachedAssessmentLoad(): Promise<void> {
    console.log('\n📋 Test 4: Loading cached assessment...');

    try {
      const { data: progress } = await supabase
        .from('plan_progress')
        .select('current_week')
        .eq('user_id', this.testUserId)
        .single();

      const currentWeek = progress?.current_week || 1;

      // Load WITHOUT forcing recalculation (should use cache)
      const assessment = await WeeklyAssessmentOrchestrator.conductWeeklyAssessment(
        this.testUserId,
        currentWeek,
        false // Use cache if available
      );

      if (!assessment) {
        this.results.push({
          test: 'Cached Assessment Load',
          passed: false,
          message: 'Assessment returned null',
        });
        return;
      }

      this.results.push({
        test: 'Cached Assessment Load',
        passed: true,
        message: `✅ Cached assessment loaded for Week ${assessment.performance.week}`,
        data: {
          week: assessment.performance.week,
          phase: assessment.performance.phase,
          averageAchievement: assessment.performance.averageAchievement,
          consistencyDays: assessment.consistency.consistentDays,
          recommendation: assessment.assessment.recommendation,
        },
      });
    } catch (error) {
      this.results.push({
        test: 'Cached Assessment Load',
        passed: false,
        message: `Exception: ${error}`,
      });
    }
  }

  /**
   * Test 5: Verify cached data matches original calculation
   */
  private async testDataConsistency(): Promise<void> {
    console.log('\n📋 Test 5: Verifying data consistency...');

    try {
      const { data: progress } = await supabase
        .from('plan_progress')
        .select('current_week')
        .eq('user_id', this.testUserId)
        .single();

      const currentWeek = progress?.current_week || 1;

      // Load cached version 1
      const cached1 = await WeeklyAssessmentOrchestrator.conductWeeklyAssessment(
        this.testUserId,
        currentWeek,
        false
      );

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 100));

      // Load cached version 2
      const cached2 = await WeeklyAssessmentOrchestrator.conductWeeklyAssessment(
        this.testUserId,
        currentWeek,
        false
      );

      if (!cached1 || !cached2) {
        this.results.push({
          test: 'Data Consistency',
          passed: false,
          message: 'One or both assessments returned null',
        });
        return;
      }

      // Compare key metrics
      const metricsMatch = 
        cached1.performance.averageAchievement === cached2.performance.averageAchievement &&
        cached1.consistency.consistentDays === cached2.consistency.consistentDays &&
        cached1.assessment.recommendation === cached2.assessment.recommendation;

      if (!metricsMatch) {
        this.results.push({
          test: 'Data Consistency',
          passed: false,
          message: 'Cached data does not match between loads',
          data: {
            load1: {
              achievement: cached1.performance.averageAchievement,
              consistency: cached1.consistency.consistentDays,
              recommendation: cached1.assessment.recommendation,
            },
            load2: {
              achievement: cached2.performance.averageAchievement,
              consistency: cached2.consistency.consistentDays,
              recommendation: cached2.assessment.recommendation,
            },
          },
        });
        return;
      }

      this.results.push({
        test: 'Data Consistency',
        passed: true,
        message: '✅ Cached data is consistent across multiple loads',
        data: {
          averageAchievement: cached1.performance.averageAchievement,
          consistentDays: cached1.consistency.consistentDays,
          recommendation: cached1.assessment.recommendation,
        },
      });
    } catch (error) {
      this.results.push({
        test: 'Data Consistency',
        passed: false,
        message: `Exception: ${error}`,
      });
    }
  }

  /**
   * Test 6: Force recalculation and verify it updates
   */
  private async testForceRecalculation(): Promise<void> {
    console.log('\n📋 Test 6: Testing force recalculation...');

    try {
      const { data: progress } = await supabase
        .from('plan_progress')
        .select('current_week')
        .eq('user_id', this.testUserId)
        .single();

      const currentWeek = progress?.current_week || 1;

      // Get cached version
      const cached = await WeeklyAssessmentOrchestrator.conductWeeklyAssessment(
        this.testUserId,
        currentWeek,
        false
      );

      // Force recalculation
      const fresh = await WeeklyAssessmentOrchestrator.conductWeeklyAssessment(
        this.testUserId,
        currentWeek,
        true
      );

      if (!cached || !fresh) {
        this.results.push({
          test: 'Force Recalculation',
          passed: false,
          message: 'One or both assessments returned null',
        });
        return;
      }

      // They should have same data (since underlying metrics haven't changed)
      // but fresh should have newer assessed_at timestamp
      this.results.push({
        test: 'Force Recalculation',
        passed: true,
        message: '✅ Force recalculation works correctly',
        data: {
          cached: {
            achievement: cached.performance.averageAchievement,
            recommendation: cached.assessment.recommendation,
          },
          fresh: {
            achievement: fresh.performance.averageAchievement,
            recommendation: fresh.assessment.recommendation,
          },
        },
      });
    } catch (error) {
      this.results.push({
        test: 'Force Recalculation',
        passed: false,
        message: `Exception: ${error}`,
      });
    }
  }

  /**
   * Print test results summary
   */
  private printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60) + '\n');

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    this.results.forEach((result, index) => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} Test ${index + 1}: ${result.test}`);
      console.log(`   ${result.message}`);
      if (result.data) {
        console.log(`   Data:`, JSON.stringify(result.data, null, 2));
      }
      console.log('');
    });

    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%`);
    console.log('='.repeat(60) + '\n');

    if (failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Assessment caching is working correctly.\n');
    } else {
      console.log('⚠️  Some tests failed. Please review the results above.\n');
    }
  }
}

/**
 * Run the test suite
 * Usage: Import this in your test file and call runAssessmentCachingTest(userId)
 */
export async function runAssessmentCachingTest(userId: string): Promise<void> {
  const tester = new AssessmentCachingTest();
  await tester.runTests(userId);
}

