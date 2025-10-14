// User Profile Card Component
// Displays user avatar, name, email, and basic profile information

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';

interface UserProfileCardProps {
  name: string;
  email: string;
  planType?: string;
  joinDate?: string;
  onEditProfile?: () => void;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  name,
  email,
  planType = 'Premium',
  joinDate,
  onEditProfile,
}) => {
  // Generate initials from name
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Recently joined';
    const date = new Date(dateString);
    return `Member since ${date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })}`;
  };

  return (
    <View style={styles.container}>
      {/* Avatar and Basic Info */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          <View style={styles.planBadge}>
            <Icon name="diamond" size={12} color={theme.colors.primary} />
            <Text style={styles.planText}>{planType}</Text>
          </View>
        </View>

        {onEditProfile && (
          <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
            <Icon name="pencil" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Member Since */}
      <View style={styles.memberInfo}>
        <Icon name="calendar-outline" size={14} color={theme.colors.textSecondary} />
        <Text style={styles.memberText}>{formatJoinDate(joinDate)}</Text>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.base,
  },
  avatarText: {
    fontSize: theme.typography.large,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  planText: {
    fontSize: theme.typography.xsmall,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  editButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.base,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  memberText: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
});
