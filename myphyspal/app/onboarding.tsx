import React, { useState } from 'react';
import { StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function OnboardingScreen() {
  const [formData, setFormData] = useState({
    name: '',
    condition: '',
    painLevel: '5',
    goals: '',
  });

  const handleFinishOnboarding = () => {
    // ---------------------------------------------------------
    // BACKEND INTEGRATION POINT:
    // POST /register { ...formData }
    // The backend should trigger the LLM here to generate the initial plan.
    // ---------------------------------------------------------
    console.log('Sending onboarding data to FastAPI/LLM...', formData);
    router.replace('/(tabs)');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title">Welcome to MyPhysPal</ThemedText>
        <ThemedText style={styles.subtitle}>Let's customize your recovery plan.</ThemedText>

        <ThemedView style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold">What's your name?</ThemedText>
          <TextInput 
            style={styles.input} 
            placeholder="Name" 
            placeholderTextColor="#888"
            value={formData.name}
            onChangeText={(t) => setFormData({...formData, name: t})}
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold">Describe your condition or pain:</ThemedText>
          <TextInput 
            style={[styles.input, { height: 80 }]} 
            placeholder="e.g. Knee ACL surgery recovery" 
            placeholderTextColor="#888"
            multiline
            value={formData.condition}
            onChangeText={(t) => setFormData({...formData, condition: t})}
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold">Current pain level (1-10):</ThemedText>
          <TextInput 
            style={styles.input} 
            keyboardType="numeric"
            placeholder="5" 
            placeholderTextColor="#888"
            value={formData.painLevel}
            onChangeText={(t) => setFormData({...formData, painLevel: t})}
          />
        </ThemedView>

        <TouchableOpacity style={styles.button} onPress={handleFinishOnboarding}>
          <ThemedText style={styles.buttonText}>Generate My Plan (LLM)</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  content: {
    marginTop: 60,
    gap: 20,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.7,
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
  button: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
