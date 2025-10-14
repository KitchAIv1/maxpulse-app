// Message Bubble Component
// Individual chat message bubble with styling for user/coach

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { MessageBubbleProps } from '../../types/coach';
import { WellnessIndicators } from './WellnessIndicators';
import { coachTheme } from '../../utils/coachTheme';

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

  const getMessageIcon = (): { name: string; color: string } | null => {
    if (!isCoach) return null;
    
    // Use consistent sparkles icon for all coach messages
    return { name: 'sparkles', color: coachTheme.colors.primary };
  };

  const getBubbleGradient = (): string[] => {
    if (!isCoach) return [coachTheme.colors.chat.userBubble, coachTheme.colors.chat.userBubble];
    
    // Use consistent default gradient for all coach messages
    return coachTheme.colors.messageTypes.default;
  };

  if (isCoach) {
    return (
      <View style={styles.coachContainer}>
        {/* Coach Avatar */}
        <View style={styles.coachAvatar}>
          <LinearGradient
            colors={[coachTheme.colors.avatar.primary, coachTheme.colors.avatar.secondary]}
            style={styles.avatarGradient}
          >
            <Icon 
              name="chatbubble-ellipses" 
              size={coachTheme.spacing.iconSize} 
              color={coachTheme.colors.avatar.iconColor} 
            />
          </LinearGradient>
        </View>

        {/* Message Content */}
        <View style={styles.coachBubbleContainer}>
          <LinearGradient
            colors={getBubbleGradient()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.coachBubble}
          >
            {/* Message Type Icon */}
            {getMessageIcon() && (
              <Icon 
                name={getMessageIcon()!.name} 
                size={16} 
                color={getMessageIcon()!.color}
                style={styles.messageIcon}
              />
            )}
            
            <Text style={styles.coachText}>{content}</Text>
            
            {/* Context Data Display */}
            {contextData && (
              <View style={styles.contextContainer}>
                {contextData.steps && (
                  <View style={styles.contextChip}>
                    <Icon name="footsteps-outline" size={14} color={coachTheme.colors.healthCard.steps} />
                    <Text style={styles.contextText}>
                      {contextData.steps.current.toLocaleString()}/{contextData.steps.target.toLocaleString()}
                    </Text>
                  </View>
                )}
                {contextData.hydration && (
                  <View style={styles.contextChip}>
                    <Icon name="water-outline" size={14} color={coachTheme.colors.healthCard.hydration} />
                    <Text style={styles.contextText}>
                      {contextData.hydration.current}/{contextData.hydration.target}oz
                    </Text>
                  </View>
                )}
                {contextData.sleep && (
                  <View style={styles.contextChip}>
                    <Icon name="moon-outline" size={14} color={coachTheme.colors.healthCard.sleep} />
                    <Text style={styles.contextText}>
                      {contextData.sleep.current}h/{contextData.sleep.target}h
                    </Text>
                  </View>
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
    borderRadius: coachTheme.borderRadius.bubble,
    borderTopLeftRadius: 4,
    padding: coachTheme.spacing.bubblePadding,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  messageIcon: {
    marginBottom: 4,
  },
  coachText: {
    fontSize: 14,                                 // Reduced from 15
    lineHeight: coachTheme.spacing.textLineHeight, // Tighter line height
    color: coachTheme.colors.chat.coachText,
  },
  contextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  contextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',     // Light dark background for better contrast
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  contextText: {
    fontSize: 11,
    color: '#5A5A5A',                           // Dark gray text for better visibility
    fontWeight: '500',
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
    backgroundColor: coachTheme.colors.chat.userBubble,  // Solid purple background
    borderRadius: 16,
    borderTopRightRadius: 4,
    padding: coachTheme.spacing.bubblePadding,
    ...coachTheme.shadows.bubble,  // Add shadow for depth
  },
  userText: {
    fontSize: 14,                                 // Reduced from 15 to match coach text
    lineHeight: coachTheme.spacing.textLineHeight, // Consistent line height
    color: coachTheme.colors.chat.userText,
  },

  // Shared styles
  timestamp: {
    fontSize: 11,
    color: '#9A9A9A',                    // Light gray instead of white
    marginTop: 4,
    textAlign: 'right',
  },
});
