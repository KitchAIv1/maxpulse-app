// Quick Note Input Component
// Simple, clean input for mood context notes

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '../../utils/theme';

interface QuickNoteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
}

export const QuickNoteInput: React.FC<QuickNoteInputProps> = ({
  value,
  onChangeText,
  placeholder = "What's contributing to this feeling?",
  onFocus,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Quick Note (Optional)</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        returnKeyType="done"
        blurOnSubmit={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    fontSize: theme.typography.regular,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 80,
    ...theme.shadows.subtle,
  },
});
