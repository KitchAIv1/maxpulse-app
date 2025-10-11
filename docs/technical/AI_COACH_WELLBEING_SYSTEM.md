# MaxPulse AI Coach & Wellbeing Dashboard System

## Overview

The MaxPulse AI Coach and Wellbeing Dashboard provide intelligent, personalized health guidance through natural language conversations and comprehensive health insights. The system combines real-time health data analysis with contextual AI responses to create a supportive, interactive health companion.

## Architecture

### System Components
```
Health Data → AI Analysis Engine → Contextual Responses → User Interface
     ↓              ↓                    ↓                    ↓
Life Score → Wellness Insights → Personalized Advice → Chat Interface
```

### Key Features
1. **Natural Language Processing**: Understand user health conversations
2. **Contextual Health Analysis**: Correlate symptoms with current metrics
3. **Wellness Assessments**: Structured mood, energy, and stress evaluations
4. **Wellbeing Dashboard**: Comprehensive Life Score breakdown and insights
5. **Trend Analysis**: Historical health data visualization and patterns

## AI Coach System

### Chat Interface Architecture

#### Core Components
- **`CoachScreen.tsx`**: Main chat interface with message history
- **`MessageBubble.tsx`**: Individual message display with wellness indicators
- **`ChatComposer.tsx`**: Input field with quick action buttons
- **`QuickActionChips.tsx`**: Pre-defined action buttons
- **`WellnessPrompts.tsx`**: Example conversation starters

#### Message Flow
```typescript
interface ChatMessage {
  id: string;
  type: 'user' | 'coach';
  content: string;
  timestamp: Date;
  metadata?: {
    action?: string;
    healthContext?: HealthContextData;
    insights?: CoachInsight[];
  };
}
```

### Natural Language Processing

#### Conversation Types
1. **General Health Questions**: "How can I improve my sleep?"
2. **Symptom Sharing**: "I've been feeling tired and have headaches"
3. **Progress Inquiries**: "How am I doing with my goals?"
4. **Wellness Checks**: Structured health assessments
5. **Quick Actions**: "Log 8oz of water" or "Check my Life Score"

#### Intent Recognition
```typescript
export function analyzeMessageIntent(message: string): MessageIntent {
  const lowerMessage = message.toLowerCase();
  
  // Symptom sharing patterns
  if (SYMPTOM_PATTERNS.some(pattern => pattern.test(lowerMessage))) {
    return 'symptom_sharing';
  }
  
  // Wellness check requests
  if (WELLNESS_CHECK_PATTERNS.some(pattern => pattern.test(lowerMessage))) {
    return 'wellness_check';
  }
  
  // Progress inquiries
  if (PROGRESS_PATTERNS.some(pattern => pattern.test(lowerMessage))) {
    return 'progress_check';
  }
  
  return 'general_conversation';
}
```

### Contextual Response Generation

#### Health Context Analysis
```typescript
interface HealthContextData {
  currentMetrics: {
    steps: number;
    stepTarget: number;
    hydrationOz: number;
    hydrationTarget: number;
    sleepHours: number;
    sleepTarget: number;
    lifeScore: number;
  };
  trends: {
    stepsWeekly: number[];
    hydrationWeekly: number[];
    sleepWeekly: number[];
    lifeScoreWeekly: number[];
  };
  recentActivity: {
    lastHydrationLog: Date;
    lastMoodCheckIn: Date;
    lastSleepUpdate: Date;
  };
}
```

#### Response Generation Logic
```typescript
export function generateCoachResponse(
  message: string,
  healthContext: HealthContextData,
  conversationHistory: ChatMessage[]
): CoachResponse {
  const intent = analyzeMessageIntent(message);
  const insights = analyzeHealthContext(healthContext);
  
  switch (intent) {
    case 'symptom_sharing':
      return generateSymptomResponse(message, insights);
    
    case 'wellness_check':
      return generateWellnessCheckResponse(healthContext);
    
    case 'progress_check':
      return generateProgressResponse(insights);
    
    default:
      return generateGeneralResponse(message, insights);
  }
}
```

### Wellness Check System

#### Assessment Structure
```typescript
interface WellnessCheckData {
  mood: MoodLevel;           // 'excellent' | 'good' | 'neutral' | 'low' | 'poor'
  energy: EnergyLevel;       // 'high' | 'moderate' | 'low' | 'exhausted'
  stress: StressLevel;       // 'minimal' | 'manageable' | 'high' | 'overwhelming'
  hydration: number;         // Current hydration level
  sleep: number;             // Hours of sleep last night
  symptoms?: string[];       // Optional symptom list
}
```

#### Wellness Check Flow
1. **Medical Disclaimer**: Display health information disclaimer
2. **Mood Assessment**: 5-point mood scale with visual indicators
3. **Energy Level**: Current energy state evaluation
4. **Stress Assessment**: Stress level with coping suggestions
5. **Physical Symptoms**: Optional symptom reporting
6. **Correlation Analysis**: Link responses to current health metrics
7. **Personalized Recommendations**: Actionable advice based on assessment

