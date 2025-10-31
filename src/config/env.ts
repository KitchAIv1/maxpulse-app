// Environment Configuration
// Centralized access to environment variables with type safety
// Follows .cursorrules: <200 lines, single responsibility

import { OPENAI_API_KEY, OPENAI_MODEL, OPENAI_MAX_TOKENS, OPENAI_TEMPERATURE } from '@env';

export const ENV = {
  // OpenAI Configuration
  OPENAI_API_KEY: OPENAI_API_KEY || '',
  OPENAI_MODEL: OPENAI_MODEL || 'gpt-3.5-turbo', // Fallback to gpt-3.5-turbo (available on all accounts)
  OPENAI_MAX_TOKENS: parseInt(OPENAI_MAX_TOKENS || '1000', 10),
  OPENAI_TEMPERATURE: parseFloat(OPENAI_TEMPERATURE || '0.7'),
  
  // Validation
  isOpenAIConfigured: (): boolean => {
    return !!OPENAI_API_KEY && OPENAI_API_KEY.length > 0;
  },
};

