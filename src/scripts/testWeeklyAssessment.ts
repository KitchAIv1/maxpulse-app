// Weekly Assessment Test Runner
// Script to test the weekly assessment system implementation

import { WeeklyAssessmentFlowTest } from '../tests/WeeklyAssessmentFlowTest';

/**
 * Test runner for weekly assessment system
 * Usage: Run this script with a test user ID to verify the implementation
 */
async function runWeeklyAssessmentTests() {
  console.log('🧪 Weekly Assessment System Test Runner');
  console.log('=====================================');

  // Test user ID (replace with actual user ID for testing)
  const TEST_USER_ID = 'test-user-id-replace-me';

  if (TEST_USER_ID === 'test-user-id-replace-me') {
    console.log('⚠️ Please replace TEST_USER_ID with an actual user ID');
    console.log('📝 Edit src/scripts/testWeeklyAssessment.ts and update the TEST_USER_ID constant');
    return;
  }

  try {
    // Run all tests
    const results = await WeeklyAssessmentFlowTest.runAllTests(TEST_USER_ID);

    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${results.summary.passedTests}`);
    console.log(`❌ Failed: ${results.summary.failedTests}`);
    console.log(`📈 Total: ${results.summary.totalTests}`);

    if (results.success) {
      console.log('\n🎉 All tests passed! The weekly assessment system is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Check the detailed results below:');
      
      // Show failed test details
      Object.entries(results.testResults).forEach(([testName, result]) => {
        if (!result.success) {
          console.log(`\n❌ ${testName}:`);
          if ('errors' in result) {
            result.errors.forEach((error: string) => console.log(`   - ${error}`));
          }
          if ('error' in result) {
            console.log(`   - ${result.error}`);
          }
        }
      });
    }

    console.log('\n📋 Detailed Test Results:');
    console.log(JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('❌ Test runner failed:', error);
  }
}

/**
 * Quick health check for the assessment system
 */
async function quickHealthCheck() {
  console.log('🏥 Quick Health Check');
  console.log('====================');

  const checks = [
    {
      name: 'WeeklyAssessmentOrchestrator',
      test: () => import('../services/assessment/WeeklyAssessmentOrchestrator'),
    },
    {
      name: 'AutoProgressionService',
      test: () => import('../services/progression/AutoProgressionService'),
    },
    {
      name: 'TargetManager',
      test: () => import('../services/TargetManager'),
    },
    {
      name: 'WeeklyScheduler',
      test: () => import('../services/scheduling/WeeklyScheduler'),
    },
    {
      name: 'AssessmentTrigger',
      test: () => import('../services/scheduling/AssessmentTrigger'),
    },
    {
      name: 'WeeklyAssessmentModal',
      test: () => import('../components/assessment/WeeklyAssessmentModal'),
    },
  ];

  let passedChecks = 0;
  const totalChecks = checks.length;

  for (const check of checks) {
    try {
      await check.test();
      console.log(`✅ ${check.name} - OK`);
      passedChecks++;
    } catch (error) {
      console.log(`❌ ${check.name} - FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log(`\n📊 Health Check Results: ${passedChecks}/${totalChecks} components OK`);
  
  if (passedChecks === totalChecks) {
    console.log('🎉 All components are healthy!');
  } else {
    console.log('⚠️ Some components have issues. Check the errors above.');
  }
}

// Export functions for use in other scripts
export { runWeeklyAssessmentTests, quickHealthCheck };

// Run health check if this script is executed directly
if (require.main === module) {
  quickHealthCheck()
    .then(() => {
      console.log('\n💡 To run full tests, update TEST_USER_ID and call runWeeklyAssessmentTests()');
    })
    .catch(console.error);
}
