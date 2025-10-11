// Mood Check-In Modal Component
// Modal for emotional wellness check-ins with journal functionality

import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MoodCheckInModalProps, MoodOption, ContextualPrompt } from '../../types/moodCheckIn';
import { MoodLevel } from '../../types';

export const MoodCheckInModal: React.FC<MoodCheckInModalProps> = ({
  visible,
  onClose,
  onSubmit,
  healthContext,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [notes, setNotes] = useState('');

  const moodOptions: MoodOption[] = [
    {
      level: 5,
      label: 'Excellent',
      emoji: '😄',
      description: 'Feeling fantastic and energized'
    },
    {
      level: 4,
      label: 'Good',
      emoji: '😊',
      description: 'Positive and content'
    },
    {
      level: 3,
      label: 'Neutral',
      emoji: '😐',
      description: 'Balanced, neither good nor bad'
    },
    {
      level: 2,
      label: 'Low',
      emoji: '😔',
      description: 'Feeling down or tired'
    },
    {
      level: 1,
      label: 'Poor',
      emoji: '😢',
      description: 'Struggling or overwhelmed'
    }
  ];

  const contextualPrompts: ContextualPrompt[] = useMemo(() => {
    const prompts: ContextualPrompt[] = [];

    if (healthContext?.sleepHours && healthContext.sleepHours < 7) {
      prompts.push({
        id: 'sleep',
        question: 'How is your energy today?',
        context: `You had ${healthContext.sleepHours}h of sleep last night.`,
        suggestion: 'Less sleep can affect mood and energy levels.'
      });
    }

    if (healthContext?.hydrationOz && healthContext.hydrationOz < 40) {
      prompts.push({
        id: 'hydration',
        question: 'How are you feeling physically?',
        context: `You've had ${healthContext.hydrationOz}oz of water today.`,
        suggestion: 'Staying hydrated can help with mood and focus.'
      });
    }

    if (healthContext?.stepsCount && healthContext.stepsCount > 8000) {
      prompts.push({
        id: 'activity',
        question: 'How did your activity affect your mood?',
        context: `You've been active today with ${healthContext.stepsCount.toLocaleString()} steps.`,
        suggestion: 'Physical activity often boosts mood and energy.'
      });
    }

    return prompts;
  }, [healthContext]);

  const handleSubmit = () => {
    if (!selectedMood) return;

    const checkIn = {
      mood_level: selectedMood,
      notes: notes.trim() || undefined,
      journal_entry: journalEntry.trim() || undefined,
      health_context: healthContext ? {
        sleep_quality: healthContext.sleepHours,
        hydration_level: healthContext.hydrationOz,
        activity_level: healthContext.stepsCount,
      } : undefined,
    };

    onSubmit(checkIn);
    handleClose();
  };

  const handleClose = () => {
    setSelectedMood(null);
    setJournalEntry('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#047857" translucent={true} />
        <LinearGradient
          colors={['#047857', '#065f46', '#1f2937']}
          style={styles.gradient}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Mood Check-In</Text>
              <View style={styles.headerRight} />
            </View>

            {/* Contextual Prompts */}
            {contextualPrompts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Today's Context</Text>
                {contextualPrompts.map((prompt) => (
                  <View key={prompt.id} style={styles.promptCard}>
                    <Text style={styles.promptQuestion}>{prompt.question}</Text>
                    <Text style={styles.promptContext}>{prompt.context}</Text>
                    {prompt.suggestion && (
                      <Text style={styles.promptSuggestion}>{prompt.suggestion}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Mood Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How are you feeling right now?</Text>
              <View style={styles.moodGrid}>
                {moodOptions.map((option) => (
                  <TouchableOpacity
                    key={option.level}
                    style={[
                      styles.moodOption,
                      selectedMood === option.level && styles.moodOptionSelected
                    ]}
                    onPress={() => setSelectedMood(option.level)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.moodEmoji}>{option.emoji}</Text>
                    <Text style={styles.moodLabel}>{option.label}</Text>
                    <Text style={styles.moodDescription}>{option.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quick Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What's contributing to this feeling?</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g., work stress, good workout, family time..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Journal Entry */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Journal (Optional)</Text>
              <Text style={styles.sectionSubtitle}>
                Reflect deeper on your thoughts and feelings
              </Text>
              <TextInput
                style={styles.journalInput}
                value={journalEntry}
                onChangeText={setJournalEntry}
                placeholder="Take a moment to write about your day, thoughts, or anything on your mind..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <View style={styles.submitSection}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !selectedMood && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!selectedMood}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  Complete Check-In
                </Text>
              </TouchableOpacity>
              <Text style={styles.submitHint}>
                Your emotional awareness helps build healthier habits
              </Text>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50, // Account for status bar
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  headerRight: {
    width: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 15,
  },
  promptCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  promptQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  promptContext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  promptSuggestion: {
    fontSize: 12,
    color: 'rgba(16, 185, 129, 0.9)',
    fontStyle: 'italic',
  },
  moodGrid: {
    gap: 12,
  },
  moodOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  moodDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 80,
  },
  journalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 120,
  },
  submitSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#10b981', // emerald-500
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    minWidth: 200,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  submitHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 250,
  },
  bottomSpacer: {
    height: 40,
  },
});
