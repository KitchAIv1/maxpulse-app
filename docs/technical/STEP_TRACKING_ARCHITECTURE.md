# Step Tracking Architecture

## Overview

The step tracking system is designed to work automatically in the background, similar to modern fitness trackers like Apple Health, Google Fit, and Fitbit. Users don't need to manually start or stop tracking - it happens passively once they sign in and grant permissions.

## Architecture Principles

### 1. **Automatic Background Tracking**
- Step tracking starts automatically after user sign-in
- No manual "Start Tracking" button required
- Runs continuously in the background using device sensors
- Survives app restarts and device reboots

### 2. **Passive Data Collection**
- Uses native device APIs (CoreMotion on iOS, Step Counter on Android)
- Minimal battery impact (leverages OS-level optimizations)
- Real-time updates every 5 seconds with motion activity filtering
- Automatic sync to database every 10 seconds
- Motion activity detection prevents false steps from hand movements

### 3. **Daily Reset Pattern**
- Steps reset to 0 at midnight (like other core habits)
- Automatic detection of new day
- Clears cached data and starts fresh
- Maintains historical data in database

## Recent Improvements (v1.4)

### Real-Time UI Updates
- **Issue**: Steps were tracked correctly but UI only updated when user stopped walking
- **Root Cause**: Motion activity filter was blocking legitimate step updates
- **Solution**: Trust CoreMotion's built-in accuracy, remove redundant motion filtering
- **Result**: Real-time step updates every 5 seconds while walking

### Motion Activity Filtering
- **Issue**: Hand-waving was being counted as steps (220 → 238 steps)
- **Solution**: Added MotionActivityManager to detect actual walking activity
- **Implementation**: Uses expo-sensors DeviceMotion to analyze acceleration patterns
- **Result**: Prevents false steps while preserving real walking steps

### Database Sync Reliability
- **Issue**: Steps visible in UI but not saved to database
- **Root Cause**: onStepUpdate callback bypassed handleStepUpdate method
- **Solution**: Fixed callback chain to ensure database sync is called
- **Result**: Steps properly synced to daily_metrics table every 10 seconds

## System Components

### Core Services

#### 1. **IOSPedometerService** (`src/services/IOSPedometerService.ts`)
- **Purpose**: iOS-specific step tracking using CoreMotion
- **Features**:
  - Automatic mode detection (HealthKit → CoreMotion → Manual)
  - Real-time step updates with motion activity filtering
  - Permission management
  - Fallback strategies
  - Motion activity detection to prevent false steps
- **Lifecycle**: Singleton, initialized once per app session

#### 2. **StepTrackingService** (`src/services/StepTrackingService.ts`)
- **Purpose**: Platform-agnostic step tracking orchestration
- **Features**:
  - Unified API for iOS and Android
  - Event-based architecture
  - Cache management
  - Daily reset handling
- **Lifecycle**: Singleton, wraps platform-specific services

#### 3. **StepSyncService** (`src/services/StepSyncService.ts`)
- **Purpose**: Database synchronization
- **Features**:
  - Throttled database writes (max 1 per 10 seconds)
  - Automatic sync on step updates
  - Daily metrics row management
  - Offline support
- **Lifecycle**: Singleton, handles all DB operations

### Integration Layer

#### 4. **StepTrackingManager** (`src/components/StepTrackingManager.tsx`)
- **Purpose**: React integration and lifecycle management
- **Features**:
  - Automatic initialization on sign-in
  - Permission requests
  - Daily reset detection
  - User ID management
- **Lifecycle**: React component, wraps app content

#### 5. **stepTrackingStore** (`src/stores/stepTrackingStore.ts`)
- **Purpose**: Zustand state management
- **Features**:
  - Step count state
  - Target management
  - Status tracking
  - React hooks
- **Lifecycle**: Global store, persists across renders

### Data Flow

```
Device Sensors (CoreMotion/Step Counter)
    ↓
IOSPedometerService (Platform-specific)
    ↓
StepTrackingService (Platform-agnostic)
    ↓
StepSyncService (Database sync)
    ↓
daily_metrics table (Supabase)
    ↓
appStore (Zustand)
    ↓
CalAiTriRings (UI Component)
```

## User Experience Flow

### First Launch
1. User signs in with activation code
2. App requests motion permissions (iOS) or activity recognition (Android)
3. User grants permissions
4. Step tracking starts automatically in background
5. Ring component displays current steps

### Daily Usage
1. User walks throughout the day
2. Steps update automatically every 5 seconds
3. Ring fills up as steps increase
4. Database syncs every 10 seconds
5. No user interaction required

### Midnight Rollover
1. App detects new day (00:00 local time)
2. Triggers `resetForNewDay()` in StepTrackingService
3. Clears cached step data
4. Creates new daily_metrics row
5. Steps start from 0 for new day

### App Restart
1. App loads cached step data from AsyncStorage
2. Displays last known step count immediately
3. Initializes step tracking services
4. Fetches latest data from database
5. Resumes real-time tracking

## Database Schema

