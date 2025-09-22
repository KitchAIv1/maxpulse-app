// Wellbeing Dashboard Modal
// Comprehensive Life Score breakdown and insights modal

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WellbeingDashboardProps, DailyInsight, LifeScoreTrend } from '../../types/wellbeing';
import { BatteryGauge } from './BatteryGauge';
import { ContributionBar } from './ContributionBar';
import { DailyInsights } from './DailyInsights';
import { TrendsChart } from './TrendsChart';

export const WellbeingDashboard: React.FC<WellbeingDashboardProps> = ({
  visible,
  onClose,
  currentScore,
  breakdown,
  onNavigateToModule,
}) => {
  const [trendsPeriod, setTrendsPeriod] = useState<'7d' | '30d'>('7d');

  // Generate mock daily insight based on current data
  const generateDailyInsight = (): DailyInsight => {
    const { steps, hydration, sleep } = breakdown;
    
    // Determine which metric needs most attention
    const metrics = [
      { name: 'steps', value: steps, label: 'step count' },
      { name: 'hydration', value: hydration, label: 'hydration' },
      { name: 'sleep', value: sleep, label: 'sleep' },
    ].sort((a, b) => a.value - b.value);

    const weakest = metrics[0];
    const strongest = metrics[2];

    let mood: DailyInsight['mood'] = 'neutral';
    let summary = '';
    let reason = '';
    let suggestion = '';

    if (currentScore >= 80) {
      mood = 'positive';
      summary = `Excellent work! Your Life Score of ${Math.round(currentScore)}% shows you're maintaining great health habits.`;
      reason = `Your ${strongest.label} is performing exceptionally well at ${Math.round(strongest.value * 100)}%, keeping your overall wellness high.`;
      suggestion = `Keep up the momentum! Consider adding a 5-minute meditation to boost your mental wellness even further.`;
    } else if (currentScore >= 60) {
      mood = 'neutral';
      summary = `You're doing well with a ${Math.round(currentScore)}% Life Score. There's room to optimize your daily routine.`;
      reason = `While your ${strongest.label} is strong at ${Math.round(strongest.value * 100)}%, your ${weakest.label} at ${Math.round(weakest.value * 100)}% is holding back your score.`;
      suggestion = `Focus on improving your ${weakest.label} today. Small consistent improvements make a big difference!`;
    } else {
      mood = 'needs-improvement';
      summary = `Your ${Math.round(currentScore)}% Life Score indicates several areas need attention. Don't worry - small changes can make a big impact!`;
      reason = `Your ${weakest.label} is at ${Math.round(weakest.value * 100)}% of target, significantly impacting your overall wellness score.`;
      suggestion = `Start with one simple action: ${weakest.name === 'steps' ? 'take a 10-minute walk' : weakest.name === 'hydration' ? 'drink a large glass of water' : 'plan for 30 minutes more sleep tonight'}.`;
    }

    return { summary, reason, suggestion, mood };
  };

  // Generate mock trends data
  const generateTrendsData = (period: '7d' | '30d'): LifeScoreTrend[] => {
    const days = period === '7d' ? 7 : 30;
    const data: LifeScoreTrend[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic score variations
      const baseScore = currentScore;
      const variation = (Math.random() - 0.5) * 30; // ±15 points variation
      const score = Math.max(20, Math.min(100, baseScore + variation));
      
      data.push({
        date: date.toISOString().split('T')[0],
        score,
        breakdown: {
          steps: Math.max(0.2, Math.min(1.2, breakdown.steps + (Math.random() - 0.5) * 0.4)),
          hydration: Math.max(0.2, Math.min(1.2, breakdown.hydration + (Math.random() - 0.5) * 0.4)),
          sleep: Math.max(0.2, Math.min(1.2, breakdown.sleep + (Math.random() - 0.5) * 0.4)),
        },
      });
    }
    
    return data;
  };

  const dailyInsight = generateDailyInsight();
  const trendsData = generateTrendsData(trendsPeriod);

  const handleBoostAction = () => {
    // Find the metric that needs most attention and navigate to it
    const { steps, hydration, sleep } = breakdown;
    const metrics = [
      { name: 'steps' as const, value: steps },
      { name: 'hydration' as const, value: hydration },
      { name: 'sleep' as const, value: sleep },
    ].sort((a, b) => a.value - b.value);

    const weakestMetric = metrics[0].name;
    onNavigateToModule?.(weakestMetric);
    onClose();
  };

  const handleAskCoach = () => {
    // TODO: Implement coach integration
    console.log('Opening AI Coach with Life Score context...');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#047857', '#065f46', '#1f2937']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Wellbeing Dashboard</Text>
              <Text style={styles.headerSubtitle}>Your complete health overview</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Breakdown View */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Life Score Breakdown</Text>
              
              {/* Battery Gauge */}
              <View style={styles.gaugeContainer}>
                <BatteryGauge score={currentScore} size={180} animated />
              </View>

              {/* Contribution Bars */}
              <View style={styles.contributionsContainer}>
                <ContributionBar
                  label="Steps"
                  percentage={breakdown.steps}
                  color="#3B82F6"
                  onPress={() => onNavigateToModule?.('steps')}
                />
                <ContributionBar
                  label="Hydration"
                  percentage={breakdown.hydration}
                  color="#06B6D4"
                  onPress={() => onNavigateToModule?.('hydration')}
                />
                <ContributionBar
                  label="Sleep"
                  percentage={breakdown.sleep}
                  color="#8B5CF6"
                  onPress={() => onNavigateToModule?.('sleep')}
                />
                {/* Future metrics - shown as coming soon */}
                <ContributionBar
                  label="Mood"
                  percentage={0.75}
                  color="#F59E0B"
                />
                <ContributionBar
                  label="AI Engagement"
                  percentage={0.6}
                  color="#10B981"
                />
              </View>
            </View>

            {/* 2. Daily Insights */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Daily Insights</Text>
              <DailyInsights 
                insight={dailyInsight}
                onBoostAction={handleBoostAction}
              />
            </View>

            {/* 3. Trends & History */}
            <View style={styles.section}>
              <TrendsChart
                data={trendsData}
                period={trendsPeriod}
                onPeriodChange={setTrendsPeriod}
              />
            </View>

            {/* 4. Coach Integration */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Coach</Text>
              <View style={styles.coachContainer}>
                <View style={styles.coachContent}>
                  <Text style={styles.coachIcon}>🤖</Text>
                  <View style={styles.coachText}>
                    <Text style={styles.coachTitle}>Get Personalized Advice</Text>
                    <Text style={styles.coachDescription}>
                      Your AI Coach can provide deeper insights about your Life Score and create a personalized plan to help you improve.
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.coachButton}
                  onPress={handleAskCoach}
                  activeOpacity={0.8}
                >
                  <Text style={styles.coachButtonText}>Ask Coach About My Score</Text>
                  <Text style={styles.coachButtonIcon}>💬</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 5. Gamification Hooks */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Achievements & Milestones</Text>
              <View style={styles.gamificationContainer}>
                {/* Milestones */}
                <View style={styles.milestonesGrid}>
                  <View style={[styles.milestone, currentScore >= 50 && styles.milestoneAchieved]}>
                    <Text style={styles.milestoneIcon}>🌱</Text>
                    <Text style={styles.milestoneText}>Getting Started</Text>
                    <Text style={styles.milestoneThreshold}>50%+</Text>
                  </View>
                  <View style={[styles.milestone, currentScore >= 70 && styles.milestoneAchieved]}>
                    <Text style={styles.milestoneIcon}>💪</Text>
                    <Text style={styles.milestoneText}>Good Progress</Text>
                    <Text style={styles.milestoneThreshold}>70%+</Text>
                  </View>
                  <View style={[styles.milestone, currentScore >= 90 && styles.milestoneAchieved]}>
                    <Text style={styles.milestoneIcon}>⭐</Text>
                    <Text style={styles.milestoneText}>Excellent</Text>
                    <Text style={styles.milestoneThreshold}>90%+</Text>
                  </View>
                  <View style={styles.milestone}>
                    <Text style={styles.milestoneIcon}>🏆</Text>
                    <Text style={styles.milestoneText}>Perfect Day</Text>
                    <Text style={styles.milestoneThreshold}>100%</Text>
                  </View>
                </View>

                {/* Level Progress */}
                <View style={styles.levelContainer}>
                  <Text style={styles.levelTitle}>Level Progress</Text>
                  <View style={styles.levelProgress}>
                    <Text style={styles.levelText}>Level 3 • Health Enthusiast</Text>
                    <View style={styles.levelBar}>
                      <View style={[styles.levelFill, { width: '65%' }]} />
                    </View>
                    <Text style={styles.levelPoints}>650 / 1000 points to Level 4</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  contributionsContainer: {
    // Contribution bars will stack vertically
  },
  coachContainer: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  coachContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  coachIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  coachText: {
    flex: 1,
  },
  coachTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  coachDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  coachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#10B981',
    borderRadius: 12,
  },
  coachButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
  coachButtonIcon: {
    fontSize: 16,
  },
  gamificationContainer: {
    // Gamification content
  },
  milestonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  milestone: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  milestoneAchieved: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  milestoneIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 2,
  },
  milestoneThreshold: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  levelContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  levelProgress: {
    // Level progress content
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  levelBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  levelFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  levelPoints: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  bottomSpacer: {
    height: 40,
  },
});
