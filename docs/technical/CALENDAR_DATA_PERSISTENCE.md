# Calendar & Data Persistence System

## 📅 Overview

The MaxPulse app implements a sophisticated calendar navigation system with offline-first data persistence, allowing users to view historical health data for the past 3 weeks while ensuring their current day progress is never lost.

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready

---

## 🎯 Core Features

### 1. **Calendar Navigation**
- **3-Week Historical View**: Users can navigate through the current week and 2 past weeks
- **Swipeable Interface**: Horizontal swipe gestures for intuitive week-to-week navigation
- **Visual Indicators**: Dots showing current week position (current/last week/2 weeks ago)
- **Date Selection**: Tap any past date to view historical data
- **Future Date Protection**: Prevents selection of future dates

### 2. **Offline-First Data Persistence**
- **AsyncStorage Priority**: Local device storage as primary data source
- **Database Sync**: Background synchronization with Supabase
- **Offline Queue**: Operations queued when offline, synced when online
- **Zero Data Loss**: User progress preserved across app restarts and navigation

### 3. **Historical Data Display**
- **Ring Visualization**: Progress rings animate smoothly when switching dates
- **Actual vs Zero Display**: Shows actual data if exists, zeros if no data for that date
- **Target Preservation**: Maintains correct weekly targets from V2 Engine
- **Disabled Actions**: Quick action buttons disabled when viewing past dates

---

## 🏗️ Architecture

### Component Hierarchy

```
App.tsx (Main Container)
├── CalendarBar (Date Navigation)
│   ├── ScrollView (Horizontal Pager)
│   │   ├── Week Container (3 weeks)
│   │   │   ├── Day Button (7 days × 3 weeks)
│   │   │   └── Visual States (today/selected/future/past)
│   │   └── Snap Intervals (screenWidth)
│   └── Week Indicators (Dots)
│
├── CalAiTriRings (Health Rings)
│   ├── LandscapeStepsCard
│   │   └── CalAiRing (Animated)
│   ├── SmallRingCard (Hydration)
│   │   └── CalAiRing (Animated)
│   ├── SmallRingCard (Sleep)
│   │   └── CalAiRing (Animated)
│   └── SmallRingCard (Mood)
│       └── CalAiRing (Animated)
│
└── Quick Actions (Conditional)
    ├── +8oz Water Button
    ├── +15m Sleep Button
    └── Mood Check-in Button
```

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    USER ACTION                          │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────▼───────────┐
        │  1. UI Update         │  ← Immediate (0ms)
        │     (Optimistic)      │
        └───────────┬───────────┘
                    │
        ┌───────────▼───────────┐
        │  2. AsyncStorage      │  ← Local (5ms)
        │     Save (Priority 1) │
        └───────────┬───────────┘
                    │
        ┌───────────▼───────────┐
        │  3. Database Queue    │  ← Background (200ms)
        │     (Priority 2)      │
        └───────────┬───────────┘
                    │
        ┌───────────▼───────────┐
        │  4. Offline Queue     │  ← If offline
        │     (Sync Later)      │
        └───────────────────────┘

