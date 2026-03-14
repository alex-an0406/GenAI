import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const MOCK_TODAY = [
  { id: '1', name: 'Knee Extensions', sets: 3, reps: 15, completed: false },
  { id: '2', name: 'Hamstring Curls', sets: 3, reps: 12, completed: false },
  { id: '3', name: 'Wall Sits', sets: 2, holdTime: '30s', completed: false },
];

export default function TodayScreen() {
  const [exercises, setExercises] = useState(MOCK_TODAY);

  const toggleComplete = (id: string) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, completed: !ex.completed } : ex
    ));
    // ---------------------------------------------------------
    // BACKEND INTEGRATION POINT:
    // POST /complete-exercise { id, status: 'completed' }
    // Updates the user's progress for the day.
    // ---------------------------------------------------------
  };

  const startLiveAssistant = (exerciseName: string) => {
    // Navigate to the Coach tab (explore.tsx)
    router.push('/(tabs)/explore');
  };

  const renderExercise = ({ item }: { item: any }) => (
    <ThemedView style={styles.card}>
      <View style={styles.cardInfo}>
        <ThemedText type="subtitle" style={item.completed && styles.completedText}>{item.name}</ThemedText>
        <ThemedText>{item.reps ? `${item.sets} x ${item.reps}` : `${item.sets} x ${item.holdTime}`}</ThemedText>
      </View>
      
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
        <ThemedText>Recovery Plan: Day 12</ThemedText>
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
  }
});
