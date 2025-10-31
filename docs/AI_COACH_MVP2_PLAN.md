# AI Coach MVP2 - Enhancement Plan

## Overview
Building on MVP1's successful conversation storage and AI integration, MVP2 focuses on conversation history, advanced analytics, and enhanced user experience.

---

## MVP1 Achievements (Completed ✅)

### Core Features
- ✅ Real-time AI conversations with OpenAI
- ✅ Symptom detection and analysis
- ✅ Health recommendations (natural + medical)
- ✅ Conversation storage to database
- ✅ Offline queue support
- ✅ HIPAA-compliant audit trail
- ✅ USA PH & UAE compliance

### Technical Implementation
- ✅ Database schema (6 tables with RLS)
- ✅ Modular services (<200 lines per file)
- ✅ OpenAI integration with guardrails
- ✅ Session management
- ✅ Message tracking
- ✅ Auto-save on unmount

---

## MVP2 Goals

### Primary Objectives
1. **Conversation History** - Retrieve and display past conversations
2. **Pattern Recognition** - Identify health trends over time
3. **Proactive Insights** - AI-driven health alerts
4. **Enhanced UX** - Better chat interface and interactions
5. **Product Recommendations** - Implement opt-in product suggestions

### Success Metrics
- Users can access last 30 days of conversations
- AI identifies 3+ health patterns per user
- 80% user satisfaction with conversation continuity
- <2s load time for conversation history
- Product recommendation opt-in rate >30%

---

## Feature Breakdown

### 1. Conversation History Retrieval

#### 1.1 Recent Conversations List
**Description:** Display last 5-10 conversations when opening AI Coach

**UI Components:**
```
┌─────────────────────────────────────┐
│ Recent Conversations                │
├─────────────────────────────────────┤
│ 🩺 Headache discussion              │
│    Oct 31, 2025 • 5 messages        │
├─────────────────────────────────────┤
│ 💊 Sleep quality concerns           │
│    Oct 30, 2025 • 8 messages        │
├─────────────────────────────────────┤
│ 🏃 Energy levels and exercise       │
│    Oct 29, 2025 • 12 messages       │
└─────────────────────────────────────┘
```

**Technical Requirements:**
- Query `health_conversations` on mount
- Order by `started_at DESC`
- Limit to last 10 conversations
- Show conversation type icon
- Display summary (first message preview)
- Show message count and date

**Database Query:**
```sql
SELECT 
  id,
  session_id,
  conversation_type,
  summary,
  started_at,
  (metadata->>'message_count')::int as message_count
FROM health_conversations
WHERE user_id = $1
ORDER BY started_at DESC
LIMIT 10;
```

**New Components:**
- `ConversationHistoryList.tsx` (<200 lines)
- `ConversationHistoryItem.tsx` (<150 lines)

**Estimated Effort:** 2-3 days

---

#### 1.2 Continue Previous Conversation
**Description:** Allow users to tap a conversation and continue where they left off

**Features:**
- Load full message history
- Restore conversation context
- Append new messages to existing conversation
- Update `ended_at` timestamp

**Technical Requirements:**
- Fetch full conversation from metadata
- Restore `conversationMessages` ref
- Use same `session_id` for continuity
- Update existing conversation record (not create new)

**Database Query:**
```sql
SELECT 
  id,
  session_id,
  metadata->'messages' as full_messages,
  metadata as context
FROM health_conversations
WHERE id = $1 AND user_id = $2;
```

**New Service Methods:**
```typescript
// HealthConversationStorage.ts
loadConversation(userId: string, conversationId: string): Promise<Conversation>
updateConversation(conversationId: string, newMessages: Message[]): Promise<boolean>
```

**Estimated Effort:** 3-4 days

---

#### 1.3 Search Conversations
**Description:** Search through conversation history by keyword or date

**Features:**
- Full-text search in conversation content
- Filter by conversation type
- Date range picker
- Search by symptom type

**Technical Requirements:**
- PostgreSQL full-text search on metadata
- Index on `metadata` JSONB field
- Filter UI component

**Database Query:**
```sql
SELECT 
  id,
  session_id,
  conversation_type,
  summary,
  started_at
FROM health_conversations
WHERE user_id = $1
  AND (
    summary ILIKE $2 
    OR metadata::text ILIKE $2
  )
  AND started_at >= $3
  AND started_at <= $4
ORDER BY started_at DESC;
```

