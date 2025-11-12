// Streak Info Modal Component
// Explains how streak calculations work
// Reusable component for streak education

import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';

const { height: screenHeight } = Dimensions.get('window');

interface StreakInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export const StreakInfoModal: React.FC<StreakInfoModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" />
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Icon name="information-circle" size={24} color={theme.colors.primary} />
              <Text style={[styles.headerTitle, { marginLeft: theme.spacing.sm }]}>How Streaks Work</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* What Counts as a Day */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={[styles.sectionTitle, { marginLeft: theme.spacing.sm }]}>What Counts as a Day</Text>
              </View>
              <Text style={styles.sectionText}>
                A day counts toward your streak when your Life Score is 50% or higher.
              </Text>
              <Text style={styles.sectionSubtext}>
                This means you've met at least half of your daily targets for Steps, Water, Sleep, and Mood.
              </Text>
            </View>

            {/* Life Score Calculation */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="calculator" size={20} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { marginLeft: theme.spacing.sm }]}>Life Score Calculation</Text>
              </View>
              <Text style={styles.sectionText}>
                Your Life Score is the average of four components:
              </Text>
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>Steps: 25%</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>Water: 25%</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>Sleep: 25%</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>Mood Check-ins: 25%</Text>
                </View>
              </View>
              <Text style={styles.sectionSubtext}>
                Each component is calculated as: (Actual / Target) × 100%
              </Text>
            </View>

            {/* Current Streak */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="flame" size={20} color="#FF6B35" />
                <Text style={[styles.sectionTitle, { marginLeft: theme.spacing.sm }]}>Current Streak</Text>
              </View>
              <Text style={styles.sectionText}>
                Your current streak counts consecutive days from today backward.
              </Text>
              <Text style={styles.sectionSubtext}>
                If you miss a day (Life Score below 50%), your streak resets to 0 and starts fresh the next day you meet the threshold.
              </Text>
            </View>

            {/* Best Streak */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="trophy" size={20} color="#FFD700" />
                <Text style={[styles.sectionTitle, { marginLeft: theme.spacing.sm }]}>Best Streak</Text>
              </View>
              <Text style={styles.sectionText}>
                Your best streak is your longest consecutive streak ever achieved.
              </Text>
              <Text style={styles.sectionSubtext}>
                This is calculated from all your historical data, so even if your current streak breaks, your best streak remains as a record of your achievement.
              </Text>
            </View>

            {/* Milestones */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="flag" size={20} color={theme.colors.ringMood} />
                <Text style={[styles.sectionTitle, { marginLeft: theme.spacing.sm }]}>Milestones & Rewards</Text>
              </View>
              <Text style={styles.sectionText}>
                Reach streak milestones to earn bonus points:
              </Text>
              <View style={styles.milestoneList}>
                <View style={styles.milestoneItem}>
                  <Text style={styles.milestoneDays}>7 days</Text>
                  <Text style={styles.milestoneBonus}>+50 points</Text>
                </View>
                <View style={styles.milestoneItem}>
                  <Text style={styles.milestoneDays}>14 days</Text>
                  <Text style={styles.milestoneBonus}>+100 points</Text>
                </View>
                <View style={styles.milestoneItem}>
                  <Text style={styles.milestoneDays}>21 days</Text>
                  <Text style={styles.milestoneBonus}>+150 points</Text>
                </View>
                <View style={styles.milestoneItem}>
                  <Text style={styles.milestoneDays}>30 days</Text>
                  <Text style={styles.milestoneBonus}>+200 points</Text>
                </View>
                <View style={styles.milestoneItem}>
                  <Text style={styles.milestoneDays}>60 days</Text>
                  <Text style={styles.milestoneBonus}>+300 points</Text>
                </View>
                <View style={styles.milestoneItem}>
                  <Text style={styles.milestoneDays}>90 days</Text>
                  <Text style={styles.milestoneBonus}>+500 points</Text>
                </View>
              </View>
            </View>

            {/* Tips */}
            <View style={styles.tipsSection}>
              <View style={styles.tipsHeader}>
                <Icon name="bulb" size={20} color="#FF9800" />
                <Text style={[styles.tipsTitle, { marginLeft: theme.spacing.sm }]}>Tips to Maintain Your Streak</Text>
              </View>
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>Aim for at least 50% Life Score each day</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>Track your habits consistently throughout the day</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>Don't worry if you miss a day - start fresh the next day</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>Small progress each day adds up to big streaks</Text>
                </View>
              </View>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Close Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.gotItButton} onPress={onClose}>
              <Text style={styles.gotItButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.base,
  },
  modalContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxWidth: 500,
    height: screenHeight * 0.85,
    flexDirection: 'column',
    ...theme.shadows.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.base,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  sectionText: {
    fontSize: theme.typography.small,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeights.normal * theme.typography.small,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtext: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeights.tight * theme.typography.xsmall,
    fontStyle: 'italic',
  },
  bulletList: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  bullet: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
    width: 16,
  },
  bulletText: {
    flex: 1,
    fontSize: theme.typography.small,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeights.normal * theme.typography.small,
  },
  milestoneList: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  milestoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  milestoneDays: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },
  milestoneBonus: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.ringMood,
  },
  tipsSection: {
    backgroundColor: '#FFF9E6',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tipsTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  footer: {
    padding: theme.spacing.base,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  gotItButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    alignItems: 'center',
  },
  gotItButtonText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.cardBackground,
  },
  bottomSpacer: {
    height: theme.spacing.base,
  },
});

