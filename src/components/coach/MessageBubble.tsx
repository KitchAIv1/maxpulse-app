// Message Bubble Component
// Individual chat message bubble with styling for user/coach

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageBubbleProps } from '../../types/coach';
import { WellnessIndicators } from './WellnessIndicators';

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  sender,
  timestamp,
  contextData,
  messageType = 'text',
}) => {
  const isCoach = sender === 'coach';
  const isUser = sender === 'user';

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageIcon = (): string => {
    if (!isCoach) return '';
    
    switch (messageType) {
      case 'celebration':
        return '🎉';
      case 'suggestion':
        return '💡';
      case 'insight':
        return '📊';
      default:
        return '🌟';
    }
  };

  if (isCoach) {
    return (
      <View style={styles.coachContainer}>
        {/* Coach Avatar */}
        <View style={styles.coachAvatar}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>🤖</Text>
          </LinearGradient>
        </View>

        {/* Message Content */}
        <View style={styles.coachBubbleContainer}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.05)']}
            style={styles.coachBubble}
          >
            {/* Message Type Icon */}
            {getMessageIcon() && (
              <Text style={styles.messageIcon}>{getMessageIcon()}</Text>
            )}
            
            <Text style={styles.coachText}>{content}</Text>
            
            {/* Context Data Display */}
            {contextData && (
              <View style={styles.contextContainer}>
                {contextData.steps && (
                  <Text style={styles.contextChip}>
                    🚶‍♂️ {contextData.steps.current.toLocaleString()}/{contextData.steps.target.toLocaleString()}
                  </Text>
                )}
                {contextData.hydration && (
                  <Text style={styles.contextChip}>
                    💧 {contextData.hydration.current}/{contextData.hydration.target}oz
                  </Text>
                )}
                {contextData.sleep && (
                  <Text style={styles.contextChip}>
                    😴 {contextData.sleep.current}h/{contextData.sleep.target}h
                  </Text>
                )}
              </View>
            )}

            {/* Wellness Indicators for wellness-related messages */}
            {messageType === 'insight' && content.includes('feeling') && (
              <View style={styles.wellnessContainer}>
                <WellnessIndicators 
                  mood="neutral" 
                  energy="moderate" 
                  stress="low"
                  showLabels={false}
                />
              </View>
            )}
          </LinearGradient>
          
          <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
        </View>
      </View>
    );
  }

  // User message
  return (
    <View style={styles.userContainer}>
      <View style={styles.userBubbleContainer}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{content}</Text>
        </View>
        <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Coach message styles
  coachContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  coachAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    marginTop: 4,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
  },
  coachBubbleContainer: {
    flex: 1,
    maxWidth: '85%',
  },
  coachBubble: {
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  messageIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  coachText: {
    fontSize: 15,
    lineHeight: 20,
    color: 'white',
  },
  contextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  contextChip: {
    fontSize: 12,
    color: 'rgba(16, 185, 129, 0.9)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  wellnessContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.1)',
  },

  // User message styles
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  userBubbleContainer: {
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderTopRightRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userText: {
    fontSize: 15,
    lineHeight: 20,
    color: 'white',
  },

  // Shared styles
  timestamp: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
    textAlign: 'right',
  },
});
