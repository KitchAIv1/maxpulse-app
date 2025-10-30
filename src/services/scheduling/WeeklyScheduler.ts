// Weekly Scheduler Service
// Single responsibility: Schedule and manage weekly assessment timing

import { supabase } from '../supabase';
import { AssessmentTrigger } from '../../types/assessment';

export class WeeklyScheduler {
  /**
   * Check if user needs a weekly assessment
   */
  static async checkForWeeklyAssessment(userId: string): Promise<{
    needsAssessment: boolean;
    weekNumber?: number;
    daysSinceWeekStart?: number;
    reason?: string;
  }> {
    try {
      // Get user's current plan progress
      const { data: progress, error } = await supabase
        .from('plan_progress')
        .select('current_week, current_phase, last_assessment_date, start_date')
        .eq('user_id', userId)
        .single();

      if (error || !progress) {
        return { needsAssessment: false, reason: 'No active plan found' };
      }

      const currentWeek = progress.current_week;
      const weekStartDate = this.calculateWeekStartDate(progress.start_date, currentWeek);
      const daysSinceWeekStart = this.calculateDaysSinceWeekStart(weekStartDate);

      // Check if it's Sunday evening (day 6 of the week, 0-indexed)
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
      const currentHour = today.getHours();

      // Assessment triggers:
      // 1. Sunday evening (8 PM or later)
      // 2. 7+ days since week start
      // 3. No assessment recorded for current week
      
      const isSundayEvening = dayOfWeek === 0 && currentHour >= 20; // Sunday 8 PM+
      const isWeekComplete = daysSinceWeekStart >= 7;
      const hasRecentAssessment = this.hasRecentAssessment(progress.last_assessment_date, weekStartDate);

      let needsAssessment = false;
      let reason = '';

      if (!hasRecentAssessment && (isSundayEvening || isWeekComplete)) {
        needsAssessment = true;
        if (isSundayEvening) {
          reason = 'Sunday evening assessment time';
        } else if (isWeekComplete) {
          reason = 'Week completed - assessment overdue';
        }
      }

      return {
        needsAssessment,
        weekNumber: currentWeek,
        daysSinceWeekStart,
        reason,
      };
    } catch (error) {
      console.error('Error checking for weekly assessment:', error);
      return { needsAssessment: false, reason: 'Error checking assessment status' };
    }
  }

