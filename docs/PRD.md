# MaxPulse – Personalized Health Transformation App (PRD)

A comprehensive health transformation platform that combines **Steps**, **Hydration**, **Sleep**, and **Mood Tracking** with an **AI Coach**, **Wellbeing Dashboard**, and **Activation Code System** for personalized 90-day health journeys.

*Last updated: October 30, 2025 - Version 1.8.0*

---

## Version 1.8.0 - Current MVP Status

**Release Date:** October 30, 2025  
**Status:** Production Ready ✅

### Key Features Implemented:
- ✅ **Life Score Assessment Integration** - Cumulative scoring from all weekly assessments
- ✅ **5-Component Weighted Model** - 20% past assessments + 80% current week (20% per pillar)
- ✅ **Performance Optimized** - 5-minute cache prevents excessive DB queries
- ✅ **Event-Based Updates** - Only refreshes on meaningful events (not every render)
- ✅ **Mood Check-In Keyboard Handling** - Input field stays above keyboard when typing
- ✅ **Real-time Step Tracking** with iOS CoreMotion integration
- ✅ **Calendar Dual Highlighting System** - Today always clearly visible
- ✅ **Date Navigation** - Steps persist correctly without app reload
- ✅ **Step Percentage Display** - Shows actual progress (not 0%)
- ✅ **Data Integrity** - No cache overwriting live step data
- ✅ **Enhanced UX** - Seamless date switching and visual feedback

### Technical Improvements:
- **LifeScoreCalculator Service**: Assessment-aware calculation with cumulative weekly data
- **Blended Scoring Formula**: (Past Avg / 100 × 0.2) + (Current Week × 0.8)
- **Week 1 Fallback**: 4-pillar model (25% each) when no past assessments exist
- **5-Minute Cache**: In-memory cache prevents redundant DB queries (max 12 records)
- **Zustand State Persistence**: Assessment-based Life Score cached in appStore
- **KeyboardAvoidingView**: Platform-specific behavior for mood check-in (iOS: padding, Android: height)
- **Rate Limiting**: 3 steps/second maximum to prevent overcounting
- **Session Baseline Tracking**: No initial jump on app launch
- **Cache Restoration Fixes**: All paths preserve live step data
- **Calendar UX**: Bright blue highlighting for today's date
- **Percentage Calculation**: Reused proven logic from rewards section

### Critical Bugs Fixed:
- **CRITICAL: Life Score Calculation Bug** - Fixed 10x inflated scores (348 → 32)
  - Mixed percentage (0-100) from database with decimal (0-1) from current metrics
  - Now correctly converts percentage to decimal before calculation
  - Impact: All users with past assessments were seeing inflated scores
