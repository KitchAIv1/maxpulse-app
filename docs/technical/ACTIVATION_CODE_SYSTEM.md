# MaxPulse Activation Code Authentication System

## Overview

The MaxPulse app uses a unique activation code system that seamlessly integrates with pre-existing health assessment data. Users receive activation codes from distributors/coaches after completing health assessments, providing instant access to personalized health transformation programs.

## Architecture

### Data Flow
```
Health Assessment → Activation Code Generation → App Signup → Profile Confirmation → Personalized App Experience
```

### Key Components
1. **Activation Code Validation**: Real-time code verification during signup
2. **Profile Data Extraction**: Automatic profile setup from assessment data
3. **Dynamic Target Generation**: Personalized health targets based on assessment results
4. **90-Day Plan Integration**: Progressive health transformation roadmap

## Database Schema

### `activation_codes` Table
```sql
CREATE TABLE activation_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,                    -- The activation code string
    distributor_id UUID REFERENCES distributor_profiles(id),
    session_id TEXT NOT NULL,                     -- Links to assessment session
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    onboarding_data JSONB NOT NULL,              -- Complete assessment analysis
    purchase_id TEXT,
    plan_type TEXT,
    purchase_amount NUMERIC(10,2),
    status TEXT DEFAULT 'pending',               -- pending|activated|expired
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `app_user_profiles` Table
```sql
CREATE TABLE app_user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    height_cm INTEGER NOT NULL,
    weight_kg INTEGER NOT NULL,
    bmi NUMERIC(5,2) NOT NULL,
    medical_conditions TEXT[],
    medical_allergies TEXT[],
    medical_medications TEXT[],
    mental_health_data JSONB,
    activation_code_id UUID REFERENCES activation_codes(id),
    distributor_id UUID,
    session_id TEXT,
    plan_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Onboarding Data Structure

The `onboarding_data` JSONB field contains comprehensive health assessment results:

### Demographics
```json
{
  "demographics": {
    "age": 45,
    "bmi": 30.9,
    "gender": "male",
    "heightCm": 180,
    "weightKg": 100
  }
}
```

### Personalized Targets
```json
{
  "personalizedTargets": {
    "steps": {
      "targetDaily": 8000,
      "currentDaily": 5000,
      "deficitSteps": 3000
    },
    "sleep": {
      "targetMinHours": 7,
      "targetMaxHours": 9,
      "currentHours": 6.5,
      "deficitHours": 0.5
    },
    "hydration": {
      "targetLiters": 3.5,
      "currentLiters": 1.2,
      "deficitPercentage": 65.7
    },
    "weight": {
      "targetMinKg": 75,
      "targetMaxKg": 80,
      "currentKg": 100,
      "excessKg": 20
    },
    "bmi": {
      "target": 24.5,
      "current": 30.9,
      "category": "Obese Class I"
    }
  }
}
```

### Medical Information
```json
{
  "medical": {
    "conditions": ["high_blood_pressure", "type_2_diabetes"],
    "allergies": ["shellfish", "peanuts"],
    "medications": ["metformin", "lisinopril"]
  }
}
```

### Mental Health Assessment
```json
{
  "mentalHealth": {
    "energy": "low",
    "stress": "high",
    "burnout": "moderate",
    "mindfulness": "low",
    "socialSupport": "moderate"
  }
}
```

### 90-Day Transformation Roadmap
```json
{
  "transformationRoadmap": {
    "phases": [
      {
        "name": "Foundation Building",
        "phase": 1,
        "weeks": "Weeks 1-4",
        "focus": ["sleep_optimization", "hydration_habits"],
        "actions": [
          {
            "action": "Establish consistent bedtime routine",
            "how": "Set fixed bedtime and wake time",
            "why": "Improve sleep quality and duration",
            "tracking": "Sleep hours in app"
          }
        ],
        "expectedResults": ["Better sleep quality", "Increased energy"],
        "weeklyMilestones": [
          {
            "week": 1,
            "focus": "Sleep routine establishment",
            "expectedChanges": ["Earlier bedtime", "Consistent wake time"]
          }
        ]
      }
    ],
    "successFactors": [
      "Consistency over perfection",
      "Gradual habit formation",
      "Regular progress tracking"
    ],
    "overallTimeline": "90 days to sustainable health transformation"
  }
}
```