#### Response Generation
```typescript
export function generateWellnessCheckResponse(
  checkData: WellnessCheckData,
  healthContext: HealthContextData
): WellnessCheckResponse {
  const correlations = analyzeWellnessCorrelations(checkData, healthContext);
  
  return {
    summary: generateWellnessSummary(checkData),
    insights: correlations.insights,
    recommendations: generateWellnessRecommendations(correlations),
    followUpQuestions: generateWellnessFollowUps(checkData),
    riskFactors: identifyRiskFactors(checkData, healthContext)
  };
}
```

### Quick Actions System

#### Available Actions
```typescript
const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'wellness_check',
    label: 'Wellness Check',
    action: 'wellness_check',
    icon: '🩺'
  },
  {
    id: 'check_score',
    label: 'Check my Life Score',
    action: 'check_score',
    icon: '🔋'
  },
  {
    id: 'boost_score',
    label: 'Boost my score',
    action: 'boost_score',
    icon: '⚡'
  },
  {
    id: 'log_water',
    label: 'Log hydration',
    action: 'log_hydration',
    params: { amount: 8 },
    icon: '💧'
  }
];
```

#### Dynamic Action Generation
```typescript
export function generateContextualQuickActions(
  healthContext: HealthContextData
): QuickAction[] {
  const actions: QuickAction[] = [...DEFAULT_QUICK_ACTIONS];
  
  // Add contextual actions based on current state
  if (healthContext.currentMetrics.hydrationOz < healthContext.currentMetrics.hydrationTarget * 0.5) {
    actions.push({
      id: 'hydration_reminder',
      label: 'Drink water now',
      action: 'log_hydration',
      params: { amount: 16 },
      icon: '💧',
      priority: 'high'
    });
  }
  
  return actions.sort((a, b) => (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0));
}
```

## Wellbeing Dashboard System

### Dashboard Architecture

#### Core Components
- **`WellbeingDashboard.tsx`**: Main modal container
- **`BatteryGauge.tsx`**: Life Score visualization with battery metaphor
- **`ContributionBar.tsx`**: Individual metric contribution bars
- **`DailyInsights.tsx`**: AI-generated daily recommendations
- **`TrendsChart.tsx`**: Historical Life Score trend visualization

#### Life Score Breakdown
```typescript
interface LifeScoreBreakdown {
  overall: number;           // 0-100 overall Life Score
  steps: number;            // Steps contribution (0-1)
  hydration: number;        // Hydration contribution (0-1)
  sleep: number;            // Sleep contribution (0-1)
  mood: number;             // Mood check-in frequency contribution (0-1)
}
```

### Battery Gauge Visualization

#### Visual Design
- **Battery Shape**: Rounded rectangle with terminal
- **Fill Animation**: Smooth color transition based on score
- **Color Coding**: 
  - 0-30%: Red (Critical)
  - 31-60%: Orange (Needs Attention)
  - 61-80%: Yellow (Good)
  - 81-100%: Green (Excellent)

#### Implementation
```typescript
export const BatteryGauge: React.FC<BatteryGaugeProps> = ({
  score,
  size = 120,
  animated = true
}) => {
  const fillHeight = (score / 100) * (size * 0.7);
  const fillColor = getBatteryColor(score);
  
  return (
    <View style={[styles.container, { width: size, height: size * 1.2 }]}>
      <Svg width={size} height={size * 1.2}>
        {/* Battery outline */}
        <Rect
          x={size * 0.1}
          y={size * 0.1}
          width={size * 0.8}
          height={size * 0.7}
          rx={size * 0.05}
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={2}
        />
        
        {/* Battery fill */}
        <Rect
          x={size * 0.12}
          y={size * 0.8 - fillHeight}
          width={size * 0.76}
          height={fillHeight}
          rx={size * 0.03}
          fill={fillColor}
        />
        
        {/* Battery terminal */}
        <Rect
          x={size * 0.4}
          y={size * 0.05}
          width={size * 0.2}
          height={size * 0.05}
          rx={size * 0.02}
          fill="rgba(255,255,255,0.3)"
        />
      </Svg>
      
      <Text style={styles.scoreText}>{score}%</Text>
    </View>
  );
};
```

### Contribution Bars

#### Metric Visualization
```typescript
export const ContributionBar: React.FC<ContributionBarProps> = ({
  label,
  value,
  target,
  color,
  icon
}) => {
  const percentage = Math.min(value / target, 1);
  const isComplete = percentage >= 1;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.percentage, isComplete && styles.complete]}>
          {Math.round(percentage * 100)}%
        </Text>
      </View>
      
      <View style={styles.barContainer}>
        <View style={styles.barBackground} />
        <View 
          style={[
            styles.barFill, 
            { width: `${percentage * 100}%`, backgroundColor: color }
          ]} 
        />
      </View>
      
      <Text style={styles.details}>
        {value} / {target} {getUnitLabel(label)}
      </Text>
    </View>
  );
};
```

### Daily Insights Generation

#### Insight Types
1. **Achievement Recognition**: Celebrate completed goals
2. **Improvement Suggestions**: Actionable recommendations
3. **Pattern Recognition**: Identify trends and correlations
4. **Motivation Boosters**: Encouraging messages for progress

