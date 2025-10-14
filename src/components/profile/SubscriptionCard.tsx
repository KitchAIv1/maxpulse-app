// Subscription & Billing Card Component
// Displays subscription plan, billing info, and upgrade options

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';

interface SubscriptionCardProps {
  planName: string;
  planPrice: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate?: string;
  features: string[];
  onManageBilling?: () => void;
  onUpgrade?: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  planName,
  planPrice,
  billingCycle,
  nextBillingDate,
  features,
  onManageBilling,
  onUpgrade,
}) => {
  const formatBillingDate = (dateString?: string) => {
    if (!dateString) return 'No billing date set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isPremium = planName.toLowerCase().includes('premium');

  return (
    <View style={styles.container}>
      {/* Plan Header */}
      <View style={styles.header}>
        <View style={styles.planInfo}>
          <View style={styles.planTitleRow}>
            <Icon 
              name={isPremium ? "diamond" : "star"} 
              size={20} 
              color={isPremium ? theme.colors.primary : theme.colors.warning} 
            />
            <Text style={styles.planName}>{planName}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.planPrice}>{planPrice}</Text>
            <Text style={styles.billingCycle}>/{billingCycle}</Text>
          </View>
        </View>

        {onUpgrade && !isPremium && (
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Next Billing */}
      {nextBillingDate && (
        <View style={styles.billingInfo}>
          <Icon name="calendar-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.billingText}>
            Next billing: {formatBillingDate(nextBillingDate)}
          </Text>
        </View>
      )}

      {/* Plan Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>Plan Features</Text>
        <View style={styles.featuresList}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Icon name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {onManageBilling && (
          <TouchableOpacity style={styles.manageButton} onPress={onManageBilling}>
            <Icon name="card-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.manageButtonText}>Manage Billing</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.base,
    ...theme.shadows.subtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.base,
  },
  planInfo: {
    flex: 1,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  planName: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: theme.typography.large,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  billingCycle: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  upgradeButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  upgradeButtonText: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.cardBackground,
  },
  billingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
  },
  billingText: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  featuresSection: {
    marginBottom: theme.spacing.base,
  },
  featuresTitle: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  featuresList: {
    gap: theme.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  actions: {
    paddingTop: theme.spacing.base,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  manageButtonText: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
});
