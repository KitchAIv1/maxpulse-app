// Chat Composer Component
// Input field and quick actions for sending messages

import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { QuickActionChips } from './QuickActionChips';
import { ChatComposerProps, QuickAction } from '../../types/coach';

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
      icon: '🩺'
    },
    {
      id: 'check_score',
      label: 'Check my Life Score',
      action: 'check_score',
      icon: '🔋'
    },
    {
      id: 'boost_score',
      label: 'Boost my score',
      action: 'boost_score',
      icon: '⚡'
    },
    {
      id: 'plan_week',
      label: 'Plan week',
      action: 'plan_tomorrow',
      icon: '📅'
    },
    {
      id: 'log_water',
      label: 'Log hydration',
      action: 'log_hydration',
      params: { amount: 8 },
      icon: '💧'
    },
  ];

  return (
    <View style={styles.container}>
      {/* Input Row */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
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
            <ActivityIndicator size="small" color="white" />
          ) : (
            <View style={styles.sendIcon}>
              <View style={styles.sendArrow} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingTop: 12,
    paddingBottom: 12, // Add breathing room between input and nav bar
    position: 'absolute',
    bottom: 99, // Position above bottom navigation (1+8+8+24+4+12+8+34)
    left: 0,
    right: 0,
    zIndex: 999, // Below bottom navigation (1000) but above content
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 100,
  },
  textInput: {
    color: 'white',
    fontSize: 15,
    lineHeight: 20,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sendIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 0,
    borderBottomWidth: 4,
    borderTopWidth: 4,
    borderLeftColor: 'white',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
  },
});