ON APP RELOAD:
┌─────────────────────────────────────────────────────────┐
│  1. Check AsyncStorage (Source of Truth)               │
│  2. Restore currentState (steps, water, sleep, mood)   │
│  3. Load targets from Database (V2 Engine)             │
│  4. Render UI with restored data                       │
└─────────────────────────────────────────────────────────┘
```

---

## 💾 Data Persistence Strategy

### Priority System

#### **Priority 1: AsyncStorage (Offline-First)**
```typescript
// Storage Key Format: @todayState_YYYY-MM-DD
{
  steps: number,
  waterOz: number,
  sleepHr: number,
  moodCheckInFrequency: {
    total_checkins: number,
    target_checkins: number,
    current_streak: number,
    last_checkin: string | null
  }
}
```

**Characteristics:**
- ✅ Works offline
- ✅ Instant read/write (5ms)
- ✅ Survives app restart
- ✅ Device-specific
- ⚠️ Can be cleared by OS or user

#### **Priority 2: Database (Permanent Backup)**
```typescript
// Supabase daily_metrics table
{
  user_id: string,
  date: string, // YYYY-MM-DD
  steps_actual: number,
  steps_target: number,
  water_oz_actual: number,
  water_oz_target: number,
  sleep_hr_actual: number,
  sleep_hr_target: number,
  mood_checkins_actual: number,
  mood_checkins_target: number
}
```

**Characteristics:**
- ✅ Permanent storage
- ✅ Cross-device sync
- ✅ Backed up
- ⚠️ Requires internet
- ⚠️ Slower (200ms)

### Cache Layer

#### **LRU Cache (In-Memory)**
```typescript
// src/utils/dateMetricsCache.ts
class LRUCache {
  maxSize: 21,        // 21 days (3 weeks)
  ttl: 5 * 60 * 1000  // 5 minutes
}
```

**Purpose:**
- Reduce database queries for recently viewed dates
- Improve performance when switching between dates
- Automatic expiration after 5 minutes

**Benefits:**
- 🚀 Instant access to recently viewed dates
- 💰 Reduced database costs
- 📊 Request deduplication

---

## 🔄 State Management

### App Store (Zustand)

```typescript
// src/stores/appStore.ts
interface AppStore {
  // Current State
  currentState: {
    steps: number,
    waterOz: number,
    sleepHr: number
  },
  
  // Date Navigation
  selectedDate: string,        // YYYY-MM-DD
  isViewingPastDate: boolean,
  todayStateCache: {...} | null,
  
  // Actions
  setSelectedDate: (date: string) => Promise<void>,
  loadDateMetrics: (date: string) => Promise<void>,
  loadTodayData: () => Promise<void>,
  addHydration: (amount: number) => Promise<void>,
  updateSleep: (hours: number) => Promise<void>,
  updateSteps: (steps: number) => Promise<void>,
  addMoodCheckIn: (checkIn) => Promise<void>
}
```

### Key Behaviors

#### **Date Selection Flow**
```typescript
setSelectedDate(date: string) {
  1. Validate date is within 3-week range
  2. Check if already viewing this date (skip if yes)
  3. If switching from today → past:
     - Cache today's state (water, sleep, mood)
  4. If switching from past → today:
     - Restore from AsyncStorage (source of truth)
  5. Update selectedDate and isViewingPastDate
  6. Persist selected date to AsyncStorage
  7. Load metrics for selected date
}
```

#### **Today Data Restoration**
```typescript
loadTodayData() {
  1. Try to restore from AsyncStorage
     - Key: @todayState_YYYY-MM-DD
     - Restore: steps, water, sleep, mood
  2. Load targets from Database
     - V2 Engine weekly targets
     - Don't override restored currentState
  3. If no AsyncStorage data:
     - Use Database data for everything
     - Initialize with zeros if no data
}
```

#### **User Action Persistence**
```typescript
// Example: addHydration
addHydration(amount: number) {
  1. Update UI immediately (optimistic)
  2. Save to AsyncStorage (@todayState_YYYY-MM-DD)
  3. Invalidate cache for today
  4. Queue database sync (background)
  5. If offline: Add to OfflineQueue
}
```

---

## 📱 UI Components

### CalendarBar Component

**Location**: `src/components/calendar/CalendarBar.tsx`

**Responsibilities:**
- Render 7-day week view
- Handle horizontal swipe navigation
- Manage week indicators
- Disable future dates
- Emit date selection events

**Key Features:**
```typescript
// Swipe Navigation
- pagingEnabled: true
- snapToInterval: screenWidth
- snapToAlignment: "start"
- 3 weeks × screenWidth = 3 pages

// Visual States
- isToday: Current date highlighting
- isSelected: Active selection state
- isFuture: Disabled appearance
- isPast: Selectable past dates

