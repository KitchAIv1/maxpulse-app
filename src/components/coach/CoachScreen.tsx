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
  Keyboard,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ChatMessage } from './ChatMessage';
import { ChatComposer } from './ChatComposer';
import { CoachScreenProps, ChatMessage as ChatMessageType, QuickAction, HealthContextData } from '../../types/coach';
import AICoachService from '../../services/AICoachService';
import { supabase } from '../../services/supabase';
import { useAppStore } from '../../stores/appStore';
import { useLifeScore } from '../../hooks/useAppSelectors';
import { useStepProgress } from '../../stores/stepTrackingStore';
import { theme } from '../../utils/theme';
import { coachTheme } from '../../utils/coachTheme';

// Generate UUID for session ID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const CoachScreen: React.FC<CoachScreenProps> = ({
  initialContext,
  preloadedMessage,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const coachService = AICoachService.getInstance();
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  
  // Session management
  const sessionId = useRef<string>(generateUUID()).current;
  const conversationMessages = useRef<Array<{role: 'user' | 'assistant'; content: string; timestamp: string}>>([]);

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

  // Get authenticated user
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          console.log('✅ User authenticated for conversation:', user.id);
        } else {
          console.warn('⚠️ No authenticated user found');
        }
      } catch (error) {
        console.error('Failed to get user:', error);
      }
    };
    getUser();
  }, []);

  // Save conversation on unmount
  useEffect(() => {
    return () => {
      // Save conversation when component unmounts
      if (userId && conversationMessages.current.length > 0) {
        console.log('💾 Saving conversation on unmount...');
        
        // Dynamic import to avoid module loading issues
        import('../../services/coach/HealthConversationStorage').then(module => {
          const HealthConversationStorage = module.default;
          const storage = HealthConversationStorage.getInstance();
          
          storage.saveConversationSession(
            userId,
            sessionId,
            conversationMessages.current,
            { healthContext, lifeScore }
          ).then(result => {
            if (result.success) {
              console.log('✅ Conversation saved successfully');
            } else {
              console.error('❌ Failed to save conversation:', result.error);
            }
          }).catch(error => {
            console.error('❌ Error saving conversation:', error);
          });
        }).catch(error => {
          console.error('❌ Failed to load HealthConversationStorage:', error);
        });
      }
    };
  }, [userId]);

  // Keyboard listeners for smooth animation
  useEffect(() => {
    const keyboardWillShow = (event: any) => {
      Animated.timing(keyboardHeight, {
        duration: coachTheme.animations.keyboard.duration,
        toValue: event.endCoordinates.height,
        useNativeDriver: false,
      }).start();
    };

    const keyboardWillHide = (event: any) => {
      Animated.timing(keyboardHeight, {
        duration: coachTheme.animations.keyboard.duration,
        toValue: 0,
        useNativeDriver: false,
      }).start();
    };

    const showSubscription = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
    const hideSubscription = Keyboard.addListener('keyboardWillHide', keyboardWillHide);

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, [keyboardHeight]);

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
          // Generate health-focused greeting
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
        // Fallback health-focused greeting
        const fallbackMessage: ChatMessageType = {
          id: 'fallback',
          content: "Hi! I'm Max, your health companion 💙\n\nI'm here to listen to your health concerns, help you understand symptoms, and provide personalized wellness guidance. Feel free to share anything you're experiencing - physical symptoms, mood changes, sleep issues, or general health questions.\n\nWhat would you like to talk about today?",
          sender: 'coach',
          timestamp: new Date().toISOString(),
          quickActions: [
            { id: 'wellness_check', label: 'Wellness Check', action: 'wellness_check', icon: 'medical-outline' },
            { id: 'describe_symptoms', label: 'Describe symptoms', action: 'symptom_log', params: { type: 'general' }, icon: 'fitness-outline' },
            { id: 'mood_energy', label: 'Mood & energy', action: 'symptom_log', params: { type: 'mood' }, icon: 'happy-outline' },
          ],
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
    
    // Track user message in conversation history
    conversationMessages.current.push({
      role: 'user',
      content: messageText,
      timestamp: userMessage.timestamp,
    });
    
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
      
      // Track AI message in conversation history
      conversationMessages.current.push({
        role: 'assistant',
        content: response.message,
        timestamp: aiMessage.timestamp,
      });
      
      // Save symptom report and recommendations if present
      if (response.metadata?.needsDatabaseSave && userId) {
        try {
          const { default: HealthConversationStorage } = await import('../../services/coach/HealthConversationStorage');
          const storage = HealthConversationStorage.getInstance();
          
          const symptomResult = await storage.saveSymptomReport(
            userId,
            sessionId,
            {
              symptomDescription: messageText,
              symptomType: response.metadata.symptomAnalysis.symptom_type,
              severity: response.metadata.symptomAnalysis.severity_assessment,
              durationDays: response.metadata.symptomAnalysis.duration_days,
              affectedAreas: response.metadata.symptomAnalysis.affected_areas,
              triggers: response.metadata.symptomAnalysis.triggers,
            },
            response.metadata.symptomAnalysis
          );
          
          if (symptomResult.success && response.metadata.recommendations?.length > 0) {
            await storage.saveHealthRecommendations(
              userId,
              sessionId,
              symptomResult.symptomReportId!,
              response.metadata.recommendations
            );
          }
        } catch (error) {
          console.error('❌ Failed to save symptom/recommendations:', error);
        }
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        content: "I'm having trouble responding right now. Please try again!",
        sender: 'coach',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Track error message too
      conversationMessages.current.push({
        role: 'assistant',
        content: errorMessage.content,
        timestamp: errorMessage.timestamp,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    if (isLoading) return;

    setIsLoading(true);

    try {

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
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} translucent={true} />
      <View style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {onClose && (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={onClose}
              >
                <Icon name="arrow-back" size={24} color={coachTheme.colors.primary} />
              </TouchableOpacity>
            )}
            <View style={styles.coachIndicator}>
              <Icon name="chatbubble-ellipses" size={20} color={coachTheme.colors.primary} />
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
              <Icon name="trash-outline" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Messages */}
        <Animated.View style={[styles.chatContainer, { marginBottom: keyboardHeight }]}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>💙</Text>
                <Text style={styles.emptyStateTitle}>Welcome to Max Health Coach</Text>
                <Text style={styles.emptyStateText}>
                  I'm here to listen to your health concerns and provide personalized wellness guidance. Share your symptoms, ask questions, or tell me how you're feeling.
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

        </Animated.View>

      </View>
      
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
    backgroundColor: theme.colors.background,
  },
  gradient: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.cardBackground,
    ...theme.shadows.subtle,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.xsmall,
  },
  coachIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: coachTheme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: theme.spacing.xsmall,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: theme.typography.regular,
    color: theme.colors.textSecondary,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 84, // Account for ChatComposer height + spacing (12+8+40+12+12) - no bottom nav
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.base,
  },
  emptyStateTitle: {
    fontSize: theme.typography.xlarge,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xsmall,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: theme.typography.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  typingIndicator: {
    paddingHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.base,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.base,
    borderTopLeftRadius: 4,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxWidth: '70%',
    ...theme.shadows.subtle,
  },
  typingText: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xsmall,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
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
