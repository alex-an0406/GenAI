import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStore } from '@/store/use-store';
import { router } from 'expo-router';
import { Exercise } from '@/lib/api';

export default function CalendarScreen() {
  const { activePlan } = useAppStore();

  const renderExercise = ({ item }: { item: Exercise }) => {
    return (
      <View style={styles.dayRow}>
        <View style={styles.circle}>
          <ThemedText style={styles.whiteText}>{item.name[0]}</ThemedText>
        </View>
        <View style={styles.info}>
          <ThemedText type="subtitle">{item.name}</ThemedText>
          <ThemedText style={{ opacity: 0.6 }}>
            {item.target_sets} sets x {item.target_reps} reps • {item.intensity}
          </ThemedText>
        </View>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => router.push('/coach')}
        >
           <ThemedText style={styles.viewButtonText}>Start</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  if (!activePlan) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ThemedText type="subtitle" style={{ textAlign: 'center', marginBottom: 20 }}>
          No active plan found.
        </ThemedText>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/onboarding')}
        >
          <ThemedText style={styles.actionButtonText}>Generate a Plan</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Current Plan</ThemedText>
        <ThemedText>Momentum: {activePlan.momentum_score} 🔥</ThemedText>
      </ThemedView>

      <FlatList
        data={activePlan.exercises}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={renderExercise}
        contentContainerStyle={styles.list}
      />
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
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  whiteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  viewButton: {
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
