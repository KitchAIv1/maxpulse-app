# Changelog

All notable changes to the MaxPulse app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-22 (MVP1 Release)

### 🚀 MVP1 Release - Ready for Production Testing

**Release Date:** December 6, 2025  
**Testing Period:** November 22 - December 5, 2025 (2 weeks)  
**Status:** MVP1 Release Ready ✅

### Added
- **Exclusive Sign-In Experience**
  - Removed sign-up flow (handled in separate repo)
  - Elegant "Welcome to MaxPulse" branding
  - "Maximum 88 Exclusive" badge with shield icon
  - "Where health meets purpose" tagline
  - Refined UI with compact spacing and understated design
  - Professional layout: Logo → Tagline → Exclusive Badge → Sign-In Form

- **Sign-In Performance Optimization (75% Improvement)**
  - Life Score caching with AsyncStorage (5-minute TTL)
  - Background refresh if cache older than 2 minutes
  - Parallelized auth operations (loadUserTargets + loadTodayData)
  - Once-per-day checks for mood backfill and daily metrics audit
  - Deferred step tracking initialization (3s delay to not block sign-in)
  - Target loading deduplication (3s debounce window)
  - Result: Sign-in time reduced from 4s → <1s

- **Mood Check-In Keyboard UX Enhancement**
  - Auto-scroll to input field when focused
  - KeyboardAvoidingView with platform-specific behavior
  - Keyboard dismisses on drag-to-scroll
  - Proper z-index handling for smooth transitions
  - returnKeyType="done" for better keyboard UX
  - User can always see what they're typing

- **Elegant UI Branding Consistency**
  - Reduced font sizes across all pages (Rewards, Assessment, Profile, Life Score)
  - Compact spacing and subtle curves
  - Consistent icon sizes and border radius
  - Understated, professional design language
  - Rewards "Coming Soon" UI with gradient icon and feature list

### Fixed
- **CRITICAL: Sign-In Performance (4s → <1s)**
  - Identified and fixed 7 performance bottlenecks
  - Eliminated duplicate operations (target loading, mood backfill)
  - Prevented step tracking from blocking UI during sign-in
  - Converted sequential operations to parallel execution
  
- **Mood Check-In Keyboard Covering Input**
  - Input field now automatically scrolls above keyboard
  - Smooth animations on keyboard show/hide
  - Platform-specific handling for iOS and Android
  
- **Sign-Up Flow Removed**
  - AuthContainer now defaults to login flow
  - Sign-up handled in separate repository
  - Clean, focused sign-in experience

- **Text Arrangement on Sign-In Page**
  - Removed redundant "Welcome to MaxPulse" text
  - Tagline positioned directly under logo
  - Exclusive badge positioned between tagline and email input
  - Better visual hierarchy and spacing

### Improved
- **Performance Optimizations**
  - Life Score caching: <1ms cache hits vs 150ms DB queries
  - Target loading deduplication prevents redundant calls
  - Once-per-day mood backfill reduces DB operations
  - Once-per-day daily metrics audit prevents redundant checks
  - Step tracking deferred to not block app initialization

- **Code Quality**
  - All files follow .cursorrules (<500 lines)
  - Services properly separated with single responsibility
  - Full TypeScript type coverage
  - Comprehensive error handling

### Technical Details
- **Version:** 2.0.0
- **Branch:** `main`
- **Testing:** Ready for 2-week production testing period
- **Launch:** December 6, 2025

## [1.9.0] - 2025-10-31

### Added
- **AI Coach MVP1 - Complete Health-Focused Implementation**
  - OpenAI integration for conversational AI health coaching
  - Real-time symptom analysis with AI-powered insights
  - Database persistence for all conversations with HIPAA compliance
  - Hybrid rule-based + AI approach for optimal performance
  - Session management with unique UUID tracking
  - Automatic conversation save on chat close
  - Offline queue support for failed saves

- **Conversation Storage System**
  - Full conversation history stored in `health_conversations` table
  - Symptom reports saved to `symptom_reports` with AI analysis
  - Health recommendations stored in `health_recommendations` table
  - All data linked via session IDs and conversation IDs
  - Complete audit trail for HIPAA compliance

- **New Services (All <200 lines per .cursorrules)**
  - `OpenAIService.ts` - React Native-compatible OpenAI wrapper
  - `HealthConversationStorage.ts` - Database persistence service
  - Enhanced `SymptomAnalysisEngine.ts` - AI-enhanced symptom analysis
  - Extended `OfflineQueueService.ts` - Conversation type support

