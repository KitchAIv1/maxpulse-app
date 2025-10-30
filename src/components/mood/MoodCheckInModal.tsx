// Mood Check-In Modal Component
// Modern bottom sheet modal for emotional wellness check-ins

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/Ionicons';
import { MoodCheckInModalProps } from '../../types/moodCheckIn';
import { MoodLevel } from '../../types';
import { MoodSelector } from './MoodSelector';
import { HealthContextCards } from './HealthContextCards';
import { QuickNoteInput } from './QuickNoteInput';
import { theme } from '../../utils/theme';

const { height: screenHeight } = Dimensions.get('window');

export const MoodCheckInModal: React.FC<MoodCheckInModalProps> = ({
  visible,
  onClose,
  onSubmit,
  healthContext,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!selectedMood) return;

    // Add success haptic feedback
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Haptics not available on this platform
    }

    const checkIn = {
      mood_level: selectedMood,
      notes: notes.trim() || undefined,
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
    setNotes('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
        
        {/* Backdrop */}
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        
        {/* Bottom Sheet */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.bottomSheet}
          keyboardVerticalOffset={0}
        >
          {/* Handle */}
          <View style={styles.handle} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mood Check-In</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Health Context Cards */}
            <HealthContextCards healthContext={healthContext} />

            {/* Mood Selection */}
            <MoodSelector
              selectedMood={selectedMood}
              onMoodSelect={setSelectedMood}
            />

            {/* Quick Note Input */}
            <QuickNoteInput
              value={notes}
              onChangeText={setNotes}
            />

            {/* Submit Button */}
            <View style={styles.submitSection}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !selectedMood && styles.submitButtonDisabled,
                  selectedMood && { backgroundColor: theme.colors.ringMood }
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
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'transparent' },
  backdrop: { 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: screenHeight * 0.85,
    minHeight: screenHeight * 0.6,
  },
  handle: {
    width: 40, height: 4, backgroundColor: theme.colors.border, borderRadius: 2,
    alignSelf: 'center', marginTop: theme.spacing.sm, marginBottom: theme.spacing.base,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: theme.spacing.base, paddingBottom: theme.spacing.base,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.large,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  closeButton: { padding: theme.spacing.xs },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.base,
    paddingBottom: theme.spacing.xl,
  },
  submitSection: { alignItems: 'center', marginTop: theme.spacing.base },
  submitButton: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.xl,
    minWidth: 200,
    alignItems: 'center',
    ...theme.shadows.subtle,
  },
  submitButtonDisabled: { backgroundColor: theme.colors.border },
  submitButtonText: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.cardBackground,
  },
  submitHint: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    maxWidth: 280,
    lineHeight: theme.typography.lineHeights.normal * theme.typography.xsmall,
  },
  bottomSpacer: { height: theme.spacing.base },
});
