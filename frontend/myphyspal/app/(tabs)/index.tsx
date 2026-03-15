import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppStore } from '@/store/use-store';
import { getPlan, Exercise } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function TodayScreen() {
  const { activePlan, setActivePlan, planId, setPlanId } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  useEffect(() => {
    const fetchLatestPlan = async () => {
      // If we already have a plan in the store, no need to fetch unless we want to refresh
      if (activePlan) return;

      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/login');
          return;
        }

        // If we don't have a planId in store, we might need to find it from Supabase
        let currentPlanId = planId;
        if (!currentPlanId) {
          const { data: plans, error } = await supabase
            .from('plans')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1);

          if (error) throw error;
          if (plans && plans.length > 0) {
            currentPlanId = plans[0].id;
            setPlanId(currentPlanId as string);
          }
        }

        if (currentPlanId) {
          const planData = await getPlan(currentPlanId, user.id);
          setActivePlan(planData);
        } else {
          // No active plan found, maybe redirect to onboarding?
          router.replace('/onboarding');
        }
      } catch (error: any) {
        console.error('Error fetching plan:', error);
        Alert.alert('Error', 'Failed to load your exercise plan.');
      } finally {
        setLoading(true);
        // Wait, I should set it to false
        setLoading(false);
      }
    };

    fetchLatestPlan();
  }, []);

  const toggleComplete = (exerciseName: string) => {
    if (completedExercises.includes(exerciseName)) {
      setCompletedExercises(completedExercises.filter(name => name !== exerciseName));
    } else {
      setCompletedExercises([...completedExercises, exerciseName]);
    }
  };

  const startLiveAssistant = (exerciseName: string) => {
    // Navigate to the Coach screen
    router.push({
      pathname: '/coach',
      params: { exerciseName }
    });
  };

  const renderExercise = ({ item }: { item: Exercise }) => {
    const isCompleted = completedExercises.includes(item.name);
    
    return (
      <ThemedView style={styles.card}>
        <TouchableOpacity 
          style={styles.cardInfo} 
          onPress={() => setSelectedExercise(item)}
        >
          <View style={styles.titleRow}>
            <ThemedText type="subtitle" style={isCompleted && styles.completedText}>{item.name}</ThemedText>
            <IconSymbol size={16} name="info.circle" color="#888" style={{marginLeft: 5}} />
          </View>
          <ThemedText>{`${item.target_sets} x ${item.target_reps}`}</ThemedText>
        </TouchableOpacity>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.liveButton} onPress={() => startLiveAssistant(item.name)}>
            <ThemedText style={styles.liveButtonText}>Coach</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.checkButton, isCompleted && styles.checked]} 
            onPress={() => toggleComplete(item.name)}
          >
            <ThemedText style={styles.whiteText}>{isCompleted ? '✓' : ''}</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={{marginTop: 10}}>Loading your plan...</ThemedText>
      </ThemedView>
    );
  }

  const exercises = activePlan?.exercises || [];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Today's Exercises</ThemedText>
        <ThemedText>
          Recovery Plan: {activePlan?.profile_snapshot ? `Active Session` : 'No Active Plan'}
        </ThemedText>
        <ThemedText style={styles.momentumText}>
          Momentum Score: {activePlan?.momentum_score || 0}%
        </ThemedText>
      </ThemedView>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.name}
        renderItem={renderExercise}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>No exercises found for today.</ThemedText>
          </ThemedView>
        }
      />

      {exercises.length > 0 && completedExercises.length === exercises.length && (
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
                <ThemedText style={styles.descriptionText}>
                  Perform {selectedExercise?.target_sets} sets of {selectedExercise?.target_reps} reps with {selectedExercise?.intensity} intensity.
                  Focus on smooth, controlled movements and maintaining proper form throughout the exercise.
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
                  const name = selectedExercise?.name;
                  setSelectedExercise(null);
                  if (name) startLiveAssistant(name);
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  momentumText: {
    color: '#007AFF',
    fontWeight: 'bold',
    marginTop: 5,
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
    marginBottom: 20,
  },
  emptyContainer: {
    padding: 40,
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