  /**
   * Schedule next weekly assessment notification
   */
  static async scheduleNextAssessment(userId: string): Promise<{
    success: boolean;
    scheduledFor?: Date;
    error?: string;
  }> {
    try {
      // Get user's current week info
      const { data: progress } = await supabase
        .from('plan_progress')
        .select('current_week, start_date')
        .eq('user_id', userId)
        .single();

      if (!progress) {
        return { success: false, error: 'No active plan found' };
      }

      // Calculate next Sunday 8 PM
      const nextSunday = this.getNextSundayEvening();
      
      // Store scheduled assessment (for future notification system)
      const trigger: Omit<AssessmentTrigger, 'triggeredAt'> = {
        type: 'scheduled',
        scheduledFor: nextSunday,
        userId,
        weekNumber: progress.current_week,
      };

      // For MVP, we'll just return the scheduled time
      // In production, this would integrate with a notification system
      return {
        success: true,
        scheduledFor: nextSunday,
      };
    } catch (error) {
      console.error('Error scheduling next assessment:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get assessment schedule for a user (next few weeks)
   */
  static async getAssessmentSchedule(userId: string, weeksAhead: number = 4): Promise<{
    currentWeek: number;
    upcomingAssessments: Array<{
      weekNumber: number;
      scheduledFor: Date;
      status: 'pending' | 'completed' | 'overdue';
    }>;
  }> {
    try {
      const { data: progress } = await supabase
        .from('plan_progress')
        .select('current_week, start_date, last_assessment_date')
        .eq('user_id', userId)
        .single();

      if (!progress) {
        return { currentWeek: 1, upcomingAssessments: [] };
      }

      const upcomingAssessments = [];
      const startDate = new Date(progress.start_date);

      for (let week = progress.current_week; week <= Math.min(progress.current_week + weeksAhead, 12); week++) {
        const weekStartDate = this.calculateWeekStartDate(progress.start_date, week);
        const assessmentDate = new Date(weekStartDate);
        assessmentDate.setDate(assessmentDate.getDate() + 6); // Sunday of that week
        assessmentDate.setHours(20, 0, 0, 0); // 8 PM

        let status: 'pending' | 'completed' | 'overdue' = 'pending';
        
        if (week === progress.current_week) {
          const daysSinceWeekStart = this.calculateDaysSinceWeekStart(weekStartDate);
          const hasAssessment = this.hasRecentAssessment(progress.last_assessment_date, weekStartDate);
          
          if (hasAssessment) {
            status = 'completed';
          } else if (daysSinceWeekStart > 7) {
            status = 'overdue';
          }
        }

        upcomingAssessments.push({
          weekNumber: week,
          scheduledFor: assessmentDate,
          status,
        });
      }

      return {
        currentWeek: progress.current_week,
        upcomingAssessments,
      };
    } catch (error) {
      console.error('Error getting assessment schedule:', error);
      return { currentWeek: 1, upcomingAssessments: [] };
    }
  }

  /**
   * Calculate week start date based on plan start and week number
   */
  private static calculateWeekStartDate(planStartDate: string, weekNumber: number): string {
    const startDate = new Date(planStartDate);
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(startDate.getDate() + ((weekNumber - 1) * 7));
    return weekStartDate.toISOString().split('T')[0];
  }

  /**
   * Calculate days since week started
   */
  private static calculateDaysSinceWeekStart(weekStartDate: string): number {
    const today = new Date();
    const startDate = new Date(weekStartDate);
    const diffTime = today.getTime() - startDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if user has recent assessment for current week
   */
  private static hasRecentAssessment(lastAssessmentDate: string | null, weekStartDate: string): boolean {
    if (!lastAssessmentDate) return false;
    
    const assessmentDate = new Date(lastAssessmentDate);
    const weekStart = new Date(weekStartDate);
    
    // Assessment is recent if it's after the week started
    return assessmentDate >= weekStart;
  }

  /**
   * Get next Sunday 8 PM
   */
  private static getNextSundayEvening(): Date {
    const now = new Date();
    const nextSunday = new Date(now);
    
    // Calculate days until next Sunday
    const daysUntilSunday = (7 - now.getDay()) % 7;
    
    // If it's already Sunday and past 8 PM, go to next Sunday
    if (now.getDay() === 0 && now.getHours() >= 20) {
      nextSunday.setDate(now.getDate() + 7);
    } else if (daysUntilSunday === 0) {
      // It's Sunday but before 8 PM
      nextSunday.setDate(now.getDate());
    } else {
      nextSunday.setDate(now.getDate() + daysUntilSunday);
    }
    
    nextSunday.setHours(20, 0, 0, 0); // 8 PM
    return nextSunday;
  }

  /**
   * Mark assessment as completed for scheduling purposes
   */
  static async markAssessmentCompleted(userId: string, weekNumber: number): Promise<void> {
    try {
      await supabase
        .from('plan_progress')
        .update({ 
          last_assessment_date: new Date().toISOString().split('T')[0] 
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error marking assessment as completed:', error);
    }
  }

  /**
   * Check if it's currently assessment time (Sunday evening)
   */
  static isAssessmentTime(): boolean {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const currentHour = now.getHours();
    
    // Sunday between 8 PM and 11 PM
    return dayOfWeek === 0 && currentHour >= 20 && currentHour < 23;
  }

  /**
   * Get time until next assessment
   */
  static getTimeUntilNextAssessment(): {
    days: number;
    hours: number;
    minutes: number;
    nextAssessmentDate: Date;
  } {
    const nextSunday = this.getNextSundayEvening();
    const now = new Date();
    const diffMs = nextSunday.getTime() - now.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      days,
      hours,
      minutes,
      nextAssessmentDate: nextSunday,
    };
  }

  /**
   * Check if a specific week is complete for a user
   */
  static async isWeekComplete(userId: string, week: number): Promise<boolean> {
    try {
      // Get user's plan start date
      const { data: progress, error } = await supabase
        .from('plan_progress')
        .select('start_date')
        .eq('user_id', userId)
        .single();

      if (error || !progress) {
        console.warn('Could not get plan progress for week completion check');
        return false;
      }

      // Calculate week date range
      const weekStart = this.getWeekStartDate(week, progress.start_date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // Check if we're past the week end date
      const now = new Date();
      const isWeekPast = now > weekEnd;

      // For MVP, consider a week complete if it's past the end date
      // In production, this could check for actual data completion
      return isWeekPast;

    } catch (error) {
      console.error('Error checking week completion:', error);
      return false;
    }
  }

  /**
   * Get week start date based on plan start date
   */
  static getWeekStartDate(week: number, startDate: string): Date {
    const planStart = new Date(startDate);
    const weekStart = new Date(planStart);
    weekStart.setDate(planStart.getDate() + (week - 1) * 7);
    return weekStart;
  }
}