**New Components:**
- `ConversationSearch.tsx` (<200 lines)
- `SearchFilters.tsx` (<150 lines)

**Estimated Effort:** 3-4 days

---

### 2. Pattern Recognition & Analytics

#### 2.1 Health Trend Detection
**Description:** AI analyzes conversation history to identify patterns

**Patterns to Detect:**
- Recurring symptoms (e.g., headaches every Monday)
- Symptom triggers (e.g., headaches after poor sleep)
- Improvement trends (e.g., energy levels increasing)
- Concerning patterns (e.g., worsening symptoms)

**Technical Approach:**
```typescript
// New Service: HealthPatternAnalyzer.ts
interface HealthPattern {
  type: 'recurring' | 'trigger' | 'improvement' | 'concern';
  symptom: string;
  frequency: string;
  correlation?: string;
  confidence: number;
  recommendation: string;
}

class HealthPatternAnalyzer {
  analyzeConversations(userId: string, days: number): Promise<HealthPattern[]>
  detectRecurringSymptoms(conversations: Conversation[]): HealthPattern[]
  findSymptomTriggers(conversations: Conversation[], healthData: DailyMetrics[]): HealthPattern[]
  identifyTrends(conversations: Conversation[]): HealthPattern[]
}
```

**Database Queries:**
```sql
-- Get all symptom reports with health context
SELECT 
  sr.symptom_type,
  sr.symptom_description,
  sr.severity,
  sr.reported_at,
  sr.health_context,
  dm.sleep_hr,
  dm.water_oz,
  dm.steps
FROM symptom_reports sr
LEFT JOIN daily_metrics dm ON DATE(sr.reported_at) = dm.date
WHERE sr.user_id = $1
  AND sr.reported_at >= NOW() - INTERVAL '30 days'
ORDER BY sr.reported_at;
```

**New Components:**
- `HealthPatternAnalyzer.ts` (<200 lines)
- `PatternInsightsCard.tsx` (<150 lines)

**Estimated Effort:** 5-6 days

---

#### 2.2 Proactive Health Alerts
**Description:** AI sends proactive notifications based on detected patterns

**Alert Types:**
- "You've reported headaches 3 times this week. Let's explore triggers."
- "Your energy levels have improved 40% since increasing hydration."
- "It's been 2 weeks since your last wellness check. How are you feeling?"

**Technical Requirements:**
- Background job to analyze patterns daily
- Push notification integration
- Alert preferences management
- Alert history tracking

**New Database Table:**
```sql
CREATE TABLE health_alerts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  alert_type TEXT,
  title TEXT,
  message TEXT,
  pattern_data JSONB,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  shown_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**New Service:**
```typescript
// HealthAlertService.ts
class HealthAlertService {
  generateAlerts(userId: string): Promise<HealthAlert[]>
  sendAlert(userId: string, alert: HealthAlert): Promise<boolean>
  dismissAlert(alertId: string): Promise<boolean>
  getActiveAlerts(userId: string): Promise<HealthAlert[]>
}
```

**Estimated Effort:** 4-5 days

---

### 3. Enhanced Chat Experience

#### 3.1 Rich Message Types
**Description:** Support different message formats beyond text

**Message Types:**
- Text (current)
- Quick replies (buttons)
- Cards (product recommendations)
- Charts (health trends)
- Checklists (action items)
- Images (educational content)

**Technical Requirements:**
- Extend `ChatMessage` type
- New message renderers
- Interactive components

**New Types:**
```typescript
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'coach';
  timestamp: string;
  messageFormat?: 'text' | 'card' | 'chart' | 'checklist' | 'image';
  richContent?: {
    type: string;
    data: any;
  };
  quickActions?: QuickAction[];
}
```

**New Components:**
- `MessageCard.tsx` (<150 lines)
- `MessageChart.tsx` (<150 lines)
- `MessageChecklist.tsx` (<150 lines)

**Estimated Effort:** 4-5 days

---

#### 3.2 Voice Input
**Description:** Allow users to speak their symptoms instead of typing

**Features:**
- Speech-to-text integration
- Voice recording UI
- Playback capability
- Automatic transcription

**Technical Requirements:**
- Expo Speech Recognition API
- Audio recording permissions
- Transcription service (OpenAI Whisper)

**New Components:**
- `VoiceInput.tsx` (<200 lines)
- `AudioPlayer.tsx` (<150 lines)

**Estimated Effort:** 5-6 days

---

#### 3.3 Typing Indicators & Read Receipts
**Description:** Show when AI is "thinking" and when messages are read

**Features:**
- Animated typing indicator
- Read receipts for messages
- "Max is analyzing..." status

**New Components:**
- `TypingIndicator.tsx` (<100 lines)
- `MessageStatus.tsx` (<100 lines)

**Estimated Effort:** 2 days

---

### 4. Product Recommendations (Opt-in)

#### 4.1 User Consent Flow
**Description:** Implement opt-in system for product recommendations

**UI Flow:**
```
1. First-time user sees consent modal
2. Explain benefits of product recommendations
3. User opts in/out
4. Preference saved to database
5. Can change preference in settings
```

**Database:**
- Use existing `user_consent_preferences` table
- Track consent version and timestamp

**New Components:**
- `ConsentModal.tsx` (<200 lines)
- `ConsentSettings.tsx` (<150 lines)

**Estimated Effort:** 2-3 days

---

#### 4.2 Smart Product Suggestions
**Description:** AI recommends products based on symptoms and health data

**Recommendation Logic:**
```typescript
// ProductRecommendationEngine.ts
class ProductRecommendationEngine {
  generateRecommendations(
    symptomAnalysis: AISymptomAnalysis,
    userProfile: UserProfile,
    conversationHistory: Conversation[]
  ): Promise<ProductRecommendation[]>
  