## Authentication Flow

### 1. Signup Screen (`SignupScreen.tsx`)

**Features:**
- Real-time activation code validation
- Email/password input with validation
- Visual feedback for code status
- Error handling for invalid/expired codes

**Code Validation Process:**
```typescript
const validateActivationCode = async (code: string) => {
  const result = await activationService.validateActivationCode(code);
  
  if (result.isValid) {
    // Show success state
    setActivationCodeStatus({
      isValid: true,
      message: 'Valid activation code',
      activationData: result.activationCode
    });
  } else {
    // Show error state
    setActivationCodeStatus({
      isValid: false,
      message: result.error || 'Invalid code'
    });
  }
};
```

### 2. Profile Confirmation Screen (`ProfileConfirmationScreen.tsx`)

**Features:**
- Display assessment-derived profile data
- Editable fields for user customization
- Read-only fields for assessment data
- Personalized target preview
- Medical information display

**Profile Data Extraction:**
```typescript
const createUserProfileFromActivation = (
  activationCode: ActivationCode, 
  userId: string
): UserProfileFromActivation => {
  const { demographics, medical, mentalHealth } = activationCode.onboarding_data;
  
  return {
    email: activationCode.customer_email,
    name: activationCode.customer_name,
    age: demographics.age,
    gender: demographics.gender,
    height_cm: demographics.heightCm,
    weight_kg: demographics.weightKg,
    bmi: demographics.bmi,
    medical_conditions: medical.conditions,
    medical_allergies: medical.allergies,
    medical_medications: medical.medications,
    mental_health_data: mentalHealth,
    activation_code_id: activationCode.id,
    distributor_id: activationCode.distributor_id,
    session_id: activationCode.session_id,
    plan_type: activationCode.plan_type
  };
};
```

### 3. Authentication Container (`AuthContainer.tsx`)

**Flow Management:**
```typescript
type AuthFlow = 'login' | 'signup' | 'profile-confirmation';

const handleSignupSuccess = (user: any, activationCode: ActivationCode) => {
  setAuthData({ user, activationCode });
  setCurrentFlow('profile-confirmation');
};

const handleProfileConfirmed = (profile: UserProfileFromActivation) => {
  if (authData?.user) {
    onAuthComplete(authData.user, profile);
  }
};
```

## Service Functions

### Activation Service (`activationService`)

#### `validateActivationCode(code: string)`
```typescript
async validateActivationCode(code: string): Promise<ActivationCodeValidationResult> {
  const { data, error } = await supabase
    .from('activation_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error || !data) {
    return { isValid: false, error: 'Invalid activation code' };
  }

  const now = new Date();
  const isExpired = now > new Date(data.expires_at);
  const isUsed = data.status === 'activated';

  return {
    isValid: !isExpired && !isUsed,
    isExpired,
    isUsed,
    activationCode: data,
    error: isExpired ? 'Code expired' : isUsed ? 'Code already used' : undefined
  };
}
```

#### `consumeActivationCode(code: string, userId: string)`
```typescript
async consumeActivationCode(code: string, userId: string): Promise<ActivationCodeConsumptionResult> {
  const validation = await this.validateActivationCode(code);
  
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  const { data, error } = await supabase
    .from('activation_codes')
    .update({
      status: 'activated',
      activated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('code', code.toUpperCase())
    .select()
    .single();

  return error ? 
    { success: false, error: 'Failed to activate code' } :
    { success: true, activationCode: data };
}
```

