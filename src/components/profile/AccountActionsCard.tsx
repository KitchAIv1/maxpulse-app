// Account Actions Card Component
// Critical account actions like sign out, delete account, export data

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';

interface AccountAction {
  id: string;
  icon: string;
  label: string;
  description: string;
  type: 'normal' | 'warning' | 'danger';
  onPress: () => void;
}

interface AccountActionsCardProps {
  actions: AccountAction[];
}

export const AccountActionsCard: React.FC<AccountActionsCardProps> = ({
  actions,
}) => {
  const getActionStyles = (type: AccountAction['type']) => {
    switch (type) {
      case 'danger':
        return {
          iconColor: theme.colors.error,
          backgroundColor: theme.colors.error + '10',
          textColor: theme.colors.error,
        };
      case 'warning':
        return {
          iconColor: theme.colors.warning,
          backgroundColor: theme.colors.warning + '10',
          textColor: theme.colors.warning,
        };
      default:
        return {
          iconColor: theme.colors.textSecondary,
          backgroundColor: theme.colors.background,
          textColor: theme.colors.textPrimary,
        };
    }
  };

  const handleActionPress = (action: AccountAction) => {
    if (action.type === 'danger') {
      Alert.alert(
        'Confirm Action',
        `Are you sure you want to ${action.label.toLowerCase()}? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Confirm', 
            style: 'destructive',
            onPress: action.onPress 
          },
        ]
      );
    } else if (action.type === 'warning') {
      Alert.alert(
        'Confirm Action',
        `Are you sure you want to ${action.label.toLowerCase()}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Confirm', 
            onPress: action.onPress 
          },
        ]
      );
    } else {
      action.onPress();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="shield-outline" size={20} color={theme.colors.textPrimary} />
        <Text style={styles.title}>Account Actions</Text>
      </View>

      <View style={styles.actionsList}>
        {actions.map((action) => {
          const actionStyles = getActionStyles(action.type);
          
          return (
            <TouchableOpacity
              key={action.id}
              style={styles.actionItem}
              onPress={() => handleActionPress(action)}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <View style={[
                  styles.iconContainer, 
                  { backgroundColor: actionStyles.backgroundColor }
                ]}>
                  <Icon 
                    name={action.icon as any} 
                    size={18} 
                    color={actionStyles.iconColor} 
                  />
                </View>
                
                <View style={styles.actionInfo}>
                  <Text style={[
                    styles.actionLabel, 
                    { color: actionStyles.textColor }
                  ]}>
                    {action.label}
                  </Text>
                  <Text style={styles.actionDescription}>
                    {action.description}
                  </Text>
                </View>
              </View>

              <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Warning Text for Destructive Actions */}
      <View style={styles.warningSection}>
        <Icon name="information-circle-outline" size={14} color={theme.colors.textTertiary} />
        <Text style={styles.warningText}>
          Destructive actions require confirmation and cannot be undone.
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
  actionsList: {
    marginBottom: theme.spacing.base,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.base,
  },
  actionInfo: {
    flex: 1,
  },
  actionLabel: {
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.xs,
  },
  actionDescription: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  warningSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: theme.spacing.base,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  warningText: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textTertiary,
    marginLeft: theme.spacing.xs,
    flex: 1,
    lineHeight: 16,
  },
});
