// Chat Message Component
// Complete message with bubble and quick actions

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MessageBubble } from './MessageBubble';
import { QuickActionChips } from './QuickActionChips';
import { ChatMessageProps } from '../../types/coach';

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onQuickAction,
  isLatest = false,
}) => {
  return (
    <View style={[styles.container, isLatest && styles.latestMessage]}>
      <MessageBubble
        content={message.content}
        sender={message.sender}
        timestamp={message.timestamp}
        contextData={message.contextData}
        messageType={message.messageType}
      />
      
      {message.quickActions && message.quickActions.length > 0 && (
        <QuickActionChips
          actions={message.quickActions}
          onActionPress={onQuickAction}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Base container styles
  },
  latestMessage: {
    marginBottom: 20, // Extra space for latest message
  },
});
