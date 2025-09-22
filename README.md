# TriHabit - Unified Health Habits App

A React Native app built with Expo that unifies **Steps (pedometer)**, **Hydration**, and **Sleep** tracking with an **AI Coach** and **Rewards** system.

## Features

- 🚶‍♂️ **Automatic Step Tracking** via device pedometer
- 💧 **Hydration Logging** with quick-add buttons
- 😴 **Sleep Tracking** with HealthKit/Google Fit integration
- 🎯 **Life Score** - unified health indicator
- 🤖 **AI Coach** - personalized next best actions
- 🏆 **Rewards System** - points, streaks, and badges
- 📊 **Diagnostics** - gaps, debt, and pace tracking

## Tech Stack

- **Frontend**: React Native with Expo
- **Styling**: NativeWind (Tailwind for React Native)
- **State Management**: Zustand
- **Backend**: Supabase (Auth, Database, RLS)
- **Health Integration**: HealthKit (iOS) / Google Fit (Android)
- **Graphics**: React Native SVG

## Quick Start

### Prerequisites

- Node.js 18+ 
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd MaxApp
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on device/simulator:**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI atoms (Badge, Bar)
│   ├── cards/          # Card components (KPICard)
│   └── rings/          # TriRings visualization
├── screens/            # Screen components (future)
├── stores/             # Zustand state management
├── services/           # API services (Supabase)
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and algorithms
```

## Key Components

### TriRings
The signature three-ring visualization showing:
- **Outer Ring**: Steps progress (white)
- **Middle Ring**: Hydration progress (lime)
- **Inner Ring**: Sleep progress (cyan)
- **Center**: Life Score (0-100)

### Life Score Algorithm
```typescript
// Weighted average: steps 33%, water 34%, sleep 33%
const score = steps * 0.33 + water * 0.34 + sleep * 0.33;
```

### Health Integrations

#### iOS (HealthKit)
- Automatic step counting via Core Motion
- Sleep data import from Health app
- Hydration data sync (if available)

#### Android (Google Fit)
- Step counting via Activity Recognition API
- Sleep and hydration data import

## Backend Setup

The app uses Supabase for backend services. You'll need to:

1. **Create a Supabase project**
2. **Set up the database schema** (see PRD for table definitions)
3. **Configure Row Level Security (RLS)**
4. **Add your credentials to `.env`**

### Database Tables
- `users` - User profiles
- `daily_metrics` - Daily aggregated data
- `hydration_logs` - Individual hydration entries
- `sleep_sessions` - Sleep tracking data
- `pedometer_snapshots` - Step count snapshots
- `rewards_ledger` - Points and rewards tracking
- `badges` & `user_badges` - Achievement system

## Development

### Mock Data
The app includes mock data for development. Real data integration requires:
- Health permissions setup
- Supabase backend configuration
- Device sensor integration

### Testing
```bash
# Run type checking
npm run tsc

# Run linting
npm run lint

# Run tests (when added)
npm test
```

### Building
```bash
# Development build
expo build

# Production build
expo build --release-channel production
```

## Permissions

### iOS (Info.plist)
- `NSMotionUsageDescription` - Step counting
- `NSHealthShareUsageDescription` - Health data access

### Android (app.json)
- `ACTIVITY_RECOGNITION` - Step counting
- Google Fit API access

## Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Follow the component patterns established
4. Test on both iOS and Android
5. Update documentation for new features

## License

Private project - All rights reserved.

---

Built with ❤️ for better health habits.
