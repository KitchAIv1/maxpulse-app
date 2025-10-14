// Quick Action Chips Component
// Scrollable row of action buttons for quick interactions

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { QuickActionChipsProps } from '../../types/coach';
import { coachTheme } from '../../utils/coachTheme';

export const QuickActionChips: React.FC<QuickActionChipsProps> = ({
  actions,
  onActionPress,
  maxVisible = 4,
}) => {
  if (actions.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {actions.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.chip,
              index === 0 && styles.firstChip,
              index === actions.length - 1 && styles.lastChip,
            ]}
            onPress={() => onActionPress(action)}
            activeOpacity={0.7}
          >
            {action.icon && (
              <Icon 
                name={action.icon} 
                size={16} 
                color={coachTheme.colors.quickActions.iconColor}
                style={styles.chipIcon}
              />
            )}
            <Text style={styles.chipText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: coachTheme.colors.quickActions.background,  // Solid white background
    borderRadius: coachTheme.borderRadius.quickAction,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: coachTheme.colors.quickActions.border,
    minHeight: 36,
    ...coachTheme.shadows.card,  // Add subtle shadow
  },
  firstChip: {
    marginLeft: 0,
  },
  lastChip: {
    marginRight: 0,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: coachTheme.colors.quickActions.textColor,  // Dark text on white background
  },
});