// Positioning
- paddingHorizontal: 16px (matches app container)
- marginLeft: -0.25 day width (fine-tune alignment)
```

**Performance Optimizations:**
- ✅ React.memo for component memoization
- ✅ useMemo for week data generation
- ✅ useCallback for event handlers
- ✅ Throttled scroll events (16ms)

### CalAiRing Component

**Location**: `src/components/rings/CalAiRing.tsx`

**Responsibilities:**
- Render single progress ring
- Support animated percentages
- Cap completion at 100%
- Display center content

**Key Features:**
```typescript
// Ring Rendering
- Background track: #EDEDED (light gray)
- Progress arc: accentColor (default: black)
- strokeLinecap: "round"
- Starts at top, clockwise

// Animation Support
- Static percentage: number (0-1)
- Animated percentage: Animated.Value
- Interpolation: 0-1 → circumference-0
- Duration: 800ms smooth transition

// Completion Cap
- Math.min(1, percentage)
- Prevents overflow beyond 100%
- Keeps ring solid when exceeding target
```

### CalAiTriRings Component

**Location**: `src/components/rings/CalAiTriRings.tsx`

**Responsibilities:**
- Orchestrate 4 health rings layout
- Animate ring transitions
- Display current/target values
- Handle completion states

**Layout Structure:**
```
┌─────────────────────────────────────┐
│  Steps Card (Landscape)             │
│  ┌─────────┐  ┌──────────────┐     │
│  │  Steps  │  │  Ring        │     │
│  │  4,582  │  │  (Large)     │     │
│  │  73%    │  │              │     │
│  └─────────┘  └──────────────┘     │
└─────────────────────────────────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐
│Hydration │ │  Sleep   │ │   Mood   │
│   💧     │ │    😴    │ │    😊    │
│  Ring    │ │  Ring    │ │  Ring    │
│ (Small)  │ │ (Small)  │ │ (Small)  │
└──────────┘ └──────────┘ └──────────┘
```

**Animation System:**
```typescript
// Animated values for each metric
const [animatedStepsPct] = useState(new Animated.Value(stepsPct));
const [animatedWaterPct] = useState(new Animated.Value(waterPct));
const [animatedSleepPct] = useState(new Animated.Value(sleepPct));
const [animatedMoodPct] = useState(new Animated.Value(moodPct));

// Parallel animation on percentage change
Animated.parallel([
  Animated.timing(animatedStepsPct, {toValue: stepsPct, duration: 800}),
  Animated.timing(animatedWaterPct, {toValue: waterPct, duration: 800}),
  Animated.timing(animatedSleepPct, {toValue: sleepPct, duration: 800}),
  Animated.timing(animatedMoodPct, {toValue: moodPct, duration: 800}),
]).start();
```

---

## 🔧 Services & Utilities

### HealthDataService

**Location**: `src/services/HealthDataService.ts`

**New Methods:**
```typescript
// Fetch metrics for specific date
async getMetricsByDate(userId: string, date: string): Promise<DailyMetrics | null>

// Validate date is within 3-week range
isDateInValidRange(dateString: string): boolean {
  const today = new Date();
  const targetDate = new Date(dateString);
  const diffDays = (today - targetDate) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 21; // 3 weeks
}
```

### dateMetricsCache (LRU Cache)

**Location**: `src/utils/dateMetricsCache.ts`

**Implementation:**
```typescript
class LRUCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 21;  // 21 days
  private ttl = 5 * 60 * 1000;  // 5 minutes

  get(key: string): DailyMetrics | null | undefined {
    // Check if cached
    // Check TTL expiration
    // Move to front (LRU)
    // Return data
  }

  set(key: string, value: DailyMetrics | null): void {
    // Delete if exists (refresh)
    // Evict LRU if at maxSize
    // Add with timestamp
  }

  invalidate(key: string): void {
    // Remove specific entry
    // Used when data changes
  }
}

export const dateMetricsCache = new LRUCache(21, 5 * 60 * 1000);
```

**Usage:**
```typescript
// Check cache before database query
const cachedMetrics = dateMetricsCache.get(date);
if (cachedMetrics !== undefined) {
  return cachedMetrics; // Cache hit
}

// On database fetch
const metrics = await supabase.query(...);
dateMetricsCache.set(date, metrics);

// On user action (invalidate today's cache)
dateMetricsCache.invalidate(getTodayDate());
```

---

## 🎨 Design Specifications

### Calendar Styling

```typescript
// Container Alignment
paddingHorizontal: 16px  // Matches app content container
marginLeft: -(screenWidth / 7) * 0.25  // Fine-tune: 0.25 day left shift

