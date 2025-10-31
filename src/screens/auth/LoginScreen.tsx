// Login Screen Component
// Modern Cal AI-branded authentication interface

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/Ionicons';
import { authService } from '../../services/supabase';
import { theme } from '../../utils/theme';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
  onSwitchToSignup?: () => void; // Made optional for backwards compatibility
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Required Fields', 'Please fill in all fields');
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      return;
    }

    setIsLoading(true);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}

    try {
      const { data, error } = await authService.signIn(formData.email, formData.password);

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed');
      }

      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      onLoginSuccess(data.user);
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred');
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
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
      <View style={styles.content}>
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
          <Text style={styles.tagline}>Where health meets purpose.</Text>
        </View>

        {/* Exclusive Badge Section */}
        <View style={styles.exclusiveSection}>
          <View style={styles.exclusiveBadge}>
            <Icon name="shield-checkmark" size={14} color={theme.colors.primary} />
            <Text style={styles.exclusiveBadgeText}>Maximum 88 Exclusive</Text>
          </View>
          
          <Text style={styles.accessNote}>
            Verified customers and distributors only
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.form}>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputIconContainer}>
              <Icon 
                name="mail-outline" 
                size={20} 
                color={emailFocused ? theme.colors.textPrimary : theme.colors.textSecondary}
              />
            </View>
            <TextInput
              style={[
                styles.input,
                emailFocused && styles.inputFocused
              ]}
              placeholder="Email address"
              placeholderTextColor={theme.colors.textTertiary}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="off"
              textContentType="none"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputIconContainer}>
              <Icon 
                name="lock-closed-outline" 
                size={20} 
                color={passwordFocused ? theme.colors.textPrimary : theme.colors.textSecondary}
              />
            </View>
            <TextInput
              style={[
                styles.input,
                passwordFocused && styles.inputFocused
              ]}
              placeholder="Password"
              placeholderTextColor={theme.colors.textTertiary}
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              secureTextEntry={!showPassword}
              autoComplete="off"
              textContentType="none"
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => {
                setShowPassword(!showPassword);
                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
              }}
            >
              <Icon 
                name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <Text style={styles.loginButtonText}>Signing in...</Text>
            ) : (
              <>
                <Text style={styles.loginButtonText}>Sign in</Text>
                <Icon name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 140,
    paddingBottom: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
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
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: theme.typography.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: theme.typography.weights.regular,
    marginTop: 2,
  },
  exclusiveSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  exclusiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FF', // Subtle blue tint
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.xs,
    gap: 6,
  },
  exclusiveBadgeText: {
    fontSize: theme.typography.small,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: 0.3,
  },
  accessNote: {
    fontSize: theme.typography.xsmall,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    fontWeight: theme.typography.weights.regular,
    marginTop: 2,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.base,
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
  loginButton: {
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
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.medium,
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: 0.3,
  },
  footer: {
    fontSize: theme.typography.tiny,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: theme.spacing.lg,
  },
});
