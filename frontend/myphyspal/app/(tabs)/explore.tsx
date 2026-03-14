import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppStore } from '@/store/use-store';

export default function PlannerScreen() {
  const { plans } = useAppStore();

  const addNewPlan = () => {
    router.push('/onboarding');
  };

  const renderPlan = ({ item }: { item: any }) => (
    <ThemedView style={styles.planCard}>
      <View style={styles.planInfo}>
        <ThemedText type="subtitle">{item.title}</ThemedText>
        <ThemedText style={styles.dateText}>Started: {item.startDate}</ThemedText>
      </View>
      <View style={styles.statusBadge}>
        <ThemedText style={styles.statusText}>{item.active ? 'Active' : 'Completed'}</ThemedText>
      </View>
      <IconSymbol size={20} name="chevron.right" color="#888" />
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">My Plans</ThemedText>
        <ThemedText>Manage multiple recovery tracks</ThemedText>
      </ThemedView>

      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        renderItem={renderPlan}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No plans found. Create your first one!</ThemedText>
          </View>
        }
      />

      <TouchableOpacity style={styles.addButton} onPress={addNewPlan}>
        <IconSymbol size={24} name="plus" color="#fff" />
        <ThemedText style={styles.addButtonText}>Add New Recovery Plan</ThemedText>
      </TouchableOpacity>
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
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
  },
  planInfo: {
    flex: 1,
  },
  dateText: {
    opacity: 0.6,
    fontSize: 14,
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  statusText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 40,
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.5,
    textAlign: 'center',
  }
});