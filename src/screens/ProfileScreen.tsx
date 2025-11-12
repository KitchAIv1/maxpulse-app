// Profile Screen Component
// Modern user profile with Cal AI design language

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  UserProfileCard,
  HealthSummaryCard,
  PreferencesCard,
  SupportCard,
  AccountActionsCard,
} from '../components/profile';
import { useAppStore } from '../stores/appStore';
import { useLifeScore } from '../hooks/useAppSelectors';
import { authService } from '../services/supabase';
import { theme } from '../utils/theme';
import { useNotifications } from '../hooks/notifications/useNotifications';

interface ProfileScreenProps {
  onBack?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = React.memo(({ onBack }) => {
  const { user, targets, currentState, moodCheckInFrequency } = useAppStore();
  const { stepsPct, waterPct, sleepPct, score: lifeScore } = useLifeScore();
  const [refreshing, setRefreshing] = useState(false);
  
  // Notification permissions hook - syncs with iOS Settings
  // Hook already handles AppState listener for refreshing on return from Settings
  const {
    isEnabled: notificationsEnabled,
    isLoading: notificationsLoading,
    requestPermission: requestNotificationPermission,
    openSettings: openNotificationSettings,
  } = useNotifications();

  const [preferences, setPreferences] = useState({
    weeklyReports: true,
    dataSharing: false,
    units: 'imperial' as 'metric' | 'imperial',
    privacy: 'friends' as 'public' | 'friends' | 'private',
  });

  // Mock user data - in production, this would come from the backend
  const profileData = useMemo(() => ({
    name: user?.display_name || 'Health Enthusiast',
    email: 'user@maxpulse.com', // Would come from user profile in production
    planType: 'Premium',
    joinDate: '2024-01-15',
    nextBillingDate: '2025-01-15',
  }), [user]);

  // Health metrics for summary (no rings)
  const healthMetrics = useMemo(() => [
    {
      icon: 'footsteps',
      label: 'Steps',
      current: ((currentState?.steps ?? 0)).toLocaleString(),
      target: ((targets?.steps ?? 0)).toLocaleString(),
      percentage: stepsPct * 100,
    },
    {
      icon: 'water',
      label: 'Hydration',
      current: ((currentState?.waterOz ?? 0)).toString(),
      target: ((targets?.waterOz ?? 0)).toString(),
      percentage: waterPct * 100,
      unit: 'oz',
    },
    {
      icon: 'moon',
      label: 'Sleep',
      current: ((currentState?.sleepHr ?? 0)).toFixed(1),
      target: ((targets?.sleepHr ?? 0)).toString(),
      percentage: sleepPct * 100,
      unit: 'hr',
    },
    {
      icon: 'happy',
      label: 'Mood',
      current: ((moodCheckInFrequency?.total_checkins ?? 0)).toString(),
      target: '7',
      percentage: ((moodCheckInFrequency?.total_checkins ?? 0) / 7) * 100,
      unit: 'check-ins',
    },
  ], [currentState, targets, moodCheckInFrequency, stepsPct, waterPct, sleepPct]);


  // Handle notification toggle
  // Note: Switch is controlled by notificationsEnabled state, so it will automatically
  // reflect the actual permission status after async operations complete
  const handleNotificationToggle = useCallback(async (value: boolean) => {
    // Prevent action if already in the desired state
    if (value === notificationsEnabled) {
      return;
    }

    if (value) {
      // User wants to enable notifications - request permission
      const granted = await requestNotificationPermission();
      if (!granted) {
        // Permission denied or user dismissed - check if we can ask again
        // The hook will have already refreshed the state, so toggle will reflect actual status
        Alert.alert(
          'Notifications Disabled',
          'To enable notifications, please allow them in the permission prompt or go to Settings > MaxPulse > Notifications.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                // Open Settings - hook will refresh when app returns to foreground
                openNotificationSettings();
              },
            },
          ],
        );
      }
      // If granted, the hook's refreshPermission will update notificationsEnabled automatically
    } else {
      // User wants to disable notifications - guide to Settings
      // Note: We can't disable programmatically, so toggle will stay ON until user disables in Settings
      Alert.alert(
        'Disable Notifications',
        'To disable notifications, please go to Settings > MaxPulse > Notifications and turn off Allow Notifications.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              // Open Settings - hook will refresh when app returns to foreground
              openNotificationSettings();
            },
          },
        ],
      );
    }
  }, [notificationsEnabled, requestNotificationPermission, openNotificationSettings]);

  // User preferences
  const preferenceItems = useMemo(() => [
    {
      id: 'notifications',
      icon: 'notifications-outline',
      label: 'Push Notifications',
      description: notificationsLoading 
        ? 'Checking permissions...' 
        : notificationsEnabled 
          ? 'Enabled in Settings' 
          : 'Tap to enable notifications',
      type: 'toggle' as const,
      value: notificationsEnabled,
      onToggle: handleNotificationToggle,
    },
    {
      id: 'reports',
      icon: 'document-text-outline',
      label: 'Weekly Reports',
      description: 'Email summary of your progress',
      type: 'toggle' as const,
      value: preferences.weeklyReports,
      onToggle: (value: boolean) => setPreferences(prev => ({ ...prev, weeklyReports: value })),
    },
    {
      id: 'units',
      icon: 'speedometer-outline',
      label: 'Units',
      description: 'Measurement system preference',
      type: 'select' as const,
      value: preferences.units === 'metric' ? 'Metric' : 'Imperial',
      onPress: () => {
        Alert.alert(
          'Units',
          'Choose your preferred measurement system',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Metric', 
              onPress: () => setPreferences(prev => ({ ...prev, units: 'metric' }))
            },
            { 
              text: 'Imperial', 
              onPress: () => setPreferences(prev => ({ ...prev, units: 'imperial' }))
            },
          ]
        );
      },
    },
    {
      id: 'privacy',
      icon: 'shield-outline',
      label: 'Privacy Level',
      description: 'Who can see your health data',
      type: 'select' as const,
      value: preferences.privacy.charAt(0).toUpperCase() + preferences.privacy.slice(1),
      onPress: () => {
        Alert.alert(
          'Privacy Level',
          'Choose who can see your health data',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Private', 
              onPress: () => setPreferences(prev => ({ ...prev, privacy: 'private' }))
            },
            { 
              text: 'Friends Only', 
              onPress: () => setPreferences(prev => ({ ...prev, privacy: 'friends' }))
            },
            { 
              text: 'Public', 
              onPress: () => setPreferences(prev => ({ ...prev, privacy: 'public' }))
            },
          ]
        );
      },
    },
    {
      id: 'data-sharing',
      icon: 'share-outline',
      label: 'Anonymous Data Sharing',
      description: 'Help improve MaxPulse for everyone',
      type: 'toggle' as const,
      value: preferences.dataSharing,
      onToggle: (value: boolean) => setPreferences(prev => ({ ...prev, dataSharing: value })),
    },
  ], [preferences, notificationsEnabled, notificationsLoading, handleNotificationToggle]);

  // Support options
  const supportOptions = useMemo(() => [
    {
      id: 'help-center',
      icon: 'library-outline',
      label: 'Help Center',
      description: 'Browse articles and guides',
      action: 'url' as const,
      value: 'https://help.maxpulse.com',
    },
    {
      id: 'contact-support',
      icon: 'mail-outline',
      label: 'Contact Support',
      description: 'Get help from our team',
      action: 'email' as const,
      value: 'support@maxpulse.com',
    },
    {
      id: 'feature-request',
      icon: 'bulb-outline',
      label: 'Feature Request',
      description: 'Suggest new features',
      action: 'email' as const,
      value: 'feedback@maxpulse.com',
    },
    {
      id: 'community',
      icon: 'people-outline',
      label: 'Community Forum',
      description: 'Connect with other users',
      action: 'url' as const,
      value: 'https://community.maxpulse.com',
    },
  ], []);

  // Account actions
  const accountActions = useMemo(() => [
    {
      id: 'export-data',
      icon: 'download-outline',
      label: 'Export Data',
      description: 'Download your health data',
      type: 'normal' as const,
      onPress: () => {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
          // Haptics not available
        }
        Alert.alert('Export Data', 'Your data export will be emailed to you within 24 hours.');
      },
    },
    {
      id: 'sign-out',
      icon: 'log-out-outline',
      label: 'Sign Out',
      description: 'Sign out of your account',
      type: 'warning' as const,
      onPress: handleSignOut,
    },
    {
      id: 'delete-account',
      icon: 'trash-outline',
      label: 'Delete Account',
      description: 'Permanently delete your account and data',
      type: 'danger' as const,
      onPress: () => {
        Alert.alert(
          'Delete Account',
          'This will permanently delete your account and all your health data. This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete Account', 
              style: 'destructive',
              onPress: () => {
                // In production, this would call a delete account API
                Alert.alert('Account Deletion', 'Account deletion request submitted. You will receive a confirmation email.');
              }
            },
          ]
        );
      },
    },
  ], []);

  const handleBackPress = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available
    }
    
    if (onBack) {
      onBack();
    } else {
      // Fallback: If no onBack prop provided, just log (shouldn't happen in normal flow)
      console.warn('ProfileScreen: No onBack handler provided');
    }
  }, [onBack]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  async function handleSignOut() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available
    }
    
    console.log('🔐 ProfileScreen: Initiating sign out...');
    
    try {
      const result = await authService.signOut();
      if (result.error) {
        throw new Error(result.error.message);
      }
      console.log('✅ ProfileScreen: Sign out successful - AppWithAuth will handle state change');
      // AppWithAuth auth listener will handle the state change
    } catch (error) {
      console.error('❌ ProfileScreen: Sign out failed:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  }


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} translucent={true} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Icon name="arrow-back" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* User Profile Card */}
        <UserProfileCard
          name={profileData.name}
          email={profileData.email}
          planType={profileData.planType}
          joinDate={profileData.joinDate}
          onEditProfile={() => Alert.alert('Edit Profile', 'Profile editing coming soon!')}
        />

        {/* Health Summary */}
        <HealthSummaryCard
          lifeScore={Math.round(lifeScore)}
          metrics={healthMetrics}
        />

        {/* Preferences */}
        <PreferencesCard preferences={preferenceItems} />

        {/* Support & Help */}
        <SupportCard supportOptions={supportOptions} appVersion="1.0.0" />

        {/* Account Actions */}
        <AccountActionsCard actions={accountActions} />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
});

// Add display name for better debugging
ProfileScreen.displayName = 'ProfileScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: 50, // Account for status bar
    paddingBottom: 100, // Account for bottom navigation
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 40, // Match back button width
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
});

export default ProfileScreen;