// Day Button
flex: 1
minHeight: 56px
marginHorizontal: 2px
borderRadius: 16px

// Active Day
backgroundColor: #FFFFFF
shadow: subtle

// Date Circle
width: 32px
height: 32px
borderRadius: 16px
borderWidth: 1px
borderStyle: "dashed" (inactive) / "solid" (active)
borderColor: #E0E0E0 (inactive) / #000000 (active)

// Typography
dayLabel: 12px, weight: light, uppercase
dateText: 14px, weight: light
activeDateText: 14px, weight: regular, color: #000000

// Week Indicators
3 dots: 6px × 6px (inactive) / 8px × 8px (active)
color: #E0E0E0 (inactive) / #6B7280 (active)
gap: 4px
```

### Ring Styling

```typescript
// Ring Sizes
stepsRing: Math.min(screenWidth * 0.30, 120)
smallRings: Math.min(screenWidth * 0.22, 90)

// Ring Colors
background: #EDEDED
progress: accentColor
  - Steps: #FFFFFF
  - Hydration: #00FF88
  - Sleep: #3B82F6
  - Mood: #FFC9C9

// Ring Stroke
strokeWidth: 7px
strokeLinecap: "round"

// Completion Cap
percentage: Math.min(1, actualPercentage)
// Ensures rings stay solid at 100%, never gray
```

---

## 🧪 Testing Guidelines

### Manual Testing Checklist

#### **Calendar Navigation**
- [ ] Swipe left shows older weeks (reverse chronological)
- [ ] Swipe right shows newer weeks (up to current)
- [ ] Current week indicator dot is leftmost
- [ ] Tap past date switches to that date
- [ ] Future dates are disabled (grayed out)
- [ ] Sunday is fully visible on all weeks
- [ ] Calendar aligns with steps card container

#### **Data Persistence**
- [ ] Add water → Reload app → Water persists
- [ ] Add sleep → Reload app → Sleep persists
- [ ] Do mood check-in → Reload app → Mood persists
- [ ] Steps update → No unwanted persistence (auto-tracked)
- [ ] Navigate to past → Return to today → Progress preserved
- [ ] Offline mode → Add data → Come online → Syncs

#### **Ring Visualization**
- [ ] Rings animate smoothly when switching dates
- [ ] Rings show zeros for dates with no data
- [ ] Rings cap at 100% when exceeding target (stay solid)
- [ ] Ring colors remain vibrant, never gray at 100%+
- [ ] Percentage displays correctly (can show >100%)

#### **Quick Actions**
- [ ] Quick actions visible when viewing today
- [ ] Quick actions hidden when viewing past date
- [ ] Quick actions grayed when offline (optional)

### Edge Cases

#### **Date Handling**
- [ ] Timezone changes handled correctly
- [ ] Daylight saving time transitions
- [ ] Date boundary at midnight
- [ ] Week boundaries (Sunday → Monday)

#### **Data Integrity**
- [ ] AsyncStorage quota exceeded
- [ ] Database connection lost mid-sync
- [ ] Rapid date switching
- [ ] Concurrent updates to same date

#### **Performance**
- [ ] Smooth scrolling with 3 weeks loaded
- [ ] No lag when animating rings
- [ ] Quick app restart (<2s to restored state)
- [ ] Low memory usage (<50MB for calendar)

---

## 🐛 Troubleshooting

### Common Issues

#### **Issue: Data Lost on Reload**
**Symptoms**: Water/sleep resets to 0 after closing app

**Diagnosis:**
```typescript
// Check AsyncStorage
const state = await AsyncStorage.getItem('@todayState_2025-01-12');
console.log('Stored state:', state);

