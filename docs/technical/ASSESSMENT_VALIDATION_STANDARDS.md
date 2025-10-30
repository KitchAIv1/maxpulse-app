# Weekly Assessment Validation Standards

## Overview

This document defines the validation standards and correctness criteria for the Weekly Assessment system. All assessments must pass these validation tests to ensure data accuracy and compliance with the 90-day transformation plan.

## Validation Categories

### 1. 📊 Calculation Accuracy

Ensures all mathematical calculations are correct and consistent.

#### Tests:

**1.1 Average Achievement Calculation**
- **Rule**: Average achievement = Sum of pillar achievements / 4
- **Tolerance**: ±0.01%
- **Severity**: CRITICAL
- **Example**: If pillars are [80%, 70%, 90%, 60%], average should be 75%

**1.2 Pillar Percentage Bounds**
- **Rule**: All pillar percentages must be 0-100
- **Severity**: CRITICAL
- **Rationale**: Percentages outside this range indicate calculation errors

**1.3 Consistency Days Bounds**
- **Rule**: Consistency days ≤ Total tracking days
- **Severity**: CRITICAL
- **Rationale**: Cannot have more consistent days than days tracked

**1.4 Consistency Rate Calculation**
- **Rule**: Consistency rate = (Consistent days / Total days) × 100
- **Tolerance**: ±0.01%
- **Severity**: CRITICAL

**1.5 Streak Logic**
- **Rule**: Longest streak ≥ Current streak
- **Severity**: WARNING
- **Rationale**: Longest streak should always be at least as long as current

**1.6 Pillar Count**
- **Rule**: Must have exactly 4 health pillars
- **Expected**: steps, water, sleep, mood
- **Severity**: CRITICAL

**1.7 Performance Grade Assignment**
- **Rules**:
  - `mastery`: Achievement ≥80% AND Consistency ≥5 days
  - `progress`: Achievement ≥60% AND Consistency ≥3 days
  - `struggle`: All other cases
- **Severity**: CRITICAL

---

### 2. 🔍 Data Integrity

Ensures data is complete, valid, and consistent across systems.

#### Tests:

**2.1 Date Range Order**
- **Rule**: Start date < End date
- **Severity**: CRITICAL
- **Rationale**: Invalid date ranges corrupt time-based calculations

**2.2 Weekly Date Range**
- **Rule**: Date range should span 6-7 days
- **Tolerance**: ±1 day
- **Severity**: WARNING
- **Rationale**: Assessments are weekly by design

**2.3 Target Alignment with V2 Engine**
- **Rule**: Assessment targets must match V2 Engine current week targets
- **Fields**: steps, waterOz, sleepHr
- **Severity**: CRITICAL
- **Rationale**: Ensures consistency with personalized 90-day plan

**2.4 Data Completeness**
- **Required Performance Fields**:
  - week, phase, averageAchievement, consistencyDays
  - strongestPillar, weakestPillar, overallGrade
  - pillarBreakdown (array with 4 items)
- **Required Consistency Fields**:
  - consistentDays, totalDays, consistencyRate
  - currentStreak, longestStreak
  - weekdayConsistency, weekendConsistency
- **Required Assessment Fields**:
  - recommendation, confidence, reasoning (array)
- **Severity**: CRITICAL

**2.5 Database Consistency**
- **Rule**: Assessment must be stored in `weekly_performance_history`
- **Validation**: Stored data matches calculated data
- **Tolerance**: ±0.01% for achievement values
- **Severity**: CRITICAL

---

### 3. ⚙️ Business Logic

Validates adherence to progression rules and recommendation logic.

#### Tests:

**3.1 80% Mastery Advance Rule**
- **Condition**: Achievement ≥80% AND Consistency ≥5 days
- **Expected**: Recommendation = `advance`
- **Severity**: CRITICAL
- **Rationale**: Core progression rule for the 90-day plan

**3.2 Low Performance Reset Rule**
- **Condition**: Achievement <40%
- **Expected**: Recommendation = `reset`
- **Severity**: CRITICAL
- **Rationale**: Prevents user frustration by resetting to achievable targets

**3.3 Moderate Performance Extend Rule**
- **Condition**: 40% ≤ Achievement <80% OR Consistency <5 days
- **Expected**: Recommendation = `extend`
- **Severity**: CRITICAL
- **Rationale**: Allows mastery building before advancing

**3.4 Valid Recommendation Type**
- **Rule**: Recommendation must be one of: `advance`, `extend`, `reset`
- **Severity**: CRITICAL

**3.5 Recommendation Reasoning**
- **Rule**: Reasoning array must not be empty
- **Minimum**: 1 reasoning point
- **Severity**: WARNING
- **Rationale**: Users need to understand why a recommendation was made

**3.6 Modifications Logic**
- **Rule**: Modifications should only exist for `extend` recommendation
- **Severity**: WARNING
- **Rationale**: Only extended weeks get target adjustments

**3.7 Confidence Score Range**
- **Rule**: Confidence must be 0-100
- **Severity**: CRITICAL

**3.8 High Confidence for Clear Cases**
- **Condition**: Achievement ≥85% AND Consistency ≥6 days AND Recommendation = `advance`
- **Expected**: Confidence ≥90%
- **Severity**: INFO
- **Rationale**: Clear mastery should have high confidence

**3.9 Modifications Target Weakest Pillar**
- **Rule**: When extending, modifications should focus on weakest pillar
- **Severity**: WARNING
- **Rationale**: Targeted improvements are more effective

