/**
 * Weekly Assessment Data Validation Test
 * Validates calculation accuracy, data integrity, and adherence to 90-day plan standards
 */

import { WeeklyAssessmentOrchestrator } from '../services/assessment/WeeklyAssessmentOrchestrator';
import { WeeklyPerformanceCalculator } from '../services/assessment/WeeklyPerformanceCalculator';
import { ProgressionRecommendationEngine } from '../services/assessment/ProgressionRecommendationEngine';
import V2EngineConnector from '../services/V2EngineConnector';
import { supabase } from '../services/supabase';
import { WeeklyAssessmentData } from '../types/assessment';

interface ValidationResult {
  test: string;
  category: 'calculation' | 'data_integrity' | 'business_logic' | 'standards';
  passed: boolean;
  message: string;
  expected?: any;
  actual?: any;
  severity: 'critical' | 'warning' | 'info';
}

export class WeeklyAssessmentDataValidation {
  private results: ValidationResult[] = [];
  private testUserId: string = '';
  private assessmentData: WeeklyAssessmentData | null = null;

  /**
   * Run complete validation suite
   */
  async runValidation(userId: string): Promise<void> {
    this.testUserId = userId;
    console.log('🔬 Starting Weekly Assessment Data Validation...\n');

    try {
      // Load assessment data
      await this.loadAssessmentData();

      if (!this.assessmentData) {
        console.error('❌ Cannot proceed: No assessment data available');
        return;
      }

      // Category 1: Calculation Accuracy
      console.log('📊 Category 1: Calculation Accuracy Tests');
      await this.validatePerformanceCalculations();
      await this.validateConsistencyCalculations();
      await this.validatePillarBreakdown();
      await this.validateGradeAssignment();

      // Category 2: Data Integrity
      console.log('\n🔍 Category 2: Data Integrity Tests');
      await this.validateDateRanges();
      await this.validateTargetAlignment();
      await this.validateDataCompleteness();
      await this.validateDatabaseConsistency();

      // Category 3: Business Logic
      console.log('\n⚙️ Category 3: Business Logic Tests');
      await this.validateProgressionRules();
      await this.validateRecommendationLogic();
      await this.validateConfidenceScoring();
      await this.validateModificationRules();

      // Category 4: 90-Day Plan Standards
      console.log('\n📋 Category 4: 90-Day Plan Standards');
      await this.validatePhaseAlignment();
      await this.validateWeekProgression();
      await this.validateTargetProgression();
      await this.validatePlanBoundaries();

      // Print results
      this.printResults();
    } catch (error) {
      console.error('❌ Validation suite failed:', error);
    }
  }

  /**
   * Load assessment data for testing
   */
  private async loadAssessmentData(): Promise<void> {
    try {
      const { data: progress } = await supabase
        .from('plan_progress')
        .select('current_week')
        .eq('user_id', this.testUserId)
        .single();

      const currentWeek = progress?.current_week || 1;

      this.assessmentData = await WeeklyAssessmentOrchestrator.conductWeeklyAssessment(
        this.testUserId,
        currentWeek,
        false
      );

      if (this.assessmentData) {
        console.log(`✅ Loaded assessment data for Week ${this.assessmentData.performance.week}\n`);
      }
    } catch (error) {
      console.error('Error loading assessment data:', error);
    }
  }

  // ============================================================================
  // CATEGORY 1: CALCULATION ACCURACY
  // ============================================================================

