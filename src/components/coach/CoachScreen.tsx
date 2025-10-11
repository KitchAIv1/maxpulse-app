// Coach Screen Component
// Main AI Coach chat interface

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChatMessage } from './ChatMessage';
import { ChatComposer } from './ChatComposer';
import { WellnessPrompts } from './WellnessPrompts';
import { CoachScreenProps, ChatMessage as ChatMessageType, QuickAction, HealthContextData } from '../../types/coach';
import AICoachService from '../../services/AICoachService';
import { useAppStore } from '../../stores/appStore';
import { useLifeScore } from '../../hooks/useAppSelectors';
import { useStepProgress } from '../../stores/stepTrackingStore';

export const CoachScreen: React.FC<CoachScreenProps> = ({
  initialContext,
  preloadedMessage,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWellnessPrompts, setShowWellnessPrompts] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const coachService = AICoachService.getInstance();

  // Get current health context from stores
  const { currentState, targets } = useAppStore();
  const { steps: realSteps, target: stepTarget } = useStepProgress();
  const { score: lifeScore } = useLifeScore();

  // Build health context
  const healthContext: HealthContextData = initialContext || {
    steps: { current: realSteps, target: stepTarget },
    hydration: { current: currentState.waterOz, target: targets.waterOz, unit: 'oz' },
    sleep: { current: currentState.sleepHr, target: targets.sleepHr, unit: 'hours' },
    lifeScore,
    date: new Date().toISOString().split('T')[0],
  };

  // Initialize chat with greeting
  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      
      try {
        let initialMessage: ChatMessageType;
        
        if (preloadedMessage) {
          // Handle preloaded message (e.g., from wellbeing dashboard)
          initialMessage = {
            id: 'preloaded',
            content: preloadedMessage,
            sender: 'user',
            timestamp: new Date().toISOString(),
          };
          setMessages([initialMessage]);
          
          // Get AI response to preloaded message
          const response = await coachService.generateResponse(preloadedMessage, healthContext);
          const aiMessage: ChatMessageType = {
            id: `ai-${Date.now()}`,
            content: response.message,
            sender: 'coach',
            timestamp: new Date().toISOString(),
            contextData: response.contextData,
            quickActions: response.quickActions,
            messageType: response.messageType,
          };
          setMessages(prev => [...prev, aiMessage]);
        } else {
          // Generate greeting
          const greeting = coachService.generateGreeting(healthContext);
          initialMessage = {
            id: 'greeting',
            content: greeting.message,
            sender: 'coach',
            timestamp: new Date().toISOString(),
            contextData: greeting.contextData,
            quickActions: greeting.quickActions,
            messageType: greeting.messageType,
          };
          setMessages([initialMessage]);
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        // Fallback greeting
        const fallbackMessage: ChatMessageType = {
          id: 'fallback',
          content: "Hi! I'm your wellness coach 🌟 How can I help you today?",
          sender: 'coach',
          timestamp: new Date().toISOString(),
        };
        setMessages([fallbackMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [preloadedMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (messageText: string) => {
    if (isLoading) return;

    // Add user message
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      content: messageText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get AI response
      const response = await coachService.generateResponse(messageText, healthContext);
      const aiMessage: ChatMessageType = {
        id: `ai-${Date.now()}`,
        content: response.message,
        sender: 'coach',
        timestamp: new Date().toISOString(),
        contextData: response.contextData,
        quickActions: response.quickActions,
        messageType: response.messageType,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        content: "I'm having trouble responding right now. Please try again!",
        sender: 'coach',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    if (isLoading) return;

    // Hide wellness prompts when user takes action
    setShowWellnessPrompts(false);
    setIsLoading(true);

    try {
      // Show wellness prompts if this is a wellness check
      if (action.action === 'wellness_check') {
        setShowWellnessPrompts(true);
      }

      // Process the quick action
      const response = await coachService.processQuickAction(action, healthContext);
      const aiMessage: ChatMessageType = {
        id: `action-${Date.now()}`,
        content: response.message,
        sender: 'coach',
        timestamp: new Date().toISOString(),
        contextData: response.contextData,
        quickActions: response.quickActions,
        messageType: response.messageType,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to process quick action:', error);
      const errorMessage: ChatMessageType = {
        id: `action-error-${Date.now()}`,
        content: "I couldn't complete that action. Please try again!",
        sender: 'coach',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWellnessPrompt = (prompt: string) => {
    setShowWellnessPrompts(false);
    handleSendMessage(prompt);
  };

  const handleClearChat = () => {
    setMessages([]);
    // Reinitialize with greeting
    const greeting = coachService.generateGreeting(healthContext);
    const greetingMessage: ChatMessageType = {
      id: 'new-greeting',
      content: greeting.message,
      sender: 'coach',
      timestamp: new Date().toISOString(),
      contextData: greeting.contextData,
      quickActions: greeting.quickActions,
      messageType: greeting.messageType,
    };
    setMessages([greetingMessage]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#047857" translucent={true} />
      <LinearGradient
        colors={['#047857', '#065f46', '#1f2937']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.coachIndicator}>
              <Text style={styles.coachIcon}>🤖</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Coach</Text>
              <Text style={styles.headerSubtitle}>Your wellness assistant</Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleClearChat}
            >
              <Text style={styles.headerButtonText}>🗑️</Text>
            </TouchableOpacity>
            
            {onClose && (
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={onClose}
              >
                <Text style={styles.headerButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Chat Messages */}
        <View style={styles.chatContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🤖</Text>
                <Text style={styles.emptyStateTitle}>Welcome to Coach!</Text>
                <Text style={styles.emptyStateText}>
                  I'm here to help you stay healthy and motivated. Ask me anything about your wellness journey!
                </Text>
              </View>
            )}
            
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                onQuickAction={handleQuickAction}
                isLatest={index === messages.length - 1}
              />
            ))}
            
            {/* Wellness Prompts */}
            {showWellnessPrompts && (
              <WellnessPrompts 
                onPromptPress={handleWellnessPrompt}
                visible={showWellnessPrompts}
              />
            )}
            
            {isLoading && (
              <View style={styles.typingIndicator}>
                <View style={styles.typingBubble}>
                  <Text style={styles.typingText}>Coach is typing</Text>
                  <View style={styles.typingDots}>
                    <View style={[styles.dot, styles.dot1]} />
                    <View style={[styles.dot, styles.dot2]} />
                    <View style={[styles.dot, styles.dot3]} />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

        </View>

      </LinearGradient>
      
      {/* Chat Composer - Positioned outside gradient to align with bottom nav */}
      <ChatComposer
        onSendMessage={handleSendMessage}
        onQuickAction={handleQuickAction}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coachIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  coachIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 16,
    color: 'white',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 183, // Account for ChatComposer height + spacing + bottom nav (12+8+40+12+12+99)
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  typingIndicator: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    maxWidth: '70%',
  },
  typingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.6)',
  },
  dot1: {
    // Animation would be added here
  },
  dot2: {
    // Animation would be added here
  },
  dot3: {
    // Animation would be added here
  },
});
