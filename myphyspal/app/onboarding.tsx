import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { updateProfile } from '../lib/profile';
import { getCurrentUser } from '../lib/auth';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [injuryType, setInjuryType] = useState('');
  const [injuryDescription, setInjuryDescription] = useState('');
  const [timeSinceInjury, setTimeSinceInjury] = useState('');
  const [painLevel, setPainLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      await updateProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        age: parseInt(age) || undefined,
        height_cm: parseFloat(heightCm) || undefined,
        weight_kg: parseFloat(weightKg) || undefined,
        injury_type: injuryType,
        injury_description: injuryDescription,
        time_since_injury: timeSinceInjury,
        pain_level: parseInt(painLevel) || undefined,
      });

      Alert.alert('Profile Saved!', 'Your profile has been set up.', [
        { text: 'OK', onPress: () => router.replace('/') },  // Goes to main tabs
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tell Us About You 📋</Text>
      <Text style={styles.subtitle}>
        This helps us create a personalized physio plan
      </Text>

      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="John"
      />

      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Doe"
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        value={age}
        onChangeText={setAge}
        placeholder="25"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        value={heightCm}
        onChangeText={setHeightCm}
        placeholder="175"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        value={weightKg}
        onChangeText={setWeightKg}
        placeholder="70"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Type of Injury</Text>
      <TextInput
        style={styles.input}
        value={injuryType}
        onChangeText={setInjuryType}
        placeholder="e.g., ACL tear, Back strain, etc."
      />

      <Text style={styles.label}>Describe Your Injury</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={injuryDescription}
        onChangeText={setInjuryDescription}
        placeholder="Tell us more about your injury..."
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Time Since Injury</Text>
      <TextInput
        style={styles.input}
        value={timeSinceInjury}
        onChangeText={setTimeSinceInjury}
        placeholder="e.g., 2 weeks, 3 months"
      />

      <Text style={styles.label}>Pain Level (1-10)</Text>
      <TextInput
        style={styles.input}
        value={painLevel}
        onChangeText={setPainLevel}
        placeholder="5"
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSaveProfile}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Saving...' : 'Save & Continue'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 8,
    color: '#2D6A4F',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});