  /**
   * Validate performance calculations are mathematically correct
   */
  private async validatePerformanceCalculations(): Promise<void> {
    if (!this.assessmentData) return;

    const { performance } = this.assessmentData;

    // Test 1: Average achievement should be sum of pillars / 4
    const calculatedAverage = performance.pillarBreakdown.reduce(
      (sum, p) => sum + p.averageAchievement,
      0
    ) / performance.pillarBreakdown.length;

    const averageMatch = Math.abs(calculatedAverage - performance.averageAchievement) < 0.01;

    this.results.push({
      test: 'Average Achievement Calculation',
      category: 'calculation',
      passed: averageMatch,
      message: averageMatch
        ? '✅ Average achievement correctly calculated'
        : '❌ Average achievement calculation mismatch',
      expected: calculatedAverage.toFixed(2),
      actual: performance.averageAchievement.toFixed(2),
      severity: 'critical',
    });

    // Test 2: Pillar percentages should be 0-100
    const invalidPillars = performance.pillarBreakdown.filter(
      p => p.averageAchievement < 0 || p.averageAchievement > 100
    );

    this.results.push({
      test: 'Pillar Percentage Bounds',
      category: 'calculation',
      passed: invalidPillars.length === 0,
      message:
        invalidPillars.length === 0
          ? '✅ All pillar percentages within valid range (0-100)'
          : `❌ ${invalidPillars.length} pillars have invalid percentages`,
      actual: invalidPillars.map(p => `${p.pillar}: ${p.averageAchievement}`),
      severity: 'critical',
    });

    // Test 3: Consistency days should not exceed total days
    const consistencyValid = performance.consistencyDays <= performance.totalTrackingDays;

    this.results.push({
      test: 'Consistency Days Bounds',
      category: 'calculation',
      passed: consistencyValid,
      message: consistencyValid
        ? '✅ Consistency days within valid range'
        : '❌ Consistency days exceeds total tracking days',
      expected: `<= ${performance.totalTrackingDays}`,
      actual: performance.consistencyDays,
      severity: 'critical',
    });
  }

  /**
   * Validate consistency metrics calculations
   */
  private async validateConsistencyCalculations(): Promise<void> {
    if (!this.assessmentData) return;

    const { consistency } = this.assessmentData;

    // Test 1: Consistency rate should match formula
    const expectedRate = consistency.totalDays > 0
      ? (consistency.consistentDays / consistency.totalDays) * 100
      : 0;

    const rateMatch = Math.abs(expectedRate - consistency.consistencyRate) < 0.01;

    this.results.push({
      test: 'Consistency Rate Calculation',
      category: 'calculation',
      passed: rateMatch,
      message: rateMatch
        ? '✅ Consistency rate correctly calculated'
        : '❌ Consistency rate calculation mismatch',
      expected: expectedRate.toFixed(2) + '%',
      actual: consistency.consistencyRate.toFixed(2) + '%',
      severity: 'critical',
    });

    // Test 2: Current streak should not exceed total days
    const streakValid = consistency.currentStreak <= consistency.totalDays;

    this.results.push({
      test: 'Current Streak Bounds',
      category: 'calculation',
      passed: streakValid,
      message: streakValid
        ? '✅ Current streak within valid range'
        : '❌ Current streak exceeds total days',
      expected: `<= ${consistency.totalDays}`,
      actual: consistency.currentStreak,
      severity: 'critical',
    });

    // Test 3: Longest streak should be >= current streak
    const longestValid = consistency.longestStreak >= consistency.currentStreak;

    this.results.push({
      test: 'Longest Streak Logic',
      category: 'calculation',
      passed: longestValid,
      message: longestValid
        ? '✅ Longest streak >= current streak'
        : '❌ Longest streak < current streak (invalid)',
      expected: `>= ${consistency.currentStreak}`,
      actual: consistency.longestStreak,
      severity: 'warning',
    });
  }

