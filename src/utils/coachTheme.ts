// Coach-Specific Theme Extension
// Centralized design tokens for AI Coach interface
// Follows MaxPulse branding with metallic ring colors

import { theme } from './theme';

export const coachTheme = {
  // Brand Colors (matching ring colors for consistency)
  colors: {
    // Primary coach branding
    primary: theme.colors.ringSleep,      // '#8E24AA' - Purple (sleep ring)
    secondary: theme.colors.ringHydration, // '#1E88E5' - Blue (hydration ring)
    accent: theme.colors.ringMood,        // '#E91E63' - Pink (mood ring)
    
    // Message type gradients
    messageTypes: {
      insight: ['#667eea', '#764ba2'],      // Purple gradient for insights
      celebration: ['#f093fb', '#f5576c'],  // Pink gradient for celebrations
      suggestion: ['#4facfe', '#00f2fe'],   // Blue gradient for suggestions
      default: ['#a8edea', '#fed6e3'],      // Soft gradient for default
    },
    
    // Avatar colors
    avatar: {
      primary: theme.colors.ringSleep,      // Purple
      secondary: theme.colors.ringMood,     // Pink
      background: '#FFFFFF',
      iconColor: '#FFFFFF',
    },
    
    // Modern chat colors
    chat: {
      background: '#F5F5F5',               // Light gray (not dark overlay)
      inputBackground: '#FFFFFF',
      inputBorder: '#E0E0E0',
      inputText: theme.colors.textPrimary,
      placeholderText: theme.colors.textSecondary,
      
      // Bubble colors
      coachBubble: '#FFFFFF',
      userBubble: theme.colors.ringSleep,   // Purple for user messages
      coachText: '#5A5A5A',                 // Lighter gray for softer appearance
      userText: '#FFFFFF',
      
      // Send button
      sendButton: theme.colors.ringSleep,   // Purple
      sendButtonDisabled: '#E0E0E0',
    },
    
    // Quick action colors
    quickActions: {
      background: '#FFFFFF',
      border: '#E0E0E0',
      iconColor: theme.colors.ringSleep,    // Purple icons
      textColor: theme.colors.textPrimary,
      activeBackground: theme.colors.ringSleep + '10', // 10% opacity
    },
    
    // Health context card colors
    healthCard: {
      background: '#FFFFFF',
      border: '#F0F0F0',
      steps: theme.colors.ringSteps,        // Black
      hydration: theme.colors.ringHydration, // Blue
      sleep: theme.colors.ringSleep,        // Purple
      mood: theme.colors.ringMood,          // Pink
    },
  },
  
  // Coach-specific spacing
  spacing: {
    bubblePadding: 14,                    // Reduced from 16 for tighter spacing
    bubbleMargin: 10,                     // Reduced from 12 for closer messages
    avatarSize: 40,
    iconSize: 20,
    inputPadding: 16,
    cardPadding: 12,
    textLineHeight: 18,                   // Tighter line height
  },
  
  // Coach-specific border radius
  borderRadius: {
    bubble: 20,
    avatar: 20,
    input: 24,
    card: 12,
    quickAction: 16,
  },
  
  // Coach-specific shadows
  shadows: {
    bubble: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
  },
  
  // Animation configurations
  animations: {
    messageEntrance: {
      duration: 300,
      delay: 100,
    },
    typing: {
      duration: 1200,
    },
    quickAction: {
      duration: 200,
    },
    keyboard: {
      duration: 250,        // Fast keyboard animation
      easing: 'ease-out',   // Smooth easing
    },
  },
};

export type CoachTheme = typeof coachTheme;