**3.10 Modification Reason Provided**
- **Rule**: If modifications exist, adjustment reason must be provided
- **Severity**: WARNING

---

### 4. 📋 90-Day Plan Standards

Ensures compliance with the transformation roadmap structure.

#### Tests:

**4.1 Phase Calculation**
- **Rule**: Phase = ceil(Week / 4)
- **Examples**:
  - Weeks 1-4 → Phase 1 (Foundation)
  - Weeks 5-8 → Phase 2 (Building)
  - Weeks 9-12 → Phase 3 (Mastery)
- **Severity**: CRITICAL

**4.2 Week Progression Consistency**
- **Rule**: Assessment week must match `plan_progress.current_week`
- **Severity**: CRITICAL
- **Rationale**: Ensures assessment aligns with user's actual progress

**4.3 Target Progression Standards**
- **Phase 1 (Foundation)**: Lower targets for habit formation
  - Steps: ≤8,000
  - Water: ≤80oz
  - Sleep: ≤7.5hr
- **Phase 2 (Building)**: Moderate targets for growth
  - Steps: 6,000-12,000
  - Water: 60-100oz
  - Sleep: 6.5-8hr
- **Phase 3 (Mastery)**: Higher targets for optimization
  - Steps: ≥8,000
  - Water: ≥70oz
  - Sleep: ≥7hr
- **Severity**: INFO
- **Note**: These are guidelines; V2 Engine personalization may vary

**4.4 90-Day Plan Week Bounds**
- **Rule**: Week must be 1-12
- **Severity**: CRITICAL
- **Rationale**: 90-day plan is 12 weeks

**4.5 90-Day Plan Phase Bounds**
- **Rule**: Phase must be 1-3
- **Severity**: CRITICAL
- **Rationale**: 90-day plan has 3 phases

---

## Severity Levels

### CRITICAL
- **Impact**: System will produce incorrect results or fail
- **Action**: Must be fixed immediately before production use
- **Examples**: Calculation errors, invalid data, broken business logic

### WARNING
- **Impact**: System works but may have suboptimal behavior
- **Action**: Should be reviewed and fixed for quality
- **Examples**: Missing reasoning, inconsistent patterns

### INFO
- **Impact**: Informational feedback for optimization
- **Action**: Review for potential improvements
- **Examples**: Confidence scoring patterns, target progression guidelines

---

## Running Validation Tests

### In Development (App)

1. Open the app in development mode (`__DEV__ = true`)
2. Navigate to the Dashboard
3. Tap the purple "🔬 Validate Assessment Data" button
4. Review the comprehensive validation report

### Programmatically

```typescript
import { runWeeklyAssessmentValidation } from './src/tests/WeeklyAssessmentDataValidation';

await runWeeklyAssessmentValidation(userId);
```

---

## Expected Test Results

### Healthy System (All Tests Pass)

```
📊 WEEKLY ASSESSMENT DATA VALIDATION RESULTS
================================================================================

📊 Calculation Accuracy: 7/7 passed
🔍 Data Integrity: 8/8 passed
⚙️  Business Logic: 10/10 passed
📋 90-Day Plan Standards: 5/5 passed

================================================================================
✅ Passed: 30/30
❌ Critical Failures: 0
⚠️  Warnings: 0
📈 Success Rate: 100%
================================================================================

🎉 ALL VALIDATIONS PASSED! Assessment data is accurate and standards-compliant.
```

### System with Issues

```
📊 WEEKLY ASSESSMENT DATA VALIDATION RESULTS
================================================================================

📊 Calculation Accuracy: 6/7 passed
❌ Average Achievement Calculation
   ❌ Average achievement calculation mismatch
   Expected: 75.25
   Actual: 75.00

🔍 Data Integrity: 7/8 passed
⚠️  Target Alignment with V2 Engine
   ⚠️  Steps target mismatch with V2 Engine
   Expected: 10000
   Actual: 8000

================================================================================
✅ Passed: 28/30
❌ Critical Failures: 1
⚠️  Warnings: 1
📈 Success Rate: 93%
================================================================================

⚠️  Critical issues detected. Please review and fix before production use.
```

---

## Maintenance

### When to Update Standards

1. **New Features**: When adding new assessment metrics or calculations
2. **Business Rule Changes**: When modifying progression rules or thresholds
3. **90-Day Plan Updates**: When adjusting phase structure or target ranges
4. **Bug Fixes**: When fixing calculation errors, update tests to prevent regression

### Adding New Tests

1. Identify the validation category (Calculation, Data Integrity, Business Logic, Standards)
2. Define the rule, expected behavior, and severity
3. Implement the test in `WeeklyAssessmentDataValidation.ts`
4. Document the test in this file
5. Verify the test catches the issue it's designed to detect

---

## Related Documentation

- [Assessment System Analysis](./ASSESSMENT_SYSTEM_ANALYSIS.md)
- [90-Day Plan Verification](./90_DAY_PLAN_VERIFICATION.md)
- [Activation Code System](./ACTIVATION_CODE_SYSTEM.md)
- [Migration Guide](./MIGRATION_GUIDE.md)

---

## Version History

- **v1.0** (2025-10-30): Initial validation standards document
  - 30 validation tests across 4 categories
  - Comprehensive coverage of calculation, data integrity, business logic, and 90-day plan standards

