// Preferences Card Component
// User settings for notifications, units, privacy, etc.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';

interface PreferenceItem {
  id: string;
  icon: string;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'action';
  value?: boolean | string;
  options?: string[];
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

interface PreferencesCardProps {
  preferences: PreferenceItem[];
}

export const PreferencesCard: React.FC<PreferencesCardProps> = ({
  preferences,
}) => {
  const renderPreferenceItem = (item: PreferenceItem) => {
    return (
      <View key={item.id} style={styles.preferenceItem}>
        <View style={styles.preferenceLeft}>
          <View style={styles.iconContainer}>
            <Icon name={item.icon as any} size={18} color={theme.colors.textSecondary} />
          </View>
          
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceLabel}>{item.label}</Text>
            {item.description && (
              <Text style={styles.preferenceDescription}>{item.description}</Text>
            )}
          </View>
        </View>

        <View style={styles.preferenceRight}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value as boolean}
              onValueChange={item.onToggle}
              trackColor={{ 
                false: theme.colors.border, 
                true: theme.colors.primary + '40' 
              }}
              thumbColor={item.value ? theme.colors.primary : theme.colors.cardBackground}
              ios_backgroundColor={theme.colors.border}
            />
          )}
          
          {item.type === 'select' && (
            <TouchableOpacity style={styles.selectButton} onPress={item.onPress}>
              <Text style={styles.selectValue}>{item.value as string}</Text>
              <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
          
          {item.type === 'action' && (
            <TouchableOpacity style={styles.actionButton} onPress={item.onPress}>
              <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="settings-outline" size={20} color={theme.colors.textPrimary} />
        <Text style={styles.title}>Preferences</Text>
      </View>

      <View style={styles.preferencesList}>
        {preferences.map(renderPreferenceItem)}
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
  preferencesList: {
    gap: theme.spacing.base,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.base,
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  preferenceDescription: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  preferenceRight: {
    marginLeft: theme.spacing.base,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    minWidth: 80,
  },
  selectValue: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  actionButton: {
    padding: theme.spacing.xs,
  },
});