  /**
   * Validate pillar breakdown data
   */
  private async validatePillarBreakdown(): Promise<void> {
    if (!this.assessmentData) return;

    const { performance } = this.assessmentData;

    // Test 1: Should have exactly 4 pillars
    const has4Pillars = performance.pillarBreakdown.length === 4;

    this.results.push({
      test: 'Pillar Count',
      category: 'calculation',
      passed: has4Pillars,
      message: has4Pillars
        ? '✅ Correct number of health pillars (4)'
        : `❌ Expected 4 pillars, found ${performance.pillarBreakdown.length}`,
      expected: 4,
      actual: performance.pillarBreakdown.length,
      severity: 'critical',
    });

    // Test 2: Should have all required pillars
    const requiredPillars = ['steps', 'water', 'sleep', 'mood'];
    const foundPillars = performance.pillarBreakdown.map(p => p.pillar);
    const missingPillars = requiredPillars.filter(p => !foundPillars.includes(p as any));

    this.results.push({
      test: 'Required Pillars Present',
      category: 'calculation',
      passed: missingPillars.length === 0,
      message:
        missingPillars.length === 0
          ? '✅ All required pillars present'
          : `❌ Missing pillars: ${missingPillars.join(', ')}`,
      expected: requiredPillars,
      actual: foundPillars,
      severity: 'critical',
    });

    // Test 3: Each pillar should have daily values
    const pillarsWithoutData = performance.pillarBreakdown.filter(
      p => !p.dailyValues || p.dailyValues.length === 0
    );

    this.results.push({
      test: 'Pillar Daily Values',
      category: 'calculation',
      passed: pillarsWithoutData.length === 0,
      message:
        pillarsWithoutData.length === 0
          ? '✅ All pillars have daily values'
          : `❌ ${pillarsWithoutData.length} pillars missing daily values`,
      actual: pillarsWithoutData.map(p => p.pillar),
      severity: 'warning',
    });
  }

  /**
   * Validate grade assignment logic
   */
  private async validateGradeAssignment(): Promise<void> {
    if (!this.assessmentData) return;

    const { performance } = this.assessmentData;

    // Test: Grade should match the defined rules
    let expectedGrade: 'mastery' | 'progress' | 'struggle';
    if (performance.averageAchievement >= 80 && performance.consistencyDays >= 5) {
      expectedGrade = 'mastery';
    } else if (performance.averageAchievement >= 60 && performance.consistencyDays >= 3) {
      expectedGrade = 'progress';
    } else {
      expectedGrade = 'struggle';
    }

    const gradeMatch = performance.overallGrade === expectedGrade;

    this.results.push({
      test: 'Performance Grade Assignment',
      category: 'calculation',
      passed: gradeMatch,
      message: gradeMatch
        ? `✅ Grade "${performance.overallGrade}" correctly assigned`
        : `❌ Grade mismatch (achievement: ${performance.averageAchievement}%, consistency: ${performance.consistencyDays} days)`,
      expected: expectedGrade,
      actual: performance.overallGrade,
      severity: 'critical',
    });
  }

  // ============================================================================
  // CATEGORY 2: DATA INTEGRITY
  // ============================================================================

  /**
   * Validate date ranges are correct
   */
  private async validateDateRanges(): Promise<void> {
    if (!this.assessmentData) return;

    const { performance } = this.assessmentData;

    // Test 1: Start date should be before end date
    const startDate = new Date(performance.startDate);
    const endDate = new Date(performance.endDate);
    const datesValid = startDate < endDate;

    this.results.push({
      test: 'Date Range Order',
      category: 'data_integrity',
      passed: datesValid,
      message: datesValid
        ? '✅ Start date before end date'
        : '❌ Invalid date range order',
      expected: 'startDate < endDate',
      actual: `${performance.startDate} to ${performance.endDate}`,
      severity: 'critical',
    });

    // Test 2: Date range should be approximately 7 days
    const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const rangeValid = daysDiff >= 6 && daysDiff <= 7;

    this.results.push({
      test: 'Weekly Date Range',
      category: 'data_integrity',
      passed: rangeValid,
      message: rangeValid
        ? `✅ Date range spans ${daysDiff} days (valid week)`
        : `❌ Date range spans ${daysDiff} days (expected ~7)`,
      expected: '6-7 days',
      actual: `${daysDiff} days`,
      severity: 'warning',
    });
  }

