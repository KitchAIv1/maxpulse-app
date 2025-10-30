// Progression Recommendation Engine Service
// Single responsibility: Generate progression recommendations based on performance data

import { 
  ProgressionAssessment, 
  WeeklyPerformance, 
  ConsistencyMetrics, 
  TargetModifications,
  ProgressionRecommendation,
  HealthPillar 
} from '../../types/assessment';

export class ProgressionRecommendationEngine {
  /**
   * Generate progression recommendation based on weekly performance and consistency
   */
  static generateRecommendation(
    performance: WeeklyPerformance,
    consistency: ConsistencyMetrics,
    weekExtensions: number = 0
  ): ProgressionAssessment {
    const recommendation = this.determineRecommendation(performance, consistency, weekExtensions);
    const confidence = this.calculateConfidence(performance, consistency, recommendation);
    const reasoning = this.generateReasoning(performance, consistency, recommendation);
    const modifications = this.generateTargetModifications(performance, recommendation);
    const riskFactors = this.identifyRiskFactors(performance, consistency);
    const opportunities = this.identifyOpportunities(performance, consistency);

    return {
      recommendation,
      confidence,
      reasoning,
      modifications,
      riskFactors,
      opportunities,
    };
  }

  /**
   * Determine the core progression recommendation using 80% mastery rule
   */
  private static determineRecommendation(
    performance: WeeklyPerformance,
    consistency: ConsistencyMetrics,
    weekExtensions: number
  ): ProgressionRecommendation {
    // 80% Rule: Advance if 80%+ average AND 5+ consistent days
    if (performance.averageAchievement >= 80 && consistency.consistentDays >= 5) {
      return 'advance';
    }

    // Reset if performance is very low or too many extensions
    if (performance.averageAchievement < 40 || weekExtensions >= 3) {
      return 'reset';
    }

    // Default to extend for moderate performance
    return 'extend';
  }

  /**
   * Calculate confidence level in the recommendation
   */
  private static calculateConfidence(
    performance: WeeklyPerformance,
    consistency: ConsistencyMetrics,
    recommendation: ProgressionRecommendation
  ): number {
    let baseConfidence = 70;

    // High confidence for clear mastery
    if (recommendation === 'advance' && performance.averageAchievement >= 85 && consistency.consistentDays >= 6) {
      baseConfidence = 95;
    }
    // High confidence for clear struggle
    else if (recommendation === 'reset' && performance.averageAchievement < 35) {
      baseConfidence = 90;
    }
    // Moderate confidence for borderline cases
    else if (recommendation === 'extend') {
      baseConfidence = 75;
    }

    // Adjust based on consistency patterns
    if (consistency.currentStreak >= 3) {
      baseConfidence += 5;
    }
    if (consistency.consistencyRate >= 70) {
      baseConfidence += 5;
    }

    return Math.min(100, baseConfidence);
  }

  /**
   * Generate human-readable reasoning for the recommendation
   */
  private static generateReasoning(
    performance: WeeklyPerformance,
    consistency: ConsistencyMetrics,
    recommendation: ProgressionRecommendation
  ): string[] {
    const reasoning: string[] = [];

    switch (recommendation) {
      case 'advance':
        reasoning.push(`Achieved ${Math.round(performance.averageAchievement)}% average performance (target: 80%)`);
        reasoning.push(`Consistent for ${consistency.consistentDays} out of ${consistency.totalDays} days (target: 5+ days)`);
        if (consistency.currentStreak >= 3) {
          reasoning.push(`Currently on a ${consistency.currentStreak}-day streak`);
        }
        reasoning.push('Ready for the next challenge level');
        break;

      case 'extend':
        reasoning.push(`Achieved ${Math.round(performance.averageAchievement)}% average performance`);
        reasoning.push(`Consistent for ${consistency.consistentDays} out of ${consistency.totalDays} days`);
        reasoning.push('Building a strong foundation before advancing');
        if (performance.weakestPillar) {
          reasoning.push(`Focus area: ${this.getPillarDisplayName(performance.weakestPillar)} needs attention`);
        }
        break;

      case 'reset':
        reasoning.push(`Performance at ${Math.round(performance.averageAchievement)}% needs improvement`);
        reasoning.push('Rebuilding foundation will lead to better long-term success');
        reasoning.push('Previous week targets may be more appropriate right now');
        break;
    }

    return reasoning;
  }

