import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PostWorkoutSurvey } from '@/components/post-workout-survey';

/**
 * LIVE COACH SCREEN
 * ... (math derivation unchanged)
 */

export default function LiveCoachScreen() {
  const [isCoaching, setIsCoaching] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(180);
  const [showSurvey, setShowSurvey] = useState(false);

  const handleStopCoaching = () => {
    setIsCoaching(false);
    setShowSurvey(true);
  };

  const handleSurveySubmit = (rpe: number, pain: number, feedback: string) => {
    // ---------------------------------------------------------
    // BACKEND INTEGRATION POINT:
    // POST /adaptive-loop { rpe, pain, feedback, session_data }
    // This triggers the LLM to recalibrate the next week's plan.
    // ---------------------------------------------------------
    console.log('Syncing to FastAPI:', { rpe, pain, feedback });
    setShowSurvey(false);
    alert('Progress synced! Your plan will recalibrate.');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Live Coach</ThemedText>
        <ThemedText>MediaPipe Pose Tracking Active</ThemedText>
      </ThemedView>

      <View style={styles.cameraPlaceholder}>
        <ThemedText style={styles.placeholderText}>
          [ CAMERA FEED PLACEHOLDER ]
        </ThemedText>
        
        {isCoaching && (
          <View style={styles.overlay}>
            <ThemedText style={styles.angleText}>Knee Angle: {currentAngle}°</ThemedText>
            <ThemedText style={styles.guidanceText}>"Keep your back straight"</ThemedText>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.button, isCoaching ? styles.stopButton : styles.startButton]}
        onPress={isCoaching ? handleStopCoaching : () => setIsCoaching(true)}
      >
        <ThemedText style={styles.buttonText}>
          {isCoaching ? 'STOP & COMPLETE' : 'START LIVE SESSION'}
        </ThemedText>
      </TouchableOpacity>

      <PostWorkoutSurvey 
        visible={showSurvey} 
        onClose={() => setShowSurvey(false)} 
        onSubmit={handleSurveySubmit} 
      />
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
    marginBottom: 20,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  placeholderText: {
    color: '#fff',
    opacity: 0.5,
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 12,
  },
  angleText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  guidanceText: {
    color: '#00FF00',
    fontSize: 18,
    marginTop: 5,
  },
  button: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#007AFF',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
