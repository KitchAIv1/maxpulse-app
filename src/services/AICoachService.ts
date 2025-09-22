// AI Coach Service
// Handles chat logic, AI responses, and health context analysis

import { 
  ChatMessage, 
  CoachResponse, 
  HealthContextData, 
  QuickAction, 
  CoachInsight,
  CoachConfig,
  CoachPersonality 
} from '../types/coach';

class AICoachService {
  private static instance: AICoachService;
  private config: CoachConfig;
  private messageHistory: ChatMessage[] = [];

  private constructor() {
    this.config = {
      personality: {
        tone: 'encouraging',
        responseStyle: 'conversational',
        emojiUsage: 'moderate',
      },
      maxMessageLength: 200,
      contextRetention: 10,
      autoSuggestActions: true,
      celebrationThreshold: 5, // 5 point improvement
    };
  }

  public static getInstance(): AICoachService {
    if (!AICoachService.instance) {
      AICoachService.instance = new AICoachService();
    }
    return AICoachService.instance;
  }

  /**
   * Generate AI coach response based on user message and health context
   */
  async generateResponse(
    userMessage: string, 
    healthContext: HealthContextData
  ): Promise<CoachResponse> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    const messageType = this.determineMessageType(userMessage, healthContext);
    const response = this.craftResponse(userMessage, healthContext, messageType);
    
