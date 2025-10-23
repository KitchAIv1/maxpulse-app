# MaxPulse UI/UX Design System

## Overview

MaxPulse features a Cal AI-inspired minimalist design system with card-based ring visualizations for health tracking. The design emphasizes clean typography, soft pastels, and intuitive user interactions.

## Design Principles

### Cal AI Design Philosophy
- **Minimalist Approach**: Clean, uncluttered interfaces
- **Card-Based Layout**: Information organized in digestible cards
- **Soft Color Palette**: Beige backgrounds with pastel accents
- **Light Typography**: Refined font weights (300-500) for elegance
- **Generous Spacing**: Breathable layouts with ample whitespace

## Color Palette

### Primary Colors
```typescript
{
  background: '#F5F5DC',      // Beige background for calm feel
  cardBackground: '#FFFFFF',   // Pure white cards
  textPrimary: '#2C2C2C',     // Dark gray for main text
  textSecondary: '#8E8E8E',   // Medium gray for secondary text
  primary: '#FF6B6B',         // Soft red for accents
  hydration: '#D4E8FF',       // Light blue for hydration
  sleep: '#E5D9FF',           // Light purple for sleep
  mood: '#FFE5E5',            // Light pink for mood
  warning: '#FFA07A',         // Light orange for warnings
  success: '#90EE90',         // Light green for success
}
```