### daily_metrics Table
```sql
CREATE TABLE daily_metrics (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  steps_target INTEGER NOT NULL,
  steps_actual INTEGER DEFAULT 0,
  water_oz_target INTEGER NOT NULL,
  water_oz_actual INTEGER DEFAULT 0,
  sleep_hr_target DECIMAL NOT NULL,
  sleep_hr_actual DECIMAL DEFAULT 0,
  mood_checkins_target INTEGER NOT NULL,
  mood_checkins_actual INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

### Step Data Storage
- **Primary**: `daily_metrics.steps_actual` (database)
- **Cache**: AsyncStorage key `steps_YYYY-MM-DD`
- **Memory**: `StepTrackingService.todayStepsCache`

## Permission Handling

### iOS (CoreMotion)
- **Permission**: Motion & Fitness
- **Request Time**: Automatic on first launch after sign-in
- **Fallback**: Manual entry mode if denied

### Android (Step Counter)
- **Permission**: Activity Recognition
- **Request Time**: Automatic on first launch after sign-in
- **Fallback**: Google Fit integration or manual entry

## Performance Optimizations

### 1. **Throttling**
- UI updates: Max 1 per second
- Database sync: Max 1 per 10 seconds
- Prevents excessive writes and renders

### 2. **Caching**
- AsyncStorage for persistence
- In-memory cache for fast access
- Reduces database queries

### 3. **Background Efficiency**
- Uses native OS APIs (low battery impact)
- Batch updates instead of individual writes
- Lazy initialization (only when needed)

## Error Handling

### Graceful Degradation
1. **Permission Denied**: Continue without step tracking, other features work
2. **Database Offline**: Use cached data, sync when online
3. **Sensor Unavailable**: Fall back to manual entry
4. **Service Crash**: Auto-restart on next app launch

### Error Recovery
- Automatic retry with exponential backoff
- Fallback to alternative data sources
- User-friendly error messages (no technical jargon)
- Silent failures for non-critical operations

## Testing Strategy

### Unit Tests
- Service initialization
- Permission handling
- Data synchronization
- Daily reset logic

### Integration Tests
- End-to-end step tracking flow
- Database sync verification
- Offline/online transitions
- Multi-day scenarios

### Manual Testing
- Walk with device and verify step count
- Test midnight rollover
- Test app restart with cached data
- Test permission denial scenarios

## Removed Components

### Temporary Test Components (Deleted)
- ~~`PedometerQuickTest.tsx`~~ - Was creating duplicate pedometer instances
- ~~`PedometerTestScreen.tsx`~~ - Development testing only

These components were causing:
- Duplicate service initialization
- Conflicting step updates
- Delayed UI updates
- Redundant permission requests

## Configuration

### StepTrackingService Config
```typescript
{
  liveUpdateInterval: 2000,        // 2 seconds
  backgroundSyncInterval: 300000,  // 5 minutes
  dailyCutoffHour: 22,            // 10 PM
  maxStepsPerDay: 100000,         // Anti-gaming limit
  minimumStepThreshold: 5,        // Ignore tiny movements
  confidenceThreshold: 0.7,       // Data quality threshold
  enableBackgroundTracking: true,
  enableLiveUpdates: true,
  historicalDataDays: 30,
}
```

### IOSPedometerService Config
```typescript
{
  enableHealthKit: true,
  enableCoreMotion: true,
  updateInterval: 5000,      // 5 seconds
  maxRetries: 3,
  fallbackTimeout: 10000,    // 10 seconds
}
```

## Best Practices

### 1. **Single Source of Truth**
- Database is the source of truth
- Cache is for performance only
- Always sync to database

### 2. **Fail Gracefully**
- Never block the app on step tracking failures
- Provide fallbacks for all critical paths
- Log errors but don't show alerts

### 3. **Respect User Privacy**
- Only request permissions when needed
- Explain why permissions are needed
- Allow app to work without step tracking

### 4. **Optimize for Battery**
- Use native APIs (not polling)
- Batch database writes
- Minimize background activity

## Future Enhancements

### Planned Features
1. **Historical Step Analysis**: Weekly/monthly trends
2. **Step Goals**: Adaptive targets based on history
3. **Achievements**: Badges for milestones
4. **Social Features**: Compare with friends
5. **Apple Watch Integration**: Sync with watchOS
6. **Google Fit Integration**: Sync with Android Wear

### Technical Improvements
1. **Background Fetch**: Update steps even when app is closed
2. **Push Notifications**: Daily step reminders
3. **Widget Support**: Home screen step counter
4. **Health Kit Sync**: Two-way sync with Apple Health
5. **ML Predictions**: Predict daily step count

## Troubleshooting

### Common Issues

#### Steps Not Updating
- Check permissions are granted
- Verify service is initialized
- Check database connectivity
- Look for errors in console

#### Steps Reset During Day
- Check daily reset logic
- Verify date calculation
- Check AsyncStorage keys
- Review cache invalidation

#### Delayed UI Updates
- Check throttling settings
- Verify event listeners
- Check React re-render logic
- Review state management

#### Database Sync Failures
- Check network connectivity
- Verify Supabase credentials
- Check RLS policies
- Review error logs

## Support

For issues or questions:
1. Check console logs for errors
2. Review this documentation
3. Check `docs/IOS_PEDOMETER_INTEGRATION.md`
4. Contact development team

## Version History

- **v1.2** (2025-10-23): **CRITICAL FIX** - Fixed database sync by ensuring `handleStepUpdate` is called in `onStepUpdate` callback
- **v1.1** (2025-10-23): Reduced polling interval from 30s to 5s for smoother UI updates
- **v1.0** (2025-10-23): Initial implementation with automatic tracking
- **v0.9** (2025-10-22): Added test components (later removed)
- **v0.8** (2025-10-21): Basic pedometer integration

