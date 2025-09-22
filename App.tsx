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
import { Badge, KPICard, TriRings, BottomNavigation, WellbeingDashboard } from './src/components';
import { useAppStore, useLifeScore, useNextBestAction } from './src/stores/appStore';
import { useStepProgress, useStepTrackingStatus } from './src/stores/stepTrackingStore';
import { formatSleepDuration } from './src/utils';
import { RewardsScreen } from './src/screens/RewardsScreen';
import StepTrackingManager from './src/components/StepTrackingManager';

function TriHabitApp() {
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'coach' | 'rewards' | 'settings'>('dashboard');
  const [wellbeingDashboardVisible, setWellbeingDashboardVisible] = useState(false);
  
  const {
    currentState,
    targets,
    addHydration,
    updateSleep,
    initializeTargets,
  } = useAppStore();

  // Use real step data from step tracking store
  const { steps: realSteps, target: stepTarget, percentage: realStepsPct } = useStepProgress();
  const { isAvailable: stepTrackingAvailable, isTracking } = useStepTrackingStatus();

  // Use real steps if available, fallback to mock data
  const displaySteps = stepTrackingAvailable ? realSteps : currentState.steps;
  const displayStepTarget = stepTrackingAvailable ? stepTarget : targets.steps;
  const displayStepsPct = stepTrackingAvailable ? realStepsPct : (currentState.steps / targets.steps);

  const { score: lifeScore, stepsPct: lifeScoreStepsPct, waterPct, sleepPct } = useLifeScore();
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

  // Initialize targets on app start
  useEffect(() => {
    initializeTargets();
  }, [initializeTargets]);

  // Handle different screens
  if (currentScreen === 'rewards') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#047857" translucent={true} />
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
        <StatusBar barStyle="light-content" backgroundColor="#047857" translucent={true} />
        <LinearGradient
          colors={['#047857', '#065f46', '#1f2937']}
          style={styles.gradient}
        >
          <View style={styles.placeholderScreen}>
            <Text style={styles.placeholderTitle}>AI Coach</Text>
            <Text style={styles.placeholderText}>Coming Soon</Text>
          </View>
        </LinearGradient>
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
        <StatusBar barStyle="light-content" backgroundColor="#047857" translucent={true} />
        <LinearGradient
          colors={['#047857', '#065f46', '#1f2937']}
          style={styles.gradient}
        >
          <View style={styles.placeholderScreen}>
            <Text style={styles.placeholderTitle}>Settings</Text>
            <Text style={styles.placeholderText}>Coming Soon</Text>
          </View>
        </LinearGradient>
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
      <StatusBar barStyle="light-content" backgroundColor="#047857" translucent={true} />
      <LinearGradient
        colors={['#047857', '#065f46', '#1f2937']} // emerald-700 to emerald-800 to gray-900
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.dateText}>{dateFmt}</Text>
              <Text style={styles.titleText}>Your Daily Health</Text>
            </View>
            <View style={styles.headerBadges}>
              <TouchableOpacity 
                style={styles.rewardsButton}
                onPress={() => setCurrentScreen('rewards')}
              >
                <Text style={styles.rewardsPointsText}>🏆 1,247 pts</Text>
              </TouchableOpacity>
            </View>
          </View>

                 {/* TriRings */}
                 <View style={styles.ringsContainer}>
                 <TriRings
                   stepsPct={displayStepsPct}
                   waterPct={waterPct}
                   sleepPct={sleepPct}
                   onLifeScorePress={handleLifeScorePress}
                 />
                 </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.hydrationButton]}
              onPress={() => addHydration(8)}
            >
              <Text style={styles.actionButtonText}>+8 oz water</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.sleepButton]}
              onPress={() => updateSleep(Math.min(currentState.sleepHr + 0.25, targets.sleepHr))}
            >
              <Text style={styles.actionButtonText}>+15m sleep</Text>
            </TouchableOpacity>
          </View>

          {/* KPI Cards */}
          <View style={styles.kpiContainer}>
            <KPICard
              title="Steps"
              value={`${displaySteps.toLocaleString()} / ${displayStepTarget.toLocaleString()}`}
              sub={stepTrackingAvailable 
                ? (isTracking ? "Live tracking active" : "Tracking available") 
                : "Auto from phone pedometer"
              }
              percent={displayStepsPct}
            />
            <KPICard
              title="Hydration"
              value={`${currentState.waterOz} / ${targets.waterOz} oz`}
              sub="Personalized by weight & climate"
              percent={waterPct}
            />
            <KPICard
              title="Sleep"
              value={`${formatSleepDuration(currentState.sleepHr)} / ${formatSleepDuration(targets.sleepHr)}`}
              sub="Chronotype & recovery‑aware"
              percent={sleepPct}
            />
          </View>

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
                  {Math.max(0, targets.waterOz - currentState.waterOz)} oz left
                </Text>
                <Text style={styles.diagnosticHint}>Aim for steady sips each hour</Text>
              </View>
              <View style={styles.diagnosticItem}>
                <Text style={styles.diagnosticLabel}>Sleep debt</Text>
                <Text style={styles.diagnosticValue}>
                  {formatSleepDuration(Math.max(0, targets.sleepHr - currentState.sleepHr))}
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
      </LinearGradient>
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
        }}
        onNavigateToModule={handleNavigateToModule}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 50, // Account for status bar
    paddingBottom: 100, // Account for bottom navigation
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardsButton: {
    paddingHorizontal: 16, // Increased from 12
    paddingVertical: 10, // Increased from 8
    borderRadius: 20, // Increased from 18
    backgroundColor: 'rgba(255, 215, 0, 0.2)', // Changed to golden background
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)', // Golden border
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(255, 215, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  rewardsPointsText: {
    fontSize: 14, // Increased from 12
    fontWeight: '700', // Increased from 600
    color: '#FFD700', // Golden color
  },
  ringsContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  hydrationButton: {
    backgroundColor: '#00ff88', // neon green for hydration
  },
  sleepButton: {
    backgroundColor: '#3b82f6', // blue for sleep
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  kpiContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    marginHorizontal: -4, // Negative margin to account for card spacing
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
      <TriHabitApp />
    </StepTrackingManager>
  );
}