- **Enhanced AI Coach Features**
  - Conversational AI with empathetic responses
  - Follow-up questions for better symptom understanding
  - Context-aware recommendations based on health data
  - Natural language symptom detection
  - USA PH & UAE compliance built-in

- **Environment Configuration**
  - Secure OpenAI API key storage in `.env`
  - Babel configuration for environment variables
  - Type-safe environment variable access via `src/config/env.ts`

- **Database Schema**
  - 6 new tables: health_conversations, symptom_reports, health_recommendations, product_recommendations, user_consent_preferences, health_data_audit_log
  - Row Level Security (RLS) enabled on all tables
  - 15 performance indexes
  - Automatic audit trail triggers
  - Migration file: `migrations/012_health_conversations_schema.sql`

- **Documentation**
  - Complete implementation documentation
  - MVP2 plan for future enhancements
  - Root cause analysis and debugging guides
  - Migration instructions and verification guides

### Fixed
- **Critical Import/Export Mismatch Bug**
  - Fixed `TypeError: Cannot read property 'getInstance' of undefined`
  - Root cause: Named import used for default export in `HealthConversationStorage`
  - Solution: Changed to default import to match `OfflineQueueService` export
  - Impact: Conversations now save successfully to database

- **Module Loading Issues**
  - Implemented dynamic imports for component unmount scenarios
  - Prevented module unloading before cleanup functions execute
  - Added comprehensive error handling for save operations

### Improved
- **AI Coach System Prompt**
  - Enhanced to be more conversational and empathetic
  - Instructs AI to ask clarifying follow-up questions
  - Better context gathering for symptom analysis
  - Natural, warm tone instead of clinical/robotic

- **Code Quality**
  - All services follow .cursorrules (<200 lines per file)
  - Modular architecture with single responsibility
  - Full TypeScript type coverage
  - Comprehensive error handling

### Technical Details
- **Branch:** `feature/openai-integration`
- **Database:** 6 new tables with RLS policies
- **Services:** 2 new, 3 enhanced
- **Components:** 1 new, 2 updated
- **Migration:** `012_health_conversations_schema.sql`

## [1.8.0] - 2025-10-30

### Added
- **Life Score Assessment Integration**
  - Life Score now aggregates data from all weekly assessments (cumulative scoring)
  - 5-component weighted model: 20% past assessments + 80% current week (20% per pillar)
  - Auto-refreshes on assessment completion and app launch
  - Real-time updates during the week with cached assessment data
  - Performance-optimized with 5-minute cache to prevent excessive DB queries

- **LifeScoreCalculator Service**
  - New service for assessment-aware Life Score calculation
  - Handles cumulative weekly assessment aggregation
  - Implements blended scoring formula with fallback for Week 1
  - Includes comprehensive validation test suite

- **Assessment-Based Life Score State**
  - Added `assessmentBasedLifeScore` to appStore for cached calculation
  - Zustand state persistence across screens
  - Event-based updates (app launch, assessment completion, date changes)
  - No DB queries on every render - only on meaningful events

### Fixed
- **CRITICAL: Life Score Calculation Bug**
  - Fixed score showing 348 instead of 32 due to mixing percentage (0-100) with decimal (0-1) values
  - Database stores `overall_achievement_avg` as percentage (15.6 = 15.6%)
  - Current week metrics are decimals (0.362 = 36.2%)
  - Now correctly converts percentage to decimal before calculation
  - Impact: All users with past assessments were seeing 10x inflated scores

### Improved
- **Performance Optimization**
  - 5-minute in-memory cache prevents redundant DB queries
  - Max 1 query per 5 minutes under normal usage
  - Cache hit: <1ms, Cache miss: <150ms
  - Event-based updates only (NOT on every render)
  - Targets <10 queries per session

- **Life Score Calculation Accuracy**
  - Correctly handles Week 1 (no past data) with 4-pillar fallback model
  - Properly blends past assessment averages with current week progress
  - Formula: (Past Avg / 100 × 0.2) + (Current Week × 0.8)

## [1.7.0] - 2025-10-30

### Added
- **Calendar Dual Highlighting System (v1.7)**
  - Today's date always clearly visible with bright blue styling
  - Selected date clearly distinguished with black styling
  - Special "today + selected" state with blue highlighting
  - Fixed calendar UX where today was invisible when viewing other dates
  - Enhanced visual states: today (blue), selected (black), past (dark), future (disabled)