  scoreProduct(
    product: Product,
    symptom: string,
    userContext: any
  ): number
  
  filterByCompliance(
    products: Product[],
    region: string
  ): Product[]
}
```

**Product Database:**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  type TEXT,
  description TEXT,
  benefits TEXT[],
  price_range TEXT,
  affiliate_link TEXT,
  image_url TEXT,
  compliance_regions TEXT[],
  target_symptoms TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**New Service:**
- `ProductRecommendationEngine.ts` (<200 lines)

**Estimated Effort:** 5-6 days

---

#### 4.3 Product Cards in Chat
**Description:** Display product recommendations as interactive cards

**Features:**
- Product image
- Name and description
- Price range
- Benefits list
- "Learn More" button
- "Not Interested" option
- Track clicks and conversions

**Use existing:**
- `ProductRecommendationCard.tsx` (already created in MVP1)

**Enhancements needed:**
- Click tracking
- Conversion tracking
- A/B testing support

**Estimated Effort:** 2-3 days

---

### 5. Advanced Analytics Dashboard

#### 5.1 Conversation Analytics
**Description:** Admin/user view of conversation metrics

**Metrics:**
- Total conversations
- Average conversation length
- Most discussed symptoms
- Conversation sentiment
- AI response quality
- User satisfaction ratings

**New Components:**
- `ConversationAnalytics.tsx` (<200 lines)
- `SymptomHeatmap.tsx` (<150 lines)

**Estimated Effort:** 4-5 days

---

#### 5.2 Health Journey Timeline
**Description:** Visual timeline of user's health conversations and progress

**Features:**
- Chronological view of conversations
- Symptom milestones
- Health improvements
- Recommendation follow-ups

**New Components:**
- `HealthTimeline.tsx` (<200 lines)
- `TimelineEvent.tsx` (<150 lines)

**Estimated Effort:** 4-5 days

---

### 6. Data Export & Sharing

#### 6.1 Export Conversations
**Description:** Allow users to export their conversation history

**Export Formats:**
- PDF (formatted report)
- JSON (raw data)
- CSV (for analysis)

**Features:**
- Date range selection
- Include/exclude symptom reports
- Include/exclude recommendations
- HIPAA-compliant formatting

**New Service:**
```typescript
// ConversationExportService.ts
class ConversationExportService {
  exportToPDF(userId: string, dateRange: DateRange): Promise<Blob>
  exportToJSON(userId: string, dateRange: DateRange): Promise<string>
  exportToCSV(userId: string, dateRange: DateRange): Promise<string>
}
```

**Estimated Effort:** 4-5 days

---

#### 6.2 Share with Doctor
**Description:** Generate doctor-friendly summary of conversations

**Features:**
- Professional medical summary format
- Symptom timeline
- Frequency and severity charts
- Medication and treatment history
- Secure sharing link (time-limited)

**New Components:**
- `DoctorSummary.tsx` (<200 lines)
- `SecureShareLink.tsx` (<150 lines)

**Estimated Effort:** 5-6 days

---

## Technical Architecture Updates

### New Services (Following .cursorrules)

1. **HealthPatternAnalyzer.ts** (<200 lines)
   - Pattern detection algorithms
   - Trend analysis
   - Correlation finding

2. **HealthAlertService.ts** (<200 lines)
   - Alert generation
   - Notification management
   - Alert history

3. **ProductRecommendationEngine.ts** (<200 lines)
   - Product scoring
   - Compliance filtering
   - Recommendation logic

4. **ConversationExportService.ts** (<200 lines)
   - PDF generation
   - Data formatting
   - Export management

5. **ConversationHistoryService.ts** (<200 lines)
   - History retrieval
   - Search functionality
   - Conversation updates

### New Database Tables

```sql
-- Health alerts
CREATE TABLE health_alerts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  alert_type TEXT,
  title TEXT,
  message TEXT,
  pattern_data JSONB,
  priority TEXT,
  shown_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products catalog
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  type TEXT,
  description TEXT,
  benefits TEXT[],
  price_range TEXT,
  affiliate_link TEXT,
  image_url TEXT,
  compliance_regions TEXT[],
  target_symptoms TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product interactions
