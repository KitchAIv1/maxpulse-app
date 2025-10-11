// Test Activation Code Service
// Simple test function to verify activation code integration

import { activationService } from '../services/supabase';

/**
 * Test activation code validation with a real code from the database
 * Use this for testing the integration
 */
export const testActivationCodeIntegration = async () => {
  console.log('🧪 Testing MaxPulse Activation Code Integration...');
  
  try {
    // Test with one of the sample codes from the database
    const testCode = 'EM9HQ54P'; // From the sample data you provided
    
    console.log(`📝 Testing validation for code: ${testCode}`);
    
    const validationResult = await activationService.validateActivationCode(testCode);
    
    console.log('✅ Validation Result:', {
      isValid: validationResult.isValid,
      isExpired: validationResult.isExpired,
      isUsed: validationResult.isUsed,
      error: validationResult.error,
      hasActivationData: !!validationResult.activationCode,
    });

    if (validationResult.activationCode) {
      console.log('📊 Activation Code Data Preview:', {
        id: validationResult.activationCode.id,
        customerName: validationResult.activationCode.customer_name,
        status: validationResult.activationCode.status,
        planType: validationResult.activationCode.plan_type,
        hasOnboardingData: !!validationResult.activationCode.onboarding_data,
      });

      // Test target extraction
      const dynamicTargets = activationService.extractDynamicTargets(validationResult.activationCode);
      console.log('🎯 Extracted Dynamic Targets:', dynamicTargets);

      // Test profile creation
      const mockUserId = 'test-user-id';
      const userProfile = activationService.createUserProfileFromActivation(
        validationResult.activationCode, 
        mockUserId
      );
      console.log('👤 Generated User Profile Preview:', {
        name: userProfile.name,
        email: userProfile.email,
        age: userProfile.age,
        bmi: userProfile.bmi,
        medicalConditions: userProfile.medical_conditions,
        planType: userProfile.plan_type,
      });
    }

    console.log('✅ Activation Code Integration Test Complete!');
    return true;
  } catch (error) {
    console.error('❌ Activation Code Integration Test Failed:', error);
    return false;
  }
};

/**
 * Test with multiple activation codes to verify different scenarios
 */
export const testMultipleActivationCodes = async () => {
  console.log('🧪 Testing Multiple Activation Codes...');
  
  const testCodes = [
    'EM9HQ54P', // Should be valid/pending
    'GT3AC6HT', // Should be valid/pending
    'INVALID123', // Should be invalid
  ];

  for (const code of testCodes) {
    try {
      console.log(`\n📝 Testing code: ${code}`);
      const result = await activationService.validateActivationCode(code);
      console.log(`Result: ${result.isValid ? '✅ Valid' : '❌ Invalid'} - ${result.error || 'No error'}`);
    } catch (error) {
      console.error(`❌ Error testing ${code}:`, error);
    }
  }
};

// Export for easy testing in development
export const runActivationTests = async () => {
  await testActivationCodeIntegration();
  await testMultipleActivationCodes();
};