  /**
   * Validate targets align with V2 Engine
   */
  private async validateTargetAlignment(): Promise<void> {
    if (!this.assessmentData) return;

    try {
      const v2Targets = await V2EngineConnector.getCurrentWeekTargets(this.testUserId);
      const assessmentTargets = this.assessmentData.currentTargets;

      // Test 1: Steps target alignment
      const stepsMatch = v2Targets.steps === assessmentTargets.steps;

      this.results.push({
        test: 'Steps Target Alignment',
        category: 'data_integrity',
        passed: stepsMatch,
        message: stepsMatch
          ? '✅ Steps target matches V2 Engine'
          : '❌ Steps target mismatch with V2 Engine',
        expected: v2Targets.steps,
        actual: assessmentTargets.steps,
        severity: 'critical',
      });

      // Test 2: Water target alignment
      const waterMatch = v2Targets.waterOz === assessmentTargets.waterOz;

      this.results.push({
        test: 'Water Target Alignment',
        category: 'data_integrity',
        passed: waterMatch,
        message: waterMatch
          ? '✅ Water target matches V2 Engine'
          : '❌ Water target mismatch with V2 Engine',
        expected: v2Targets.waterOz,
        actual: assessmentTargets.waterOz,
        severity: 'critical',
      });

      // Test 3: Sleep target alignment
      const sleepMatch = v2Targets.sleepHr === assessmentTargets.sleepHr;

      this.results.push({
        test: 'Sleep Target Alignment',
        category: 'data_integrity',
        passed: sleepMatch,
        message: sleepMatch
          ? '✅ Sleep target matches V2 Engine'
          : '❌ Sleep target mismatch with V2 Engine',
        expected: v2Targets.sleepHr,
        actual: assessmentTargets.sleepHr,
        severity: 'critical',
      });
    } catch (error) {
      this.results.push({
        test: 'V2 Engine Target Alignment',
        category: 'data_integrity',
        passed: false,
        message: `❌ Could not validate target alignment: ${error}`,
        severity: 'warning',
      });
    }
  }

  /**
   * Validate data completeness
   */
  private async validateDataCompleteness(): Promise<void> {
    if (!this.assessmentData) return;

    const { performance, consistency, assessment } = this.assessmentData;

    // Test 1: All required performance fields present
    const performanceComplete =
      performance.week !== undefined &&
      performance.phase !== undefined &&
      performance.averageAchievement !== undefined &&
      performance.consistencyDays !== undefined &&
      performance.strongestPillar !== undefined &&
      performance.weakestPillar !== undefined;

    this.results.push({
      test: 'Performance Data Completeness',
      category: 'data_integrity',
      passed: performanceComplete,
      message: performanceComplete
        ? '✅ All performance fields present'
        : '❌ Missing performance fields',
      severity: 'critical',
    });

    // Test 2: All required consistency fields present
    const consistencyComplete =
      consistency.consistentDays !== undefined &&
      consistency.totalDays !== undefined &&
      consistency.consistencyRate !== undefined &&
      consistency.currentStreak !== undefined &&
      consistency.longestStreak !== undefined;

    this.results.push({
      test: 'Consistency Data Completeness',
      category: 'data_integrity',
      passed: consistencyComplete,
      message: consistencyComplete
        ? '✅ All consistency fields present'
        : '❌ Missing consistency fields',
      severity: 'critical',
    });

    // Test 3: All required assessment fields present
    const assessmentComplete =
      assessment.recommendation !== undefined &&
      assessment.confidence !== undefined &&
      assessment.reasoning !== undefined &&
      Array.isArray(assessment.reasoning);

    this.results.push({
      test: 'Assessment Data Completeness',
      category: 'data_integrity',
      passed: assessmentComplete,
      message: assessmentComplete
        ? '✅ All assessment fields present'
        : '❌ Missing assessment fields',
      severity: 'critical',
    });
  }

