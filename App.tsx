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
import { LinearGradient } from 'expo-linear-gradient';
import { Badge, KPICard, CalAiTriRings, CalendarBar, BottomNavigation, WellbeingDashboard, CoachScreen, MoodCheckInModal, AppWithAuth } from './src/components';
import { useAppStore } from './src/stores/appStore';
import { useLifeScore } from './src/hooks/useAppSelectors';
import { useStepProgress, useStepTrackingStatus } from './src/stores/stepTrackingStore';
import { formatSleepDuration } from './src/utils';
import { theme } from './src/utils/theme';
import { calAiCard, calAiContainer, calAiText } from './src/utils/calAiStyles';
import { RewardsScreen } from './src/screens/RewardsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import StepTrackingManager from './src/components/StepTrackingManager';

function TriHabitApp() {
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'coach' | 'rewards' | 'settings'>('dashboard');
  const [wellbeingDashboardVisible, setWellbeingDashboardVisible] = useState(false);
  const [moodCheckInVisible, setMoodCheckInVisible] = useState(false);
  
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

  // Handle wellbeing dashboard navigation
  const handleLifeScorePress = () => {
    setWellbeingDashboardVisible(true);
  };

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
        <CoachScreen />
        <BottomNavigation 
          currentScreen={currentScreen} 
          onScreenChange={setCurrentScreen} 
        />
      </View>
    );
  }

  if (currentScreen === 'settings') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#7f1d1d" translucent={true} />
        <ProfileScreen />
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
              stepsPct={displayStepsPct}
              waterPct={currentState.waterOz / finalTargets.waterOz}
              sleepPct={currentState.sleepHr / finalTargets.sleepHr}
              moodPct={moodCheckInPct}
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
              onLifeScorePress={handleLifeScorePress}
            />
          </View>


          {/* Quick Actions - Only show when viewing today */}
          {!isViewingPastDate && (
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.hydrationButton]}
                onPress={() => addHydration(8)}
              >
                <Text style={styles.actionButtonText}>+8oz Water</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.sleepButton]}
                onPress={() => updateSleep(Math.min(currentState.sleepHr + 0.25, targets.sleepHr))}
              >
                <Text style={styles.actionButtonText}>+15m Sleep</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.stepsButton]}
                onPress={handleMoodCheckIn}
              >
                <Text style={styles.actionButtonText}>Mood</Text>
                <Text style={styles.actionButtonSubtext}>Check-in</Text>
              </TouchableOpacity>
            </View>
          )}

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
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    marginTop: 0,
    paddingHorizontal: theme.spacing.base,
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
    backgroundColor: theme.colors.fat, // Soft blue for hydration
  },
  sleepButton: {
    backgroundColor: '#E5D9FF', // Soft purple for sleep
  },
  stepsButton: {
    backgroundColor: theme.colors.protein, // Soft pink for mood
  },
  actionButtonText: {
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  actionButtonSubtext: {
    fontSize: theme.typography.xsmall,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  ringSection: {
    marginHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
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
