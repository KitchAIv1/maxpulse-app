// Signup Screen Component
// Modern Cal AI-branded registration interface with activation code validation

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
  Image,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/Ionicons';
import { activationService, authService } from '../../services/supabase';
import { ActivationCode } from '../../types';
import { theme } from '../../utils/theme';

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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
          message: result.error || (result.isValid ? '✓ Valid code' : 'Invalid code'),
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

    const timeoutId = setTimeout(validateCode, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.activationCode]);

  const handleSignup = async () => {
    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.activationCode) {
      Alert.alert('Required Fields', 'Please fill in all fields');
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      return;
    }

    if (!activationCodeStatus.isValid || !activationCodeStatus.activationData) {
      Alert.alert('Invalid Code', 'Please enter a valid activation code');
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      return;
    }

    setIsLoading(true);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}

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

      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      onSignupSuccess(authData.user, activationCodeStatus.activationData);

    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Signup Failed', error instanceof Error ? error.message : 'An error occurred');
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderInputWithIcon = (
    icon: string,
    placeholder: string,
    value: string,
    field: keyof typeof formData,
    options: {
      keyboardType?: 'email-address' | 'default';
      autoCapitalize?: 'none' | 'characters';
      maxLength?: number;
      secureTextEntry?: boolean;
      showPasswordToggle?: boolean;
      showPasswordValue?: boolean;
      setShowPassword?: (show: boolean) => void;
    } = {}
  ) => {
    const isFocused = focusedField === field;
    const iconColor = isFocused ? theme.colors.textPrimary : theme.colors.textSecondary;

    return (
      <View style={styles.inputWrapper}>
        <View style={styles.inputIconContainer}>
          <Icon name={icon} size={20} color={iconColor} />
        </View>
        <TextInput
          style={[styles.input, isFocused && styles.inputFocused]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          value={value}
          onChangeText={(val) => updateFormData(field, val)}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          keyboardType={options.keyboardType || 'default'}
          autoCapitalize={options.autoCapitalize || 'none'}
          maxLength={options.maxLength}
          secureTextEntry={options.secureTextEntry && !options.showPasswordValue}
          autoComplete="off"
          textContentType="none"
        />
        {options.showPasswordToggle && options.setShowPassword && (
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => {
              options.setShowPassword!(!options.showPasswordValue);
              try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
            }}
          >
            <Icon 
              name={options.showPasswordValue ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.brandRow}>
            <Image 
              source={require('../../assets/images/ax.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>MaxPulse</Text>
          </View>
          <Text style={styles.tagline}>Start your wellness journey</Text>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          <View style={styles.formSpacer} />

          {/* Activation Code Input */}
          <View>
            <View style={[
              styles.inputWrapper,
              activationCodeStatus.isValid && styles.inputWrapperValid,
              activationCodeStatus.message && !activationCodeStatus.isValid && styles.inputWrapperError
            ]}>
              <View style={styles.inputIconContainer}>
                <Icon 
                  name="key-outline" 
                  size={20} 
                  color={
                    activationCodeStatus.isValid 
                      ? theme.colors.success 
                      : focusedField === 'activationCode' 
                        ? theme.colors.textPrimary 
                        : theme.colors.textSecondary
                  }
                />
              </View>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'activationCode' && styles.inputFocused
                ]}
                placeholder="Activation code"
                placeholderTextColor={theme.colors.textTertiary}
                value={formData.activationCode}
                onChangeText={(val) => updateFormData('activationCode', val.toUpperCase())}
                onFocus={() => setFocusedField('activationCode')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="characters"
                maxLength={10}
                autoComplete="off"
                textContentType="none"
              />
              {activationCodeStatus.isChecking && (
                <View style={styles.validationIcon}>
                  <ActivityIndicator size="small" color={theme.colors.textSecondary} />
                </View>
              )}
              {!activationCodeStatus.isChecking && activationCodeStatus.isValid && (
                <View style={styles.validationIcon}>
                  <Icon name="checkmark-circle" size={24} color={theme.colors.success} />
                </View>
              )}
            </View>
            {activationCodeStatus.message && !activationCodeStatus.isChecking && (
              <Text style={[
                styles.validationMessage,
                activationCodeStatus.isValid ? styles.validMessage : styles.errorMessage
              ]}>
                {activationCodeStatus.message}
              </Text>
            )}
          </View>

          {/* Email Input */}
          {renderInputWithIcon(
            'mail-outline',
            'Email address',
            formData.email,
            'email',
            { keyboardType: 'email-address' }
          )}

          {/* Password Input */}
          {renderInputWithIcon(
            'lock-closed-outline',
            'Password (min. 6 characters)',
            formData.password,
            'password',
            { 
              secureTextEntry: true,
              showPasswordToggle: true,
              showPasswordValue: showPassword,
              setShowPassword: setShowPassword
            }
          )}

          {/* Confirm Password Input */}
          {renderInputWithIcon(
            'lock-closed-outline',
            'Confirm password',
            formData.confirmPassword,
            'confirmPassword',
            { 
              secureTextEntry: true,
              showPasswordToggle: true,
              showPasswordValue: showConfirmPassword,
              setShowPassword: setShowConfirmPassword
            }
          )}

          {/* Signup Button */}
          <TouchableOpacity
            style={[
              styles.signupButton, 
              (isLoading || !activationCodeStatus.isValid) && styles.buttonDisabled
            ]}
            onPress={handleSignup}
            disabled={isLoading || !activationCodeStatus.isValid}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <Text style={styles.signupButtonText}>Creating account...</Text>
            ) : (
              <>
                <Text style={styles.signupButtonText}>Create account</Text>
                <Icon name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Switch to Login */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Already have an account?</Text>
            <TouchableOpacity 
              onPress={() => {
                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                onSwitchToLogin();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.switchLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          By creating an account, you agree to our{'\n'}Terms of Service & Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 140,
    paddingBottom: theme.spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: theme.spacing.sm,
  },
  appName: {
    fontSize: 30.5, // Exact match with dashboard titleText
    fontWeight: '500', // Exact match with dashboard (medium)
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: theme.typography.weights.regular,
  },
  form: {
    gap: theme.spacing.base,
    marginBottom: theme.spacing.xl,
  },
  formSpacer: {
    height: 48, // Equivalent to the removed formTitle height + marginBottom
  },
  formTitle: {
    fontSize: theme.typography.xlarge, // 32px - consistent with login
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.5,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  inputWrapperValid: {
    borderColor: theme.colors.success,
  },
  inputWrapperError: {
    borderColor: theme.colors.error,
  },
  inputIconContainer: {
    paddingLeft: theme.spacing.base,
    paddingRight: theme.spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.base,
    paddingRight: theme.spacing.base,
    fontSize: theme.typography.regular,
    color: theme.colors.textPrimary,
  },
  inputFocused: {
    borderColor: theme.colors.textPrimary,
  },
  eyeIcon: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
  },
  validationIcon: {
    paddingHorizontal: theme.spacing.base,
  },
  validationMessage: {
    fontSize: theme.typography.tiny,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  validMessage: {
    color: theme.colors.success,
  },
  errorMessage: {
    color: theme.colors.error,
  },
  signupButton: {
    backgroundColor: theme.colors.textPrimary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 18,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.base,
    ...theme.shadows.soft,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: 0.3,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  switchText: {
    fontSize: theme.typography.regular,
    color: theme.colors.textSecondary,
  },
  switchLink: {
    fontSize: theme.typography.regular,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
  },
  footer: {
    fontSize: theme.typography.tiny,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: theme.spacing.lg,
  },
});
