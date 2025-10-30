// TriHabit - Unified Health Habits App
// React Native implementation based on PRD specifications

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge, KPICard, CalAiTriRings, CalendarBar, BottomNavigation, WellbeingDashboard, CoachScreen, MoodCheckInModal, AppWithAuth } from './src/components';
import { WeeklyAssessmentModal } from './src/components/assessment/WeeklyAssessmentModal';
import { AssessmentTestButton } from './src/components/testing/AssessmentTestButton';
import { AssessmentValidationButton } from './src/components/testing/AssessmentValidationButton';
import { useAppStore } from './src/stores/appStore';
import { useLifeScore } from './src/hooks/useAppSelectors';
import { useStepProgress, useStepTrackingStatus } from './src/stores/stepTrackingStore';
import { useWeeklyAssessment } from './src/hooks/assessment/useWeeklyAssessment';
import { useProgressionDecision } from './src/hooks/assessment/useProgressionDecision';
import { useRealTimeAssessment } from './src/hooks/assessment/useRealTimeAssessment';
import { formatSleepDuration } from './src/utils';
import { theme } from './src/utils/theme';
import { calAiCard, calAiContainer, calAiText } from './src/utils/calAiStyles';
import { RewardsScreen } from './src/screens/RewardsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import StepTrackingManager from './src/components/StepTrackingManager';
import FirebaseService from './src/services/FirebaseService';
import { AssessmentTrigger } from './src/services/scheduling/AssessmentTrigger';
import V2EngineConnector from './src/services/V2EngineConnector';