  /**
   * Validate database consistency
   */
  private async validateDatabaseConsistency(): Promise<void> {
    if (!this.assessmentData) return;

    try {
      // Check if assessment is stored in weekly_performance_history
      const { data, error } = await supabase
        .from('weekly_performance_history')
        .select('*')
        .eq('user_id', this.testUserId)
        .eq('week_number', this.assessmentData.performance.week)
        .single();

      const isStored = !error && data !== null;

      this.results.push({
        test: 'Assessment Database Storage',
        category: 'data_integrity',
        passed: isStored,
        message: isStored
          ? '✅ Assessment stored in database'
          : '❌ Assessment not found in database',
        severity: 'critical',
      });

      if (isStored && data) {
        // Validate stored data matches calculated data
        const achievementMatch =
          Math.abs(data.overall_achievement_avg - this.assessmentData.performance.averageAchievement) < 0.01;

        this.results.push({
          test: 'Stored Data Accuracy',
          category: 'data_integrity',
          passed: achievementMatch,
          message: achievementMatch
            ? '✅ Stored data matches calculated data'
            : '❌ Stored data differs from calculated data',
          expected: this.assessmentData.performance.averageAchievement.toFixed(2),
          actual: data.overall_achievement_avg.toFixed(2),
          severity: 'warning',
        });
      }
    } catch (error) {
      this.results.push({
        test: 'Database Consistency Check',
        category: 'data_integrity',
        passed: false,
        message: `❌ Database validation failed: ${error}`,
        severity: 'warning',
      });
    }
  }

  // ============================================================================
  // CATEGORY 3: BUSINESS LOGIC
  // ============================================================================

  /**
   * Validate 80% mastery progression rules
   */
  private async validateProgressionRules(): Promise<void> {
    if (!this.assessmentData) return;

    const { performance, consistency, assessment } = this.assessmentData;

    // Test 1: Advance rule (80%+ achievement AND 5+ consistent days)
    if (performance.averageAchievement >= 80 && consistency.consistentDays >= 5) {
      const shouldAdvance = assessment.recommendation === 'advance';

      this.results.push({
        test: '80% Mastery Advance Rule',
        category: 'business_logic',
        passed: shouldAdvance,
        message: shouldAdvance
          ? '✅ Correctly recommends advance (80%+ & 5+ days)'
          : '❌ Should recommend advance but does not',
        expected: 'advance',
        actual: assessment.recommendation,
        severity: 'critical',
      });
    }

    // Test 2: Reset rule (<40% achievement OR 3+ extensions)
    if (performance.averageAchievement < 40) {
      const shouldReset = assessment.recommendation === 'reset';

      this.results.push({
        test: 'Low Performance Reset Rule',
        category: 'business_logic',
        passed: shouldReset,
        message: shouldReset
          ? '✅ Correctly recommends reset (<40% achievement)'
          : '❌ Should recommend reset but does not',
        expected: 'reset',
        actual: assessment.recommendation,
        severity: 'critical',
      });
    }

    // Test 3: Extend rule (moderate performance)
    if (
      performance.averageAchievement >= 40 &&
      performance.averageAchievement < 80 &&
      consistency.consistentDays < 5
    ) {
      const shouldExtend = assessment.recommendation === 'extend';

      this.results.push({
        test: 'Moderate Performance Extend Rule',
        category: 'business_logic',
        passed: shouldExtend,
        message: shouldExtend
          ? '✅ Correctly recommends extend (moderate performance)'
          : '❌ Should recommend extend but does not',
        expected: 'extend',
        actual: assessment.recommendation,
        severity: 'critical',
      });
    }
  }

