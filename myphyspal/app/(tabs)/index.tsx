import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

const MOCK_TODAY = [
  { 
    id: '1', 
    name: 'Knee Extensions', 
    sets: 3, 
    reps: 15, 
    completed: false,
    description: 'Sit on a chair with your back straight. Slowly straighten one knee, lifting your foot until your leg is straight. Hold for 2 seconds, then slowly lower. Focus on engaging your quadriceps.'
  },
  { 
    id: '2', 
    name: 'Hamstring Curls', 
    sets: 3, 
    reps: 12, 
    completed: false,
    description: 'Stand tall while holding onto a sturdy chair or wall for balance. Bend one knee, bringing your heel toward your glutes. Keep your knees aligned. Slowly lower back down.'
  },
  { 
    id: '3', 
    name: 'Wall Sits', 
    sets: 2, 
    holdTime: '30s', 
    completed: false,
    description: 'Lean against a flat wall with your feet about shoulder-width apart. Slide down until your knees are at a 90-degree angle, as if sitting in an invisible chair. Hold this position.'
  },
];

export default function TodayScreen() {
  const [exercises, setExercises] = useState(MOCK_TODAY);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  const toggleComplete = (id: string) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, completed: !ex.completed } : ex
    ));
  };

  const startLiveAssistant = (exerciseName: string) => {
    // Navigate to the new Coach screen
    router.push('/coach');
  };

  const renderExercise = ({ item }: { item: any }) => (
    <ThemedView style={styles.card}>
      <TouchableOpacity 
        style={styles.cardInfo} 
        onPress={() => setSelectedExercise(item)}
      >
        <View style={styles.titleRow}>
          <ThemedText type="subtitle" style={item.completed && styles.completedText}>{item.name}</ThemedText>
          <IconSymbol size={16} name="info.circle" color="#888" style={{marginLeft: 5}} />
        </View>
        <ThemedText>{item.reps ? `${item.sets} x ${item.reps}` : `${item.sets} x ${item.holdTime}`}</ThemedText>
      </TouchableOpacity>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.liveButton} onPress={() => startLiveAssistant(item.name)}>
          <ThemedText style={styles.liveButtonText}>Coach</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.checkButton, item.completed && styles.checked]} 
          onPress={() => toggleComplete(item.id)}
        >
          <ThemedText style={styles.whiteText}>{item.completed ? '✓' : ''}</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Today's Exercises</ThemedText>
        <ThemedText>Recovery Plan: Knee Pain (Day 12)</ThemedText>
      </ThemedView>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExercise}
        contentContainerStyle={styles.list}
      />

      {exercises.every(e => e.completed) && (
        <ThemedView style={styles.congrats}>
          <ThemedText type="defaultSemiBold">🎉 Today's Routine Complete!</ThemedText>
        </ThemedView>
      )}

      {/* Exercise Description Modal */}
      <Modal
        visible={!!selectedExercise}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedExercise(null)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">{selectedExercise?.name}</ThemedText>
              <TouchableOpacity onPress={() => setSelectedExercise(null)}>
                <IconSymbol size={28} name="xmark.circle.fill" color="#888" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <ThemedView style={styles.descriptionCard}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Instructions</ThemedText>
                <ThemedText style={styles.descriptionText}>{selectedExercise?.description}</ThemedText>
              </ThemedView>

              <ThemedView style={styles.statsRow}>
                <View style={styles.statBox}>
                  <ThemedText style={styles.statValue}>{selectedExercise?.sets}</ThemedText>
                  <ThemedText style={styles.statLabel}>Sets</ThemedText>
                </View>
                <View style={styles.statBox}>
                  <ThemedText style={styles.statValue}>{selectedExercise?.reps || selectedExercise?.holdTime}</ThemedText>
                  <ThemedText style={styles.statLabel}>{selectedExercise?.reps ? 'Reps' : 'Hold'}</ThemedText>
                </View>
              </ThemedView>

              <TouchableOpacity 
                style={styles.modalCoachButton} 
                onPress={() => {
                  setSelectedExercise(null);
                  startLiveAssistant(selectedExercise?.name);
                }}
              >
                <ThemedText style={styles.modalCoachButtonText}>Start with AI Coach</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 30,
  },
  list: {
    gap: 15,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
  },
  cardInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liveButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  liveButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#34C759',
  },
  whiteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  congrats: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    marginTop: 20,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalScroll: {
    gap: 20,
  },
  descriptionCard: {
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#007AFF',
  },
  descriptionText: {
    lineHeight: 22,
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  modalCoachButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  modalCoachButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
