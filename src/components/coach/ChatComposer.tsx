// Chat Composer Component
// Input field and quick actions for sending messages

import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ChatComposerProps, QuickAction } from '../../types/coach';
import { coachTheme } from '../../utils/coachTheme';

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  onQuickAction,
  isLoading = false,
  placeholder = "Describe how you're feeling, ask questions, or share symptoms...",
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  // Default quick actions always available
  const defaultQuickActions: QuickAction[] = [
    {
      id: 'wellness_check',
      label: 'Wellness Check',
      action: 'wellness_check',
      icon: 'medical'
    },
    {
      id: 'check_score',
      label: 'Check my Life Score',
      action: 'check_score',
      icon: 'battery-charging'
    },
    {
      id: 'boost_score',
      label: 'Boost my score',
      action: 'boost_score',
      icon: 'flash'
    },
    {
      id: 'plan_week',
      label: 'Plan week',
      action: 'plan_tomorrow',
      icon: 'calendar'
    },
    {
      id: 'log_water',
      label: 'Log hydration',
      action: 'log_hydration',
      params: { amount: 8 },
      icon: 'water'
    },
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.container}>
        {/* Input Row */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder={placeholder}
              placeholderTextColor={coachTheme.colors.chat.placeholderText}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!message.trim() || isLoading}
            activeOpacity={0.7}
          >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Icon name="send" size={18} color="#FFFFFF" />
          )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  container: {
    backgroundColor: coachTheme.colors.chat.background,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12, // Add bottom padding to input container for proper spacing
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: coachTheme.colors.chat.inputBackground,
    borderRadius: coachTheme.borderRadius.input,
    borderWidth: 1,
    borderColor: coachTheme.colors.chat.inputBorder,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 100,
    ...coachTheme.shadows.card,
  },
  textInput: {
    color: coachTheme.colors.chat.inputText,
    fontSize: 15,
    lineHeight: 20,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: coachTheme.colors.chat.sendButton,
    alignItems: 'center',
    justifyContent: 'center',
    ...coachTheme.shadows.card,
  },
  sendButtonDisabled: {
    backgroundColor: coachTheme.colors.chat.sendButtonDisabled,
  },
});