- **Critical Date Navigation Bug Fix (v1.7)**
  - Fixed steps showing 0 after date navigation (DB: 504, UI: 0)
  - Prevented cache from overwriting live step data on date switching
  - Applied "don't overwrite steps" fix to all cache restoration paths
  - StepTrackingService now remains single source of truth in all scenarios
  - No more app reload required to see correct step counts

- **Step Tracking UI Enhancements (v1.7)**
  - Fixed percentage display showing 0% instead of actual progress
  - Reused existing percentage logic from rewards section
  - Removed non-working animation code for cleaner codebase
  - Ensured step ring percentage updates correctly in real-time

### Fixed
- Calendar today date visibility when not selected
- Date navigation cache overwriting live step data
- Step percentage calculation in main dashboard
- AsyncStorage fallback paths preserving step data integrity

## [1.7.1] - 2025-10-30

### Fixed
- **Mood Check-In Keyboard Covering Input Field**
  - Keyboard was covering the quick notes input field when typing
  - User couldn't see what they were typing during mood check-in
  - Poor UX for mood check-in flow

### Improved
- **Enhanced Keyboard Handling for Mood Check-In**
  - Wrapped bottom sheet with KeyboardAvoidingView for smooth behavior
  - Added platform-specific keyboard handling (iOS: padding, Android: height)
  - Input field now automatically stays above keyboard when typing
  - Added keyboardShouldPersistTaps for better scroll handling
  - Smooth animations on keyboard show/hide for professional feel

## [1.6.0] - 2025-10-30

### Added
- **Step Tracking Rate Limiting & Accuracy Fix (v1.6)**
  - Fixed critical overcounting issue (70 actual steps → 160 counted)
  - Implemented time-based rate limiting with 3 steps/second maximum
  - Added session baseline tracking to prevent initial jump on app launch
  - Removed redundant smoothing logic (validation now at source)
  - Enhanced logging with step rate monitoring (steps/sec)
  - Achieved deterministic accuracy with proper CoreMotion batch handling
  - Fixed AsyncStorage overwriting live step data bug

- **Step Tracking Near Real-Time Accuracy (v1.5)**
  - Reduced polling interval from 5s to 1s for near real-time updates
  - Added step validation with 15 steps/second threshold
  - Implemented step smoothing for delayed CoreMotion processing
  - Added anomaly detection for unrealistic increments
  - Achieved 100% accuracy in controlled tests (30/30 steps)
  - Enhanced UI responsiveness with 500ms throttle (2 updates/second)
  - Optimized database sync to 3-second intervals

- **Step Tracking Real-Time UI Updates (v1.4)**
  - Fixed critical issue where UI only updated when user stopped walking
  - Removed motion activity filter that was blocking legitimate step updates
  - Steps now update in real-time every 5 seconds while walking
  - Added comprehensive logging throughout data flow for debugging
  - Trust CoreMotion's built-in accuracy instead of redundant filtering
  - Enhanced step increment logging with change tracking

- **Motion Activity Filtering (v1.4)**
  - Added MotionActivityManager to detect actual walking activity
  - Prevents false step counts from hand-waving and other non-walking motions
  - Uses expo-sensors DeviceMotion for sophisticated activity detection
  - Implements Apple Health-compliant motion filtering approach
  - Added activity confidence levels and walking pattern detection

- **Step Tracking Database Sync Fix (v1.2)**
  - Fixed critical bug where steps were not being saved to database
  - Ensured `handleStepUpdate` is called in `onStepUpdate` callback
  - Steps now properly sync to `daily_metrics` table every 10 seconds
  - Added comprehensive logging for database sync operations
  - Updated documentation with troubleshooting guides

- **Step Tracking Performance Improvements (v1.1)**
  - Reduced polling interval from 30 seconds to 5 seconds for smoother UI updates
  - Improved initial step detection with better logging
  - Enhanced CoreMotion integration for more responsive step tracking
  - Added initial step count logging for better debugging

- **Rewards UI Redesign**
  - Starbucks partnership reward card with optimized image (14KB)
  - Today's earnings grid with mini ring visualizations
  - Rewards hero card with animated progress ring
  - Streak visualization with milestone tracking
  - Achievement badges with vector icons
  - Partner rewards section header outside card container
  
