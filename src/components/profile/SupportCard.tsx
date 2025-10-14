// Support & Help Card Component
// Contact options, help resources, and support features

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';

interface SupportOption {
  id: string;
  icon: string;
  label: string;
  description: string;
  action: 'email' | 'url' | 'modal';
  value: string;
  onPress?: () => void;
}

interface SupportCardProps {
  supportOptions: SupportOption[];
  appVersion?: string;
}

export const SupportCard: React.FC<SupportCardProps> = ({
  supportOptions,
  appVersion = '1.0.0',
}) => {
  const handleSupportAction = async (option: SupportOption) => {
    if (option.onPress) {
      option.onPress();
      return;
    }

    switch (option.action) {
      case 'email':
        const emailUrl = `mailto:${option.value}?subject=MaxPulse Support Request`;
        try {
          await Linking.openURL(emailUrl);
        } catch (error) {
          console.error('Failed to open email client:', error);
        }
        break;
        
      case 'url':
        try {
          await Linking.openURL(option.value);
        } catch (error) {
          console.error('Failed to open URL:', error);
        }
        break;
        
      default:
        console.log('Support action not implemented:', option.action);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="help-circle-outline" size={20} color={theme.colors.textPrimary} />
        <Text style={styles.title}>Support & Help</Text>
      </View>

      <View style={styles.supportList}>
        {supportOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.supportItem}
            onPress={() => handleSupportAction(option)}
            activeOpacity={0.7}
          >
            <View style={styles.supportLeft}>
              <View style={styles.iconContainer}>
                <Icon name={option.icon as any} size={18} color={theme.colors.primary} />
              </View>
              
              <View style={styles.supportInfo}>
                <Text style={styles.supportLabel}>{option.label}</Text>
                <Text style={styles.supportDescription}>{option.description}</Text>
              </View>
            </View>

            <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* App Version */}
      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>MaxPulse v{appVersion}</Text>
        <Text style={styles.versionSubtext}>
          Built with ❤️ for your health journey
        </Text>
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
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  supportList: {
    marginBottom: theme.spacing.lg,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  supportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.base,
  },
  supportInfo: {
    flex: 1,
  },
  supportLabel: {
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  supportDescription: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  versionInfo: {
    alignItems: 'center',
    paddingTop: theme.spacing.base,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  versionText: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  versionSubtext: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
});
