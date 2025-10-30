# Weekly Assessment Validation - Quick Reference

## 🎯 Core Standards at a Glance

### Progression Rules (80% Mastery System)

| Condition | Recommendation | Confidence |
|-----------|---------------|------------|
| Achievement ≥80% **AND** Consistency ≥5 days | **ADVANCE** | ≥90% (clear mastery) |
| Achievement <40% **OR** Extensions ≥3 | **RESET** | ≥90% (clear struggle) |
| All other cases | **EXTEND** | ~75% (building) |

### Calculation Standards

| Metric | Formula | Valid Range |
|--------|---------|-------------|
| Average Achievement | Sum of 4 pillars / 4 | 0-100% |
| Consistency Rate | (Consistent days / Total days) × 100 | 0-100% |
| Consistency Days | Days with ≥80% overall achievement | 0 to Total days |
| Current Streak | Consecutive days ≥80% | 0 to Total days |
| Longest Streak | Maximum consecutive days | ≥ Current streak |

### Performance Grades

| Grade | Criteria |
|-------|----------|
| **Mastery** | Achievement ≥80% AND Consistency ≥5 days |
| **Progress** | Achievement ≥60% AND Consistency ≥3 days |
| **Struggle** | Below progress thresholds |

### 90-Day Plan Structure

| Phase | Weeks | Focus | Typical Targets |
|-------|-------|-------|-----------------|
| **Phase 1: Foundation** | 1-4 | Habit formation | Steps ≤8,000, Water ≤80oz |
| **Phase 2: Building** | 5-8 | Growth | Steps 6,000-12,000, Water 60-100oz |
| **Phase 3: Mastery** | 9-12 | Optimization | Steps ≥8,000, Water ≥70oz |

**Phase Calculation**: `Phase = ceil(Week / 4)`

---

## 🔬 Validation Test Checklist

### ✅ Critical Tests (Must Pass)

- [ ] Average achievement = Sum of pillars / 4 (±0.01%)
- [ ] All pillar percentages 0-100
- [ ] Consistency days ≤ Total tracking days
- [ ] Start date < End date
- [ ] Targets match V2 Engine (steps, water, sleep)
- [ ] All required data fields present
- [ ] Assessment stored in database
- [ ] Grade matches achievement/consistency rules
- [ ] Recommendation follows 80% mastery rule
- [ ] Recommendation is valid type (advance/extend/reset)
- [ ] Confidence score 0-100
- [ ] Phase = ceil(Week / 4)
- [ ] Week 1-12, Phase 1-3
- [ ] Assessment week matches plan_progress

### ⚠️ Warning Tests (Should Pass)

- [ ] Date range spans 6-7 days
- [ ] Longest streak ≥ Current streak
- [ ] Pillars have daily values
- [ ] Reasoning provided (not empty)
- [ ] Modifications only for "extend"
- [ ] Modifications target weakest pillar
- [ ] Modification reason provided

### ℹ️ Info Tests (Optimization)

- [ ] High confidence (≥90%) for clear mastery
- [ ] Targets appropriate for phase

---

## 🚨 Common Issues & Fixes

### Issue: Average Achievement Mismatch
**Symptom**: Calculated average ≠ reported average  
**Cause**: Rounding errors or incorrect pillar sum  
**Fix**: Verify all 4 pillars included, check rounding logic

### Issue: Invalid Recommendation
**Symptom**: Recommendation doesn't match achievement/consistency  
**Cause**: Business logic error in ProgressionRecommendationEngine  
**Fix**: Verify 80% rule implementation, check week extensions

### Issue: Target Misalignment
**Symptom**: Assessment targets ≠ V2 Engine targets  
**Cause**: Stale targets or incorrect week lookup  
**Fix**: Ensure V2EngineConnector called before assessment, verify current_week

### Issue: Missing Database Record
**Symptom**: Assessment not found in weekly_performance_history  
**Cause**: Storage failure or RLS policy blocking insert  
**Fix**: Check RLS policies, verify user_id, review error logs

### Issue: Invalid Date Range
**Symptom**: Start date ≥ End date or range ≠ 7 days  
**Cause**: Incorrect start_date in plan_progress  
**Fix**: Run fix_historical_start_dates.sql, verify calculation

### Issue: Phase Mismatch
**Symptom**: Phase doesn't match ceil(Week/4)  
**Cause**: Incorrect phase calculation or stale data  
**Fix**: Verify phase calculation in WeeklyPerformanceCalculator

---

## 📊 Expected Validation Output

### Perfect Score (Production Ready)
```
📊 Calculation Accuracy: 7/7 passed
🔍 Data Integrity: 8/8 passed
⚙️  Business Logic: 10/10 passed
📋 90-Day Plan Standards: 5/5 passed

✅ Passed: 30/30
❌ Critical Failures: 0
⚠️  Warnings: 0
📈 Success Rate: 100%

🎉 ALL VALIDATIONS PASSED!
```

### Acceptable (Minor Issues)
```
✅ Passed: 28/30
❌ Critical Failures: 0
⚠️  Warnings: 2
📈 Success Rate: 93%

✅ All critical tests passed. Review warnings for optimization.
```

### Needs Attention (Critical Issues)
```
✅ Passed: 25/30
❌ Critical Failures: 3
⚠️  Warnings: 2
📈 Success Rate: 83%

⚠️  Critical issues detected. Fix before production use.
```

---

## 🛠️ Quick Testing Guide

### 1. Run Validation (In App)
```
1. Open app in dev mode
2. Tap "🔬 Validate Assessment Data"
3. Review results modal
```

### 2. Run Validation (Programmatically)
```typescript
import { runWeeklyAssessmentValidation } from './src/tests/WeeklyAssessmentDataValidation';

await runWeeklyAssessmentValidation(userId);
```

### 3. Interpret Results
- **All Green (✅)**: System working correctly
- **Yellow (⚠️)**: Review for optimization
- **Red (❌)**: Fix immediately

---

## 📝 When to Run Validation

### Required
- [ ] Before production deployment
- [ ] After modifying assessment calculations
- [ ] After changing progression rules
- [ ] After updating 90-day plan structure

### Recommended
- [ ] After database migrations
- [ ] After V2 Engine updates
- [ ] Weekly during development
- [ ] When debugging assessment issues

---

## 🔗 Related Documentation

- **Full Standards**: [ASSESSMENT_VALIDATION_STANDARDS.md](./ASSESSMENT_VALIDATION_STANDARDS.md)
- **Assessment System**: [ASSESSMENT_SYSTEM_ANALYSIS.md](./ASSESSMENT_SYSTEM_ANALYSIS.md)
- **90-Day Plan**: [90_DAY_PLAN_VERIFICATION.md](./90_DAY_PLAN_VERIFICATION.md)
- **Caching Tests**: Run "🧪 Test Assessment Caching" button

---

## 💡 Pro Tips

1. **Run Both Tests**: Caching test + Validation test for complete coverage
2. **Check Logs**: Terminal logs show detailed calculation steps
3. **Compare Weeks**: Run validation for multiple weeks to spot trends
4. **Database First**: Verify migrations before running validation
5. **Fresh Data**: Test with real user data for accurate validation

---

**Last Updated**: 2025-10-30  
**Version**: 1.0  
**Test Suite**: 30 tests across 4 categories