### Ring Colors
- **Steps**: Black (#000000) progress arc on light gray (#EDEDED) track
- **Hydration**: Solid metallic blue (#1E88E5)
- **Sleep**: Solid metallic purple (#8E24AA)
- **Mood**: Solid metallic pink (#E91E63)

## Typography Scale

### Font Sizes
```typescript
{
  tiny: 10,      // Small labels
  xsmall: 12,    // Secondary text
  small: 14,     // Body text
  regular: 16,   // Default text
  medium: 18,    // Headings
  large: 20,     // Section headers
  xlarge: 24,    // Main headers
  xxlarge: 32,   // Hero text
}
```

### Font Weights
```typescript
{
  light: '300',     // Subtle text
  regular: '400',   // Body text
  medium: '500',    // Semi-emphasis
  semibold: '600',  // Strong emphasis
  bold: '700',      // Highest emphasis
}
```

## Spacing System

```typescript
{
  tiny: 2,    // Micro spacing
  xs: 8,      // Extra small
  sm: 12,     // Small
  base: 16,   // Default
  md: 20,     // Medium
  lg: 24,     // Large
  xl: 32,     // Extra large
  xxl: 48,    // Double extra large
}
```

## Border Radius

```typescript
{
  sm: 8,      // Small elements
  md: 12,     // Medium cards
  lg: 16,     // Large cards
  xl: 20,     // Extra large containers
  full: 9999, // Fully rounded (pills, circles)
}
```

## Shadows

```typescript
{
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
}
```

## Component Design

### CalAiTriRings Layout

#### Landscape Steps Card
- **Layout**: Label and percentage on left, large ring on right
- **Ring Size**: 30% screen width (max 120px)
- **Typography**: Weight 360 for label, small size for percentage
- **Icon**: 🚶‍♂️ at 24px

#### Three Core Habit Cards (Horizontal Row)
1. **Hydration Card** 💧
   - Ring size: 22% screen width (max 90px)
   - Icon size: 18px
   - Label: Small, weight 425
   - Shows current oz vs target oz

2. **Sleep Card** 😴
   - Ring size: 22% screen width (max 90px)
   - Icon size: 18px
   - Label: Small, weight 425
   - Shows current hours vs target hours

3. **Mood Card** 😊
   - Ring size: 22% screen width (max 90px)
   - Icon size: 18px
   - Label: Small, weight 425
   - Shows check-ins completed vs weekly target

### Ring Design Specifications
- **Track**: Light gray (#EDEDED), 6-8px width, rounded ends
- **Progress Arc**: Black (#000000), smooth animation, clockwise progression
- **Center Content**: Icon + current value + target value (tight spacing)
- **Container**: Cal AI white cards with subtle shadows and rounded corners

### Calendar Bar
- **7-Day Week Selector**: Horizontal layout with abbreviated day names
- **Active Day**: White background, bold text, solid border with curved edges
- **Inactive Days**: Dashed gray circles, muted text
- **Future Days**: Disabled with reduced opacity
- **Position**: Above ring cards for logical flow

### MaxPulse Header
- **Logo**: 34x34px MaxPulse logo on the left
- **App Name**: "MaxPulse" at 30.5px, weight 500
- **Rewards**: Red (#FF0000) points display on the right

## Component Patterns

### Cards
```typescript
calAiCard.base = {
  backgroundColor: theme.colors.cardBackground,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.base,
  ...theme.shadows.medium,
}
```

### Typography
```typescript
calAiText = {
  heading: {
    fontSize: theme.typography.large,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  body: {
    fontSize: theme.typography.regular,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
  },
  label: {
    fontSize: theme.typography.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
}
```

## Screen Layouts

### Main Dashboard
- **Background**: Cal AI beige (#F5F5DC)
- **Header**: Logo + MaxPulse + Rewards
- **Calendar Bar**: 7-day week selector
- **Landscape Steps Card**: Full width with ring on right
- **Three Core Habits**: Horizontal row (Hydration, Sleep, Mood)
- **Quick Actions**: +8oz Water, +15m Sleep, Mood Check-in buttons

### Coach Screen
- **Full-screen chat interface** with Cal AI styling
- **Message bubbles** with wellness indicators
- **Quick action buttons** for common health tasks
- **Wellness prompts** for conversation starters

### Rewards Screen
- **Points summary** with animated progress ring
- **Today's earnings** breakdown with mini rings
- **Streak visualization** with milestone tracking
- **Achievement badges** with vector icons
- **Partner rewards** section with Starbucks integration

### Profile Screen
- **User data verification** and backend alignment display
- **Assessment data review** with editing capabilities
- **Settings and preferences** management

## Accessibility

### Screen Reader Support
- **ARIA labels** for all interactive elements
- **Semantic HTML** structure for proper navigation
- **Alternative text** for all images and icons

### Color Accessibility
- **High contrast** ratios for text readability
- **Color-blind friendly** with icons and text labels
- **Multiple indicators** beyond color (icons, text, patterns)

### Interaction Design
- **Haptic feedback** for goal completions and interactions
- **Smooth animations** for state transitions
- **Clear visual hierarchy** for easy scanning
- **Touch targets** minimum 44px for accessibility

## Animation Guidelines

### Micro-interactions
- **Ring progress**: Smooth clockwise animation
- **Button presses**: Subtle scale and color changes
- **Modal transitions**: Slide and fade effects
- **Loading states**: Gentle pulsing animations

### Performance
- **GPU acceleration** for smooth 60fps animations
- **React.memo** for component optimization
- **useMemo** for expensive calculations
- **useCallback** for event handlers

## Responsive Design

### Breakpoints
- **Mobile**: 375px - 414px (iPhone)
- **Tablet**: 768px - 1024px (iPad)
- **Desktop**: 1024px+ (Web version)

### Adaptive Layouts
- **Ring sizing**: Responsive to screen width
- **Typography**: Scales appropriately
- **Spacing**: Maintains proportions across devices
- **Touch targets**: Optimized for finger navigation

## Implementation Guidelines

### React Native Components
- **NativeWind** for styling consistency
- **React Native SVG** for ring visualizations
- **Expo Linear Gradient** for background effects
- **Zustand** for state management

### Code Organization
- **Component limits**: Maximum 200 lines
- **File limits**: Maximum 500 lines
- **Single responsibility**: One purpose per component
- **TypeScript**: Comprehensive type safety

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: MaxPulse Development Team