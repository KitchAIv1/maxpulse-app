// Bottom Navigation Component for TriHabit
// Navigation bar with Home, Coach, Rewards, Settings tabs

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
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
    { id: 'dashboard', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { id: 'coach', label: 'Coach', icon: 'chatbubble-outline', activeIcon: 'chatbubble' },
    { id: 'rewards', label: 'Rewards', icon: 'gift-outline', activeIcon: 'gift' },
    { id: 'settings', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
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
          <Icon
            name={currentScreen === tab.id ? tab.activeIcon : tab.icon}
            size={24}
            color={currentScreen === tab.id ? theme.colors.navActive : theme.colors.navInactive}
            style={styles.tabIcon}
          />
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
    borderTopWidth: 0.5, // Thinner border like Instagram/TikTok
    borderTopColor: '#E0E0E0', // Lighter border
    paddingBottom: 34,
    paddingTop: 10, // Reduced padding for cleaner look
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
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
    marginBottom: 2, // Minimal spacing between icon and label
  },
  tabLabel: {
    fontSize: theme.typography.tiny, // Smaller text like TikTok
    color: theme.colors.navInactive,
    fontWeight: theme.typography.weights.medium,
  },
  activeTabLabel: {
    color: theme.colors.navActive,
    fontWeight: theme.typography.weights.semibold,
  },
});
