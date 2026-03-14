import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarScreen() {
  const [completedDays, setCompletedDays] = useState(['Mon', 'Tue']); // Mock tracking

  const renderDay = ({ item }: { item: string }) => {
    const isCompleted = completedDays.includes(item);
    return (
      <View style={styles.dayRow}>
        <View style={[styles.circle, isCompleted && styles.completedCircle]}>
          <ThemedText style={isCompleted ? styles.whiteText : {}}>{item[0]}</ThemedText>
        </View>
        <View style={styles.info}>
          <ThemedText type="subtitle">{item}day's Routine</ThemedText>
          <ThemedText style={{ opacity: 0.6 }}>
            {isCompleted ? '✓ 3/3 Exercises Completed' : '0/3 Exercises Completed'}
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.viewButton}>
           <ThemedText style={styles.viewButtonText}>View</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Weekly Progress</ThemedText>
        <ThemedText>Recovery Streak: 2 Days 🔥</ThemedText>
      </ThemedView>

      <FlatList
        data={DAYS}
        keyExtractor={(item) => item}
        renderItem={renderDay}
        contentContainerStyle={styles.list}
      />

      {/* ---------------------------------------------------------
          BACKEND INTEGRATION POINT:
          GET /calendar-summary
          Returns the history of completed exercises for the UI.
          --------------------------------------------------------- */}
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
  completedCircle: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
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
  },
  viewButtonText: {
    color: '#007AFF',
  }
});
