import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TextInput, ScrollView, TouchableOpacity, View, Alert, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppStore } from '@/store/use-store';
import { supabase } from '../lib/supabase';
import { generatePlan, UserProfile } from '../lib/api';

type OnboardingState = 'ASK_DIAGNOSIS' | 'FORM';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export default function OnboardingScreen() {
  const { profile, setProfile, setActivePlan } = useAppStore();
  const [step, setStep] = useState<OnboardingState>('ASK_DIAGNOSIS');
  const [hasDiagnosis, setHasDiagnosis] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showProfileFields, setShowProfileFields] = useState(true);
  const [genderLayout, setGenderLayout] = useState({ top: 0, left: 0, width: 0 });
  const genderRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  
  const [formData, setFormData] = useState({
    age: '',
    weight_kg: '',
    height_cm: '',
    gender: 'Other',
    surgery_history: 'None',
    time_since_injury_days: '0',
    diagnosis: '',
    painDescription: '',
    painLevel: 5,
  });

  // Pre-fill if profile exists
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        age: profile.age.toString(),
        weight_kg: profile.weight_kg.toString(),
        height_cm: profile.height_cm.toString(),
        gender: profile.gender,
        surgery_history: profile.surgery_history || 'None',
        time_since_injury_days: profile.time_since_injury_days.toString(),
      }));
      setShowProfileFields(false); // Hide profile fields by default if we already have them
    }
  }, [profile]);

  const openGenderPicker = () => {
    genderRef.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      setGenderLayout({
        top: pageY + height,
        left: pageX,
        width: width,
      });
      setShowGenderPicker(true);
    });
  };

  const handleDiagnosisChoice = (choice: boolean) => {
    setHasDiagnosis(choice);
    setStep('FORM');
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);

    try {
      // Get logged in user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'You must be logged in to continue');
        router.replace('/login');
        return;
      }

      // 1. Prepare UserProfile object for API
      const profileData: UserProfile = {
        age: parseInt(formData.age) || 30,
        weight_kg: parseFloat(formData.weight_kg) || 75,
        height_cm: parseFloat(formData.height_cm) || 180,
        gender: formData.gender,
        surgery_history: formData.surgery_history,
        time_since_injury_days: parseInt(formData.time_since_injury_days) || 0,
      };

      // 2. Generate Plan via Backend API (Source of Truth)
      const response = await generatePlan(user.id, profileData);

      // 3. Save to local store
      setProfile(profileData);
      setActivePlan(response.plan_data);

      console.log('✅ Plan generated and saved locally!');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Error in onboarding:', error);
      Alert.alert('Error', 'Failed to generate your plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============ ASK DIAGNOSIS SCREEN ============
  if (step === 'ASK_DIAGNOSIS') {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.centerContent}>
          <IconSymbol size={80} name="doc.text.magnifyingglass" color="#007AFF" />
          <ThemedText type="title" style={styles.title}>Do you have a diagnosis?</ThemedText>
          <ThemedText style={styles.subtitle}>
            If a doctor has already diagnosed your condition, let us know. Otherwise, describe your pain.
          </ThemedText>

          <View style={styles.choiceContainer}>
            <TouchableOpacity
              style={[styles.choiceButton, { backgroundColor: '#007AFF' }]}
              onPress={() => handleDiagnosisChoice(true)}
            >
              <ThemedText style={styles.choiceText}>Yes, I have one</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.choiceButton, { backgroundColor: '#333' }]}
              onPress={() => handleDiagnosisChoice(false)}
            >
              <ThemedText style={styles.choiceText}>No, describe pain</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ThemedView>
    );
  }

  // ============ FORM SCREEN ============
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <ThemedView style={styles.formContent}>
          <TouchableOpacity onPress={() => setStep('ASK_DIAGNOSIS')} style={styles.backButton}>
            <IconSymbol size={20} name="chevron.left" color="#007AFF" />
            <ThemedText style={styles.backText}>Back</ThemedText>
          </TouchableOpacity>

          <ThemedText type="title">New Recovery Plan</ThemedText>

          {profile && !showProfileFields ? (
            <View style={styles.profileSummary}>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryText}>
                  {formData.gender}, {formData.age} yrs, {formData.weight_kg}kg, {formData.height_cm}cm
                </ThemedText>
                <TouchableOpacity onPress={() => setShowProfileFields(true)}>
                  <ThemedText style={styles.editText}>Edit</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.row}>
                <ThemedView style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText type="defaultSemiBold">Age</ThemedText>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="30"
                    placeholderTextColor="#888"
                    value={formData.age}
                    onChangeText={(t) => setFormData({ ...formData, age: t })}
                  />
                </ThemedView>
                <ThemedView style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText type="defaultSemiBold">Weight (kg)</ThemedText>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="75"
                    placeholderTextColor="#888"
                    value={formData.weight_kg}
                    onChangeText={(t) => setFormData({ ...formData, weight_kg: t })}
                  />
                </ThemedView>
              </View>

              <View style={styles.row}>
                <ThemedView style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText type="defaultSemiBold">Height (cm)</ThemedText>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="180"
                    placeholderTextColor="#888"
                    value={formData.height_cm}
                    onChangeText={(t) => setFormData({ ...formData, height_cm: t })}
                  />
                </ThemedView>
                <ThemedView style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText type="defaultSemiBold">Gender</ThemedText>
                  <TouchableOpacity 
                    ref={genderRef}
                    style={styles.dropdownTrigger}
                    onPress={openGenderPicker}
                  >
                    <ThemedText style={styles.dropdownText}>{formData.gender}</ThemedText>
                    <IconSymbol size={16} name="chevron.down" color="#888" />
                  </TouchableOpacity>
                </ThemedView>
              </View>

              <ThemedView style={styles.inputGroup}>
                <ThemedText type="defaultSemiBold">Surgery History</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. ACL reconstruction 2022, None"
                  placeholderTextColor="#888"
                  value={formData.surgery_history}
                  onChangeText={(t) => setFormData({ ...formData, surgery_history: t })}
                />
              </ThemedView>

              <ThemedView style={styles.inputGroup}>
                <ThemedText type="defaultSemiBold">Days since injury</ThemedText>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="e.g. 14"
                  placeholderTextColor="#888"
                  value={formData.time_since_injury_days}
                  onChangeText={(t) => setFormData({ ...formData, time_since_injury_days: t })}
                />
              </ThemedView>
            </>
          )}

          {hasDiagnosis ? (
            <ThemedView style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold">What is your diagnosis?</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="e.g. Meniscus Tear, Tennis Elbow"
                placeholderTextColor="#888"
                value={formData.diagnosis}
                onChangeText={(t) => setFormData({ ...formData, diagnosis: t })}
              />
            </ThemedView>
          ) : (
            <ThemedView style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold">Describe your pain</ThemedText>
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Where does it hurt?"
                placeholderTextColor="#888"
                multiline
                value={formData.painDescription}
                onChangeText={(t) => setFormData({ ...formData, painDescription: t })}
              />
            </ThemedView>
          )}

          <ThemedView style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold">Current Pain Level: {formData.painLevel}/10</ThemedText>
            <View style={styles.painSelector}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.painCircle,
                    formData.painLevel === level && styles.selectedPainCircle,
                    { backgroundColor: getPainColor(level, formData.painLevel === level) }
                  ]}
                  onPress={() => setFormData({ ...formData, painLevel: level })}
                >
                  <ThemedText style={styles.painText}>{level}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ThemedView>

          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.6 }]}
            onPress={handleFinishOnboarding}
            disabled={loading}
          >
            <ThemedText style={styles.submitButtonText}>
              {loading ? 'Generating...' : 'Generate My Plan'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>

      {/* Localized Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenderPicker(false)}
        >
          <View style={[
            styles.localizedPicker, 
            { 
              top: genderLayout.top, 
              left: genderLayout.left, 
              width: genderLayout.width 
            }
          ]}>
            <FlatList
              data={GENDER_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.localizedOption}
                  onPress={() => {
                    setFormData({ ...formData, gender: item });
                    setShowGenderPicker(false);
                  }}
                >
                  <ThemedText style={[
                    styles.optionText,
                    formData.gender === item && { color: '#007AFF', fontWeight: 'bold' }
                  ]}>
                    {item}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const getPainColor = (level: number, isSelected: boolean) => {
  if (!isSelected) return '#1E1E1E';
  if (level <= 3) return '#34C759';
  if (level <= 7) return '#FF9F0A';
  return '#FF3B30';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#121212',
  },
  centerContent: {
    alignItems: 'center',
    gap: 20,
  },
  title: {
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  choiceContainer: {
    width: '100%',
    gap: 15,
    marginTop: 20,
  },
  choiceButton: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  choiceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContent: {
    padding: 20,
    paddingTop: 60,
    gap: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  dropdownTrigger: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },
  dropdownText: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  painSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 5,
  },
  painCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedPainCircle: {
    borderColor: '#fff',
    borderWidth: 2,
  },
  painText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  localizedPicker: {
    position: 'absolute',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    overflow: 'hidden',
  },
  localizedOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  optionText: {
    fontSize: 14,
  },
  profileSummary: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  editText: {
    color: '#007AFF',
    fontWeight: 'bold',
  }
});