// AI Coach Chat Types
// TypeScript definitions for the AI Coach chat interface

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'coach';
  timestamp: string;
  contextData?: HealthContextData;
  quickActions?: QuickAction[];
  messageType?: 'text' | 'suggestion' | 'celebration' | 'insight';
}

export interface HealthContextData {
  steps?: { current: number; target: number };
  hydration?: { current: number; target: number; unit: 'oz' | 'ml' };
  sleep?: { current: number; target: number; unit: 'hours' };
  lifeScore?: number;
  date?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  action: 'log_hydration' | 'log_steps' | 'adjust_target' | 'plan_tomorrow' | 'check_score' | 'boost_score' | 'wellness_check' | 'symptom_log';
  params?: Record<string, any>;
  icon?: string;
}

export interface CoachResponse {
  message: string;
  contextData?: HealthContextData;
  quickActions?: QuickAction[];
  messageType?: ChatMessage['messageType'];
  followUpSuggestions?: string[];
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  lastActiveAt: string;
  context: HealthContextData;
}

export interface CoachPersonality {
  tone: 'encouraging' | 'motivational' | 'gentle' | 'analytical';
  responseStyle: 'brief' | 'detailed' | 'conversational';
  emojiUsage: 'minimal' | 'moderate' | 'frequent';
}

export interface CoachConfig {
  personality: CoachPersonality;
  maxMessageLength: number;
  contextRetention: number; // Number of messages to remember
  autoSuggestActions: boolean;
  celebrationThreshold: number; // Life score improvement to trigger celebration
}

// Chat UI Component Props
export interface ChatMessageProps {
  message: ChatMessage;
  onQuickAction: (action: QuickAction) => void;
  isLatest?: boolean;
}

export interface MessageBubbleProps {
  content: string;
  sender: 'user' | 'coach';
  timestamp: string;
  contextData?: HealthContextData;
  messageType?: ChatMessage['messageType'];
}

export interface QuickActionChipsProps {
  actions: QuickAction[];
  onActionPress: (action: QuickAction) => void;
  maxVisible?: number;
}

export interface ChatComposerProps {
  onSendMessage: (message: string) => void;
  onQuickAction: (action: QuickAction) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export interface CoachScreenProps {
  initialContext?: HealthContextData;
  preloadedMessage?: string;
  onClose?: () => void;
}

// Coach Entry Points
export type CoachEntryPoint = 
  | 'nav_tab'           // Direct navigation to coach tab
  | 'dashboard_card'    // From coach suggestion card on dashboard
  | 'life_score_tap'    // From life score battery tap
  | 'wellbeing_modal'   // From "Ask Coach" in wellbeing dashboard
  | 'quick_action'      // From quick action elsewhere in app
  | 'notification';     // From push notification

export interface CoachEntryContext {
  entryPoint: CoachEntryPoint;
  contextData?: HealthContextData;
  preloadedMessage?: string;
  suggestedActions?: QuickAction[];
}

// Wellness Check & Symptom Logging
export interface WellnessCheckData {
  id: string;
  userId: string;
  timestamp: string;
  mood: MoodLevel;
  energy: EnergyLevel;
  stress: StressLevel;
  symptoms: Symptom[];
  notes?: string;
  lifeScoreImpact?: number; // Estimated impact on Life Score
}

export type MoodLevel = 'excellent' | 'good' | 'neutral' | 'low' | 'poor';
export type EnergyLevel = 'high' | 'good' | 'moderate' | 'low' | 'exhausted';
export type StressLevel = 'minimal' | 'low' | 'moderate' | 'high' | 'overwhelming';

export interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  category: 'physical' | 'mental' | 'sleep' | 'digestive' | 'other';
  duration?: string; // "2 hours", "all day", etc.
  notes?: string;
}

export interface WellnessCheckResponse {
  disclaimer: string;
  followUpQuestions: WellnessQuestion[];
  lifestyleSuggestions: LifestyleSuggestion[];
  recommendSeekCare?: boolean;
}

export interface WellnessQuestion {
  id: string;
  question: string;
  type: 'mood' | 'energy' | 'stress' | 'symptom' | 'sleep' | 'hydration' | 'open';
  options?: string[];
  required?: boolean;
}

export interface LifestyleSuggestion {
  category: 'hydration' | 'sleep' | 'activity' | 'stress' | 'nutrition';
  suggestion: string;
  reasoning: string;
  actionable: boolean;
  quickAction?: QuickAction;
}

// Coach Analytics & Insights
export interface CoachInsight {
  type: 'trend' | 'achievement' | 'suggestion' | 'warning' | 'wellness';
  title: string;
  description: string;
  data: HealthContextData;
  confidence: number; // 0-1 confidence in the insight
  actionable: boolean;
  suggestedActions?: QuickAction[];
  wellnessData?: WellnessCheckData;
}

export interface CoachAnalytics {
  totalMessages: number;
  userEngagement: number; // 0-1 engagement score
  actionCompletionRate: number; // % of suggested actions completed
  averageResponseTime: number; // ms
  topActions: QuickAction[];
  insights: CoachInsight[];
}