CREATE TABLE product_interactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  recommendation_id UUID REFERENCES product_recommendations(id),
  interaction_type TEXT, -- 'view', 'click', 'dismiss', 'purchase'
  interaction_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation ratings
CREATE TABLE conversation_ratings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  conversation_id UUID REFERENCES health_conversations(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  rated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Database Indexes

```sql
-- Performance indexes for MVP2
CREATE INDEX idx_health_conversations_user_started ON health_conversations(user_id, started_at DESC);
CREATE INDEX idx_symptom_reports_user_reported ON symptom_reports(user_id, reported_at DESC);
CREATE INDEX idx_health_alerts_user_priority ON health_alerts(user_id, priority, created_at DESC);
CREATE INDEX idx_product_interactions_user_type ON product_interactions(user_id, interaction_type);

-- Full-text search
CREATE INDEX idx_health_conversations_search ON health_conversations USING gin(to_tsvector('english', summary));
CREATE INDEX idx_health_conversations_metadata_search ON health_conversations USING gin(metadata);
```

---

## Implementation Phases

### Phase 2.1: Conversation History (2-3 weeks)
**Priority:** High
**Dependencies:** None

**Features:**
- Recent conversations list
- Continue previous conversation
- Search conversations
- Conversation details view

**Deliverables:**
- 4 new components
- 1 new service
- Updated database queries
- User documentation

---

### Phase 2.2: Pattern Recognition (3-4 weeks)
**Priority:** High
**Dependencies:** Phase 2.1

**Features:**
- Health trend detection
- Proactive health alerts
- Pattern insights dashboard

**Deliverables:**
- 2 new services
- 1 new database table
- Background job setup
- Analytics dashboard

---

### Phase 2.3: Enhanced UX (2-3 weeks)
**Priority:** Medium
**Dependencies:** None

**Features:**
- Rich message types
- Voice input
- Typing indicators
- Better animations

**Deliverables:**
- 6 new components
- Audio recording setup
- Enhanced chat UI

---

### Phase 2.4: Product Recommendations (3-4 weeks)
**Priority:** Medium
**Dependencies:** Phase 2.1

**Features:**
- User consent flow
- Product recommendation engine
- Product cards in chat
- Interaction tracking

**Deliverables:**
- 1 new service
- 2 new database tables
- Product catalog setup
- Compliance verification

---

### Phase 2.5: Analytics & Export (2-3 weeks)
**Priority:** Low
**Dependencies:** Phase 2.1, 2.2

**Features:**
- Conversation analytics
- Health journey timeline
- Data export (PDF, JSON, CSV)
- Doctor summary

**Deliverables:**
- 4 new components
- 1 new service
- Export functionality
- Analytics dashboard

---

## Success Criteria

### User Experience
- [ ] Users can access last 30 days of conversations in <2s
- [ ] Search returns relevant results in <1s
- [ ] 80%+ user satisfaction with conversation continuity
- [ ] Voice input accuracy >90%
- [ ] Product recommendation opt-in rate >30%

### Technical Performance
- [ ] All services <200 lines per file
- [ ] Database queries <500ms
- [ ] No linter errors
- [ ] 100% TypeScript coverage
- [ ] All features work offline

### Compliance
- [ ] HIPAA-compliant data handling
- [ ] USA PH & UAE regulations met
- [ ] User consent properly tracked
- [ ] Audit trail complete
- [ ] Data retention policies enforced

---

## Risk Assessment

### High Risk
1. **Pattern Recognition Accuracy**
   - Mitigation: Start with simple patterns, iterate based on feedback
   - Fallback: Manual review by health professionals

2. **Product Recommendation Compliance**
   - Mitigation: Legal review of all recommendations
   - Fallback: Disable feature if compliance issues arise

### Medium Risk
1. **Voice Input Accuracy**
   - Mitigation: Use proven speech-to-text API (OpenAI Whisper)
   - Fallback: Text input always available

2. **Performance with Large History**
   - Mitigation: Pagination, lazy loading, caching
   - Fallback: Limit history to last 90 days

### Low Risk
1. **UI/UX Changes**
   - Mitigation: A/B testing, user feedback
   - Fallback: Keep MVP1 UI as option

---

## Estimated Timeline

**Total Duration:** 12-16 weeks

| Phase | Duration | Start After |
|-------|----------|-------------|
| Phase 2.1: History | 2-3 weeks | MVP1 Complete |
| Phase 2.2: Patterns | 3-4 weeks | Phase 2.1 |
| Phase 2.3: UX | 2-3 weeks | Phase 2.1 |
| Phase 2.4: Products | 3-4 weeks | Phase 2.1 |
| Phase 2.5: Analytics | 2-3 weeks | Phase 2.2 |

**Parallel Development:**
- Phase 2.3 can run parallel with 2.2
- Phase 2.4 can run parallel with 2.2/2.3
- Phase 2.5 requires 2.1 and 2.2 complete

---

## Resource Requirements

### Development Team
- 2 Frontend Developers (React Native)
- 1 Backend Developer (Supabase/PostgreSQL)
- 1 AI/ML Engineer (Pattern Recognition)
- 1 QA Engineer
- 1 Product Manager

### External Services
- OpenAI API (increased usage)
- Speech-to-text service
- Push notification service
- PDF generation service
- Analytics platform

### Infrastructure
- Increased database storage (conversation history)
- Background job processing
- CDN for product images
- Backup and archival system

---

## Budget Estimate

### Development Costs
- Development Team: $80,000 - $120,000
- External Services: $2,000 - $5,000/month
- Infrastructure: $1,000 - $2,000/month
- Legal/Compliance Review: $5,000 - $10,000

**Total Estimated Budget:** $90,000 - $140,000

---

## Next Steps

### Immediate (Post-MVP1)
1. ✅ Validate MVP1 conversation storage (DONE)
2. ✅ Gather user feedback on current AI Coach
3. ⏳ Prioritize MVP2 features based on feedback
4. ⏳ Create detailed technical specs for Phase 2.1

### Short-term (Week 1-2)
1. Set up development environment for MVP2
2. Create database migration for new tables
3. Design UI mockups for conversation history
4. Plan sprint schedule

### Medium-term (Week 3-4)
1. Begin Phase 2.1 development
2. Set up analytics tracking
3. Conduct user interviews
4. Prepare product catalog

---

## Appendix

### Related Documents
- `AI_COACH_MVP1_README.md` - MVP1 implementation details
- `CONVERSATION_STORAGE_COMPLETE.md` - Storage system documentation
- `ROOT_CAUSE_ANALYSIS.md` - Technical debugging history
- `.cursorrulesBE` - Code quality standards

### Database Schema
- See: `migrations/012_health_conversations_schema.sql`
- New migrations will be numbered 013+

### API Documentation
- OpenAI API: https://platform.openai.com/docs
- Supabase: https://supabase.com/docs
- Expo Speech: https://docs.expo.dev/versions/latest/sdk/speech/

---

**Document Version:** 1.0  
**Created:** October 31, 2025  
**Last Updated:** October 31, 2025  
**Status:** Draft - Awaiting Approval  
**Owner:** Product Team  

---

*This plan builds on the successful MVP1 implementation and focuses on enhancing user experience, adding intelligence, and creating a comprehensive health companion system.*

