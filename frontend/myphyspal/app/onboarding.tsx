import React, { useState } from 'react';
import { StyleSheet, TextInput, ScrollView, TouchableOpacity, View, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppStore, Plan } from '@/store/use-store';
import { supabase } from '../lib/supabase';
import { saveOnboardingData, createProfile } from '../lib/profile';

type OnboardingState = 'ASK_DIAGNOSIS' | 'FORM';

export default function OnboardingScreen() {
  const { profile, setProfile, addPlan } = useAppStore();
  const [step, setStep] = useState<OnboardingState>('ASK_DIAGNOSIS');
  const [hasDiagnosis, setHasDiagnosis] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    diagnosis: '',
    painDescription: '',
    age: profile?.age || '',
    weight: profile?.weight || '',
    height: profile?.height || '',
    painLevel: 5,
  });

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

      // Make sure profile row exists
      await createProfile(user.id, user.email ?? '');

      // Save onboarding data to Supabase
      await saveOnboardingData(user.id, {
        name: formData.name,
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        hasDiagnosis: hasDiagnosis ?? false,
        diagnosis: formData.diagnosis,
        painDescription: formData.painDescription,
        painLevel: formData.painLevel,
      });

      console.log('✅ Onboarding data saved to Supabase!');

      // Also save to local store
      if (!profile) {
        setProfile({
          name: formData.name,
          age: formData.age,
          weight: formData.weight,
          height: formData.height,
        });
      }

      // Create a new plan locally
      const newPlan: Plan = {
        id: Date.now().toString(),
        title: hasDiagnosis ? formData.diagnosis : 'Pain Management',
        startDate: new Date().toLocaleDateString(),
        active: true,
        type: hasDiagnosis ? 'diagnosis' : 'pain',
        details: hasDiagnosis ? formData.diagnosis : formData.painDescription,
        painLevel: formData.painLevel,
      };

      addPlan(newPlan);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Error saving onboarding:', error);
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ThemedView style={styles.formContent}>
        <TouchableOpacity onPress={() => setStep('ASK_DIAGNOSIS')} style={styles.backButton}>
          <IconSymbol size={20} name="chevron.left" color="#007AFF" />
          <ThemedText style={styles.backText}>Back</ThemedText>
        </TouchableOpacity>

        <ThemedText type="title">New Recovery Plan</ThemedText>

        {!profile && (
          <ThemedView style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold">Full Name</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#888"
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
            />
          </ThemedView>
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
              style={[styles.input, { height: 100 }]}
              placeholder="Where does it hurt? When did it start?"
              placeholderTextColor="#888"
              multiline
              value={formData.painDescription}
              onChangeText={(t) => setFormData({ ...formData, painDescription: t })}
            />
          </ThemedView>
        )}

        {!profile && (
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
                  value={formData.weight}
                  onChangeText={(t) => setFormData({ ...formData, weight: t })}
                />
              </ThemedView>
            </View>

            <ThemedView style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold">Height (cm)</ThemedText>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="180"
                placeholderTextColor="#888"
                value={formData.height}
                onChangeText={(t) => setFormData({ ...formData, height: t })}
              />
            </ThemedView>
          </>
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
            {loading ? 'Saving...' : 'Generate My Plan'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
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
    gap: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
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
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  painSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  painCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
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
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});