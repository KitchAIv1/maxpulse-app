// Cal AI-Inspired Reusable Style Utilities
// Helper functions and common styles for consistent Cal AI aesthetic

import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from './theme';

// Card styles with Cal AI aesthetic
export const calAiCard = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.base,
    ...theme.shadows.subtle,
  } as ViewStyle,
  
  compact: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.subtle,
  } as ViewStyle,
  
  spacious: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.soft,
  } as ViewStyle,
});

// Container styles
export const calAiContainer = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.base,
  } as ViewStyle,
  
  section: {
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
});

// Typography styles
export const calAiText = StyleSheet.create({
  hero: {
    fontSize: theme.typography.hero,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.hero * theme.typography.lineHeights.tight,
  } as TextStyle,
  
  xlarge: {
    fontSize: theme.typography.xlarge,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.xlarge * theme.typography.lineHeights.tight,
  } as TextStyle,
  
  large: {
    fontSize: theme.typography.large,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.large * theme.typography.lineHeights.normal,
  } as TextStyle,
  
  body: {
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.medium * theme.typography.lineHeights.normal,
  } as TextStyle,
  
  label: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.small * theme.typography.lineHeights.normal,
  } as TextStyle,
  
  caption: {
    fontSize: theme.typography.xsmall,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.textTertiary,
    lineHeight: theme.typography.xsmall * theme.typography.lineHeights.normal,
  } as TextStyle,
});

// Button styles
export const calAiButton = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.subtle,
  } as ViewStyle,
  
  primary: {
    backgroundColor: theme.colors.textPrimary,
  } as ViewStyle,
  
  secondary: {
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
  } as ViewStyle,
  
  soft: {
    backgroundColor: theme.colors.cardBackground,
    ...theme.shadows.subtle,
  } as ViewStyle,
});

// Helper functions
export const createCalAiCard = (customStyle?: ViewStyle): ViewStyle => ({
  ...calAiCard.base,
  ...customStyle,
});

export const createCalAiButton = (color: string, customStyle?: ViewStyle): ViewStyle => ({
  ...calAiButton.base,
  backgroundColor: color,
  ...customStyle,
});

// Spacing helper
export const spacing = {
  marginTop: (multiplier: number = 1) => ({ marginTop: theme.spacing.base * multiplier }),
  marginBottom: (multiplier: number = 1) => ({ marginBottom: theme.spacing.base * multiplier }),
  marginHorizontal: (multiplier: number = 1) => ({ marginHorizontal: theme.spacing.base * multiplier }),
  marginVertical: (multiplier: number = 1) => ({ marginVertical: theme.spacing.base * multiplier }),
  padding: (multiplier: number = 1) => ({ padding: theme.spacing.base * multiplier }),
  paddingHorizontal: (multiplier: number = 1) => ({ paddingHorizontal: theme.spacing.base * multiplier }),
  paddingVertical: (multiplier: number = 1) => ({ paddingVertical: theme.spacing.base * multiplier }),
};