function TriHabitApp() {
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'coach' | 'rewards' | 'settings'>('dashboard');
  const [wellbeingDashboardVisible, setWellbeingDashboardVisible] = useState(false);
  const [moodCheckInVisible, setMoodCheckInVisible] = useState(false);
  
  // Firebase initialization
  const firebase = FirebaseService.getInstance();
  
  // Weekly Assessment Integration
  const { user } = useAppStore();
  const userId = user?.id;
  
  // Weekly assessment hooks
  const {
    assessmentData,
    isAssessmentReady,
    isLoading: assessmentLoading,
    error: assessmentError,
    triggerAssessment,
    dismissAssessment,
  } = useWeeklyAssessment(userId);

  // Real-time assessment hook (fetches actual data)
  const {
    assessmentData: realAssessmentData,
    isLoading: realDataLoading,
    error: realDataError,
    refreshAssessment,
    hasData: hasRealData,
  } = useRealTimeAssessment(userId);

  const {
    executeDecision,
    isExecuting,
    error: decisionError,
  } = useProgressionDecision();

  // Weekly assessment modal state
  const [weeklyAssessmentVisible, setWeeklyAssessmentVisible] = useState(false);
  
  // Track screen changes
  useEffect(() => {
    const screenName = currentScreen === 'dashboard' ? 'Dashboard' : 
                       currentScreen === 'coach' ? 'Coach' : 
                       currentScreen === 'rewards' ? 'Rewards' : 'Settings';
    firebase.logScreenView(screenName, screenName);
  }, [currentScreen, firebase]);

  // Check for weekly assessment trigger on app launch and screen changes
  useEffect(() => {
    const checkAssessmentTrigger = async () => {
      if (!userId) return;
      
      try {
        console.log('🔍 Checking for weekly assessment trigger...');
        await AssessmentTrigger.triggerAssessmentFlow(userId);
      } catch (error) {
        console.warn('⚠️ Error checking assessment trigger:', error);
      }
    };

    // Check on app launch and when returning to dashboard
    if (currentScreen === 'dashboard') {
      checkAssessmentTrigger();
    }
  }, [currentScreen, userId]);

  // Show assessment modal when assessment is ready
  useEffect(() => {
    if (isAssessmentReady && assessmentData && !weeklyAssessmentVisible) {
      console.log('📊 Weekly assessment ready, showing modal');
      setWeeklyAssessmentVisible(true);
    }
  }, [isAssessmentReady, assessmentData, weeklyAssessmentVisible]);
  
  const {
    currentState,
    targets,
    moodCheckInFrequency,
    selectedDate,
    isViewingPastDate,
    addHydration,
    updateSleep,
    addMoodCheckIn,
    setSelectedDate,
    initializeTargets,
  } = useAppStore();

  // Always use database values - no fallbacks or mock data
  // Step tracking service will update database when pedometer is available (dev/prod build)
  // In Expo Go, steps will show actual database value (0 until manually logged)
  const finalTargets = targets;
  
  const displaySteps = currentState.steps; // Always from database
  const displayStepTarget = finalTargets.steps;
  const displayStepsPct = finalTargets.steps > 0 ? (currentState.steps / finalTargets.steps) : 0;

  const { score: lifeScore, stepsPct: lifeScoreStepsPct, waterPct, sleepPct, moodCheckInPct } = useLifeScore();

  // Log when steps change to track UI updates
  useEffect(() => {
    console.log(`🎨 App.tsx render - displaySteps: ${displaySteps}`);
  }, [displaySteps]);

  const handleWellbeingDashboardClose = () => {
    setWellbeingDashboardVisible(false);
  };

  const handleNavigateToModule = (module: 'steps' | 'hydration' | 'sleep' | 'mood') => {
    // For now, just close the dashboard and show a message
    // In the future, this could navigate to specific module screens
    console.log(`Navigating to ${module} module...`);
    setWellbeingDashboardVisible(false);
  };

  const handleMoodCheckIn = () => {
    setMoodCheckInVisible(true);
  };

  const handleMoodCheckInSubmit = (checkIn: any) => {
    addMoodCheckIn(checkIn);
    setMoodCheckInVisible(false);
  };

  // Handle date selection from calendar
  const handleDateSelect = async (date: string) => {
    await setSelectedDate(date);
  };

  // Mock assessment data for testing
  const mockAssessmentData = {
    performance: {
      week: 1,
      phase: 1,
      startDate: '2025-01-20',
      endDate: '2025-01-26',
      averageAchievement: 75,
      consistencyDays: 5,
      totalTrackingDays: 7,
      strongestPillar: 'water' as const,
      weakestPillar: 'steps' as const,
      overallGrade: 'progress' as const,
      pillarBreakdown: [
        { pillar: 'steps' as const, averageAchievement: 65, consistentDays: 4, trend: 'improving' as const, dailyValues: [60, 65, 70, 75, 80, 50, 60] },
        { pillar: 'water' as const, averageAchievement: 85, consistentDays: 6, trend: 'stable' as const, dailyValues: [80, 85, 90, 85, 80, 85, 90] },
        { pillar: 'sleep' as const, averageAchievement: 70, consistentDays: 5, trend: 'improving' as const, dailyValues: [65, 70, 75, 70, 65, 75, 80] },
        { pillar: 'mood' as const, averageAchievement: 80, consistentDays: 6, trend: 'stable' as const, dailyValues: [75, 80, 85, 80, 75, 85, 80] },
      ],
    },
    consistency: {
      totalDays: 7,
      consistentDays: 5,
      consistencyRate: 71,
      longestStreak: 4,
      currentStreak: 3,
      weekendConsistency: 75,
      timeOfDayPatterns: [],
    },
    assessment: {
      recommendation: 'extend' as const,
      confidence: 75,
      reasoning: [
        'You achieved 75% average performance this week',
        'Consistency was good with 5 out of 7 days meeting targets',
        'Steps need more attention to reach the 80% mastery threshold',
        'Water intake is excellent - keep it up!',
      ],
      modifications: {
        focusArea: 'steps' as const,
        adjustmentReason: 'Focus on increasing daily steps to reach mastery level',
        steps: 8000,
      },
      riskFactors: ['Steps below 80% threshold'],
      opportunities: ['Strong hydration habits', 'Improving sleep patterns'],
    },
    currentTargets: {
      steps: 10000,
      waterOz: 95,
      sleepHr: 7,
      week: 1,
      phase: 1,
    },
  };

  // Weekly Assessment Handlers
  const handleWeeklyAssessmentClose = () => {
    setWeeklyAssessmentVisible(false);
    if (assessmentData) {
      dismissAssessment();
    }
  };

  const handleProgressionDecision = async (decisionObj: any) => {
    console.log('🔍 handleProgressionDecision called with:', decisionObj);
    console.log('🔍 Current userId:', userId);
    
    if (!userId) {
      console.error('❌ No userId available');
      return;
    }

    // Get the actual assessment data (prioritize real data)
    const currentAssessmentData = realAssessmentData || assessmentData || mockAssessmentData;
    
    if (!currentAssessmentData) {
      console.error('❌ No assessment data available');
      return;
    }

    try {
      // Set the userId on the decision object
      decisionObj.userId = userId;
      
      console.log('🎯 User made progression decision:', decisionObj);
      console.log('📊 Assessment data:', {
        week: currentAssessmentData.performance.week,
        phase: currentAssessmentData.performance.phase,
        recommendation: currentAssessmentData.assessment.recommendation
      });
      
      await executeDecision(decisionObj, currentAssessmentData);
      
      console.log('✅ Progression decision executed successfully');
      
      // Close modal after successful execution
      setWeeklyAssessmentVisible(false);
      
      // Refresh the assessment data to show updated week/targets
      console.log('🔄 Refreshing assessment to show new week...');
      if (hasRealData) {
        await refreshAssessment();
      }
      
      // Force reload targets from V2 Engine and reset to TODAY
      console.log('🔄 Reloading targets from V2 Engine...');
      const today = new Date().toISOString().split('T')[0];
      
      // Reload targets from V2 Engine
      const newTargets = await V2EngineConnector.getCurrentWeekTargets(userId);
      console.log('🔍 V2 Engine returned:', newTargets);
      
      if (newTargets) {
        // V2EngineConnector returns { steps, waterOz, sleepHr, ... } directly
        await useAppStore.getState().initializeTargets({
          steps: newTargets.steps,
          waterOz: newTargets.waterOz,
          sleepHr: newTargets.sleepHr,
        });
        console.log('✅ Targets updated in store:', {
          steps: newTargets.steps,
          waterOz: newTargets.waterOz,
          sleepHr: newTargets.sleepHr,
        });
      }
      
      // Reset to today's date to show current data
      console.log('📅 Resetting to today:', today);
      await useAppStore.getState().setSelectedDate(today);
      
    } catch (error) {
      console.error('❌ Error executing progression decision:', error);
      // Keep modal open on error so user can try again
    }
  };

  // V2 Engine will initialize targets automatically via AppWithAuth
  // No need to call initializeTargets() here as it would override V2 Engine

  // Handle different screens
  if (currentScreen === 'rewards') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#7f1d1d" translucent={true} />
        <RewardsScreen onBack={() => setCurrentScreen('dashboard')} />
        <BottomNavigation 
          currentScreen={currentScreen} 
          onScreenChange={setCurrentScreen} 
        />
      </View>
    );
  }

  if (currentScreen === 'coach') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#7f1d1d" translucent={true} />
        <CoachScreen onClose={() => setCurrentScreen('dashboard')} />
      </View>
    );
  }

  if (currentScreen === 'settings') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#7f1d1d" translucent={true} />
        <ProfileScreen onBack={() => setCurrentScreen('dashboard')} />
        <BottomNavigation 
          currentScreen={currentScreen} 
          onScreenChange={setCurrentScreen} 
        />
      </View>
    );
  }

  // Format current date
  const now = new Date();
  const dateFmt = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} translucent={true} />
      <View style={styles.gradient}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
                 {/* Header - With Rewards */}
                 <View style={styles.header}>
                   <View style={styles.headerLeft}>
                     <Image 
                       source={require('./src/assets/images/ax.png')} 
                       style={styles.logoImage}
                       resizeMode="contain"
                     />
                     <Text style={styles.titleText}>MaxPulse</Text>
                   </View>
                   
                   {/* Rewards - Upper Right */}
                   <TouchableOpacity 
                     style={styles.headerRewards}
                     onPress={() => setCurrentScreen('rewards')}
                   >
                     <Text style={styles.headerRewardsPoints}>1,247 pts</Text>
                     <Text style={styles.headerRewardsLabel}>Rewards</Text>
                   </TouchableOpacity>
                 </View>

          {/* Calendar Bar */}
          <CalendarBar 
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            disabled={false}
          />

          {/* Cal AI Ring Cards */}
          <View style={styles.ringSection}>
            <CalAiTriRings
              stepsPct={Math.min(1, displayStepsPct)}
              waterPct={Math.min(1, currentState.waterOz / finalTargets.waterOz)}
              sleepPct={Math.min(1, currentState.sleepHr / finalTargets.sleepHr)}
              moodPct={Math.min(1, moodCheckInPct)}
              stepsData={{
                current: displaySteps,
                target: displayStepTarget,
              }}
              waterData={{
                current: currentState.waterOz,
                target: finalTargets.waterOz,
              }}
              sleepData={{
                current: currentState.sleepHr,
                target: finalTargets.sleepHr,
              }}
              moodData={{
                current: moodCheckInFrequency.total_checkins,
                target: moodCheckInFrequency.target_checkins,
              }}
            />
          </View>

          {/* Quick Actions - Always visible, disabled when viewing past dates */}
          <View style={[styles.quickActions, isViewingPastDate && styles.quickActionsDisabled]}>
            <TouchableOpacity
              style={[styles.actionButton, styles.hydrationButton]}
              onPress={() => addHydration(8)}
              disabled={isViewingPastDate}
            >
              <Text style={styles.actionButtonText}>+8oz Water</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.sleepButton]}
              onPress={() => updateSleep(Math.min(currentState.sleepHr + 0.25, targets.sleepHr))}
              disabled={isViewingPastDate}
            >
              <Text style={styles.actionButtonText}>+15m Sleep</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.stepsButton]}
              onPress={handleMoodCheckIn}
              disabled={isViewingPastDate}
            >
              <Text style={styles.actionButtonText}>Mood</Text>
              <Text style={styles.actionButtonSubtext}>Check-in</Text>
            </TouchableOpacity>
          </View>

          {/* Assessment Buttons Container - Side by side, always visible, disabled when viewing past dates */}
          <View style={[styles.assessmentButtonsContainer, isViewingPastDate && styles.assessmentButtonsDisabled]}>
            <TouchableOpacity
              style={[styles.assessmentButton, styles.lifeScoreButton]}
              onPress={() => setWellbeingDashboardVisible(true)}
              disabled={isViewingPastDate}
            >
              <Icon name="analytics-outline" size={20} color="white" />
              <Text style={styles.assessmentButtonText}>View Life Score</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.assessmentButton, styles.weeklyAssessmentButton]}
              onPress={() => {
                if (!hasRealData && !realDataLoading) {
                  refreshAssessment();
                }
                setWeeklyAssessmentVisible(true);
              }}
              disabled={realDataLoading || isViewingPastDate}
            >
              <Icon 
                name={realDataLoading ? "hourglass" : hasRealData ? "calendar" : "refresh"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.assessmentButtonText}>
                {realDataLoading ? 'Loading...' : 'Assessment'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Status indicator */}
          {!isViewingPastDate && (
            <>
              {hasRealData ? (
                <Text style={styles.assessmentStatusText}>
                  Week {realAssessmentData?.performance.week} Assessment Available
                </Text>
              ) : (
                <Text style={styles.assessmentStatusText}>
                  Next Assessment: Sunday
                </Text>
              )}
            </>
          )}

          {/* Assessment Testing Buttons (DEV ONLY) - Uncomment to enable */}
          {/* {__DEV__ && userId && (
            <>
              <AssessmentTestButton userId={userId} />
              <AssessmentValidationButton userId={userId} />
            </>
          )} */}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
      <BottomNavigation 
        currentScreen={currentScreen} 
        onScreenChange={setCurrentScreen} 
      />

      {/* Wellbeing Dashboard Modal */}
      <WellbeingDashboard
        visible={wellbeingDashboardVisible}
        onClose={handleWellbeingDashboardClose}
        currentScore={lifeScore}
             breakdown={{
               steps: lifeScoreStepsPct,
               hydration: waterPct,
               sleep: sleepPct,
               mood: moodCheckInPct,
             }}
        onNavigateToModule={handleNavigateToModule}
      />

      {/* Mood Check-In Modal */}
      <MoodCheckInModal
        visible={moodCheckInVisible}
        onClose={() => setMoodCheckInVisible(false)}
        onSubmit={handleMoodCheckInSubmit}
        healthContext={{
          sleepHours: currentState.sleepHr,
          hydrationOz: currentState.waterOz,
          stepsCount: displaySteps,
        }}
      />

      {/* Weekly Assessment Modal */}
      <WeeklyAssessmentModal
        visible={weeklyAssessmentVisible}
        onClose={handleWeeklyAssessmentClose}
        assessmentData={realAssessmentData || assessmentData || mockAssessmentData}
        onDecision={handleProgressionDecision}
        isExecuting={isExecuting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  gradient: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: 50,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 34,
    height: 34,
    marginRight: theme.spacing.sm,
  },
  headerRewards: {
    alignItems: 'center',
    paddingLeft: theme.spacing.sm,
  },
  headerRewardsPoints: {
    fontSize: theme.typography.small,
    color: '#FF0000', // Changed from gold (#FFD700) to red
    fontWeight: theme.typography.weights.bold,
    marginBottom: 2,
  },
  headerRewardsLabel: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  dateText: {
    fontSize: theme.typography.xsmall,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  titleText: {
    fontSize: 30.5, // 29px + 1.5 = 30.5px
    fontWeight: '500', // Medium: 500
    color: theme.colors.textPrimary,
  },
  warningText: {
    fontSize: theme.typography.tiny,
    color: theme.colors.warning,
    marginTop: 2,
  },
  successText: {
    fontSize: theme.typography.tiny,
    color: theme.colors.success,
    marginTop: 2,
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardsButton: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.cardBackground,
    ...theme.shadows.subtle,
  },
  rewardsPointsText: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.warning,
  },
  assessmentStatusText: {
    fontSize: 9, // Same as calendar day labels
    fontWeight: theme.typography.weights.light, // Same as calendar day labels
    color: '#9E9E9E', // Same as calendar day labels
    textAlign: 'center',
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    marginTop: 0,
    paddingHorizontal: theme.spacing.base,
  },
  quickActionsDisabled: {
    opacity: 0.5,
  },
  actionButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    backgroundColor: theme.colors.cardBackground,
    ...theme.shadows.subtle,
  },
  hydrationButton: {
    backgroundColor: '#1E88E5', // Solid metallic blue (matches ring)
  },
  sleepButton: {
    backgroundColor: '#8E24AA', // Solid metallic purple (matches ring)
  },
  stepsButton: {
    backgroundColor: '#E91E63', // Solid metallic pink (matches ring)
  },
  actionButtonText: {
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.semibold,
    color: '#FFFFFF', // White text for better contrast on metallic backgrounds
    textAlign: 'center',
  },
  actionButtonSubtext: {
    fontSize: theme.typography.xsmall,
    fontWeight: theme.typography.weights.regular,
    color: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white for subtext
    textAlign: 'center',
    marginTop: 2,
  },
  ringSection: {
    marginHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  assessmentButtonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.base,
  },
  assessmentButtonsDisabled: {
    opacity: 0.5,
  },
  assessmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    minHeight: 48,
    ...theme.shadows.medium,
  },
  lifeScoreButton: {
    backgroundColor: '#43A047', // Green for Life Score
  },
  weeklyAssessmentButton: {
    backgroundColor: theme.colors.primary, // Red for Assessment
  },
  assessmentButtonText: {
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.semibold,
    color: 'white',
  },
  bottomSpacer: {
    height: 24,
  },
  placeholderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 50, // Account for status bar
    paddingBottom: 100, // Account for bottom navigation
  },
  placeholderTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});

export default function App() {
  return (
    <StepTrackingManager>
      <AppWithAuth>
        <TriHabitApp />
      </AppWithAuth>
    </StepTrackingManager>
  );
}
