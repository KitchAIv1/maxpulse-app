# MaxPulse - Personalized Health Transformation App

A comprehensive React Native health transformation platform that combines **Steps**, **Hydration**, **Sleep**, and **Mood Tracking** with an **AI Coach**, **Wellbeing Dashboard**, and **Activation Code System** for personalized 90-day health journeys.

![MaxPulse App](https://img.shields.io/badge/Platform-React%20Native-blue) ![Expo SDK](https://img.shields.io/badge/Expo%20SDK-54-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Supabase](https://img.shields.io/badge/Backend-Supabase-green)

## 🚀 Features

### 🔐 **Authentication & Onboarding**
- **Activation Code System**: Seamless onboarding with pre-configured personalized targets
- **Profile Confirmation**: Review and edit assessment-derived profile data
- **Supabase Authentication**: Secure email/password auth with Row Level Security

### 📊 **Health Tracking**
- **Real-time Step Tracking**: Automatic pedometer integration with device sensors
- **Hydration Logging**: One-tap water intake tracking with visual feedback
- **Sleep Monitoring**: Manual sleep hour entry with Life Score integration
- **Mood Check-ins**: Emotional wellness tracking with 5-point scale and journaling

### 🎯 **Life Score Visualization**
- **TriRings Display**: Three concentric rings showing Steps, Hydration, and Sleep progress
- **4-Factor Life Score**: Combines physical metrics (75%) with mood check-in frequency (25%)
- **Real-time Updates**: Instant recalculation when any metric changes
- **Glassmorphism UI**: Modern design with deep red gradients and clean typography

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
- **Points System**: Earn points for consistent healthy behaviors
- **Streak Tracking**: Maintain streaks for bonus rewards
- **Badge System**: Achievement unlocking for milestones
- **Progress Visualization**: Clear progress indicators and celebrations

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
├── App.tsx                     # Main app component with authentication wrapper
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── ui/                # Basic UI atoms (Badge, Bar)
│   │   ├── cards/             # KPICard components
│   │   ├── rings/             # TriRings visualization
│   │   ├── wellbeing/         # Wellbeing Dashboard components
│   │   ├── coach/             # AI Coach chat interface
│   │   ├── mood/              # Mood check-in components
│   │   ├── auth/              # Authentication components
│   │   └── AppWithAuth.tsx    # Authentication wrapper
│   ├── screens/               # Screen components
│   │   ├── auth/              # Authentication screens
│   │   └── RewardsScreen.tsx  # Rewards and gamification
│   ├── stores/                # Zustand state management
│   │   ├── appStore.ts        # Global app state
│   │   └── stepTrackingStore.ts # Step tracking state
│   ├── services/              # API services and business logic
│   │   ├── supabase.ts        # Supabase client and services
│   │   ├── StepTrackingService.ts # Step tracking logic
│   │   ├── HealthPermissionsManager.ts # Health permissions
│   │   └── AICoachService.ts  # AI Coach logic
│   ├── types/                 # TypeScript type definitions
│   │   ├── index.ts           # Core types
│   │   ├── health.ts          # Health tracking types
│   │   ├── activation.ts      # Activation code types
│   │   ├── wellbeing.ts       # Wellbeing Dashboard types
│   │   ├── coach.ts           # AI Coach types
│   │   └── moodCheckIn.ts     # Mood tracking types
│   └── utils/                 # Utility functions
│       └── index.ts           # Core algorithms and helpers
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

### TriRings Visualization
The signature three-ring health visualization:
- **Outer Ring (White)**: Steps progress with dynamic goal achievement
- **Middle Ring (Green)**: Hydration progress with real-time updates
- **Inner Ring (Blue)**: Sleep progress with target visualization
- **Center**: Tappable Life Score (0-100) that opens Wellbeing Dashboard

### Life Score Algorithm
```typescript
// 4-factor model: Steps, Hydration, Sleep, Mood Check-ins
const lifeScore = (stepsPct * 0.25) + (waterPct * 0.25) + 
                  (sleepPct * 0.25) + (moodCheckInPct * 0.25);
```

### AI Coach Features
- **Natural Language Processing**: Understand user health conversations
- **Contextual Health Analysis**: Correlate symptoms with current metrics
- **Wellness Checks**: Structured mood, energy, and stress assessments
- **Quick Actions**: Instant access to common health tasks

## 📊 Database Schema

### Core Tables
- **`activation_codes`**: Pre-configured user profiles with personalized targets
- **`app_user_profiles`**: MaxPulse app user profiles and preferences
- **`daily_metrics`**: Daily aggregated health data
- **`mood_checkins`**: Emotional wellness tracking data
- **`plan_progress`**: 90-day transformation plan tracking

### Health Data
- **`hydration_logs`**: Individual hydration entries
- **`sleep_sessions`**: Sleep tracking data
- **`pedometer_snapshots`**: Step count snapshots
- **`rewards_ledger`**: Points and achievement tracking

## 🧪 Development

### Mock Data
The app includes comprehensive mock data for development:
- Simulated step tracking for Expo Go compatibility
- Mock health permissions and sensor data
- Sample activation codes and user profiles

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
- **[Activation System](docs/technical/ACTIVATION_CODE_SYSTEM.md)** - Authentication flow
- **[AI Coach System](docs/technical/AI_COACH_WELLBEING_SYSTEM.md)** - AI features

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