// Check if loadTodayData is called
console.log('loadTodayData called in AppWithAuth');
```

**Solutions:**
- Ensure `loadTodayData()` is called in `AppWithAuth.tsx`
- Verify AsyncStorage permissions
- Check date format matches (YYYY-MM-DD)
- Clear app data and test fresh install

#### **Issue: Calendar Misaligned**
**Symptoms**: Sunday cut off or weeks shifted

**Diagnosis:**
```typescript
// Check container width
console.log('Screen width:', screenWidth);
console.log('Week container width:', weekContainerWidth);
console.log('Padding:', paddingHorizontal);
```

**Solutions:**
- Verify `snapToAlignment: "start"`
- Check `paddingHorizontal: theme.spacing.base`
- Ensure `marginLeft: -(screenWidth / 7) * 0.25`
- Remove conflicting `contentContainerStyle`

#### **Issue: Rings Turn Gray at 100%**
**Symptoms**: Ring loses color when reaching target

**Diagnosis:**
```typescript
// Check percentage calculation
console.log('Water percentage:', currentState.waterOz / target.waterOz);
// If > 1.0, needs capping
```

**Solutions:**
- Add `Math.min(1, percentage)` in App.tsx
- Verify cap applied to all 4 rings
- Check CalAiRing component clamps properly

#### **Issue: Past Date Shows Today's Data**
**Symptoms**: Wrong data displayed for selected date

**Diagnosis:**
```typescript
// Check cache/restore logic
console.log('Selected date:', selectedDate);
console.log('Is viewing past:', isViewingPastDate);
console.log('Cache state:', todayStateCache);
```

**Solutions:**
- Verify `setSelectedDate` guard: `if (selectedDate === date) return`
- Check restore logic reads from AsyncStorage, not cache
- Clear `todayStateCache` after restoring

---

## 🚀 Performance Optimization

### Implemented Optimizations

#### **1. Component Memoization**
```typescript
// CalendarBar
export const CalendarBar = React.memo(CalendarBarComponent, (prev, next) => {
  return (
    prev.selectedDate === next.selectedDate &&
    prev.disabled === next.disabled &&
    prev.onDateSelect === next.onDateSelect
  );
});
```

#### **2. Data Memoization**
```typescript
// Week data generation
const threeWeeks = useMemo(() => {
  // Generate 3 weeks of data
  return weeks;
}, [selectedDate]);
```

#### **3. Callback Memoization**
```typescript
// Event handlers
const handleDayPress = useCallback((dayItem: DayItem) => {
  if (dayItem.isFuture || disabled) return;
  onDateSelect(dayItem.fullDate);
}, [disabled, onDateSelect]);
```

#### **4. Request Deduplication**
```typescript
// Prevent concurrent queries for same date
const pendingRequests = new Map<string, Promise<void>>();

if (pendingRequests.has(date)) {
  return pendingRequests.get(date); // Wait for existing request
}

const promise = fetchDateMetrics(date);
pendingRequests.set(date, promise);
return promise;
```

#### **5. LRU Cache**
- 21-day capacity (3 weeks)
- 5-minute TTL
- Automatic eviction
- Invalidation on user actions

### Performance Metrics

**Target Performance:**
- Calendar scroll: 60 FPS
- Ring animation: 60 FPS
- Date switch: <100ms
- App reload: <2s to restored state
- Database query: <200ms (cached: <10ms)

**Memory Usage:**
- Calendar: ~20MB
- Cache: ~5MB
- Total overhead: ~30MB

---

## 🔐 Security Considerations

### Data Privacy

#### **AsyncStorage**
- **Sensitivity**: Medium (health data)
- **Encryption**: OS-level (iOS Keychain, Android KeyStore)
- **Clearable**: Yes (by user or OS)
- **Backup**: Excluded from cloud backups (configurable)

#### **Database**
- **Sensitivity**: High (PII + health data)
- **Encryption**: At rest + in transit (TLS)
- **RLS**: Row-Level Security enforced
- **Audit**: All writes logged

### Best Practices

#### **AsyncStorage Keys**
```typescript
// Date-specific keys (auto-cleanup)
@todayState_YYYY-MM-DD

// Benefit: Old dates naturally expire
// Risk: Need to handle cleanup after 3 weeks
```

#### **Data Validation**
```typescript
// Always validate date format
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!dateRegex.test(dateString)) throw new Error('Invalid date');

