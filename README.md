# MaxPulse - Personalized Health Transformation App

A comprehensive React Native health transformation platform that combines **Steps**, **Hydration**, **Sleep**, and **Mood Tracking** with an **AI Coach** and **Wellbeing Dashboard** for personalized 90-day health journeys. Features Cal AI-inspired minimalist design with card-based ring visualizations. Exclusive to Maximum 88 verified customers and distributors.

![MaxPulse App](https://img.shields.io/badge/Platform-React%20Native-blue) ![Expo SDK](https://img.shields.io/badge/Expo%20SDK-54-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Supabase](https://img.shields.io/badge/Backend-Supabase-green) ![Version](https://img.shields.io/badge/Version-2.0.0-green) ![MVP1](https://img.shields.io/badge/MVP1-Release%20Ready-orange)

## 🎯 Version 2.0.0 - MVP1 Release

**Release Date:** December 6, 2025  
**Testing Period:** November 22 - December 5, 2025 (2 weeks)  
**Status:** MVP1 Release Ready ✅  
**Launch:** December 6, 2025 🚀

### 🚀 MVP1 Release Highlights (v2.0.0):
- ✅ **Exclusive Sign-In Experience** - Maximum 88 family only, elegant branding
- ✅ **Optimized Sign-In Performance** - 4s → <1s loading time (75% improvement)
- ✅ **Smooth Mood Check-In UX** - Keyboard handling, auto-scroll, professional feel
- ✅ **Life Score Assessment Integration** - Cumulative scoring from all weekly assessments
- ✅ **Real-time Step Tracking** - iOS CoreMotion with accurate counting
- ✅ **Elegant UI Branding** - Consistent design across all pages (Rewards, Assessment, Profile, Life Score)
- ✅ **Performance Optimized** - Caching, deduplication, parallel operations
- ✅ **Production Ready** - All critical bugs fixed, tested, and validated

### Key Features in v1.8.0:
- ✅ **Life Score Assessment Integration** - Cumulative scoring from all weekly assessments
- ✅ **5-Component Weighted Model** - 20% past assessments + 80% current week (20% per pillar)
- ✅ **Performance Optimized** - 5-minute cache prevents excessive DB queries
- ✅ **Event-Based Updates** - Only refreshes on meaningful events (not every render)
- ✅ **Critical Bug Fix** - Fixed 10x inflated scores (348 → 32 for low-performing users)

### MVP1 Performance Improvements:
- ✅ **Sign-In Optimization** - 75% faster loading (4s → <1s)
  - Life Score caching with AsyncStorage (5-min TTL)
  - Parallelized auth operations (Promise.all)
  - Once-per-day checks (mood backfill, daily metrics audit)
  - Deferred step tracking (3s delay)
  - Target loading deduplication (3s debounce)
  
- ✅ **Mood Check-In Keyboard UX** - Professional, smooth experience
  - Auto-scroll to input when focused
  - Keyboard dismisses on drag
  - Platform-specific KeyboardAvoidingView
  - Proper z-index handling
  
- ✅ **UI Consistency** - Elegant branding across all pages
  - Reduced font sizes, compact spacing
  - Consistent icon sizes and border radius
  - Understated, professional design
  - Rewards "Coming Soon" UI

### Critical Bugs Fixed:
- Sign-in flow performance (4s → <1s)
- Mood check-in keyboard covering input field
- Sign-up flow removed (handled in separate repo)
- Steps showing 0 after date navigation (DB: 504, UI: 0)
- Today's date invisible when viewing other dates
- Step percentage showing 0% instead of actual progress
- AsyncStorage overwriting live step data

## 🚀 Features

### 🔐 **Authentication & Onboarding**
- **Email Sign-In**: Secure authentication for Maximum 88 verified customers and distributors only
- **Profile Management**: Access personalized health profiles with individualized targets
- **Supabase Authentication**: Secure email/password auth with Row Level Security

### 📊 **Health Tracking**
- **Real-time Step Tracking**: Automatic pedometer integration with device sensors
- **Hydration Logging**: One-tap water intake tracking with visual feedback
- **Sleep Monitoring**: Manual sleep hour entry with Life Score integration
- **Mood Check-ins**: Emotional wellness tracking with 5-point scale and journaling

### 🎯 **Health Visualization**
- **Card-Based Ring Layout**: Four separate ring cards in Cal AI minimalist style
  - **Landscape Steps Card**: Large ring with label left, percentage display, and optimized sizing
  - **Three Core Habit Cards**: Hydration, Sleep, and Mood in a horizontal row with compact rings
- **Assessment-Aware Life Score**: Cumulative scoring from all weekly assessments
  - **5-Component Model**: 20% past assessments average + 80% current week (20% per pillar: steps, water, sleep, mood)
  - **Week 1 Fallback**: 4-pillar model (25% each) when no past assessments exist
  - **Performance Optimized**: 5-minute cache prevents excessive DB queries
- **Real-time Updates**: Instant recalculation when any metric changes during the week
- **Cal AI Design System**: Beige background, soft pastels, rounded cards with subtle shadows, light typography

### 🤖 **AI Coach**
- **Natural Language Chat**: Describe symptoms, ask questions, share feelings
- **Contextual Responses**: AI analyzes current health metrics for personalized advice
- **Wellness Checks**: Structured mood, energy, and stress assessments
- **Quick Actions**: Pre-defined actions for common health tasks
- **Symptom Sharing**: Natural language symptom processing with health insights

### 📈 **Wellbeing Dashboard**
- **Comprehensive Breakdown**: Battery gauge visualization with contribution bars
- **Daily Insights**: AI-generated suggestions based on current performance
- **Trends & History**: 7-day and 30-day Life Score trend visualization
- **Module Navigation**: Direct links to improve specific health areas

### 🏆 **Rewards & Gamification**
- **Points System**: Earn points for consistent healthy behaviors (steps, hydration, sleep)
- **Animated Progress Rings**: Visual feedback with mini rings for each metric
- **Streak Tracking**: Maintain streaks for bonus rewards with milestone progress
- **Badge System**: Achievement unlocking with vector icons and categories
- **Partner Rewards**: Starbucks integration with redeemable points
- **Weekly Progress**: Animated hero card showing total points and weekly completion
- **Today's Earnings**: 2x2 grid displaying daily point breakdown
- **Performance Optimized**: React.memo, GPU acceleration for smooth animations

## 🛠 Tech Stack

### **Frontend**
- **React Native** with Expo SDK 54
- **TypeScript** for type safety and better development experience
- **NativeWind** (Tailwind CSS for React Native) for styling
- **React Native SVG** for custom graphics and ring visualizations
- **Zustand** for lightweight state management
- **Expo Linear Gradient** for beautiful background effects

### **Backend & Services**
- **Supabase** for authentication, database, and real-time features
- **PostgreSQL** with Row Level Security (RLS) policies
- **Environment Variables** for secure configuration management
- **AsyncStorage** for local data persistence (Expo Go compatible)

### **Health Integrations**
- **iOS**: Core Motion pedometer, HealthKit integration
- **Android**: Activity Recognition API, Google Fit integration
- **Permissions**: Graceful handling with fallback options
- **Real-time Sync**: Background health data synchronization

### **AI & Intelligence**
- **AI Coach Service**: Natural language health conversation processing
- **Wellness Analysis**: Mood, energy, and stress level assessment
- **Contextual Insights**: Health correlation and recommendation engine
- **Symptom Processing**: Natural language symptom sharing and analysis

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **Expo CLI**: `npm install -g @expo/cli`
- **iOS Simulator** (Mac) or **Android Emulator**
- **Supabase Account** with project credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KitchAIv1/maxpulse-app.git
   cd maxpulse-app
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables:**
   ```bash
   # Create .env file with your Supabase credentials
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Run on device/simulator:**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device testing

## 📁 Project Structure

```
maxpulse-app/
├── App.tsx                     # Main app component with MaxPulse branding
├── src/
│   ├── assets/                # Static assets
│   │   └── images/            # Logo and image files (ax.png)
│   ├── components/             # Reusable UI components
│   │   ├── ui/                # Basic UI atoms (Badge, Bar)
│   │   ├── cards/             # KPICard components
│   │   ├── rings/             # Cal AI Ring components
│   │   │   ├── CalAiRing.tsx  # Single ring with light gray track and progress arc
│   │   │   └── CalAiTriRings.tsx # Four-ring layout (Steps + 3 core habits)
│   │   ├── calendar/          # Calendar components
│   │   │   └── CalendarBar.tsx # 7-day week selector
│   │   ├── wellbeing/         # Wellbeing Dashboard components
│   │   ├── coach/             # AI Coach chat interface
│   │   ├── mood/              # Mood check-in components (MoodRing, MoodSelector, etc.)
│   │   ├── rewards/           # Rewards & gamification components
│   │   │   ├── RewardsHeroCard.tsx # Total points with animated ring
│   │   │   ├── EarningsRingCard.tsx # Individual metric earning cards
│   │   │   ├── TodayEarningsGrid.tsx # 2x2 grid for daily earnings
│   │   │   ├── StarbucksRewardCard.tsx # Partnership reward card
│   │   │   ├── StreakVisualization.tsx # Streak tracking with milestones
│   │   │   └── AchievementBadges.tsx # Badge system with progress rings
│   │   ├── auth/              # Authentication components
│   │   ├── BottomNavigation.tsx # Cal AI styled bottom nav with Ionicons
│   │   └── AppWithAuth.tsx    # Authentication wrapper with V2 Engine
│   ├── screens/               # Screen components
│   │   ├── auth/              # Authentication screens
│   │   ├── ProfileScreen.tsx  # User profile and data verification
│   │   └── RewardsScreen.tsx  # Rewards and gamification
│   ├── stores/                # Zustand state management
│   │   ├── appStore.ts        # Global app state with V2 Engine integration
│   │   └── stepTrackingStore.ts # Step tracking state
│   ├── services/              # API services and business logic
│   │   ├── supabase.ts        # Supabase client and services
│   │   ├── StepTrackingService.ts # Step tracking logic
│   │   ├── HealthDataService.ts # Daily metrics and health data CRUD
│   │   ├── OfflineQueueService.ts # Offline-first data queue
│   │   ├── SyncManager.ts     # Background data synchronization
│   │   ├── TargetManager.ts   # Personalized target extraction
│   │   ├── V2EngineConnector.ts # V2 transformation roadmap connector
│   │   ├── AppStoreActions.ts # App store business logic
│   │   ├── DatabaseInitializer.ts # User data initialization
│   │   ├── HealthPermissionsManager.ts # Health permissions
│   │   └── AICoachService.ts  # AI Coach logic
│   ├── types/                 # TypeScript type definitions
│   │   ├── index.ts           # Core types
│   │   ├── health.ts          # Health tracking types
│   │   ├── activation.ts      # (Deprecated - No longer used in MVP1)
│   │   ├── sync.ts            # Sync operation types
│   │   ├── wellbeing.ts       # Wellbeing Dashboard types
│   │   ├── coach.ts           # AI Coach types
│   │   └── moodCheckIn.ts     # Mood tracking types
│   └── utils/                 # Utility functions
│       ├── index.ts           # Core algorithms and helpers
│       ├── theme.ts           # Cal AI design system theme
│       └── calAiStyles.ts     # Reusable Cal AI card styles
├── docs/                      # Project documentation
│   ├── PRD.md                 # Product Requirements Document
│   └── ui/ux.md              # UI/UX Guidelines
├── supabase_schema.sql        # Database schema definition
└── PROJECT_STATUS.md          # Development status and resume guide
```

## 🔧 Configuration

### Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema:**
   ```sql
   -- Execute the contents of supabase_schema.sql in your Supabase SQL Editor
   ```

3. **Configure Row Level Security (RLS):**
   - Enable RLS on all user tables
   - Set up policies for `user_id = auth.uid()`

4. **Add environment variables:**
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Health Permissions

#### iOS (Info.plist)
```xml
<key>NSMotionUsageDescription</key>
<string>MaxPulse uses motion data to track your daily steps and activity.</string>
<key>NSHealthShareUsageDescription</key>
<string>MaxPulse reads health data to provide personalized insights.</string>
```

#### Android (app.json)
```json
{
  "permissions": [
    "ACTIVITY_RECOGNITION",
    "com.google.android.gms.permission.ACTIVITY_RECOGNITION"
  ]
}
```

## 🎯 Key Components

### Cal AI Ring Visualization
Modern card-based ring layout with four separate tracking components:

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

#### Ring Design Specifications
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

### Life Score Algorithm

**Assessment-Aware Cumulative Scoring** (Week 2+):
```typescript
// 5-component blended model: 20% past assessments + 80% current week
const pastAvgDecimal = pastAssessmentsAvg / 100; // Convert percentage to decimal
const currentWeek = (stepsPct * 0.2) + (waterPct * 0.2) + 
                    (sleepPct * 0.2) + (moodPct * 0.2);
const lifeScore = (pastAvgDecimal * 0.2 + currentWeek) * 100;
```

**Week 1 Fallback** (No past assessments):
```typescript
// 4-factor model: Steps, Hydration, Sleep, Mood Check-ins (25% each)
const lifeScore = ((stepsPct * 0.25) + (waterPct * 0.25) + 
                    (sleepPct * 0.25) + (moodCheckInPct * 0.25)) * 100;
```

### MaxPulse Header
- **Logo**: 34x34px MaxPulse logo on the left
- **App Name**: "MaxPulse" at 30.5px, weight 500
- **Rewards**: Red (#FF0000) points display on the right

## 🎨 Cal AI Design System

MaxPulse follows the Cal AI design philosophy for a clean, minimal, and approachable health app experience.

### Color Palette
```typescript
{
  background: '#F5F5DC',      // Beige background for calm feel
  cardBackground: '#FFFFFF',   // Pure white cards
  textPrimary: '#2C2C2C',     // Dark gray for main text
  textSecondary: '#8E8E8E',   // Medium gray for secondary text
  primary: '#FF6B6B',         // Soft red for accents
  hydration: '#D4E8FF',       // Light blue for hydration
  sleep: '#E5D9FF',           // Light purple for sleep
  protein: '#FFE5E5',         // Light pink for mood
  warning: '#FFA07A',         // Light orange for warnings
  success: '#90EE90',         // Light green for success
}
```

### Typography Scale
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

// Font Weights
{
  light: '300',     // Subtle text
  regular: '400',   // Body text
  medium: '500',    // Semi-emphasis
  semibold: '600',  // Strong emphasis
  bold: '700',      // Highest emphasis
}
```

### Spacing System
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

### Border Radius
```typescript
{
  sm: 8,      // Small elements
  md: 12,     // Medium cards
  lg: 16,     // Large cards
  xl: 20,     // Extra large containers
  full: 9999, // Fully rounded (pills, circles)
}
```

### Shadows
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

### Component Patterns

#### Cards
```typescript
calAiCard.base = {
  backgroundColor: theme.colors.cardBackground,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.base,
  ...theme.shadows.medium,
}
```

#### Typography
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

### AI Coach Features
- **Natural Language Processing**: Understand user health conversations
- **Contextual Health Analysis**: Correlate symptoms with current metrics
- **Wellness Checks**: Structured mood, energy, and stress assessments
- **Quick Actions**: Instant access to common health tasks

## 📊 Database Schema

### Core Tables
- **`app_user_profiles`**: MaxPulse app user profiles and preferences with personalized targets and V2 Engine data
  - Contains `onboarding_data` JSON with `v2Analysis.personalizedTargets` and `transformationRoadmap` (for existing users migrated from activation codes)
- **`daily_metrics`**: Daily aggregated health data with auto-calculated `life_score` (generated column)
- **`mood_checkins`**: Emotional wellness tracking data
- **`plan_progress`**: 90-day transformation plan tracking with weekly milestone data

### Health Data
- **`hydration_logs`**: Individual hydration entries with timestamps
- **`sleep_sessions`**: Sleep tracking data with session durations
- **`pedometer_snapshots`**: Step count snapshots with device sync
- **`rewards_ledger`**: Points and achievement tracking
- **`offline_queue`**: Offline-first operation queue for background sync

### V2 Engine Integration
The app uses the **V2 Engine Connector** to extract dynamic weekly targets from the 90-day transformation roadmap:

**Data Source**: The transformation roadmap is created by the MaxPulse Dashboard assessment flow and stored in user profiles:
```
app_user_profiles.onboarding_data.v2Analysis.transformationRoadmap
(or extracted from user's existing health assessment data)
```

**Target Extraction**:
```typescript
// V2EngineConnector extracts current week's targets from user's roadmap
const weeklyTargets = await V2EngineConnector.getCurrentWeekTargets(userId);
// Returns: { steps: 6250, waterOz: 51, sleepHr: 6.6, week: 1, phase: 1 }
// Based on plan_progress.current_week and stored transformation roadmap

// Targets are parsed from weeklyMilestones[].focus strings
// Example: "Sleep 6.6hrs + Drink 1.5L water daily" → { steps: 6250, waterOz: 51, sleepHr: 6.6 }
```

**Progression Notes**:
- Targets follow the **exact roadmap** from the user's personalized 90-day plan
- Phase transitions (e.g., Week 5) may show **intentional target adjustments** (quality over quantity)
- All targets are **verified** to match the stored roadmap data

**Key Services:**
- **`TargetManager`**: Single source of truth for user targets (V2 Engine → UI)
- **`V2EngineConnector`**: Extracts weekly progression from `v2Analysis.transformationRoadmap`
- **`LifeScoreCalculator`**: Assessment-aware Life Score calculation from cumulative weekly assessments
- **`HealthDataService`**: CRUD operations for daily metrics with RLS
- **`SyncManager`**: Background synchronization with offline queue support
- **`OfflineQueueService`**: Offline-first data persistence with AsyncStorage
- **`DatabaseInitializer`**: One-time user data setup on first login

### Life Score Assessment Integration
The Life Score now integrates with the **Weekly Assessment Engine** to provide cumulative scoring:

**Data Source**: Weekly assessments are stored in the `weekly_performance_history` table:
```
weekly_performance_history.overall_achievement_avg (0-100 percentage)
```

**Calculation Formula**:
```typescript
// Week 2+ (with past assessments):
const pastAvgDecimal = pastAssessmentsAvg / 100; // Convert to 0-1 range
const currentWeek = (stepsPct * 0.2) + (waterPct * 0.2) + 
                    (sleepPct * 0.2) + (moodPct * 0.2);
const lifeScore = (pastAvgDecimal * 0.2 + currentWeek) * 100;

// Week 1 (no past assessments):
const lifeScore = ((stepsPct * 0.25) + (waterPct * 0.25) + 
                    (sleepPct * 0.25) + (moodPct * 0.25)) * 100;
```

**Update Triggers**:
- App launch (once per session)
- Assessment completion (once per week on Sunday)
- Date change (once per day at midnight)
- Manual refresh (user-initiated)

**Performance Optimizations**:
- 5-minute in-memory cache (prevents redundant DB queries)
- Event-based updates only (NOT on every render)
- Max 12 records query (entire 90-day program)
- Cache hit: <1ms, Cache miss: <150ms

## 🧪 Development

### Mock Data
The app includes comprehensive mock data for development:
- Simulated step tracking for Expo Go compatibility
- Mock health permissions and sensor data
- Mock authentication for development testing

### Testing
```bash
# Type checking
npm run tsc

# Linting
npm run lint

# Start with cache clearing
npm start --clear
```

### Building
```bash
# Development build
expo build

# Production build
expo build --release-channel production
```

## 🔒 Security & Privacy

- **Row Level Security (RLS)** on all user data tables
- **Environment variables** for sensitive configuration
- **Secure token storage** using Expo SecureStore
- **Health data encryption** and secure transmission
- **Clear privacy policies** for health data usage

## 📱 Platform Support

### iOS
- **Minimum Version**: iOS 13.0+
- **Core Motion**: Real-time step tracking
- **HealthKit**: Sleep and hydration data integration
- **Haptic Feedback**: Goal completion and interaction feedback

### Android
- **Minimum Version**: Android 8.0+ (API 26)
- **Activity Recognition**: Step counting and activity detection
- **Google Fit**: Health data integration
- **Material Design**: Native Android UI patterns

## 🚀 Deployment

### Expo Application Services (EAS)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build
eas build:configure

# Build for app stores
eas build --platform all
```

### Over-the-Air Updates
```bash
# Publish update
eas update --branch production --message "Feature update"
```

## 🤝 Contributing

1. **Follow the existing code structure** and architectural patterns
2. **Maintain TypeScript types** for all new features
3. **Follow the `.cursorrules`** for code organization and file size limits
4. **Test on both iOS and Android** platforms
5. **Update documentation** for new features

### Code Style
- **File Size Limit**: Maximum 500 lines per file
- **Component Size**: React components under 200 lines
- **Function Size**: Functions under 30-40 lines
- **Single Responsibility**: Each file/component does one thing only

## 📚 Documentation

### 📖 **Complete Documentation**
Visit the **[docs/](docs/)** directory for comprehensive documentation:

- **[Documentation Index](docs/README.md)** - Complete documentation overview
- **[Product Requirements](docs/PRD.md)** - Full product specification
- **[Technical Docs](docs/technical/)** - Implementation details and architecture
- **[User Guides](docs/user-guides/)** - Setup and usage guides *(coming soon)*
- **[API Documentation](docs/api/)** - API reference and integration guides *(coming soon)*

### 🔧 **For Developers**
- **[Project Status](docs/technical/PROJECT_STATUS.md)** - Current development state
- **[Cursor AI Rules](docs/technical/CURSOR_AI_RULES.md)** - Development guidelines
- **[Database Schema](docs/technical/supabase_schema.sql)** - Complete database structure
- **[Authentication System](docs/technical/AUTH_UI_OVERHAUL.md)** - Sign-in flow (Activation Code System deprecated in MVP1)
- **[AI Coach System](docs/technical/AI_COACH_WELLBEING_SYSTEM.md)** - AI features
- **[Rewards UI Updates](docs/technical/ui/REWARDS_UI_UPDATES.md)** - Rewards redesign documentation

### 📋 **Project Information**
- **[Changelog](CHANGELOG.md)** - Version history and changes
- **[Contributing Guidelines](docs/technical/CURSOR_AI_RULES.md)** - Code standards and practices

## 📄 License

This project is private and proprietary. All rights reserved.

## 🆘 Support

For technical support or questions:
- **GitHub Issues**: [Create an issue](https://github.com/KitchAIv1/maxpulse-app/issues)
- **Documentation**: Check the **[docs/](docs/)** directory for detailed guides
- **Technical Questions**: Review **[technical documentation](docs/technical/)**
- **Setup Issues**: See **[user guides](docs/user-guides/)** *(coming soon)*

---

**MaxPulse** - Transforming health through personalized, data-driven wellness journeys. 🚀💪