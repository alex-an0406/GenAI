import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppStore } from '@/store/use-store';
import { Exercise } from '@/lib/api';

export default function TodayScreen() {
  const { activePlan } = useAppStore();
  const [exercises, setExercises] = useState<(Exercise & { completed: boolean, id: string })[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<(Exercise & { completed: boolean, id: string }) | null>(null);

  useEffect(() => {
    if (activePlan) {
      setExercises(activePlan.exercises.map((ex, index) => ({
        ...ex,
        id: `${ex.name}-${index}`,
        completed: false, 
      })));
    }
  }, [activePlan]);

  const toggleComplete = (id: string) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, completed: !ex.completed } : ex
    ));
  };

  const startLiveAssistant = (exerciseName: string) => {
    router.push('/coach');
  };

  const renderExercise = ({ item }: { item: Exercise & { completed: boolean, id: string } }) => (
    <ThemedView style={styles.card}>
      <TouchableOpacity 
        style={styles.cardInfo} 
        onPress={() => setSelectedExercise(item)}
      >
        <View style={styles.titleRow}>
          <ThemedText type="subtitle" style={item.completed && styles.completedText}>{item.name}</ThemedText>
          <IconSymbol size={16} name="info.circle" color="#888" style={{marginLeft: 5}} />
        </View>
        <ThemedText>{item.target_sets} x {item.target_reps} • {item.intensity}</ThemedText>
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

  if (!activePlan) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ThemedText type="subtitle" style={{ textAlign: 'center', marginBottom: 20 }}>
          No exercises for today.
        </ThemedText>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/onboarding')}
        >
          <ThemedText style={styles.actionButtonText}>Setup Recovery Plan</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Today's Exercises</ThemedText>
        <ThemedText>Plan: {activePlan.exercises[0]?.name} Recovery</ThemedText>
      </ThemedView>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExercise}
        contentContainerStyle={styles.list}
      />

      {exercises.length > 0 && exercises.every(e => e.completed) && (
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
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Details</ThemedText>
                <ThemedText style={styles.descriptionText}>
                  Intensity: {selectedExercise?.intensity}{"\n"}
                  Focus on proper form and control throughout the movement.
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.statsRow}>
                <View style={styles.statBox}>
                  <ThemedText style={styles.statValue}>{selectedExercise?.target_sets}</ThemedText>
                  <ThemedText style={styles.statLabel}>Sets</ThemedText>
                </View>
                <View style={styles.statBox}>
                  <ThemedText style={styles.statValue}>{selectedExercise?.target_reps}</ThemedText>
                  <ThemedText style={styles.statLabel}>Reps</ThemedText>
                </View>
              </ThemedView>

              <TouchableOpacity 
                style={styles.modalCoachButton} 
                onPress={() => {
                  setSelectedExercise(null);
                  startLiveAssistant(selectedExercise?.name || "");
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
    backgroundColor: '#121212',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 30,
  },
  list: {
    gap: 15,
    paddingBottom: 40,
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
    color: '#fff',
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
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});