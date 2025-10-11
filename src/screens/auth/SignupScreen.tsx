// Signup Screen Component
// Handles user registration with activation code validation

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { activationService, authService } from '../../services/supabase';
import { ActivationCode } from '../../types';

interface SignupScreenProps {
  onSignupSuccess: (user: any, activationCode: ActivationCode) => void;
  onSwitchToLogin: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({
  onSignupSuccess,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    activationCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activationCodeStatus, setActivationCodeStatus] = useState<{
    isValid: boolean;
    isChecking: boolean;
    message: string;
    activationData?: ActivationCode;
  }>({
    isValid: false,
    isChecking: false,
    message: '',
  });

  // Real-time activation code validation
  useEffect(() => {
    const validateCode = async () => {
      if (formData.activationCode.length < 6) {
        setActivationCodeStatus({
          isValid: false,
          isChecking: false,
          message: '',
        });
        return;
      }

      setActivationCodeStatus(prev => ({ ...prev, isChecking: true }));

      try {
        const result = await activationService.validateActivationCode(formData.activationCode);
        
        setActivationCodeStatus({
          isValid: result.isValid,
          isChecking: false,
          message: result.error || (result.isValid ? 'Valid activation code' : 'Invalid code'),
          activationData: result.activationCode,
        });
      } catch (error) {
        setActivationCodeStatus({
          isValid: false,
          isChecking: false,
          message: 'Error validating code',
        });
      }
    };

    const timeoutId = setTimeout(validateCode, 500); // Debounce validation
    return () => clearTimeout(timeoutId);
  }, [formData.activationCode]);

  const handleSignup = async () => {
    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.activationCode) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!activationCodeStatus.isValid || !activationCodeStatus.activationData) {
      Alert.alert('Error', 'Please enter a valid activation code');
      return;
    }

    setIsLoading(true);

    try {
      // Create user account
      const { data: authData, error: authError } = await authService.signUp(
        formData.email,
        formData.password
      );

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Consume activation code
      const consumeResult = await activationService.consumeActivationCode(
        formData.activationCode,
        authData.user.id
      );

      if (!consumeResult.success) {
        throw new Error(consumeResult.error || 'Failed to activate code');
      }

      // Success - pass user and activation data to parent
      onSignupSuccess(authData.user, activationCodeStatus.activationData);

    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Signup Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#7f1d1d', '#991b1b', '#1f2937']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join MaxPulse with your activation code</Text>
          </View>

          <View style={styles.form}>
            {/* Activation Code Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Activation Code</Text>
              <TextInput
                style={[
                  styles.input,
                  activationCodeStatus.isChecking && styles.inputChecking,
                  activationCodeStatus.isValid && styles.inputValid,
                  activationCodeStatus.message && !activationCodeStatus.isValid && styles.inputError
                ]}
                placeholder="Enter your activation code"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.activationCode}
                onChangeText={(value) => updateFormData('activationCode', value.toUpperCase())}
                autoCapitalize="characters"
                maxLength={10}
                autoComplete="off"
                textContentType="none"
                selectionColor="white"
              />
              {activationCodeStatus.message && (
                <Text style={[
                  styles.validationMessage,
                  activationCodeStatus.isValid ? styles.validMessage : styles.errorMessage
                ]}>
                  {activationCodeStatus.message}
                </Text>
              )}
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="off"
                textContentType="none"
                selectionColor="white"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry
                autoComplete="off"
                textContentType="none"
                selectionColor="white"
              />
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry
                autoComplete="off"
                textContentType="none"
                selectionColor="white"
              />
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={isLoading || !activationCodeStatus.isValid}
            >
              <Text style={styles.signupButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Switch to Login */}
            <TouchableOpacity style={styles.switchButton} onPress={onSwitchToLogin}>
              <Text style={styles.switchButtonText}>
                Already have an account? <Text style={styles.switchButtonLink}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputChecking: {
    borderColor: 'rgba(255,255,255,0.5)',
  },
  inputValid: {
    borderColor: '#10B981',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  validationMessage: {
    fontSize: 12,
    marginTop: 4,
  },
  validMessage: {
    color: '#10B981',
  },
  errorMessage: {
    color: '#EF4444',
  },
  signupButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  signupButtonText: {
    color: '#7f1d1d',
    fontSize: 16,
    fontWeight: '700',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  switchButtonLink: {
    color: 'white',
    fontWeight: '600',
  },
});
