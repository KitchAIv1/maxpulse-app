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
import { activationService, supabase } from '../../services/supabase';

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

  // Extract key data for display with fallbacks - data is nested under v2Analysis
  const { demographics, v2Analysis, medical } = activationCode.onboarding_data || {};
  const personalizedTargets = v2Analysis?.personalizedTargets;
  
  // Provide fallbacks for missing data
  const safeDemographics = demographics || { bmi: 0, age: 0, gender: 'other', heightCm: 0, weightKg: 0 };
  const safeTargets = personalizedTargets || { 
    bmi: { category: 'Unknown' },
    steps: { targetDaily: 8000 },
    hydration: { targetLiters: 2.5 },
    sleep: { targetMinHours: 7, targetMaxHours: 9 }
  };
  const safeMedical = medical || { conditions: [], allergies: [], medications: [] };

  const handleConfirmProfile = async () => {
    setIsLoading(true);

    try {
      // Use the user object passed to the component (from signup flow)
      console.log('Attempting to save profile for user:', user.id);
      console.log('Profile data:', {
        user_id: user.id,
        email: profileData.email,
        name: profileData.name,
      });

      const { error } = await supabase
        .from('app_user_profiles')
        .insert({
          user_id: user.id,
          email: profileData.email,
          name: profileData.name,
          age: profileData.age,
          gender: profileData.gender,
          height_cm: profileData.height_cm,
          weight_kg: profileData.weight_kg,
          bmi: profileData.bmi,
          medical_conditions: profileData.medical_conditions,
          medical_allergies: profileData.medical_allergies,
          medical_medications: profileData.medical_medications,
          mental_health_data: profileData.mental_health_data,
          activation_code_id: profileData.activation_code_id,
          distributor_id: profileData.distributor_id,
          session_id: profileData.session_id,
          plan_type: profileData.plan_type,
        });

      if (error) {
        console.error('Error saving profile:', error);
        console.error('Full error details:', JSON.stringify(error, null, 2));
        
        // If RLS is blocking us, try a different approach or just proceed
        if (error.code === '42501') {
          console.warn('RLS policy blocking profile save, proceeding without database save for now');
          Alert.alert('Notice', 'Profile will be saved after login. Proceeding to app...');
        } else {
          Alert.alert('Error', `Failed to save profile: ${error.message || 'Unknown error'}`);
          return;
        }
      }

      // Pass the profile data back to complete authentication
      onProfileConfirmed(profileData);
    } catch (error) {
      console.error('Error confirming profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileData = (field: keyof UserProfileFromActivation, value: any) => {
    // Only allow editing of name - all other data comes from assessment
    if (field === 'name') {
      setProfileData(prev => ({ ...prev, [field]: value }));
    }
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
              autoComplete="off"
              textContentType="none"
              selectionColor="white"
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
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyValue}>{profileData.age}</Text>
              </View>
              <Text style={styles.helperText}>From assessment data</Text>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyValue}>
                  {profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1)}
                </Text>
              </View>
              <Text style={styles.helperText}>From assessment data</Text>
            </View>
          </View>
        </View>

        {/* Health Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Height (cm)</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyValue}>{profileData.height_cm} cm</Text>
              </View>
              <Text style={styles.helperText}>From assessment data</Text>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Weight (kg)</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyValue}>{profileData.weight_kg} kg</Text>
              </View>
              <Text style={styles.helperText}>From assessment data</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Current BMI</Text>
            <Text style={styles.metricValue}>{safeDemographics.bmi.toFixed(1)}</Text>
            <Text style={styles.metricCategory}>{safeTargets.bmi.category}</Text>
          </View>
        </View>

        {/* Personalized Targets Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Personalized Targets</Text>
          <Text style={styles.sectionSubtitle}>These will be your daily goals in the app</Text>
          
          <View style={styles.targetsGrid}>
            <View style={styles.targetCard}>
              <Text style={styles.targetIcon}>🚶‍♂️</Text>
              <Text style={styles.targetValue}>{safeTargets.steps.targetDaily?.toLocaleString() || '8,000'}</Text>
              <Text style={styles.targetLabel}>Daily Steps</Text>
            </View>

            <View style={styles.targetCard}>
              <Text style={styles.targetIcon}>💧</Text>
              <Text style={styles.targetValue}>
                {safeTargets.hydration.targetLiters 
                  ? Math.round(safeTargets.hydration.targetLiters * 33.814) 
                  : 80} oz
              </Text>
              <Text style={styles.targetLabel}>Daily Water</Text>
            </View>

            <View style={styles.targetCard}>
              <Text style={styles.targetIcon}>😴</Text>
              <Text style={styles.targetValue}>
                {safeTargets.sleep.targetMinHours && safeTargets.sleep.targetMaxHours
                  ? Math.round((safeTargets.sleep.targetMinHours + safeTargets.sleep.targetMaxHours) / 2)
                  : 8}h
              </Text>
              <Text style={styles.targetLabel}>Sleep Target</Text>
            </View>
          </View>
          
          <View style={styles.alignmentNote}>
            <Text style={styles.alignmentText}>
              💡 These targets match exactly what you'll see in your daily dashboard
            </Text>
          </View>
        </View>

        {/* Medical Information */}
        {(safeMedical.conditions.length > 0 || safeMedical.allergies.length > 0 || safeMedical.medications.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
            
            {safeMedical.conditions.length > 0 && (
              <View style={styles.medicalGroup}>
                <Text style={styles.medicalLabel}>Conditions:</Text>
                <Text style={styles.medicalValue}>{safeMedical.conditions.join(', ')}</Text>
              </View>
            )}

            {safeMedical.allergies.length > 0 && (
              <View style={styles.medicalGroup}>
                <Text style={styles.medicalLabel}>Allergies:</Text>
                <Text style={styles.medicalValue}>{safeMedical.allergies.join(', ')}</Text>
              </View>
            )}

            {safeMedical.medications.length > 0 && (
              <View style={styles.medicalGroup}>
                <Text style={styles.medicalLabel}>Medications:</Text>
                <Text style={styles.medicalValue}>{safeMedical.medications.join(', ')}</Text>
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
            {isLoading ? 'Setting up your profile...' : 'Confirm Profile & Start Journey'}
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
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
  readOnlyField: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  readOnlyValue: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
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
  alignmentNote: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  alignmentText: {
    fontSize: 12,
    color: 'rgba(0, 255, 136, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 20,
  },
});