  /**
   * Validate recommendation logic consistency
   */
  private async validateRecommendationLogic(): Promise<void> {
    if (!this.assessmentData) return;

    const { assessment } = this.assessmentData;

    // Test 1: Recommendation should be one of the valid values
    const validRecommendations = ['advance', 'extend', 'reset'];
    const isValidRecommendation = validRecommendations.includes(assessment.recommendation);

    this.results.push({
      test: 'Valid Recommendation Type',
      category: 'business_logic',
      passed: isValidRecommendation,
      message: isValidRecommendation
        ? `✅ Recommendation "${assessment.recommendation}" is valid`
        : `❌ Invalid recommendation: ${assessment.recommendation}`,
      expected: validRecommendations,
      actual: assessment.recommendation,
      severity: 'critical',
    });

    // Test 2: Reasoning should not be empty
    const hasReasoning = assessment.reasoning && assessment.reasoning.length > 0;

    this.results.push({
      test: 'Recommendation Reasoning Present',
      category: 'business_logic',
      passed: hasReasoning,
      message: hasReasoning
        ? `✅ Reasoning provided (${assessment.reasoning.length} points)`
        : '❌ No reasoning provided for recommendation',
      severity: 'warning',
    });

    // Test 3: Modifications should only exist for "extend" recommendation
    const modificationsValid =
      assessment.recommendation === 'extend'
        ? assessment.modifications !== undefined
        : assessment.modifications === undefined;

    this.results.push({
      test: 'Modifications Logic',
      category: 'business_logic',
      passed: modificationsValid,
      message: modificationsValid
        ? '✅ Modifications correctly applied/omitted'
        : `❌ Modifications logic error (recommendation: ${assessment.recommendation})`,
      severity: 'warning',
    });
  }

  /**
   * Validate confidence scoring
   */
  private async validateConfidenceScoring(): Promise<void> {
    if (!this.assessmentData) return;

    const { assessment } = this.assessmentData;

    // Test 1: Confidence should be 0-100
    const confidenceInRange = assessment.confidence >= 0 && assessment.confidence <= 100;

    this.results.push({
      test: 'Confidence Score Range',
      category: 'business_logic',
      passed: confidenceInRange,
      message: confidenceInRange
        ? `✅ Confidence score valid (${assessment.confidence}%)`
        : `❌ Confidence score out of range: ${assessment.confidence}`,
      expected: '0-100',
      actual: assessment.confidence,
      severity: 'critical',
    });

    // Test 2: High confidence for clear cases
    if (this.assessmentData.performance.averageAchievement >= 85 && 
        this.assessmentData.consistency.consistentDays >= 6 &&
        assessment.recommendation === 'advance') {
      const highConfidence = assessment.confidence >= 90;

      this.results.push({
        test: 'High Confidence for Clear Mastery',
        category: 'business_logic',
        passed: highConfidence,
        message: highConfidence
          ? '✅ High confidence for clear mastery case'
          : `❌ Expected high confidence (>=90), got ${assessment.confidence}`,
        expected: '>=90',
        actual: assessment.confidence,
        severity: 'info',
      });
    }
  }

  /**
   * Validate target modification rules
   */
  private async validateModificationRules(): Promise<void> {
    if (!this.assessmentData) return;

    const { assessment, performance } = this.assessmentData;

    if (assessment.recommendation === 'extend' && assessment.modifications) {
      // Test 1: Modifications should target weakest pillar
      const targetsWeakest = assessment.modifications.focusArea === performance.weakestPillar;

      this.results.push({
        test: 'Modifications Target Weakest Pillar',
        category: 'business_logic',
        passed: targetsWeakest,
        message: targetsWeakest
          ? `✅ Modifications target weakest pillar (${performance.weakestPillar})`
          : `❌ Modifications target ${assessment.modifications.focusArea}, weakest is ${performance.weakestPillar}`,
        expected: performance.weakestPillar,
        actual: assessment.modifications.focusArea,
        severity: 'warning',
      });

      // Test 2: Adjustment reason should be provided
      const hasReason = assessment.modifications.adjustmentReason && 
                        assessment.modifications.adjustmentReason.length > 0;

      this.results.push({
        test: 'Modification Reason Provided',
        category: 'business_logic',
        passed: hasReason,
        message: hasReason
          ? '✅ Adjustment reason provided'
          : '❌ No adjustment reason provided',
        severity: 'warning',
      });
    }
  }