#### `extractDynamicTargets(activationCode: ActivationCode)`
```typescript
extractDynamicTargets(activationCode: ActivationCode): DynamicTargets {
  const { personalizedTargets } = activationCode.onboarding_data;
  
  return {
    steps: personalizedTargets.steps?.targetDaily || 8000,
    waterOz: personalizedTargets.hydration?.targetLiters 
      ? Math.round(personalizedTargets.hydration.targetLiters * 33.814) 
      : 80,
    sleepHr: personalizedTargets.sleep?.targetMinHours && personalizedTargets.sleep?.targetMaxHours
      ? (personalizedTargets.sleep.targetMinHours + personalizedTargets.sleep.targetMaxHours) / 2
      : 8
  };
}
```

## Security Considerations

### Row Level Security (RLS)
```sql
-- Enable RLS on activation codes (read-only for validation)
ALTER TABLE activation_codes ENABLE ROW LEVEL SECURITY;

-- Allow reading activation codes for validation during signup
CREATE POLICY "Allow activation code validation" ON activation_codes
    FOR SELECT USING (status = 'pending' AND expires_at > NOW());

-- Enable RLS on user profiles
ALTER TABLE app_user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only access their own profile
CREATE POLICY "Users can manage own profile" ON app_user_profiles
    FOR ALL USING (auth.uid() = user_id);
```

### Data Validation
- **Code Format**: Alphanumeric codes with specific length requirements
- **Email Validation**: Standard email format validation
- **Expiration Checks**: Automatic expiration handling
- **Usage Tracking**: Prevent code reuse and abuse

### Privacy Protection
- **Health Data Encryption**: All health data encrypted in transit and at rest
- **Minimal Data Exposure**: Only necessary data exposed to client
- **Audit Logging**: Track activation code usage and access patterns
- **Data Retention**: Clear policies for data retention and deletion

## Error Handling

### Common Error Scenarios
1. **Invalid Activation Code**: Code doesn't exist in database
2. **Expired Code**: Code has passed expiration date
3. **Already Used Code**: Code has been previously activated
4. **Network Issues**: Connection problems during validation
5. **Database Errors**: Backend service unavailable

### Error Messages
```typescript
const ERROR_MESSAGES = {
  INVALID_CODE: 'Invalid activation code. Please check and try again.',
  EXPIRED_CODE: 'This activation code has expired. Please contact your distributor.',
  USED_CODE: 'This activation code has already been used.',
  NETWORK_ERROR: 'Unable to validate code. Please check your connection.',
  UNKNOWN_ERROR: 'An error occurred. Please try again later.'
};
```

## Integration Points

### With Assessment System
- **Session Linking**: Activation codes link to assessment sessions
- **Data Continuity**: Seamless data flow from assessment to app
- **Distributor Tracking**: Maintain distributor relationships

### With 90-Day Plans
- **Plan Assignment**: Automatic plan assignment based on assessment
- **Target Progression**: Dynamic target adjustment over time
- **Milestone Tracking**: Progress tracking against plan milestones

### With AI Coach
- **Context Awareness**: AI Coach has access to assessment data
- **Personalized Advice**: Recommendations based on assessment results
- **Progress Correlation**: Link current progress to original assessment

## Testing Strategy

### Unit Tests
- Activation code validation logic
- Profile data extraction functions
- Target generation algorithms
- Error handling scenarios

### Integration Tests
- End-to-end signup flow
- Database interaction testing
- Authentication state management
- Profile creation and updates

### User Acceptance Tests
- Real activation code testing
- Profile confirmation flow
- Error scenario handling
- Cross-platform compatibility

## Monitoring & Analytics

### Key Metrics
- **Activation Rate**: Percentage of codes successfully activated
- **Time to Activation**: Duration from code generation to activation
- **Profile Completion Rate**: Users who complete profile confirmation
- **Error Rates**: Frequency of different error types

### Logging
- Activation code validation attempts
- Profile creation events
- Authentication failures
- System errors and exceptions

---

This activation code system provides a seamless bridge between health assessments and personalized app experiences, ensuring users receive immediate value from their health transformation journey.
