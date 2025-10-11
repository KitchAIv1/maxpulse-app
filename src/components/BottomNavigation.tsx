// Bottom Navigation Component for TriHabit
// Navigation bar with Home, Coach, Rewards, Settings tabs

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

interface BottomNavigationProps {
  currentScreen: 'dashboard' | 'coach' | 'rewards' | 'settings';
  onScreenChange: (screen: 'dashboard' | 'coach' | 'rewards' | 'settings') => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentScreen,
  onScreenChange,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: '⌂' },
    { id: 'coach', label: 'Coach', icon: '◉' },
    { id: 'rewards', label: 'Rewards', icon: '♦' },
    { id: 'settings', label: 'Profile', icon: '◐' },
  ] as const;

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            currentScreen === tab.id && styles.activeTab
          ]}
          onPress={() => onScreenChange(tab.id)}
        >
          <Text style={[
            styles.tabIcon,
            currentScreen === tab.id && styles.activeTabIcon
          ]}>
            {tab.icon}
          </Text>
          <Text style={[
            styles.tabLabel,
            currentScreen === tab.id && styles.activeTabLabel
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 34,
    paddingTop: theme.spacing.md,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    ...theme.shadows.subtle,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  activeTab: {
    // Active tab styling handled by text colors
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    color: theme.colors.navInactive,
  },
  activeTabIcon: {
    color: theme.colors.navActive,
  },
  tabLabel: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.navInactive,
    fontWeight: theme.typography.weights.medium,
  },
  activeTabLabel: {
    color: theme.colors.navActive,
    fontWeight: theme.typography.weights.semibold,
  },
});