  // ============================================================================
  // CATEGORY 4: 90-DAY PLAN STANDARDS
  // ============================================================================

  /**
   * Validate phase alignment
   */
  private async validatePhaseAlignment(): Promise<void> {
    if (!this.assessmentData) return;

    const { performance } = this.assessmentData;

    // Test: Phase should match week (Phase = ceil(week / 4))
    const expectedPhase = Math.ceil(performance.week / 4);
    const phaseMatch = performance.phase === expectedPhase;

    this.results.push({
      test: 'Phase Calculation',
      category: 'standards',
      passed: phaseMatch,
      message: phaseMatch
        ? `✅ Phase ${performance.phase} correct for Week ${performance.week}`
        : `❌ Phase mismatch for Week ${performance.week}`,
      expected: expectedPhase,
      actual: performance.phase,
      severity: 'critical',
    });
  }

  /**
   * Validate week progression
   */
  private async validateWeekProgression(): Promise<void> {
    if (!this.assessmentData) return;

    try {
      const { data } = await supabase
        .from('plan_progress')
        .select('current_week, current_phase')
        .eq('user_id', this.testUserId)
        .single();

      if (data) {
        // Test: Assessment week should match plan_progress
        const weekMatch = this.assessmentData.performance.week === data.current_week;

        this.results.push({
          test: 'Week Progression Consistency',
          category: 'standards',
          passed: weekMatch,
          message: weekMatch
            ? `✅ Assessment week matches plan_progress (Week ${data.current_week})`
            : `❌ Assessment week (${this.assessmentData.performance.week}) != plan_progress (${data.current_week})`,
          expected: data.current_week,
          actual: this.assessmentData.performance.week,
          severity: 'critical',
        });
      }
    } catch (error) {
      this.results.push({
        test: 'Week Progression Check',
        category: 'standards',
        passed: false,
        message: `❌ Could not validate week progression: ${error}`,
        severity: 'warning',
      });
    }
  }

  /**
   * Validate target progression follows 90-day plan
   */
  private async validateTargetProgression(): Promise<void> {
    if (!this.assessmentData) return;

    const { currentTargets, performance } = this.assessmentData;

    // Test: Targets should be reasonable for the phase
    const phase = performance.phase;
    let targetsReasonable = true;
    let message = '';

    // Phase 1: Foundation (Weeks 1-4) - Lower targets
    if (phase === 1) {
      if (currentTargets.steps > 8000 || currentTargets.waterOz > 80 || currentTargets.sleepHr > 7.5) {
        targetsReasonable = false;
        message = `Phase 1 targets seem high: ${currentTargets.steps} steps, ${currentTargets.waterOz}oz water`;
      } else {
        message = `✅ Phase 1 targets appropriate (foundation level)`;
      }
    }
    // Phase 2: Building (Weeks 5-8) - Moderate targets
    else if (phase === 2) {
      if (currentTargets.steps < 6000 || currentTargets.steps > 12000) {
        targetsReasonable = false;
        message = `Phase 2 steps target unusual: ${currentTargets.steps}`;
      } else {
        message = `✅ Phase 2 targets appropriate (building level)`;
      }
    }
    // Phase 3: Mastery (Weeks 9-12) - Higher targets
    else if (phase === 3) {
      if (currentTargets.steps < 8000) {
        targetsReasonable = false;
        message = `Phase 3 targets seem low: ${currentTargets.steps} steps`;
      } else {
        message = `✅ Phase 3 targets appropriate (mastery level)`;
      }
    }

    this.results.push({
      test: 'Target Progression Standards',
      category: 'standards',
      passed: targetsReasonable,
      message,
      actual: currentTargets,
      severity: 'info',
    });
  }