- Keyboard covering input field in mood check-in (user couldn't see what they were typing)
- Steps showing 0 after date navigation (DB: 504, UI: 0)
- Today's date invisible when viewing other dates
- Step percentage showing 0% instead of actual progress
- AsyncStorage overwriting live step data

### Life Score Integration Details:
- **Data Source**: `weekly_performance_history` table with `overall_achievement_avg` field
- **Update Triggers**: App launch, assessment completion, date changes, manual refresh
- **Performance**: Cache hit <1ms, Cache miss <150ms, <10 queries per session
- **Formula**: Blends past assessment averages with current week daily progress
- **Fallback**: Uses 4-pillar model (25% each) in Week 1 when no past data exists

---

## 1) Executive Summary

MaxPulse transforms health habits through personalized, data-driven 90-day transformation programs. Users access the app via unique activation codes that contain their personalized health assessment data, dynamic targets, and transformation roadmap. The app features real-time step tracking, hydration logging, sleep monitoring, and mood check-ins, all unified through a Life Score visualization and AI Coach guidance.

**Key Differentiators:**
- **Activation Code System**: Seamless onboarding with pre-configured personalized targets
- **AI Coach Chat Interface**: Natural language health conversations with contextual insights
- **Wellbeing Dashboard**: Comprehensive Life Score breakdown with trends and insights
- **Mood Check-In System**: Emotional wellness tracking with journaling capabilities
- **90-Day Transformation Plans**: Progressive targets based on individual health assessments

**Primary KPIs:** Day-7 retention; Life Score improvement over 90 days; Activation code conversion rate; AI Coach engagement.

---

## 2) Goals & Non‑Goals

**Goals**

* **Personalized Health Transformation**: Activation code system with individualized targets and 90-day plans
* **Comprehensive Tracking**: Steps (auto), hydration, sleep, and mood check-ins with Life Score visualization
* **AI-Powered Guidance**: Natural language coach interface with contextual health insights
* **Emotional Wellness**: Mood tracking with journaling and wellness check capabilities
* **Data-Driven Insights**: Wellbeing Dashboard with trends, breakdowns, and actionable recommendations
* **Seamless Authentication**: Supabase-powered auth with activation code validation and profile setup
* **Cross-Platform Excellence**: React Native with Expo for iOS/Android parity

**Non‑Goals (Current Version)**

* Social features or competitive elements
* Nutrition/calorie tracking beyond hydration
* Wearable integrations beyond HealthKit/Google Fit
* Manual target adjustment (targets come from assessment data)

---

## 3) Personas

* **Health Transformation Seeker (primary):** 30–55, has completed a health assessment and received an activation code from a distributor/coach. Wants personalized guidance and measurable progress. Success = follows 90-day plan, engages with AI Coach, improves Life Score consistently.
* **Wellness-Conscious Professional:** Busy but health-aware, values data-driven insights and emotional wellness tracking. Uses mood check-ins and AI Coach for stress management and work-life balance.
* **Accountability Partner User:** Works with a health coach/distributor who provided the activation code. Values progress tracking and sharing insights with their support network.

---

## 4) User Stories (Current Implementation)

### Authentication & Onboarding
1. As a new user, I **enter my activation code** to access my personalized health program
2. As a user, I **review and confirm my profile** derived from my health assessment data
3. As a user, I see my **personalized targets** based on my assessment results

### Core Health Tracking
4. As a user, I see **today's steps/hydration/sleep/mood** and a **Life Score** at a glance
5. As a user, **steps are auto-tracked** from my phone's pedometer without manual entry
6. As a user, I can **log hydration** in one tap (+8oz) and see progress toward my target
7. As a user, I can **update sleep hours** and see how it affects my Life Score
8. As a user, I can **check in with my mood** through a dedicated modal with journaling

### AI Coach & Insights
9. As a user, I can **chat with my AI Coach** using natural language about my health
10. As a user, I get **personalized recommendations** based on my current metrics
11. As a user, I can **perform wellness checks** to assess mood, energy, and stress levels
12. As a user, I can **share symptoms** naturally and receive contextual health insights

### Wellbeing Dashboard
13. As a user, I can **tap my Life Score** to see a detailed breakdown of contributing factors
14. As a user, I see **daily insights** and suggestions for improving my score
15. As a user, I can **view trends** over time to track my progress
16. As a user, I can **navigate to specific modules** from the dashboard for focused improvement

### Rewards & Gamification
17. As a user, I **earn points** for consistent healthy behaviors and target achievement
18. As a user, I can **view my rewards** including points, streaks, and badges earned

---

## 5) UX / UI (Current Implementation)

**Design System:** Cal AI-inspired minimalist design with beige background, soft pastels, and clean typography. Key components:

### Core Components
* **`CalAiTriRings`**: Four separate card-based rings in modern layout
  * **Landscape Steps Card**: Label left, ring right, percentage below label (30% screen width, max 120px)
  * **Three Core Habit Cards**: Hydration, Sleep, Mood in horizontal row (22% screen width, max 90px each)
  * **Ring Design**: Light gray track (#EDEDED), black progress arc (#000000), 6-8px width, rounded ends
* **`CalendarBar`**: 7-day week selector with active/inactive/future day states, positioned above ring cards
* **`MoodCheckInModal`**: Dedicated mood tracking with 5-point scale, notes, and journaling
* **`WellbeingDashboard`**: Comprehensive modal with battery gauge, contribution bars, insights, and trends
* **`CoachScreen`**: Full-screen AI chat interface with message bubbles and quick actions
* **`BottomNavigation`**: Cal AI styled bottom nav with outline icons and white background
* **`AuthContainer`**: Complete authentication flow with activation code validation

### MaxPulse Branding
* **Header**: 34x34px logo + "MaxPulse" title (30.5px, weight 500) + red rewards (#FF0000)
* **Color Palette**: Beige background, soft pastels, minimal contrast
* **Typography**: Light to medium weights (360-500) for refined appearance
* **Cards**: White background with subtle shadows, rounded corners (borderRadius.lg)
* **Spacing**: Generous padding and margins for breathable layout

### Screen Architecture
* **Main Dashboard**: Cal AI beige background with card-based ring layout
  * Header: Logo + MaxPulse + Rewards
  * Calendar Bar: 7-day week selector
  * Landscape Steps Card: Full width with ring on right
  * Three Core Habits: Horizontal row (Hydration, Sleep, Mood)
  * Quick Actions: +8oz Water, +15m Sleep, Mood Check-in buttons
* **Coach Screen**: Chat interface with Cal AI styling and wellness prompts
* **Rewards Screen**: Points, streaks, and badges with Cal AI card design
* **Profile Screen**: User data verification and backend alignment display
* **Profile Confirmation**: Assessment data review and editing before app access

### Mobile Implementation (React Native + Expo)
* **Styling**: NativeWind (Tailwind CSS for React Native) with custom glassmorphism effects
* **Graphics**: React Native SVG for rings with `strokeDasharray` calculations
* **Gradients**: Expo Linear Gradient for background effects
* **State**: Zustand for global state management
* **Backend**: Supabase integration with Row Level Security

### Accessibility & UX
* Life Score is accessible with proper ARIA labels and screen reader support
* Color-blind friendly with icons and text labels alongside colors
* Haptic feedback for interactions and goal completions
* Smooth animations and transitions throughout the app

---

## 6) Rewards System (MVP)

**Design Principles**: non‑competitive, self‑compassionate; rewards consistency, not volume binges.

**Points (daily):**

* Steps: up to **40 pts** for hitting daily target (pro‑rated on pace; cap at 40; no bonus beyond target; no points added after 10pm local).
* Hydration: up to **40 pts** for hitting water target (pro‑rated; cap at 40; late‑night chug after 9pm does **not** exceed target credit).
* Sleep: **50 pts** for 90–110% of target; **30 pts** for 80–90% or 110–120%; **0** otherwise; max once per day.
* **Daily Completion Bonus:** +20 pts if all three hit.

**Streaks:**

* 3‑day streak: +10 bonus; 7‑day: +30; 14‑day: +60; resets only if <50% of target on any metric.

**Badges (MVP):**

* “Hydration Hat‑Trick” (3 days), “Early Lights” (3 nights >90% target), “Balanced Week” (all three hit 5/7 days).

**Anti‑gaming Guardrails:**

* Ignore steps recorded after 11pm for the current day’s points.
* Cap daily hydration at target; excess doesn’t add points.
* Sleep scored on last night only; naps don’t inflate beyond the 110% band.

**Rewards Page (UI):**

* Header: Points balance + weekly progress bar.
* Cards: Today’s earnings breakdown; Streak status; Badges earned; “Next badge” progress.
* CTA: “Complete today’s 3 to earn +20.”

*Configuration (server‑side JSON):*

```json
{
  "points": {
    "steps": { "max": 40, "cutoffHour": 22 },
    "hydration": { "max": 40, "cutoffHour": 21 },
    "sleep": { "tiers": [[0.9, 1.1, 50], [0.8, 0.9, 30], [1.1, 1.2, 30]] },
    "dailyCompletionBonus": 20
  },
  "streaks": { "threshold": 0.5, "bonuses": { "3": 10, "7": 30, "14": 60 } }
}
```

---

## 7) Tech Stack & Native Integrations (Current Implementation)

**Client Framework**: 
- React Native with Expo SDK 54
- TypeScript for type safety
- NativeWind (Tailwind CSS for React Native)
- React Native SVG for graphics
- Zustand for state management

**UI & Styling**:
- Expo Linear Gradient for background effects
- Custom glassmorphism components
- Haptic feedback via Expo Haptics
- Responsive design with quadrant layouts

**Health & Sensors**:
- **iOS**: Core Motion pedometer, HealthKit integration via `react-native-health`
- **Android**: Activity Recognition API, Google Fit via `react-native-google-fit`
- **Permissions**: Motion, HealthKit, Activity Recognition with graceful fallbacks
- **Local Storage**: AsyncStorage for Expo Go compatibility

**Backend & Authentication**:
- **Supabase**: PostgreSQL database with Row Level Security (RLS)
- **Authentication**: Email/password with activation code validation
- **Real-time**: Supabase subscriptions for live data updates
- **Security**: Environment variables, secure token storage

**AI & Intelligence**:
- **AI Coach Service**: Natural language processing for health conversations
- **Wellness Analysis**: Mood, energy, stress level assessment
- **Contextual Insights**: Health correlation and recommendation engine
- **Symptom Processing**: Natural language symptom sharing and analysis

**Data Architecture**:
- **Activation Codes**: Pre-configured user profiles with personalized targets
- **Dynamic Targets**: 90-day progressive health plans
- **Life Score Algorithm**: Multi-factor health scoring with mood integration
- **Trend Analysis**: Historical data processing and visualization

**Build & Deployment**:
- Expo Development Build for native features
- Git version control with GitHub integration
- Environment-based configuration management

---

## 8) Data Model (Current Supabase Schema)

### Core Authentication & Profiles

**`activation_codes`** (Pre-existing from assessment system)
* `id` (uuid, pk), `code` (unique), `distributor_id`, `session_id`
* `customer_name`, `customer_email`, `onboarding_data` (jsonb)
* `status` (pending|activated|expired), `activated_at`, `expires_at`
* Contains personalized targets, demographics, medical data, and 90-day plans

**`app_user_profiles`** (MaxPulse app users)
* `user_id` (fk to auth.users), `email`, `name`, `age`, `gender`
* `height_cm`, `weight_kg`, `bmi`, `medical_conditions[]`, `medical_allergies[]`
* `mental_health_data` (jsonb), `activation_code_id` (fk)
* `distributor_id`, `session_id`, `plan_type`

### Health Tracking Data

**`daily_metrics`** (Daily aggregated data)
* `user_id`, `date` (composite pk), `steps_actual`, `steps_target`
* `water_oz_actual`, `water_oz_target`, `sleep_hr_actual`, `sleep_hr_target`
* `life_score`, `finalized` (bool)

**`hydration_logs`** (Individual hydration entries)
* `user_id`, `timestamp`, `amount_oz`, `source` (manual|healthkit|googlefit)

**`sleep_sessions`** (Sleep tracking data)
* `user_id`, `start_timestamp`, `end_timestamp`, `duration_hours`, `source`

**`pedometer_snapshots`** (Step count snapshots)
* `user_id`, `timestamp`, `steps_cumulative`, `source` (device|healthkit|googlefit)

**`mood_checkins`** (Emotional wellness tracking)
* `user_id`, `timestamp`, `mood_level` (1-5), `energy_level`, `stress_level`
* `notes`, `journal_entry`, `health_context` (jsonb)

### Plan & Progress Tracking

**`plan_progress`** (90-day transformation tracking)
* `user_id`, `current_week`, `current_phase`, `weekly_scores` (jsonb)
* `target_adjustments` (jsonb), `adaptation_notes`

**`weekly_targets`** (Progressive target system)
* `user_id`, `week_number`, `phase`, `steps_target`, `hydration_target`
* `sleep_target`, `focus_areas[]`, `expected_outcomes[]`

### Rewards & Gamification

**`rewards_ledger`** (Points and achievements)
* `user_id`, `date`, `type` (steps|hydration|sleep|mood|daily_bonus|streak)
* `points`, `metadata` (jsonb)

**`badges`** & **`user_badges`** (Achievement system)
* Static badges definition and user achievement tracking

### Device & Health Integration

**`device_connections`** (Health platform connections)
* `user_id`, `platform` (ios|android), `health_source` (pedometer|healthkit|googlefit)
* `last_sync_at`, `permissions_granted[]`, `sync_status`

### Security & Access Control
* **Row Level Security (RLS)** enabled on all user tables
* Policies ensure `user_id = auth.uid()` for data access
* Activation codes validate during signup process

---

## 9) Core Algorithms (Current Implementation)

### Life Score Calculation (4-Factor Model)
The Life Score integrates physical metrics with emotional wellness:

```typescript
export function computeLifeScore(
  stepsPct: number, 
  waterPct: number, 
  sleepPct: number, 
  moodCheckInPct: number
) {
  const s = clamp01(stepsPct);
  const w = clamp01(waterPct);
  const sl = clamp01(sleepPct);
  const m = clamp01(moodCheckInPct);
  
  // 4-way split: 25% each component
  const raw = s * 0.25 + w * 0.25 + sl * 0.25 + m * 0.25;
  return Math.round(raw * 100);
}

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
```

### Mood Check-In Frequency Calculation
```typescript
export function calculateMoodCheckInPct(frequency: MoodCheckInFrequency): number {
  if (frequency.target_checkins === 0) return 0;
  return Math.min(1, frequency.total_checkins / frequency.target_checkins);
}
```

### Ring Visualization (React Native SVG)
```typescript
export function ringDasharray(radius: number, percentage: number): string {
  const circumference = 2 * Math.PI * radius;
  const dashLength = circumference * Math.min(1, percentage);
  const gapLength = circumference - dashLength;
  return `${dashLength} ${gapLength}`;
}
```

### Dynamic Target Generation
```typescript
export function generateTargets(customTargets?: Partial<Targets>): Targets {
  const defaults = { steps: 8000, waterOz: 80, sleepHr: 8 };
  return { ...defaults, ...customTargets };
}
```

### Next Best Action Algorithm
Prioritizes actions based on current deficits and time of day:

```typescript
export function getNextBestAction(
  stepsPct: number,
  waterPct: number, 
  sleepPct: number,
  moodCheckInPct: number
): NextBestAction {
  const deficits = [
    { key: 'steps', deficit: 1 - stepsPct, priority: getTimePriority('steps') },
    { key: 'hydration', deficit: 1 - waterPct, priority: getTimePriority('hydration') },
    { key: 'sleep', deficit: 1 - sleepPct, priority: getTimePriority('sleep') },
    { key: 'mood', deficit: 1 - moodCheckInPct, priority: 1 }
  ];
  
  // Return highest priority deficit with contextual tip
  const topAction = deficits.sort((a, b) => 
    (b.deficit * b.priority) - (a.deficit * a.priority)
  )[0];
  
  return {
    key: topAction.key,
    tip: getActionTip(topAction.key, topAction.deficit)
  };
}
```

### AI Coach Response Generation
The AI Coach uses contextual health data to generate personalized responses:

```typescript
export function generateCoachResponse(
  message: string,
  healthContext: HealthContextData,
  conversationHistory: ChatMessage[]
): CoachResponse {
  // Analyze current health metrics
  const insights = analyzeHealthContext(healthContext);
  
  // Generate contextual response based on:
  // - User message intent
  // - Current health status
  // - Conversation history
  // - Time of day and patterns
  
  return {
    message: generateContextualMessage(message, insights),
    insights: insights,
    suggestedActions: generateQuickActions(healthContext),
    followUpQuestions: generateFollowUps(message, insights)
  };
}
```

---

## 10) Current User Flows & Features

### Authentication & Onboarding Flow

1. **Signup Screen**: User enters activation code, email, and password
2. **Code Validation**: Real-time validation against Supabase activation_codes table
3. **Profile Confirmation**: Display assessment-derived profile data for review/editing
4. **Account Creation**: Create Supabase auth user and app_user_profiles record
5. **Target Initialization**: Load personalized targets from activation code data

**Acceptance Criteria:**
* Activation codes are validated in real-time with visual feedback
* Invalid/expired/used codes show appropriate error messages
* Profile data is pre-populated from assessment with editing capabilities
* Targets are automatically set based on personalized assessment results

### Daily Health Tracking Loop

1. **Dashboard View**: Glassmorphism quadrant layout with TriRings and KPIs
2. **Step Tracking**: Automatic pedometer integration with real-time updates
3. **Hydration Logging**: One-tap +8oz buttons with instant UI updates
4. **Sleep Tracking**: Manual entry with Life Score recalculation
5. **Mood Check-In**: Dedicated modal with 5-point scale and journaling

**Acceptance Criteria:**
* Life Score updates instantly when any metric changes
* Step tracking works in background with periodic sync
* Hydration adds trigger haptic feedback and smooth animations
* Mood check-ins contribute to weekly frequency targets

### AI Coach Interaction

1. **Chat Interface**: Full-screen chat with message bubbles and quick actions
2. **Natural Language**: Users can describe symptoms, ask questions, share feelings
3. **Contextual Responses**: AI analyzes current health metrics for personalized advice
4. **Wellness Checks**: Structured mood, energy, and stress assessments
5. **Quick Actions**: Pre-defined actions for common health tasks

**Acceptance Criteria:**
* Chat responses are contextually relevant to user's current health status
* Wellness checks provide structured assessment with follow-up insights
* Quick actions integrate with main app functionality (logging, target checking)
* Conversation history is maintained for context continuity

### Wellbeing Dashboard

1. **Life Score Tap**: Tapping center Life Score opens comprehensive modal
2. **Score Breakdown**: Battery gauge with contribution bars for each metric
3. **Daily Insights**: AI-generated suggestions based on current performance
4. **Trends & History**: 7-day and 30-day Life Score trend visualization
5. **Module Navigation**: Direct links to improve specific health areas

**Acceptance Criteria:**
* Dashboard opens smoothly with animated transitions
* All metrics are accurately represented in breakdown view
* Trends show meaningful patterns over time
* Insights are actionable and personalized to user's current state

---

## 11) Analytics

* Events: `app_open`, `water_add`, `sleep_import`, `steps_update`, `nudge_shown`, `nudge_tapped`, `targets_met`, `points_awarded` (with type), `streak_incremented`.
* Funnels: day open → water add; nudge shown → nudge tapped.
* KPIs: D1/D7 retention, % daily completion, avg hydration oz/day, streak distribution.

---

## 12) Security & Privacy

* Store tokens/scopes in SecureStore; never log health data.
* RLS on all tables; Edge functions verify `auth.uid()`.
* Clear permission copy: why we read steps/sleep, how we use it.

---

## 13) Performance & Offline

* Cache today’s `daily_metrics` in local storage and reconcile on foreground.
* Debounce hydration writes; optimistic UI with server confirm.
* Background fetch (if allowed) to finalize day at midnight‑30m.

---

## 14) Testing Plan (including existing + new tests)

**Unit (JS/TS):**

* `computeLifeScore` clamps and returns 0–100 (already included inline).
* `ringDasharray` returns correct dash/gap at 0, 1, and >1 (already inline).
* **NEW:** points calculator given synthetic inputs returns expected ledger rows.

**Example Cases**

1. Steps 100%, Hydration 100%, Sleep 95% → points: 40 + 40 + 50 + 20 = **150**; streak +1.
2. Steps 60%, Hydration 40% at 8:30pm, Sleep 80% → points: 24 + 16 + 30 = **70**; no daily bonus; no streak.
3. Hydration logged 32oz at 9:30pm, target 80oz → credited only up to target; no extra points.
4. Steps >100% after 10:30pm → **no** additional points for today.

**Integration (Device):**

* Deny Motion → Steps show “No data yet”, app remains usable.
* Connect HealthKit sleep → imports last night’s session within 5s; ring updates.

**E2E (Detox/Appium):**

* Onboarding flow completes with Motion allowed.
* Add hydration twice; Rewards page reflects earned points.

---

## 15) Delivery Plan

**MVP Sprint (2–3 weeks)**

1. RN scaffold + rings + KPIs (parity with current web UI).
2. Pedometer integration; hydration logging; manual sleep entry.
3. Life Indicator + Next Best Action; Diagnostics.
4. Supabase schema + RLS; hydration writes; day metrics fetch.
5. Points engine (Edge Function) + Rewards screen (badges static for MVP).
6. QA, performance passes, App Store/TestFlight & Play Internal.

**V1.1**

* HealthKit/Fit for sleep/hydration; streak badges; richer diagnostics; localizations.

---

## 16) Open Questions for Product

1. Confirm Life Score weights (current: 33/34/33). Do we switch to 40/30/30 (sleep heavier)?
2. Daily cutoff hours: steps (10pm), hydration (9pm) — keep as proposed?
3. Rewards redemption: MVP badges only, or add cosmetic themes unlocked by milestones?
4. Should we expose weekly Life Indicator trends (sparklines) on a second screen now or in V1.1?

---

## 17) Appendix – RN Parity Snippets

**Ring Arc (react‑native‑svg)**

```tsx
import Svg, { Circle } from 'react-native-svg';
const C = 2 * Math.PI * r;
<Circle cx={c} cy={c} r={r} stroke={color} strokeWidth={10}
  strokeLinecap="round" fill="none"
  strokeDasharray={`${C*pct} ${C*(1-pct)}`}
/>
```

**Hydration Quick Add (optimistic)**

```ts
setHydration((h)=>h+8); // local
await supabase.from('hydration_logs').insert({ amount_oz:8, ts:new Date().toISOString() });
```

**Edge Function (points award skeleton)**

```ts
// POST /points/evaluate { userId, date }
// 1) read daily_metrics  2) compute points per config  3) upsert rewards_ledger
```
