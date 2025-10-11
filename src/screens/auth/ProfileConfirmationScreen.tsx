// Profile Confirmation Screen Component
// Displays and allows editing of profile data from activation code

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivationCode, UserProfileFromActivation } from '../../types';
import { activationService } from '../../services/supabase';

interface ProfileConfirmationScreenProps {
  user: any;
  activationCode: ActivationCode;
  onProfileConfirmed: (profile: UserProfileFromActivation) => void;
  onBack: () => void;
}

export const ProfileConfirmationScreen: React.FC<ProfileConfirmationScreenProps> = ({
  user,
  activationCode,
  onProfileConfirmed,
  onBack,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize profile data from activation code
  const initialProfile = activationService.createUserProfileFromActivation(activationCode, user.id);
  const [profileData, setProfileData] = useState(initialProfile);

  // Extract key data for display
  const { demographics, personalizedTargets, medical } = activationCode.onboarding_data;

  const handleConfirmProfile = async () => {
    setIsLoading(true);

    try {
      // Here you would typically save the profile to the database
      // For now, we'll just pass it back to the parent component
      onProfileConfirmed(profileData);
    } catch (error) {
      console.error('Error confirming profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileData = (field: keyof UserProfileFromActivation, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <LinearGradient
      colors={['#7f1d1d', '#991b1b', '#1f2937']}
      style={styles.gradient}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Confirm Your Profile</Text>
          <Text style={styles.subtitle}>Review and edit your information</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={profileData.name}
              onChangeText={(value) => updateProfileData('name', value)}
              placeholder="Enter your full name"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputReadonly]}
              value={profileData.email}
              editable={false}
              placeholder="Email address"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={profileData.age.toString()}
                onChangeText={(value) => updateProfileData('age', parseInt(value) || 0)}
                keyboardType="numeric"
                placeholder="Age"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderContainer}>
                {['male', 'female', 'other'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderOption,
                      profileData.gender === gender && styles.genderOptionSelected
                    ]}
                    onPress={() => updateProfileData('gender', gender)}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      profileData.gender === gender && styles.genderOptionTextSelected
                    ]}>
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Health Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={profileData.height_cm.toString()}
                onChangeText={(value) => updateProfileData('height_cm', parseInt(value) || 0)}
                keyboardType="numeric"
                placeholder="Height"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={profileData.weight_kg.toString()}
                onChangeText={(value) => updateProfileData('weight_kg', parseInt(value) || 0)}
                keyboardType="numeric"
                placeholder="Weight"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Current BMI</Text>
            <Text style={styles.metricValue}>{demographics.bmi.toFixed(1)}</Text>
            <Text style={styles.metricCategory}>{personalizedTargets.bmi.category}</Text>
          </View>
        </View>

        {/* Personalized Targets Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Personalized Targets</Text>
          
          <View style={styles.targetsGrid}>
            <View style={styles.targetCard}>
              <Text style={styles.targetIcon}>🚶‍♂️</Text>
              <Text style={styles.targetValue}>{personalizedTargets.steps.targetDaily.toLocaleString()}</Text>
              <Text style={styles.targetLabel}>Daily Steps</Text>
            </View>

            <View style={styles.targetCard}>
              <Text style={styles.targetIcon}>💧</Text>
              <Text style={styles.targetValue}>{personalizedTargets.hydration.targetLiters}L</Text>
              <Text style={styles.targetLabel}>Daily Water</Text>
            </View>

            <View style={styles.targetCard}>
              <Text style={styles.targetIcon}>😴</Text>
              <Text style={styles.targetValue}>{personalizedTargets.sleep.targetMinHours}-{personalizedTargets.sleep.targetMaxHours}h</Text>
              <Text style={styles.targetLabel}>Sleep Range</Text>
            </View>
          </View>
        </View>

        {/* Medical Information */}
        {(medical.conditions.length > 0 || medical.allergies.length > 0 || medical.medications.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
            
            {medical.conditions.length > 0 && (
              <View style={styles.medicalGroup}>
                <Text style={styles.medicalLabel}>Conditions:</Text>
                <Text style={styles.medicalValue}>{medical.conditions.join(', ')}</Text>
              </View>
            )}

            {medical.allergies.length > 0 && (
              <View style={styles.medicalGroup}>
                <Text style={styles.medicalLabel}>Allergies:</Text>
                <Text style={styles.medicalValue}>{medical.allergies.join(', ')}</Text>
              </View>
            )}

            {medical.medications.length > 0 && (
              <View style={styles.medicalGroup}>
                <Text style={styles.medicalLabel}>Medications:</Text>
                <Text style={styles.medicalValue}>{medical.medications.join(', ')}</Text>
              </View>
            )}
          </View>
        )}

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmButton, isLoading && styles.buttonDisabled]}
          onPress={handleConfirmProfile}
          disabled={isLoading}
        >
          <Text style={styles.confirmButtonText}>
            {isLoading ? 'Setting up your profile...' : 'Confirm & Start Journey'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
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
  inputReadonly: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.7)',
  },
  helperText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  genderOptionSelected: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  genderOptionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  genderOptionTextSelected: {
    color: '#7f1d1d',
  },
  metricCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  metricLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  metricCategory: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  targetsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  targetCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  targetIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  targetValue: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  targetLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  medicalGroup: {
    marginBottom: 12,
  },
  medicalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  medicalValue: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'capitalize',
  },
  confirmButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  confirmButtonText: {
    color: '#7f1d1d',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 20,
  },
});