// Validate date range
if (!isDateInValidRange(dateString)) throw new Error('Date out of range');
```

#### **Error Handling**
```typescript
// Never crash on persistence failure
try {
  await AsyncStorage.setItem(key, value);
} catch (error) {
  console.warn('Failed to persist:', error);
  // UI continues working, data queued for database
}
```

---

## 📚 API Reference

### AppStore Methods

#### `setSelectedDate(date: string): Promise<void>`
Navigates to a specific date, loading its metrics and updating UI.

**Parameters:**
- `date`: YYYY-MM-DD format string

**Behavior:**
- Validates date is within 3-week range
- Caches today's state if switching from today to past
- Restores from AsyncStorage if returning to today
- Loads metrics for selected date from cache/database
- Updates `selectedDate` and `isViewingPastDate`
- Persists selection to AsyncStorage

**Example:**
```typescript
await setSelectedDate('2025-01-10');
```

#### `loadDateMetrics(date: string): Promise<void>`
Loads health metrics for a specific date from cache or database.

**Parameters:**
- `date`: YYYY-MM-DD format string

**Behavior:**
- Checks LRU cache first
- Deduplicates concurrent requests
- Queries database if cache miss
- Updates cache with result
- Sets currentState, targets, moodCheckInFrequency
- Shows zeros if no data exists

**Example:**
```typescript
await loadDateMetrics('2025-01-10');
```

#### `loadTodayData(): Promise<void>`
Restores today's persisted state from AsyncStorage and loads targets.

**Behavior:**
- Reads from AsyncStorage: `@todayState_YYYY-MM-DD`
- Restores: steps, waterOz, sleepHr, moodCheckInFrequency
- Loads targets from database (V2 Engine)
- If no AsyncStorage: Uses database data
- If no data at all: Initializes with zeros

**Example:**
```typescript
await loadTodayData(); // Called in AppWithAuth on startup
```

#### `addHydration(amount: number): Promise<void>`
Adds water intake and persists to AsyncStorage + database.

**Parameters:**
- `amount`: Ounces of water (typically 8)

**Behavior:**
- Updates UI immediately (optimistic)
- Increments currentState.waterOz
- Saves to AsyncStorage with all current state
- Invalidates today's cache
- Queues database sync (background)
- If offline: Adds to OfflineQueue

**Example:**
```typescript
await addHydration(8); // +8oz water
```

#### `updateSleep(hours: number): Promise<void>`
Updates sleep hours and persists to AsyncStorage + database.

**Parameters:**
- `hours`: Total sleep hours (typically +0.25 for +15min)

**Behavior:**
- Updates UI immediately
- Sets currentState.sleepHr
- Saves to AsyncStorage with all current state
- Invalidates today's cache
- Queues database sync

**Example:**
```typescript
await updateSleep(currentState.sleepHr + 0.25); // +15min
```

#### `updateSteps(steps: number): Promise<void>`
Updates step count (auto-tracked, not persisted to AsyncStorage).

**Parameters:**
- `steps`: Current step count

**Behavior:**
- Updates UI only
- Sets currentState.steps
- **Does NOT save to AsyncStorage** (prevents race condition)
- Steps are database-first (manual log or pedometer sync)

**Example:**
```typescript
await updateSteps(5432); // From pedometer
```

#### `addMoodCheckIn(checkIn): Promise<void>`
Adds mood check-in and persists to AsyncStorage + database.

**Parameters:**
- `checkIn`: Mood data (level, notes, etc.)

**Behavior:**
- Updates UI immediately
- Increments moodCheckInFrequency.total_checkins
- Saves to AsyncStorage with all current state
- Queues database sync

**Example:**
```typescript
await addMoodCheckIn({
  mood_level: 4,
  notes: 'Feeling great today!',
  journal_entry: '...'
});
```

---

## 🎓 Developer Guide

### Adding New Tracked Metric

**Step 1: Update Types**
```typescript
// src/types/index.ts
export interface AppState {
  currentState: {
    steps: number,
    waterOz: number,
    sleepHr: number,
    calories: number  // NEW
  }
}
```

**Step 2: Add Persistence**
```typescript
// src/stores/appStore.ts
addCalories: async (amount: number) => {
  const { user, currentState } = get();
  
  // 1. Update UI
  set((state) => ({
    currentState: {
      ...state.currentState,
      calories: state.currentState.calories + amount
    }
  }));
  
  // 2. Save to AsyncStorage
  const today = getTodayDate();
  await AsyncStorage.setItem(`@todayState_${today}`, JSON.stringify({
    ...get().currentState,
    calories: get().currentState.calories
  }));
  
  // 3. Invalidate cache
  dateMetricsCache.invalidate(today);
  
  // 4. Queue database sync
  if (user) {
    await AppStoreActions.addCalories(user.id, amount);
  }
}
```

**Step 3: Update Restoration**
```typescript
// loadTodayData()
const state = JSON.parse(persistedState);
set({
  currentState: {
    steps: state.steps || 0,
    waterOz: state.waterOz || 0,
    sleepHr: state.sleepHr || 0,
    calories: state.calories || 0  // NEW
  }
});
```

**Step 4: Add Ring Visualization**
```typescript
// App.tsx
<CalAiTriRings
  caloriesPct={Math.min(1, currentState.calories / finalTargets.calories)}
  caloriesData={{
    current: currentState.calories,
    target: finalTargets.calories
  }}
  // ... other props