    return response;
  }

  /**
   * Generate contextual greeting message
   */
  generateGreeting(healthContext: HealthContextData): CoachResponse {
    const { steps, hydration, sleep, lifeScore } = healthContext;
    
    let message = "Hi! I'm your wellness coach 🌟 ";
    let quickActions: QuickAction[] = [];

    if (lifeScore !== undefined) {
      if (lifeScore >= 80) {
        message += `Amazing work today! Your Life Score is ${lifeScore}%. `;
      } else if (lifeScore >= 60) {
        message += `Good progress! Your Life Score is ${lifeScore}%. `;
      } else {
        message += `Let's boost your wellness! Your Life Score is ${lifeScore}%. `;
      }
    }

    message += "What would you like to work on?";

    // Add contextual quick actions
    quickActions = this.generateContextualActions(healthContext);

    return {
      message,
      contextData: healthContext,
      quickActions,
      messageType: 'text',
    };
  }

  /**
   * Process quick action and generate response
   */
  async processQuickAction(
    action: QuickAction, 
    healthContext: HealthContextData
  ): Promise<CoachResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    switch (action.action) {
      case 'log_hydration':
        return this.handleHydrationLog(action.params?.amount || 8, healthContext);
      
      case 'check_score':
        return this.handleScoreCheck(healthContext);
      
      case 'boost_score':
        return this.handleScoreBoost(healthContext);
      
      case 'plan_tomorrow':
        return this.handlePlanTomorrow(healthContext);
      
      case 'adjust_target':
        return this.handleAdjustTarget(action.params, healthContext);
      
      default:
        return {
          message: "I'll help you with that! Let me know what specific action you'd like to take.",
          contextData: healthContext,
          messageType: 'text',
        };
    }
  }

  /**
   * Analyze health trends and generate insights
   */
  generateInsights(healthContext: HealthContextData): CoachInsight[] {
    const insights: CoachInsight[] = [];
    
    // Steps insight
    if (healthContext.steps) {
      const stepsPct = healthContext.steps.current / healthContext.steps.target;
      if (stepsPct < 0.5) {
        insights.push({
          type: 'suggestion',
          title: 'Step It Up',
          description: 'You\'re behind on steps today. A 10-minute walk can make a big difference!',
          data: healthContext,
          confidence: 0.9,
          actionable: true,
          suggestedActions: [{
            id: 'walk_reminder',
            label: 'Set walk reminder',
            action: 'boost_score',
            icon: '🚶‍♂️'
          }]
        });
      }
    }

    // Hydration insight
    if (healthContext.hydration) {
      const hydrationPct = healthContext.hydration.current / healthContext.hydration.target;
      if (hydrationPct > 0.9) {
        insights.push({
          type: 'achievement',
          title: 'Hydration Hero',
          description: 'Excellent hydration today! You\'re keeping your body well-fueled.',
          data: healthContext,
          confidence: 1.0,
          actionable: false,
        });
      }
    }

    return insights;
  }

  // Private helper methods

  private determineMessageType(
    userMessage: string, 
    healthContext: HealthContextData
  ): ChatMessage['messageType'] {
    const message = userMessage.toLowerCase();
    
    if (message.includes('score') || message.includes('how am i')) {
      return 'insight';
    }
    if (message.includes('water') || message.includes('drink')) {
      return 'suggestion';
    }
    if (message.includes('good') || message.includes('great')) {
      return 'celebration';
    }
    
    return 'text';
  }

  private craftResponse(
    userMessage: string, 
    healthContext: HealthContextData,
    messageType: ChatMessage['messageType']
  ): CoachResponse {
    const message = userMessage.toLowerCase();
    
    // Score inquiry
    if (message.includes('score') || message.includes('how am i')) {
      return this.handleScoreCheck(healthContext);
    }
    
    // Hydration related
    if (message.includes('water') || message.includes('drink') || message.includes('hydrat')) {
      return this.handleHydrationInquiry(healthContext);
    }
    
    // Steps related
    if (message.includes('steps') || message.includes('walk') || message.includes('exercise')) {
      return this.handleStepsInquiry(healthContext);
    }
    
    // Sleep related
    if (message.includes('sleep') || message.includes('tired') || message.includes('rest')) {
      return this.handleSleepInquiry(healthContext);
    }
    
    // General encouragement
    return {
      message: "I'm here to help you stay healthy! 💪 What would you like to focus on today?",
      contextData: healthContext,
      quickActions: this.generateContextualActions(healthContext),
      messageType: 'text',
    };
  }

  private handleScoreCheck(healthContext: HealthContextData): CoachResponse {
    const { steps, hydration, sleep, lifeScore } = healthContext;
    
    let message = `Your Life Score is ${lifeScore || 0}%! 🔋\n\n`;
    
    if (steps) {
      const stepsPct = Math.round((steps.current / steps.target) * 100);
      message += `Steps: ${stepsPct}% (${steps.current.toLocaleString()}/${steps.target.toLocaleString()})\n`;
    }
    
    if (hydration) {
      const hydrationPct = Math.round((hydration.current / hydration.target) * 100);
      message += `Hydration: ${hydrationPct}% (${hydration.current}/${hydration.target}oz)\n`;
    }
    
    if (sleep) {
      const sleepPct = Math.round((sleep.current / sleep.target) * 100);
      message += `Sleep: ${sleepPct}% (${sleep.current}h/${sleep.target}h)\n`;
    }

    const quickActions: QuickAction[] = [];
    
    // Suggest improvement for lowest metric
    const metrics = [
      { name: 'steps', pct: steps ? steps.current / steps.target : 1 },
      { name: 'hydration', pct: hydration ? hydration.current / hydration.target : 1 },
      { name: 'sleep', pct: sleep ? sleep.current / sleep.target : 1 },
    ].sort((a, b) => a.pct - b.pct);
    
    const weakest = metrics[0];
    if (weakest.pct < 0.8) {
      message += `\n💡 Boost tip: Focus on ${weakest.name} for the biggest impact!`;
      quickActions.push({
        id: 'boost_weakest',
        label: `Improve ${weakest.name}`,
        action: 'boost_score',
        params: { focus: weakest.name },
        icon: weakest.name === 'steps' ? '🚶‍♂️' : weakest.name === 'hydration' ? '💧' : '😴'
      });
    }

    return {
      message,
      contextData: healthContext,
      quickActions,
      messageType: 'insight',
    };
  }

  private handleHydrationLog(amount: number, healthContext: HealthContextData): CoachResponse {
    const newCurrent = (healthContext.hydration?.current || 0) + amount;
    const target = healthContext.hydration?.target || 80;
    const newPct = newCurrent / target;
    
    let message = `Great! Added ${amount}oz of water 💧\n`;
    message += `You're now at ${newCurrent}oz/${target}oz (${Math.round(newPct * 100)}%)`;
    
    if (newPct >= 1.0) {
      message += `\n\n🎉 Hydration goal complete! Your Life Score just got a boost!`;
    } else if (newPct >= 0.8) {
      message += `\n\nAlmost there! Just ${target - newCurrent}oz to go!`;
    }

    return {
      message,
      contextData: {
        ...healthContext,
        hydration: { current: newCurrent, target, unit: 'oz' }
      },
      messageType: newPct >= 1.0 ? 'celebration' : 'text',
    };
  }

  private handleHydrationInquiry(healthContext: HealthContextData): CoachResponse {
    const hydration = healthContext.hydration;
    if (!hydration) {
      return {
        message: "Let's track your hydration! How much water have you had today?",
        contextData: healthContext,
        quickActions: [
          { id: 'log_8oz', label: '+8oz', action: 'log_hydration', params: { amount: 8 }, icon: '💧' },
          { id: 'log_16oz', label: '+16oz', action: 'log_hydration', params: { amount: 16 }, icon: '💧' }
        ],
        messageType: 'suggestion',
      };
    }

    const pct = hydration.current / hydration.target;
    let message = `You've had ${hydration.current}oz of ${hydration.target}oz today (${Math.round(pct * 100)}%). `;
    
    if (pct < 0.5) {
      message += "Your body needs more water! 💧 Try to sip regularly throughout the day.";
    } else if (pct < 0.8) {
      message += "Good progress! Keep it up to hit your goal. 💪";
    } else {
      message += "Excellent hydration! You're keeping your body well-fueled. 🌟";
    }

    return {
      message,
      contextData: healthContext,
      quickActions: pct < 1.0 ? [
        { id: 'log_8oz', label: '+8oz', action: 'log_hydration', params: { amount: 8 }, icon: '💧' }
      ] : [],
      messageType: 'suggestion',
    };
  }

  private handleStepsInquiry(healthContext: HealthContextData): CoachResponse {
    const steps = healthContext.steps;
    if (!steps) {
      return {
        message: "Let's get moving! Every step counts toward your wellness goals. 🚶‍♂️",
        contextData: healthContext,
        messageType: 'suggestion',
      };
    }

    const pct = steps.current / steps.target;
    let message = `You've taken ${steps.current.toLocaleString()} of ${steps.target.toLocaleString()} steps today (${Math.round(pct * 100)}%). `;
    
    if (pct < 0.5) {
      message += "Time for a walk! Even 10 minutes can make a big difference. 🚶‍♂️";
    } else if (pct < 0.8) {
      message += "Great progress! You're well on your way to your goal. 💪";
    } else {
      message += "Amazing work! You're crushing your step goal today! 🎉";
    }

    return {
      message,
      contextData: healthContext,
      messageType: 'suggestion',
    };
  }

  private handleSleepInquiry(healthContext: HealthContextData): CoachResponse {
    const sleep = healthContext.sleep;
    if (!sleep) {
      return {
        message: "Quality sleep is crucial for your wellness! How many hours did you sleep last night? 😴",
        contextData: healthContext,
        messageType: 'suggestion',
      };
    }

    const pct = sleep.current / sleep.target;
    let message = `You got ${sleep.current}h of ${sleep.target}h sleep (${Math.round(pct * 100)}%). `;
    
    if (pct < 0.7) {
      message += "Your body needs more rest! Try to wind down 30 minutes earlier tonight. 😴";
    } else if (pct < 0.9) {
      message += "Decent rest! A bit more sleep could boost your energy tomorrow. 💤";
    } else {
      message += "Excellent sleep! You're giving your body the recovery it needs. 🌟";
    }

    return {
      message,
      contextData: healthContext,
      messageType: 'suggestion',
    };
  }

  private handleScoreBoost(healthContext: HealthContextData): CoachResponse {
    // Find the metric that needs most attention
    const metrics = [
      { name: 'steps', pct: healthContext.steps ? healthContext.steps.current / healthContext.steps.target : 1, icon: '🚶‍♂️' },
      { name: 'hydration', pct: healthContext.hydration ? healthContext.hydration.current / healthContext.hydration.target : 1, icon: '💧' },
      { name: 'sleep', pct: healthContext.sleep ? healthContext.sleep.current / healthContext.sleep.target : 1, icon: '😴' },
    ].sort((a, b) => a.pct - b.pct);

    const weakest = metrics[0];
    
    let message = `Quick wins to boost your Life Score:\n\n`;
    
    if (weakest.name === 'steps' && weakest.pct < 0.8) {
      message += `${weakest.icon} Take a 5-minute walk (adds ~500 steps)\n`;
    }
    if (metrics.find(m => m.name === 'hydration')!.pct < 0.8) {
      message += `💧 Drink a glass of water (8oz boost)\n`;
    }
    if (metrics.find(m => m.name === 'sleep')!.pct < 0.8) {
      message += `😴 Plan 30min earlier bedtime tonight\n`;
    }
    
    message += `\nSmall actions = big improvements! Which one sounds good?`;

    return {
      message,
      contextData: healthContext,
      quickActions: [
        { id: 'log_water', label: 'Log water', action: 'log_hydration', params: { amount: 8 }, icon: '💧' },
        { id: 'plan_tomorrow', label: 'Plan tomorrow', action: 'plan_tomorrow', icon: '📅' }
      ],
      messageType: 'suggestion',
    };
  }

  private handlePlanTomorrow(healthContext: HealthContextData): CoachResponse {
    return {
      message: "Great idea! Let's set you up for success tomorrow 📅\n\nI recommend keeping your current targets and focusing on consistency. Small daily wins build lasting habits!",
      contextData: healthContext,
      quickActions: [
        { id: 'adjust_targets', label: 'Adjust targets', action: 'adjust_target', icon: '🎯' }
      ],
      messageType: 'suggestion',
    };
  }

  private handleAdjustTarget(params: any, healthContext: HealthContextData): CoachResponse {
    return {
      message: "Smart thinking! 🎯 Personalized targets work better than one-size-fits-all goals.\n\nWhat would you like to adjust? I can help you find the sweet spot between challenging and achievable.",
      contextData: healthContext,
      messageType: 'suggestion',
    };
  }

  private generateContextualActions(healthContext: HealthContextData): QuickAction[] {
    const actions: QuickAction[] = [
      { id: 'check_score', label: 'Check my Life Score', action: 'check_score', icon: '🔋' },
    ];

    // Add hydration action if not complete
    if (healthContext.hydration && healthContext.hydration.current < healthContext.hydration.target) {
      actions.push({
        id: 'add_water',
        label: '+8oz water',
        action: 'log_hydration',
        params: { amount: 8 },
        icon: '💧'
      });
    }

    // Add boost action if score is low
    if (healthContext.lifeScore && healthContext.lifeScore < 80) {
      actions.push({
        id: 'boost_score',
        label: 'Boost my score',
        action: 'boost_score',
        icon: '⚡'
      });
    }

    actions.push(
      { id: 'plan_week', label: 'Plan week', action: 'plan_tomorrow', icon: '📅' }
    );

    return actions;
  }
}

export default AICoachService;