  /**
   * Generate target modifications for week extensions
   */
  private static generateTargetModifications(
    performance: WeeklyPerformance,
    recommendation: ProgressionRecommendation
  ): TargetModifications | undefined {
    if (recommendation !== 'extend') {
      return undefined;
    }

    const focusArea = performance.weakestPillar;
    const weakestPillarPerformance = performance.pillarBreakdown.find(p => p.pillar === focusArea);
    
    if (!weakestPillarPerformance) {
      return undefined;
    }

    // Reduce the weakest pillar target by 10-20% to build confidence
    const reductionPercent = weakestPillarPerformance.averageAchievement < 50 ? 0.2 : 0.1;

    return {
      focusArea,
      adjustmentReason: `Reducing ${this.getPillarDisplayName(focusArea)} target to build consistency`,
      ...(focusArea === 'steps' && { steps: Math.round(8000 * (1 - reductionPercent)) }),
      ...(focusArea === 'water' && { waterOz: Math.round(80 * (1 - reductionPercent)) }),
      ...(focusArea === 'sleep' && { sleepHr: Math.round(7 * (1 - reductionPercent) * 10) / 10 }),
    };
  }

  /**
   * Identify risk factors that could impact success
   */
  private static identifyRiskFactors(
    performance: WeeklyPerformance,
    consistency: ConsistencyMetrics
  ): string[] {
    const risks: string[] = [];

    if (consistency.consistencyRate < 50) {
      risks.push('Low consistency rate may indicate habit formation challenges');
    }

    if (consistency.weekendConsistency < 60) {
      risks.push('Weekend performance drops significantly');
    }

    if (performance.averageAchievement < 60 && consistency.currentStreak === 0) {
      risks.push('No current momentum - may need additional support');
    }

    const strugglingPillars = performance.pillarBreakdown.filter(p => p.averageAchievement < 50);
    if (strugglingPillars.length >= 2) {
      risks.push('Multiple health areas need attention simultaneously');
    }

    return risks;
  }

  /**
   * Identify opportunities for improvement and growth
   */
  private static identifyOpportunities(
    performance: WeeklyPerformance,
    consistency: ConsistencyMetrics
  ): string[] {
    const opportunities: string[] = [];

    if (performance.strongestPillar) {
      const strongestPillarPerf = performance.pillarBreakdown.find(p => p.pillar === performance.strongestPillar);
      if (strongestPillarPerf && strongestPillarPerf.averageAchievement >= 85) {
        opportunities.push(`Excellent ${this.getPillarDisplayName(performance.strongestPillar)} habits can be a foundation for other areas`);
      }
    }

    if (consistency.longestStreak >= 5 && consistency.currentStreak < 3) {
      opportunities.push('Has demonstrated ability to maintain streaks - can rebuild momentum');
    }

    const improvingPillars = performance.pillarBreakdown.filter(p => p.trend === 'improving');
    if (improvingPillars.length >= 2) {
      opportunities.push('Multiple areas showing improvement trends');
    }

    if (consistency.weekendConsistency >= 90) {
      opportunities.push('Strong weekend habits show good lifestyle integration');
    }

    return opportunities;
  }

  /**
   * Get display-friendly pillar names
   */
  private static getPillarDisplayName(pillar: HealthPillar): string {
    switch (pillar) {
      case 'steps': return 'Steps';
      case 'water': return 'Hydration';
      case 'sleep': return 'Sleep';
      case 'mood': return 'Mood Check-ins';
      default: return pillar;
    }
  }

  /**
   * Validate if a recommendation is appropriate given constraints
   */
  static validateRecommendation(
    recommendation: ProgressionRecommendation,
    currentWeek: number,
    weekExtensions: number,
    maxWeeks: number = 12
  ): { isValid: boolean; reason?: string } {
    // Cannot advance beyond max weeks
    if (recommendation === 'advance' && currentWeek >= maxWeeks) {
      return { isValid: false, reason: 'Already at maximum week' };
    }

    // Cannot reset from week 1
    if (recommendation === 'reset' && currentWeek <= 1) {
      return { isValid: false, reason: 'Cannot reset from week 1' };
    }

    // Limit extensions per week
    if (recommendation === 'extend' && weekExtensions >= 5) {
      return { isValid: false, reason: 'Maximum extensions reached for this week' };
    }

    return { isValid: true };
  }
}
