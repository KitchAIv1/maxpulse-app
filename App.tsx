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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge, KPICard, TriRings, BottomNavigation, WellbeingDashboard, CoachScreen, MoodCheckInModal, AppWithAuth } from './src/components';
import { useAppStore } from './src/stores/appStore';
import { useLifeScore, useNextBestAction } from './src/hooks/useAppSelectors';
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
    addHydration,
    updateSleep,
    addMoodCheckIn,
    initializeTargets,
  } = useAppStore();

  // Use real step data from step tracking store
  const { steps: realSteps, target: stepTarget, percentage: realStepsPct } = useStepProgress();
  const { isAvailable: stepTrackingAvailable, isTracking } = useStepTrackingStatus();

  // Use app store targets directly (already loaded with personalized targets)
  const finalTargets = targets;

  // Use real steps if available, fallback to current state
  const displaySteps = stepTrackingAvailable ? realSteps : currentState.steps;
  const displayStepTarget = stepTrackingAvailable ? stepTarget : finalTargets.steps;
  const displayStepsPct = stepTrackingAvailable ? realStepsPct : (currentState.steps / finalTargets.steps);

  const { score: lifeScore, stepsPct: lifeScoreStepsPct, waterPct, sleepPct, moodCheckInPct } = useLifeScore();
  const nextAction = useNextBestAction();

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
                 {/* Header - Simplified */}
                 <View style={styles.header}>
                   <View>
                     <Text style={styles.dateText}>{dateFmt}</Text>
                     <Text style={styles.titleText}>Your Daily Health</Text>
            <Text style={styles.successText}>
              ✅ Targets: {finalTargets.steps.toLocaleString()} steps, {finalTargets.waterOz} oz, {finalTargets.sleepHr}h
            </Text>
                   </View>
                 </View>

          {/* Glassmorphism Container for Rings and KPIs */}
          <View style={styles.glassContainer}>
            <View style={styles.kpiQuadrantLayout}>
             {/* Upper Left - Steps */}
             <View style={styles.upperLeft}>
               <Text style={styles.kpiTitle}>Steps</Text>
               <Text style={styles.kpiValue}>
                 {displaySteps >= displayStepTarget ? (
                   <>
                     <Text style={styles.achievedSteps}>{displaySteps.toLocaleString()}</Text>
                     <Text style={styles.goalIndicator}> ✅</Text>
                   </>
                 ) : (
                   `${displaySteps.toLocaleString()}/${displayStepTarget.toLocaleString()}`
                 )}
               </Text>
               <Text style={styles.kpiPercent}>
                 {displaySteps >= displayStepTarget ? (
                   <Text style={styles.exceededText}>Goal: {displayStepTarget.toLocaleString()}</Text>
                 ) : (
                   `${Math.round(displayStepsPct * 100)}%`
                 )}
               </Text>
             </View>

            {/* Upper Right - Rewards */}
            <View style={styles.upperRight}>
              <TouchableOpacity 
                style={styles.rewardsKPI}
                onPress={() => setCurrentScreen('rewards')}
              >
                <Text style={styles.rewardsPoints}>1,247 pts</Text>
                <Text style={styles.rewardsLabel}>Rewards</Text>
              </TouchableOpacity>
            </View>

             {/* Lower Left - Hydration */}
             <View style={styles.lowerLeft}>
               <Text style={styles.kpiTitle}>Hydration</Text>
                       <Text style={styles.kpiValue}>
                         {currentState.waterOz >= finalTargets.waterOz ? (
                           <>
                             <Text style={styles.achievedHydration}>{currentState.waterOz}</Text>
                             <Text style={styles.goalIndicator}> ✅</Text>
                           </>
                         ) : (
                           `${currentState.waterOz}/${finalTargets.waterOz} oz`
                         )}
                       </Text>
                       <Text style={styles.kpiPercent}>
                         {currentState.waterOz >= finalTargets.waterOz ? (
                           <Text style={styles.exceededText}>Goal: {finalTargets.waterOz} oz</Text>
                         ) : (
                           `${Math.round((currentState.waterOz / finalTargets.waterOz) * 100)}%`
                         )}
                       </Text>
             </View>

             {/* Lower Right - Sleep */}
             <View style={styles.lowerRight}>
               <Text style={styles.kpiTitle}>Sleep</Text>
                       <Text style={styles.kpiValue}>
                         {currentState.sleepHr >= finalTargets.sleepHr ? (
                           <>
                             <Text style={styles.achievedSleep}>{formatSleepDuration(currentState.sleepHr)}</Text>
                             <Text style={styles.goalIndicator}> ✅</Text>
                           </>
                         ) : (
                           `${formatSleepDuration(currentState.sleepHr)}/${formatSleepDuration(finalTargets.sleepHr)}`
                         )}
                       </Text>
                       <Text style={styles.kpiPercent}>
                         {currentState.sleepHr >= finalTargets.sleepHr ? (
                           <Text style={styles.exceededText}>Goal: {formatSleepDuration(finalTargets.sleepHr)}</Text>
                         ) : (
                           `${Math.round((currentState.sleepHr / finalTargets.sleepHr) * 100)}%`
                         )}
                       </Text>
             </View>

            {/* TriRings - Precisely centered based on outermost ring */}
            <View style={styles.ringsContainer}>
              <TriRings
                stepsPct={displayStepsPct}
                waterPct={currentState.waterOz / finalTargets.waterOz}
                sleepPct={currentState.sleepHr / finalTargets.sleepHr}
                onLifeScorePress={handleLifeScorePress}
              />
            </View>
          </View>
          </View>

          {/* Quick Actions - Below the quadrant layout */}
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
              <Text style={styles.actionButtonText}>Log Steps</Text>
            </TouchableOpacity>
          </View>

          {/* Mood Check-In Card */}
          <TouchableOpacity style={styles.moodCheckInCard} onPress={handleMoodCheckIn}>
            <View style={styles.moodCheckInContent}>
              <View style={styles.moodCheckInLeft}>
                <Text style={styles.moodCheckInTitle}>Emotional Wellness</Text>
                <Text style={styles.moodCheckInSubtitle}>
                  {moodCheckInFrequency.total_checkins}/{moodCheckInFrequency.target_checkins} check-ins this week
                </Text>
                <Text style={styles.moodCheckInProgress}>
                  {Math.round(moodCheckInPct * 100)}% complete
                </Text>
              </View>
              <View style={styles.moodCheckInRight}>
                <Text style={styles.moodCheckInEmoji}>🧠</Text>
                <Text style={styles.moodCheckInAction}>Tap to reflect</Text>
              </View>
            </View>
            <View style={styles.moodProgressBar}>
              <View 
                style={[styles.moodProgressFill, { width: `${moodCheckInPct * 100}%` }]} 
              />
            </View>
          </TouchableOpacity>

          {/* Next Best Action Card */}
          <View style={styles.coachCard}>
            <View style={styles.coachContent}>
              <View style={styles.coachText}>
                <Text style={styles.coachLabel}>Next Best Action</Text>
                <Text style={styles.coachTitle}>Focus: {nextAction.key}</Text>
                <Text style={styles.coachTip}>{nextAction.tip}</Text>
              </View>
              <TouchableOpacity style={styles.coachButton}>
                <Text style={styles.coachButtonText}>Do it now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.coachBadges}>
              <Badge label="Adaptive targets" />
              <Badge label="Recovery‑aware" />
              <Badge label="Micro‑habits" />
            </View>
          </View>

          {/* Diagnostics */}
          <View style={styles.diagnosticsCard}>
            <Text style={styles.diagnosticsTitle}>Diagnostics</Text>
            <View style={styles.diagnosticsGrid}>
              <View style={styles.diagnosticItem}>
                <Text style={styles.diagnosticLabel}>Hydration gap</Text>
                <Text style={styles.diagnosticValue}>
                  {Math.max(0, finalTargets.waterOz - currentState.waterOz)} oz left
                </Text>
                <Text style={styles.diagnosticHint}>Aim for steady sips each hour</Text>
              </View>
              <View style={styles.diagnosticItem}>
                <Text style={styles.diagnosticLabel}>Sleep debt</Text>
                <Text style={styles.diagnosticValue}>
                  {formatSleepDuration(Math.max(0, finalTargets.sleepHr - currentState.sleepHr))}
                </Text>
                <Text style={styles.diagnosticHint}>Wind‑down 30m earlier today</Text>
              </View>
              <View style={styles.diagnosticItem}>
                <Text style={styles.diagnosticLabel}>Step pace</Text>
                <Text style={styles.diagnosticValue}>
                  {Math.round(displayStepsPct * 100)}% of today
                </Text>
                <Text style={styles.diagnosticHint}>Add 1–2 short walks</Text>
              </View>
              <View style={styles.diagnosticItem}>
                <Text style={styles.diagnosticLabel}>Streaks</Text>
                <Text style={styles.diagnosticValue}>🔥 3‑day hydration</Text>
                <Text style={styles.diagnosticHint}>Keep it going!</Text>
              </View>
            </View>
          </View>

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
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  dateText: {
    fontSize: theme.typography.xsmall,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  titleText: {
    fontSize: theme.typography.large,
    fontWeight: theme.typography.weights.semibold,
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
  ringsContainer: {
    position: 'absolute',
    top: 40, // Centered in the 400px container (40px + 320px + 40px)
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1, // Ensure rings appear above quadrant background
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
  glassContainer: {
    // PRESERVED: Glassmorphism for ring container
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.borderRadius.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.base,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  kpiQuadrantLayout: {
    position: 'relative',
    height: 400, // Increased height for more vertical spacing
  },
   upperLeft: {
     position: 'absolute',
     top: 10, // Moved closer to edge now that progress bars are removed
     left: 10, // Moved closer to edge for better spacing
     width: 120, // Increased width for better readability
   },
   upperRight: {
     position: 'absolute',
     top: 10, // Moved closer to edge for symmetry
     right: 10, // Moved closer to edge for better spacing
     width: 120, // Increased width for better readability
     alignItems: 'flex-end',
   },
   lowerLeft: {
     position: 'absolute',
     bottom: 10, // Moved closer to edge now that progress bars are removed
     left: 10, // Moved closer to edge for better spacing
     width: 120, // Increased width for better readability
   },
   lowerRight: {
     position: 'absolute',
     bottom: 10, // Moved closer to edge for symmetry
     right: 10, // Moved closer to edge for better spacing
     width: 120, // Increased width for better readability
     alignItems: 'flex-end',
   },
  kpiTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginBottom: 2,
  },
   kpiPercent: {
     fontSize: 12,
     color: 'rgba(255, 255, 255, 0.9)',
     fontWeight: '500',
   },
  rewardsKPI: {
    alignItems: 'flex-end',
  },
  rewardsIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  rewardsPoints: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '700',
    marginBottom: 2,
  },
   rewardsLabel: {
     fontSize: 12,
     color: 'rgba(255, 255, 255, 0.8)',
     fontWeight: '500',
   },
   achievedSteps: {
     color: '#ffffff', // White to match Steps ring color
     fontWeight: '700',
   },
   achievedHydration: {
     color: '#00ff88', // Neon green to match Hydration ring color
     fontWeight: '700',
   },
   achievedSleep: {
     color: '#3b82f6', // Blue to match Sleep ring color
     fontWeight: '700',
   },
   goalIndicator: {
     fontSize: 14,
   },
   exceededText: {
     fontSize: 10,
     color: 'rgba(255, 255, 255, 0.8)',
     fontWeight: '500',
   },
  moodCheckInCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.15)', // purple tint
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginBottom: 20,
  },
  moodCheckInContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodCheckInLeft: {
    flex: 1,
  },
  moodCheckInTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  moodCheckInSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  moodCheckInProgress: {
    fontSize: 12,
    color: 'rgba(139, 92, 246, 0.9)',
    fontWeight: '500',
  },
  moodCheckInRight: {
    alignItems: 'center',
  },
  moodCheckInEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodCheckInAction: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  moodProgressBar: {
    height: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  moodProgressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 2,
  },
  coachCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  coachContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  coachText: {
    flex: 1,
  },
  coachLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  coachTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  coachTip: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  coachButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  coachButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  coachBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  diagnosticsCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  diagnosticsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  diagnosticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  diagnosticItem: {
    width: '47%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  diagnosticLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  diagnosticValue: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  diagnosticHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
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
