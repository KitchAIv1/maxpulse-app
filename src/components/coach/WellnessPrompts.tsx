// Wellness Prompts Component
// Helpful prompts to encourage natural symptom sharing

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface WellnessPromptsProps {
  onPromptPress: (prompt: string) => void;
  visible?: boolean;
}

export const WellnessPrompts: React.FC<WellnessPromptsProps> = ({
  onPromptPress,
  visible = true,
}) => {
  const prompts = [
    "I'm feeling tired today",
    "I have a headache",
    "I'm stressed about work",
    "My energy is really low",
    "I'm feeling anxious",
    "I have stomach issues",
  ];

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 Try typing something like:</Text>
      <View style={styles.promptsContainer}>
        {prompts.map((prompt, index) => (
          <TouchableOpacity
            key={index}
            style={styles.promptButton}
            onPress={() => onPromptPress(prompt)}
            activeOpacity={0.7}
          >
            <Text style={styles.promptText}>"{prompt}"</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.subtitle}>
        Or describe your symptoms in your own words - I'm here to listen! 🤗
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  promptsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  promptButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  promptText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 16,
  },
});