#### Insight Generation Logic
```typescript
export function generateDailyInsights(
  breakdown: LifeScoreBreakdown,
  trends: HealthTrends,
  userProfile: UserProfile
): DailyInsight[] {
  const insights: DailyInsight[] = [];
  
  // Achievement insights
  if (breakdown.overall >= 80) {
    insights.push({
      type: 'achievement',
      title: 'Excellent Health Day!',
      message: 'You\'re crushing your health goals today. Keep up the amazing work!',
      icon: '🎉',
      priority: 'high'
    });
  }
  
  // Improvement insights
  const lowestMetric = findLowestMetric(breakdown);
  if (lowestMetric.value < 0.5) {
    insights.push({
      type: 'improvement',
      title: `Boost Your ${lowestMetric.name}`,
      message: getImprovementSuggestion(lowestMetric.name),
      icon: getMetricIcon(lowestMetric.name),
      priority: 'medium',
      actionable: true
    });
  }
  
  // Trend insights
  const trendInsight = analyzeTrends(trends);
  if (trendInsight) {
    insights.push(trendInsight);
  }
  
  return insights.sort((a, b) => getPriority(b.priority) - getPriority(a.priority));
}
```

### Trends Visualization

#### Chart Implementation
```typescript
export const TrendsChart: React.FC<TrendsChartProps> = ({
  data,
  period,
  onPeriodChange
}) => {
  const chartData = formatChartData(data, period);
  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value));
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Life Score Trends</Text>
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, period === '7d' && styles.activePeriod]}
            onPress={() => onPeriodChange('7d')}
          >
            <Text style={styles.periodText}>7D</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === '30d' && styles.activePeriod]}
            onPress={() => onPeriodChange('30d')}
          >
            <Text style={styles.periodText}>30D</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <Svg width="100%" height={200}>
          {/* Chart implementation with SVG paths */}
          <Path
            d={generateTrendPath(chartData)}
            stroke="#00ff88"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {chartData.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={4}
              fill="#00ff88"
            />
          ))}
        </Svg>
      </View>
      
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={styles.statValue}>
            {Math.round(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length)}%
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Best Day</Text>
          <Text style={styles.statValue}>{maxValue}%</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Improvement</Text>
          <Text style={[styles.statValue, styles.improvement]}>
            +{Math.round(((chartData[chartData.length - 1]?.value || 0) - (chartData[0]?.value || 0)))}%
          </Text>
        </View>
      </View>
    </View>
  );
};
```

## Integration Points

### With Health Tracking
- **Real-time Data**: AI Coach accesses current health metrics
- **Historical Analysis**: Trends inform conversation context
- **Goal Correlation**: Link advice to specific health targets

### With Mood Tracking
- **Emotional Context**: Mood check-ins inform AI responses
- **Wellness Correlation**: Connect physical and mental health
- **Journal Integration**: Use journal entries for deeper insights

### With Activation System
- **Personalized Context**: AI knows user's assessment results
- **Plan Awareness**: Coach understands 90-day transformation goals
- **Risk Factors**: AI considers medical conditions and medications

## Privacy & Security

### Data Handling
- **Local Processing**: Sensitive analysis performed on device when possible
- **Encrypted Storage**: All conversation history encrypted
- **Minimal Logging**: Only necessary data logged for improvement
- **User Control**: Users can delete conversation history

### Health Information
- **Medical Disclaimers**: Clear disclaimers about AI limitations
- **Professional Referrals**: Encourage professional consultation when appropriate
- **Emergency Detection**: Recognize urgent health concerns and provide resources

### Compliance
- **HIPAA Considerations**: Health data handling best practices
- **Privacy Policies**: Clear data usage and retention policies
- **User Consent**: Explicit consent for health data analysis

## Performance Optimization

### Response Generation
- **Caching**: Cache common responses and patterns
- **Lazy Loading**: Load conversation history incrementally
- **Background Processing**: Pre-generate insights when possible

### UI Performance
- **Virtual Scrolling**: Efficient message list rendering
- **Image Optimization**: Optimized icons and graphics
- **Animation Performance**: Smooth 60fps animations

### Data Management
- **Conversation Limits**: Automatic cleanup of old conversations
- **Compression**: Compress stored conversation data
- **Sync Optimization**: Efficient data synchronization

## Testing Strategy

### AI Response Testing
- **Intent Recognition**: Test message classification accuracy
- **Context Awareness**: Verify health data integration
- **Response Quality**: Evaluate helpfulness and accuracy

### UI Testing
- **Chat Interface**: Message display and input functionality
- **Dashboard Interactions**: Modal behavior and navigation
- **Cross-platform**: iOS and Android compatibility

### Integration Testing
- **Health Data Flow**: Verify data pipeline integrity
- **Real-time Updates**: Test live data synchronization
- **Error Handling**: Graceful failure scenarios

---

The AI Coach and Wellbeing Dashboard system provides users with intelligent, personalized health guidance that evolves with their journey, creating a supportive and insightful health companion that helps users achieve their transformation goals.
