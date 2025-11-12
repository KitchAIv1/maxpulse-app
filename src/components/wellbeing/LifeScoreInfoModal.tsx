// Life Score Info Modal Component
// Explains how Life Score is calculated
// Reusable component for Life Score education

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

interface LifeScoreInfoModalProps {
  visible: boolean;
  onClose: () => void;
  currentWeek?: number;
}

export const LifeScoreInfoModal: React.FC<LifeScoreInfoModalProps> = ({
  visible,
  onClose,
  currentWeek = 1,
}) => {
  // Determine weights based on current week
  const getWeights = () => {
    if (currentWeek === 1) {
      return { past: 0, current: 100 };
    } else if (currentWeek === 2) {
      return { past: 25, current: 75 };
    } else {
      return { past: 40, current: 60 };
    }
  };

  const weights = getWeights();

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
              <Text style={[styles.headerTitle, { marginLeft: theme.spacing.sm }]}>How Life Score Works</Text>
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
            {/* Overview */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="calculator" size={20} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { marginLeft: theme.spacing.sm }]}>Cumulative Scoring</Text>
              </View>
              <Text style={styles.sectionText}>
                Your Life Score is a cumulative measure that combines your past weekly performance with your current week's progress. It's not just about today—it reflects your overall wellness journey.
              </Text>
            </View>

            {/* Progressive Weighting */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="trending-up" size={20} color="#10B981" />
                <Text style={[styles.sectionTitle, { marginLeft: theme.spacing.sm }]}>Progressive Weighting</Text>
              </View>
              <Text style={styles.sectionText}>
                As you progress through your plan, the weighting changes to reflect your growing history:
              </Text>
              <View style={styles.weightingList}>
                <View style={styles.weightingItem}>
                  <View style={styles.weightingHeader}>
                    <Text style={styles.weightingLabel}>Week 1</Text>
                    <Text style={styles.weightingValue}>Current: 100%</Text>
                  </View>
                  <Text style={styles.weightingDescription}>
                    No past data yet. Life Score = Current week average
                  </Text>
                </View>
                <View style={styles.weightingItem}>
                  <View style={styles.weightingHeader}>
                    <Text style={styles.weightingLabel}>Week 2</Text>
                    <Text style={styles.weightingValue}>Past: 25% • Current: 75%</Text>
                  </View>
                  <Text style={styles.weightingDescription}>
                    Past week contributes 25%, current week contributes 75%
                  </Text>
                </View>
                <View style={styles.weightingItem}>
                  <View style={styles.weightingHeader}>
                    <Text style={styles.weightingLabel}>Week 3+</Text>
                    <Text style={styles.weightingValue}>Past: 40% • Current: 60%</Text>
                  </View>
                  <Text style={styles.weightingDescription}>
                    All past weeks average contributes 40%, current week contributes 60%
                  </Text>
                </View>
              </View>
            </View>

            {/* Current Week Calculation */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="calendar" size={20} color={theme.colors.ringSleep} />
                <Text style={[styles.sectionTitle, { marginLeft: theme.spacing.sm }]}>Current Week Component</Text>
              </View>
              <Text style={styles.sectionText}>
                Your current week score is the average of all days in the current week (not just today), calculated from four pillars:
              </Text>
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={styles.bulletBold}>Steps:</Text> Average of (actual / target) across all days this week
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={styles.bulletBold}>Water:</Text> Average of (actual / target) across all days this week
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={styles.bulletBold}>Sleep:</Text> Average of (actual / target) across all days this week
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={styles.bulletBold}>Mood:</Text> Average of (check-ins / target) across all days this week
                  </Text>
                </View>
              </View>
              <Text style={styles.sectionSubtext}>
                Each pillar contributes 25% to the current week score.
              </Text>
            </View>

            {/* Past Weeks Component */}
            {currentWeek > 1 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="time" size={20} color={theme.colors.ringMood} />
                  <Text style={[styles.sectionTitle, { marginLeft: theme.spacing.sm }]}>Past Weeks Component</Text>
                </View>
                <Text style={styles.sectionText}>
                  Your past performance is calculated from completed weekly assessments. The system averages all your past assessment scores to create a single "past performance" value.
                </Text>
                <Text style={styles.sectionSubtext}>
                  This ensures that consistent performance over time is rewarded, while recent progress still has the most impact.
                </Text>
              </View>
            )}

            {/* Your Current Calculation */}
            <View style={styles.highlightBox}>
              <View style={styles.highlightHeader}>
                <Icon name="star" size={20} color="#FFD700" />
                <Text style={[styles.highlightTitle, { marginLeft: theme.spacing.sm }]}>Your Current Calculation</Text>
              </View>
              <Text style={styles.highlightText}>
                Week {currentWeek}: {weights.past}% from past assessments + {weights.current}% from current week
              </Text>
              {currentWeek === 1 && (
                <Text style={styles.highlightSubtext}>
                  Once you complete your first weekly assessment, past performance will start contributing to your Life Score.
                </Text>
              )}
            </View>

            {/* Today's Progress vs Life Score */}
            <View style={styles.tipsSection}>
              <View style={styles.tipsHeader}>
                <Icon name="bulb" size={20} color="#FF9800" />
                <Text style={[styles.tipsTitle, { marginLeft: theme.spacing.sm }]}>Today's Progress vs Life Score</Text>
              </View>
              <Text style={styles.tipsText}>
                The breakdown shown below the Life Score gauge displays <Text style={styles.tipsBold}>today's progress</Text> for each pillar. This is different from your Life Score, which is cumulative.
              </Text>
              <Text style={styles.tipsText}>
                Your Life Score reflects your overall wellness journey, while today's progress shows how you're doing right now.
              </Text>
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
    marginTop: theme.spacing.xs,
  },
  weightingList: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  weightingItem: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  weightingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  weightingLabel: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  weightingValue: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primary,
  },
  weightingDescription: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeights.tight * theme.typography.xsmall,
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
  bulletBold: {
    fontWeight: theme.typography.weights.semibold,
  },
  highlightBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    marginBottom: theme.spacing.lg,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  highlightTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  highlightText: {
    fontSize: theme.typography.small,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeights.normal * theme.typography.small,
    marginBottom: theme.spacing.xs,
  },
  highlightSubtext: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeights.tight * theme.typography.xsmall,
    fontStyle: 'italic',
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
  tipsText: {
    fontSize: theme.typography.small,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeights.normal * theme.typography.small,
    marginBottom: theme.spacing.xs,
  },
  tipsBold: {
    fontWeight: theme.typography.weights.semibold,
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

