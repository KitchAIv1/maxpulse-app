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
import { Badge, KPICard, TriRings } from './src/components';
import { useAppStore, useLifeScore, useNextBestAction } from './src/stores/appStore';
import { useStepProgress, useStepTrackingStatus } from './src/stores/stepTrackingStore';
import { formatSleepDuration } from './src/utils';
import { RewardsScreen } from './src/screens/RewardsScreen';
import StepTrackingManager from './src/components/StepTrackingManager';

function TriHabitApp() {
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'rewards'>('dashboard');
  
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

  const { score: lifeScore, waterPct, sleepPct } = useLifeScore();
  const nextAction = useNextBestAction();

  // Initialize targets on app start
  useEffect(() => {
    initializeTargets();
  }, [initializeTargets]);

  // Show Rewards screen if selected
  if (currentScreen === 'rewards') {
    return (
      <RewardsScreen onBack={() => setCurrentScreen('dashboard')} />
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
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
              <Badge label="AI Coach" />
              <Badge label="Pedometer" />
              <TouchableOpacity 
                style={styles.rewardsButton}
                onPress={() => setCurrentScreen('rewards')}
              >
                <Text style={styles.rewardsButtonText}>🏆</Text>
              </TouchableOpacity>
              <View style={styles.avatar} />
            </View>
          </View>

          {/* TriRings */}
          <View style={styles.ringsContainer}>
          <TriRings 
            stepsPct={displayStepsPct} 
            waterPct={waterPct} 
            sleepPct={sleepPct} 
          />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => addHydration(8)}
            >
              <Text style={styles.actionButtonText}>+8 oz water</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => updateSleep(Math.min(currentState.sleepHr + 0.25, targets.sleepHr))}
            >
              <Text style={styles.actionButtonText}>+15m sleep</Text>
            </TouchableOpacity>
          </View>

          {/* KPI Cards */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.kpiScroll}
            contentContainerStyle={styles.kpiContainer}
          >
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
              onAdd={() => addHydration(12)}
              addLabel="+12 oz"
            />
            <KPICard
              title="Sleep"
              value={`${formatSleepDuration(currentState.sleepHr)} / ${formatSleepDuration(targets.sleepHr)}`}
              sub="Chronotype & recovery‑aware"
              percent={sleepPct}
              onAdd={() => updateSleep(Math.min(currentState.sleepHr + 0.5, targets.sleepHr))}
              addLabel="+30 min"
            />
          </ScrollView>

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
    </SafeAreaView>
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
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardsButtonText: {
    fontSize: 18,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  kpiScroll: {
    marginBottom: 20,
  },
  kpiContainer: {
    paddingRight: 16,
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
});

export default function App() {
  return (
    <StepTrackingManager>
      <TriHabitApp />
    </StepTrackingManager>
  );
}
