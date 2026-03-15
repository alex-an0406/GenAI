import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Modal, View, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface SurveyProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rpe: number, pain: number, feedback: string) => void;
}

export const PostWorkoutSurvey = ({ visible, onClose, onSubmit }: SurveyProps) => {
  const [rpe, setRpe] = useState(5);
  const [pain, setPain] = useState(2);
  const [feedback, setFeedback] = useState('');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        style={styles.modalOverlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ThemedView style={styles.modalContent}>
          <ThemedText type="subtitle">Workout Complete!</ThemedText>
          
          <ThemedText style={styles.label}>Rate of Perceived Exertion (1-10): {rpe}</ThemedText>
          <View style={styles.scaleContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <TouchableOpacity 
                key={num} 
                onPress={() => setRpe(num)}
                style={[styles.scaleItem, rpe === num && styles.selectedItem]}
              >
                <ThemedText style={rpe === num ? styles.selectedText : {}}>{num}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <ThemedText style={styles.label}>Pain Level (1-10): {pain}</ThemedText>
          <View style={styles.scaleContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <TouchableOpacity 
                key={num} 
                onPress={() => setPain(num)}
                style={[styles.scaleItem, pain === num && styles.selectedItem]}
              >
                <ThemedText style={pain === num ? styles.selectedText : {}}>{num}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <ThemedText style={styles.label}>Additional Feedback:</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="How do you feel?"
            placeholderTextColor="#888"
            multiline
            value={feedback}
            onChangeText={setFeedback}
          />

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => onSubmit(rpe, pain, feedback)}
          >
            <ThemedText style={styles.submitText}>Submit & Sync to Backend</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 20,
    borderRadius: 20,
    gap: 15,
  },
  label: {
    marginTop: 10,
  },
  scaleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  scaleItem: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectedText: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    height: 80,
    textAlignVertical: 'top',
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
