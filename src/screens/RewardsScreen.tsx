// Rewards Screen for TriHabit - Coming Soon
// Modern "Coming Soon" interface with Cal AI design language

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../utils/theme';

interface RewardsScreenProps {
  onBack: () => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({ onBack }) => {
  const handleBackPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available on this platform
    }
    onBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} translucent={true} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Rewards</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Coming Soon Content */}
      <View style={styles.content}>
        {/* Icon Container with Gradient */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['rgba(255, 107, 107, 0.15)', 'rgba(255, 107, 107, 0.05)']}
            style={styles.iconGradient}
          >
            <Icon name="gift" size={48} color={theme.colors.primary} />
          </LinearGradient>
        </View>

        {/* Coming Soon Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>COMING SOON</Text>
        </View>

        {/* Main Title */}
        <Text style={styles.mainTitle}>Rewards System</Text>
        <Text style={styles.subtitle}>
          We're building something exciting
        </Text>

        {/* Feature List */}
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Icon name="trophy" size={20} color={theme.colors.primary} style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Earn Points</Text>
              <Text style={styles.featureDescription}>
                Get rewarded for hitting your daily health goals
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Icon name="flame" size={20} color="#FF6B35" style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Build Streaks</Text>
              <Text style={styles.featureDescription}>
                Maintain consistency and unlock streak bonuses
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Icon name="gift" size={20} color="#4ECDC4" style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Partner Rewards</Text>
              <Text style={styles.featureDescription}>
                Redeem points for exclusive partner benefits
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Icon name="ribbon" size={20} color="#FFB800" style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Achievement Badges</Text>
              <Text style={styles.featureDescription}>
                Collect badges for milestones and accomplishments
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Message */}
        <View style={styles.bottomMessage}>
          <Text style={styles.bottomMessageText}>
            Focus on your health journey—rewards are on the way! 💪
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingTop: 50,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.large,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 120, // Space for bottom navigation
  },
  iconContainer: {
    marginBottom: theme.spacing.base,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.sm,
  },
  badgeText: {
    fontSize: theme.typography.tiny,
    fontWeight: theme.typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.regular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  featureList: {
    width: '100%',
    marginTop: theme.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.subtle,
  },
  featureIcon: {
    marginTop: 1,
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  featureTitle: {
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  bottomMessage: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.base,
  },
  bottomMessageText: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