- **Performance Optimizations**
  - React.memo for all rewards components
  - useMemo for expensive calculations
  - useCallback for event handlers
  - GPU acceleration with renderToHardwareTextureAndroid
  - Image optimization (98.8% size reduction)

- **Design System Updates**
  - Solid metallic ring colors (hydration, sleep, mood)
  - Consistent Cal AI design language across rewards
  - Section headers for better content hierarchy
  - Improved typography and spacing
  
- Comprehensive documentation organization
- Technical documentation for all major systems
- User guide structure (in development)
- Architecture documentation framework
- API documentation framework
- Rewards UI/UX documentation

## [1.0.0] - 2025-01-XX

### Added
- **Authentication System**
  - Activation code validation and consumption
  - Supabase authentication integration
  - Profile confirmation screen with assessment data
  - Row Level Security (RLS) policies

- **Health Tracking**
  - Real-time step tracking with device integration
  - Hydration logging with quick actions
  - Sleep tracking and manual entry
  - Mood check-in system with journaling

- **AI Coach System**
  - Natural language chat interface
  - Contextual health responses
  - Wellness check assessments
  - Symptom sharing and analysis
  - Quick action integration

- **Wellbeing Dashboard**
  - Life Score breakdown with battery gauge visualization
  - Contribution bars for each health metric
  - Daily insights and recommendations
  - 7-day and 30-day trend analysis
  - Module navigation for focused improvement

- **UI/UX Features**
  - Glassmorphism design with deep red gradients
  - TriRings visualization (Steps, Hydration, Sleep)
  - Quadrant KPI layout without progress bars
  - Bottom navigation with 4 main screens
  - Smooth animations and haptic feedback

- **Rewards System**
  - Points earning for healthy behaviors
  - Streak tracking and bonuses
  - Badge system for achievements
  - Progress visualization

- **Technical Infrastructure**
  - React Native with Expo SDK 54
  - TypeScript throughout the application
  - Zustand for state management
  - NativeWind for styling
  - Supabase backend with PostgreSQL
  - AsyncStorage for local persistence

### Technical Details
- **Database Schema**: Complete Supabase schema with RLS policies
- **Type Safety**: Comprehensive TypeScript interfaces
- **Clean Architecture**: Separation of UI, services, and data layers
- **Health Integrations**: iOS HealthKit and Android Google Fit support
- **Security**: Environment variables and secure token storage

### Development
- **Code Organization**: Follows Cursor AI rules for file size and structure
- **Component Limits**: Maximum 200 lines per component
- **File Limits**: Maximum 500 lines per file
- **Single Responsibility**: Each component/service has one clear purpose

## Development Milestones

### Phase 1: Core Foundation ✅
- [x] Project setup and configuration
- [x] Basic UI components and layout
- [x] Health tracking infrastructure
- [x] State management setup

### Phase 2: Authentication & Backend ✅
- [x] Supabase integration
- [x] Activation code system
- [x] User authentication flow
- [x] Database schema and RLS

### Phase 3: AI & Intelligence ✅
- [x] AI Coach chat interface
- [x] Natural language processing
- [x] Wellbeing dashboard
- [x] Health insights and recommendations

### Phase 4: Polish & Features ✅
- [x] Mood tracking system
- [x] Rewards and gamification
- [x] UI/UX refinements
- [x] Performance optimizations

### Phase 5: Documentation & Organization ✅
- [x] Comprehensive README
- [x] Technical documentation
- [x] API documentation structure
- [x] User guide framework

## Known Issues

### Current Limitations
- **Health Permissions**: Some features require Expo Dev Build for full functionality
- **Mock Data**: Development uses simulated data for Expo Go compatibility
- **RLS Policies**: Temporarily disabled for development (production ready)

### Planned Improvements
- **Real Health Integration**: Full HealthKit/Google Fit integration
- **Push Notifications**: Goal reminders and achievement notifications
- **Offline Support**: Enhanced offline functionality
- **Performance**: Further optimization for large datasets

## Breaking Changes

### v1.0.0
- Initial release - no breaking changes from previous versions

## Migration Guide

### From Development to Production
1. Enable RLS policies in Supabase
2. Configure production environment variables
3. Set up health permissions for target platforms
4. Test activation code flow with real data

## Contributors

- **MaxPulse Development Team**
- **AI Assistant** - Architecture and implementation support

## License

This project is private and proprietary. All rights reserved.

---

**Last Updated**: January 2025  
**Version**: 1.0.0