  /**
   * Validate plan boundaries
   */
  private async validatePlanBoundaries(): Promise<void> {
    if (!this.assessmentData) return;

    const { performance } = this.assessmentData;

    // Test 1: Week should be 1-12
    const weekInRange = performance.week >= 1 && performance.week <= 12;

    this.results.push({
      test: '90-Day Plan Week Bounds',
      category: 'standards',
      passed: weekInRange,
      message: weekInRange
        ? `✅ Week ${performance.week} within 90-day plan (1-12)`
        : `❌ Week ${performance.week} outside plan boundaries`,
      expected: '1-12',
      actual: performance.week,
      severity: 'critical',
    });

    // Test 2: Phase should be 1-3
    const phaseInRange = performance.phase >= 1 && performance.phase <= 3;

    this.results.push({
      test: '90-Day Plan Phase Bounds',
      category: 'standards',
      passed: phaseInRange,
      message: phaseInRange
        ? `✅ Phase ${performance.phase} within plan (1-3)`
        : `❌ Phase ${performance.phase} outside plan boundaries`,
      expected: '1-3',
      actual: performance.phase,
      severity: 'critical',
    });
  }

  /**
   * Print comprehensive validation results
   */
  private printResults(): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 WEEKLY ASSESSMENT DATA VALIDATION RESULTS');
    console.log('='.repeat(80) + '\n');

    // Group by category
    const categories = ['calculation', 'data_integrity', 'business_logic', 'standards'] as const;
    const categoryNames = {
      calculation: '📊 Calculation Accuracy',
      data_integrity: '🔍 Data Integrity',
      business_logic: '⚙️  Business Logic',
      standards: '📋 90-Day Plan Standards',
    };

    categories.forEach(category => {
      const categoryResults = this.results.filter(r => r.category === category);
      const passed = categoryResults.filter(r => r.passed).length;
      const total = categoryResults.length;

      console.log(`\n${categoryNames[category]}: ${passed}/${total} passed`);
      console.log('-'.repeat(80));

      categoryResults.forEach(result => {
        const icon = result.passed ? '✅' : result.severity === 'critical' ? '❌' : '⚠️';
        console.log(`${icon} ${result.test}`);
        console.log(`   ${result.message}`);
        
        if (result.expected !== undefined) {
          console.log(`   Expected: ${JSON.stringify(result.expected)}`);
        }
        if (result.actual !== undefined) {
          console.log(`   Actual: ${JSON.stringify(result.actual)}`);
        }
        console.log('');
      });
    });

    // Summary
    const totalPassed = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;
    const criticalFailed = this.results.filter(r => !r.passed && r.severity === 'critical').length;
    const warningFailed = this.results.filter(r => !r.passed && r.severity === 'warning').length;

    console.log('='.repeat(80));
    console.log(`✅ Passed: ${totalPassed}/${totalTests}`);
    console.log(`❌ Critical Failures: ${criticalFailed}`);
    console.log(`⚠️  Warnings: ${warningFailed}`);
    console.log(`📈 Success Rate: ${Math.round((totalPassed / totalTests) * 100)}%`);
    console.log('='.repeat(80) + '\n');

    if (criticalFailed === 0 && warningFailed === 0) {
      console.log('🎉 ALL VALIDATIONS PASSED! Assessment data is accurate and standards-compliant.\n');
    } else if (criticalFailed === 0) {
      console.log('✅ All critical tests passed. Review warnings for optimization opportunities.\n');
    } else {
      console.log('⚠️  Critical issues detected. Please review and fix before production use.\n');
    }
  }
}

/**
 * Run the validation suite
 */
export async function runWeeklyAssessmentValidation(userId: string): Promise<void> {
  const validator = new WeeklyAssessmentDataValidation();
  await validator.runValidation(userId);
}

