// Quick Action Chips Component
// Scrollable row of action buttons for quick interactions

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { QuickActionChipsProps } from '../../types/coach';

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
              <Text style={styles.chipIcon}>{action.icon}</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 36,
  },
  firstChip: {
    marginLeft: 0,
  },
  lastChip: {
    marginRight: 0,
  },
  chipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'white',
  },
});
