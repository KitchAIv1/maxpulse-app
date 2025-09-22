// Bottom Navigation Component for TriHabit
// Navigation bar with Home, Coach, Rewards, Settings tabs

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 34, // Account for safe area (home indicator)
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    // Active tab styling handled by text colors
  },
  tabIcon: {
    fontSize: 24, // Increased from 20 for better visibility
    marginBottom: 4,
    opacity: 0.6,
    color: 'rgba(255, 255, 255, 0.6)', // Ensure white color for visibility
  },
  activeTabIcon: {
    opacity: 1,
    color: 'white', // Full white for active state
  },
  tabLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: 'white',
  },
});