/>
```

### Debugging Calendar Issues

#### Enable Debug Logging
```typescript
// src/stores/appStore.ts
const DEBUG_CALENDAR = __DEV__ && true;

if (DEBUG_CALENDAR) {
  console.log('🔍 Looking for AsyncStorage key:', key);
  console.log('📱 AsyncStorage raw value:', rawValue);
  console.log('✅ Restored state:', parsedState);
}
```

#### Test Date Navigation
```typescript
// Test script
const testDates = [
  '2025-01-12', // Today
  '2025-01-11', // Yesterday
  '2025-01-05', // Last week
  '2024-12-22', // 3 weeks ago
  '2024-12-20', // Out of range (should fail)
  '2025-01-13', // Future (should be disabled)
];

for (const date of testDates) {
  await setSelectedDate(date);
  console.log('Date:', date, 'State:', currentState);
}
```

#### Verify AsyncStorage
```typescript
// Check all stored dates
const keys = await AsyncStorage.getAllKeys();
const todayKeys = keys.filter(k => k.startsWith('@todayState_'));
console.log('Stored dates:', todayKeys);

// Read specific date
const state = await AsyncStorage.getItem('@todayState_2025-01-12');
console.log('Today state:', JSON.parse(state));
```

---

## 🔮 Future Enhancements

### Planned Features

#### **1. Extended History**
- Expand from 3 weeks to full month
- Infinite scroll for older dates
- Monthly/yearly aggregated views

#### **2. Data Export**
- CSV export for date range
- PDF health reports
- Share historical progress

#### **3. Predictive Caching**
- Pre-fetch adjacent dates
- Background sync for recent dates
- Smart cache warming

#### **4. Offline Sync Intelligence**
- Conflict resolution (last-write-wins)
- Sync status indicators
- Manual sync trigger

#### **5. Calendar Enhancements**
- Custom date ranges
- Week starts on configurable day
- Compact month view
- Quick jump to specific date

---

## 📖 References

### Related Documentation
- [PRD](../PRD.md) - Product requirements
- [UI/UX Guidelines](ui/ux.md) - Design specifications
- [Project Status](PROJECT_STATUS.md) - Implementation status
- [Cursor AI Rules](CURSOR_AI_RULES.md) - Development constraints

### Code Locations
- **Calendar**: `src/components/calendar/CalendarBar.tsx`
- **Rings**: `src/components/rings/CalAi*.tsx`
- **App Store**: `src/stores/appStore.ts`
- **Health Service**: `src/services/HealthDataService.ts`
- **Cache**: `src/utils/dateMetricsCache.ts`
- **Theme**: `src/utils/theme.ts`

### External Resources
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [React Native Animated](https://reactnative.dev/docs/animated)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

---

**Document Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintained By**: MaxPulse Development Team  
**Status**: ✅ Production Ready

