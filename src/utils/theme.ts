// Cal AI-Inspired Theme System
// Centralized design tokens for consistent styling

export const theme = {
  colors: {
    // Backgrounds
    background: '#F5F1ED', // Beige/cream - Cal AI primary background
    cardBackground: '#FFFFFF', // White cards
    
    // Text
    textPrimary: '#2D2D2D', // Dark gray for primary text
    textSecondary: '#8B8B8B', // Medium gray for secondary text
    textTertiary: '#B8B8B8', // Light gray for tertiary text
    
    // Accent colors (Cal AI-inspired soft pastels)
    protein: '#FFC9C9', // Soft pink
    carbs: '#FFE4C9', // Soft orange/peach
    fat: '#C9E4FF', // Soft blue
    
    // Ring colors (solid metallic versions for better visibility)
    ringSteps: '#000000', // Black (default Cal AI ring color)
    ringHydration: '#1E88E5', // Solid metallic blue - vibrant and visible
    ringSleep: '#8E24AA', // Solid metallic purple - rich and bold
    ringMood: '#E91E63', // Solid metallic pink - bright and energetic
    
    // Functional colors
    primary: '#FF6B6B', // Primary brand color (soft red)
    secondary: '#1E88E5', // Secondary brand color (blue)
    success: '#7ED957', // Soft green
    warning: '#FFB547', // Soft amber
    error: '#FF6B6B', // Soft red
    
    // UI Elements
    border: '#E8E4E0', // Subtle border
    divider: '#F0EDE9', // Very subtle divider
    shadow: 'rgba(0, 0, 0, 0.06)', // Soft shadow
    
    // Bottom nav
    navActive: '#2D2D2D', // Dark for active state
    navInactive: '#B8B8B8', // Light gray for inactive
  },
  
  typography: {
    // Font sizes
    hero: 64, // Extra large numbers (Cal AI style)
    xxlarge: 48, // Extra extra large
    xlarge: 32, // Extra large numbers
    large: 20, // Large numbers
    medium: 18, // Body text
    regular: 16, // Regular text
    small: 14, // Small labels
    xsmall: 12, // Extra small labels
    tiny: 10, // Tiny text
    
    // Font weights
    weights: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    
    // Line heights
    lineHeights: {
      tight: 1.1,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  spacing: {
    tiny: 2,
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
    round: 9999,
  },
  
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    subtle: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
    },
  },
  
  // Animation durations
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
};

export type Theme = typeof theme;

